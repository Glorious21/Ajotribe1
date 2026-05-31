import axios from 'axios';
import crypto from 'crypto';
import { redis } from '../db/redis';

export async function sendOtp(phoneNumber: string): Promise<void> {
  const code = String(crypto.randomInt(100000, 999999));
  await redis.setex(`otp:code:${phoneNumber}`, 300, code);

  await axios.post(
    `https://${process.env.INFOBIP_BASE_URL}/sms/2/text/advanced`,
    {
      messages: [
        {
          destinations: [{ to: phoneNumber }],
          from: process.env.INFOBIP_SENDER ?? 'Ajotribe',
          text: `Your Ajotribe code na ${code}. E valid for 5 minutes. No share am with anybody.`,
        },
      ],
    },
    {
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
