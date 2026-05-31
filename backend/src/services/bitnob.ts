import axios from 'axios';

const BASE_URL = process.env.BITNOB_BASE_URL ?? 'https://api.bitnob.co/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.BITNOB_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface OfframpResult {
  transactionId: string;
  status: string;
}

export async function nairaToBtcQuote(amountNaira: number): Promise<{ sats: number; rate: number }> {
  const response = await client.post('/transactions/initiate', {
    amount: amountNaira / 100, // kobo to naira
    currency: 'NGN',
    type: 'buy',
  });
  return {
    sats: response.data.data.amountSats as number,
    rate: response.data.data.rate as number,
  };
}

export async function payLightningInvoice(invoice: string, amountSats: number): Promise<string> {
  const response = await client.post('/lightning/pay', {
    invoice,
    amount_sats: amountSats,
  });
  return response.data.data.transactionId as string;
}

export async function offrampToBank(params: {
  amountSats: number;
  bankCode: string;
  accountNumber: string;
  reference: string;
}): Promise<OfframpResult> {
  const response = await client.post('/transactions/offramp', {
    amount: params.amountSats,
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    currency: 'NGN',
    reference: params.reference,
  });
  return {
    transactionId: response.data.data.id as string,
    status: response.data.data.status as string,
  };
}
