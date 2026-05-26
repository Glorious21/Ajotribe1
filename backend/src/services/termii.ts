import axios from 'axios';

const BASE_URL = 'https://api.ng.termii.com/api';

function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.startsWith('234') && digits.length === 13) return `+${digits}`;
  if (digits.startsWith('+234')) return phone;
  return `+234${digits}`;
}

export async function sendOtp(phoneNumber: string): Promise<{ pinId: string }> {
  const phone = normalisePhone(phoneNumber);

  const response = await axios.post(`${BASE_URL}/sms/otp/send`, {
    api_key: process.env.TERMII_API_KEY,
    message_type: 'NUMERIC',
    to: phone,
    from: process.env.TERMII_SENDER_ID ?? 'Ajotribe',
    channel: 'generic',
    pin_attempts: 3,
    pin_time_to_live: 5,
    pin_length: 6,
    pin_placeholder: '< 1234 >',
    message_text: 'Your Ajotribe code na < 1234 >. E valid for 5 minutes.',
    pin_type: 'NUMERIC',
  });

  return { pinId: response.data.pinId as string };
}

export async function verifyOtp(pinId: string, pin: string): Promise<boolean> {
  try {
    const response = await axios.post(`${BASE_URL}/sms/otp/verify`, {
      api_key: process.env.TERMII_API_KEY,
      pin_id: pinId,
      pin,
    });
    return response.data.verified === 'True' || response.data.verified === true;
  } catch {
    return false;
  }
}
