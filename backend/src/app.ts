import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import { migrate } from './db/migrate';
import authRouter from './routes/auth';
import circlesRouter from './routes/circles';
import contributionsRouter from './routes/contributions';
import collectionsRouter from './routes/collections';
import usersRouter from './routes/users';
import paystackWebhook from './webhooks/paystack';
import { startRotationJob } from './jobs/rotation';
import * as breez from './services/breez';
import { JwtPayload } from './types';

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Export io for use in routes/webhooks
export function getIo(): SocketServer {
  return io;
}

// Paystack webhook needs raw body for signature verification
app.use('/webhooks/paystack', express.raw({ type: 'application/json' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) req.body = JSON.parse(req.body.toString());
  next();
}, paystackWebhook);

app.use(express.json({ limit: '10kb' }));
app.use(cors());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.APP_ENV });
});

app.use('/auth', authRouter);
app.use('/circles', circlesRouter);
app.use('/contributions', contributionsRouter);
app.use('/collections', collectionsRouter);
app.use('/users', usersRouter);

// Socket.io — authenticate and join circle room
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    next(new Error('Authentication required'));
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (socket as typeof socket & { userId: string }).userId = payload.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.on('join:circle', (circleId: string) => {
    socket.join(`circle:${circleId}`);
  });

  socket.on('leave:circle', (circleId: string) => {
    socket.leave(`circle:${circleId}`);
  });
});

const PORT = process.env.PORT ?? 3000;

migrate()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Ajotribe backend running on port ${PORT}`);
      startRotationJob();
      breez.init().catch(() => {
        // errors are logged inside init() — this prevents unhandled rejection
      });
    });
  })
  .catch((err) => {
    console.error('Migration failed — aborting startup:', err);
    process.exit(1);
  });

export default app;
