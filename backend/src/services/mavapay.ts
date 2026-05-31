import axios from 'axios';

const client = axios.create({
  baseURL: process.env.MAVAPAY_BASE_URL ?? 'https://api.mavapay.co',
  headers: {
    Authorization: `Bearer ${process.env.MAVAPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function payout(params: {
  amountNaira: number;
  bankCode: string;
  accountNumber: string;
  reference: string;
}): Promise<string> {
  const response = await client.post('/v1/payout', {
    amount: params.amountNaira / 100,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    reference: params.reference,
    currency: 'NGN',
  });
  return response.data.data.id as string;
}
