import * as bitnob from './bitnob';
import * as mavapay from './mavapay';
import * as cashwyre from './cashwyre';

export interface PayoutParams {
  amountNaira: number; // kobo
  bankCode: string;
  accountNumber: string;
  reference: string;
}

export interface PayoutResult {
  txId: string;
  rail: 'bitnob' | 'mavapay' | 'cashwyre';
}

export async function payoutWithCascade(params: PayoutParams): Promise<PayoutResult> {
  try {
    const { sats } = await bitnob.nairaToBtcQuote(params.amountNaira);
    const result = await bitnob.offrampToBank({
      amountSats: sats,
      bankCode: params.bankCode,
      accountNumber: params.accountNumber,
      reference: params.reference,
    });
    return { txId: result.transactionId, rail: 'bitnob' };
  } catch (bitnobErr) {
    console.error('Bitnob payout failed, trying Mavapay:', (bitnobErr as Error).message);
    try {
      const txId = await mavapay.payout(params);
      return { txId, rail: 'mavapay' };
    } catch (mavapayErr) {
      console.error('Mavapay payout failed, trying Cashwyre:', (mavapayErr as Error).message);
      const txId = await cashwyre.transfer(params);
      return { txId, rail: 'cashwyre' };
    }
  }
}
