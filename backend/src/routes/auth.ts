import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import * as at from '../services/africasTalking';
import * as paystackSvc from '../services/paystack';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => (req.body as { phone_number?: string }).phone_number ?? 'unknown',
  message: { error: 'Too many OTP requests. Try again in one hour.' },
  standardHeaders: true,
  legacyHeaders: false,
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
    await at.sendOtp(phone_number);
    res.json({ message: 'OTP sent', phone_number });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'E no send — abeg try again' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone_number, code } = req.body as { phone_number?: string; code?: string };

  if (!phone_number || !code) {
    res.status(400).json({ error: 'Phone number and code required' });
    return;
  }

  // Demo bypass — "000000" always passes regardless of SMS delivery
  const isDemoBypass = code === '000000';

  if (!isDemoBypass) {
    const valid = await at.verifyOtp(phone_number, code);
    if (!valid) {
      res.status(401).json({ error: 'Wrong code — try again or request a new one' });
      return;
    }
  }

  // Upsert user
  const result = await pool.query<{ id: string; display_name: string | null; bank_account: string | null }>(
    `INSERT INTO users (phone_number) VALUES ($1)
     ON CONFLICT (phone_number) DO UPDATE SET phone_number = EXCLUDED.phone_number
     RETURNING id, display_name, bank_account`,
    [phone_number]
  );
  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id, phoneNumber: phone_number },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const isNewUser = !user.display_name;
  res.json({ token, userId: user.id, isNewUser });
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
