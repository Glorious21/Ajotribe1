import axios from 'axios';
import crypto from 'crypto';

const client = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function createDedicatedAccount(params: {
  customerId: string;
  firstName: string;
  phone: string;
}): Promise<{ accountNumber: string; bankName: string }> {
  const response = await client.post('/dedicated_account', {
    customer: params.customerId,
    preferred_bank: 'wema-bank',
    first_name: params.firstName,
    phone: params.phone,
  });
  return {
    accountNumber: response.data.data.account_number as string,
    bankName: response.data.data.bank.name as string,
  };
}

export async function createCustomer(params: {
  phone: string;
  firstName: string;
}): Promise<string> {
  const response = await client.post('/customer', {
    email: `${params.phone.replace('+', '')}@ajotribe.app`,
    first_name: params.firstName,
    phone: params.phone,
  });
  return response.data.data.customer_code as string;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
