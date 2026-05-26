import axios from 'axios';

const client = axios.create({
  baseURL: process.env.CASHWYRE_BASE_URL ?? 'https://business.cashwyre.com/api',
  headers: {
    Authorization: `Bearer ${process.env.CASHWYRE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function transfer(params: {
  amountNaira: number;
  bankCode: string;
  accountNumber: string;
  reference: string;
}): Promise<string> {
  const response = await client.post('/transfer', {
    amount: params.amountNaira / 100,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    reference: params.reference,
    currency: 'NGN',
  });
  return response.data.data.id as string;
}
