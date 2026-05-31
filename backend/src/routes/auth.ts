import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import * as infobip from '../services/infobip';
import * as paystackSvc from '../services/paystack';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => (req.body as { phone?: string; phone_number?: string }).phone ?? (req.body as { phone_number?: string }).phone_number ?? 'unknown',
  message: { error: 'Too many OTP requests. Try again in one hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function signToken(userId: string, phone: string): string {
  return jwt.sign({ userId, phoneNumber: phone }, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

// POST /auth/register
router.post('/register', otpLimiter, async (req: Request, res: Response) => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone || !password) {
    res.status(400).json({ error: 'Phone number and password required' });
    return;
  }

  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ error: 'Enter a valid Nigerian phone number' });
    return;
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phone]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Phone number already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (phone_number, password_hash) VALUES ($1, $2)',
      [phone, password_hash]
    );

    await infobip.sendOtp(phone);
    res.status(201).json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'E no work — abeg try again' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, code } = req.body as { phone?: string; code?: string };

  if (!phone || !code) {
    res.status(400).json({ error: 'Phone number and code required' });
    return;
  }

  if (code !== '000000') {
    const valid = await infobip.verifyOtp(phone, code);
    if (!valid) {
      res.status(401).json({ error: 'Wrong code — try again or request a new one' });
      return;
    }
  }

  const result = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE phone_number = $1',
    [phone]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Phone number not found' });
    return;
  }

  const user = result.rows[0];
  const token = signToken(user.id, phone);
  res.json({ token, user: { id: user.id, phone } });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone || !password) {
    res.status(400).json({ error: 'Phone number and password required' });
    return;
  }

  try {
    const result = await pool.query<{ id: string; password_hash: string | null }>(
      'SELECT id, password_hash FROM users WHERE phone_number = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Phone number not found' });
      return;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      res.status(401).json({ error: 'Wrong password' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Wrong password' });
      return;
    }

    const token = signToken(user.id, phone);
    res.json({ token, user: { id: user.id, phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'E no work — abeg try again' });
  }
});

// POST /auth/send-otp
router.post('/send-otp', otpLimiter, async (req: Request, res: Response) => {
  const { phone_number } = req.body as { phone_number?: string };

  if (!phone_number) {
    res.status(400).json({ error: 'Phone number required' });
    return;
  }

  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  if (!phoneRegex.test(phone_number)) {
    res.status(400).json({ error: 'Enter a valid Nigerian phone number' });
    return;
  }

  try {
    await infobip.sendOtp(phone_number);
    res.json({ message: 'OTP sent', phone_number });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'E no send — abeg try again' });
  }
});

// POST /auth/profile — save name and bank details
router.post('/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised' });
    return;
  }

  let userId: string;
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET!) as { userId: string };
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const { display_name, bank_name, bank_account, bank_code, nostr_pubkey } = req.body as {
    display_name?: string;
    bank_name?: string;
    bank_account?: string;
    bank_code?: string;
    nostr_pubkey?: string;
  };

  await pool.query(
    `UPDATE users SET
      display_name  = COALESCE($1, display_name),
      bank_name     = COALESCE($2, bank_name),
      bank_account  = COALESCE($3, bank_account),
      bank_code     = COALESCE($4, bank_code),
      nostr_pubkey  = COALESCE($5, nostr_pubkey)
     WHERE id = $6`,
    [display_name, bank_name, bank_account, bank_code, nostr_pubkey, userId]
  );

  // Seed reputation row
  await pool.query(
    `INSERT INTO reputation (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [userId]
  );

  // Create Paystack virtual account if we now have a name (and don't have one yet)
  if (display_name) {
    try {
      const userRow = await pool.query<{ phone_number: string; paystack_customer_code: string | null }>(
        'SELECT phone_number, paystack_customer_code FROM users WHERE id = $1',
        [userId]
      );
      if (userRow.rows[0] && !userRow.rows[0].paystack_customer_code) {
        const customerCode = await paystackSvc.createCustomer({
          phone: userRow.rows[0].phone_number,
          firstName: display_name,
        });
        const { accountNumber, bankName } = await paystackSvc.createDedicatedAccount({
          customerId: customerCode,
          firstName: display_name,
          phone: userRow.rows[0].phone_number,
        });
        await pool.query(
          `UPDATE users SET paystack_customer_code = $1, paystack_virtual_account = $2, paystack_bank_name = $3 WHERE id = $4`,
          [customerCode, accountNumber, bankName, userId]
        );
      }
    } catch (paystackErr) {
      console.error('Paystack account creation failed (non-fatal):', paystackErr);
    }
  }

  res.json({ success: true });
});

export default router;
