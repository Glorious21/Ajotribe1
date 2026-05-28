import axios from 'axios';
import crypto from 'crypto';
import { redis } from '../db/redis';

const isSandbox = process.env.AT_USERNAME === 'sandbox';
const AT_BASE = isSandbox
  ? 'https://api.sandbox.africastalking.com'
  : 'https://api.africastalking.com';

export async function sendOtp(phoneNumber: string): Promise<void> {
  const code = String(crypto.randomInt(100000, 999999));
  await redis.setex(`otp:code:${phoneNumber}`, 300, code);

  await axios.post(
    `${AT_BASE}/version1/messaging`,
    new URLSearchParams({
      username: process.env.AT_USERNAME!,
      to: phoneNumber,
      message: `Your Ajotribe code na ${code}. E valid for 5 minutes. No share am with anybody.`,
    }).toString(),
    {
      headers: {
        apiKey: process.env.AT_API_KEY!,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
  const stored = await redis.get(`otp:code:${phoneNumber}`);
  if (!stored) return false;
  const valid = stored === code;
  if (valid) await redis.del(`otp:code:${phoneNumber}`);
  return valid;
}
