import path from 'path';
import fs from 'fs';
import type { BindingLiquidSdk, SdkEvent } from '@breeztech/breez-sdk-liquid';
import { connect, defaultConfig } from '@breeztech/breez-sdk-liquid';

let _sdk: BindingLiquidSdk | null = null;
let _initDone = false;
let _initPromise: Promise<void> | null = null;

function getWorkingDir(): string {
  const dir = path.resolve(process.env.BREEZ_WORKING_DIR ?? './breez-data');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getMnemonic(): string {
  const m = process.env.BREEZ_MNEMONIC;
  if (!m) throw new Error('BREEZ_MNEMONIC not set in environment');
  return m;
}

async function doInit(): Promise<void> {
  try {
    const network = process.env.APP_ENV === 'production' ? 'mainnet' as const : 'testnet' as const;
    const config = defaultConfig(network, process.env.BREEZ_API_KEY ?? '');
    config.workingDir = getWorkingDir();

    _sdk = await connect({ config, mnemonic: getMnemonic() });

    await _sdk.addEventListener({
      onEvent: (event: SdkEvent) => {
        if (event.type === 'paymentSucceeded' || event.type === 'paymentFailed') {
          console.log(`[Breez] ${event.type}: ${event.details.amountSat} sats`);
        }
      },
    });

    const info = await _sdk.getInfo();
    console.log(`✓ Breez SDK Liquid connected — balance: ${info.walletInfo.balanceSat} sats`);
  } catch (err) {
    console.error('[Breez] Init failed (falling back to quote-only mode):', (err as Error).message);
  } finally {
    _initDone = true;
  }
}

export async function init(): Promise<void> {
  if (_initDone) return;
  if (!_initPromise) _initPromise = doInit();
  return _initPromise;
}

export function isReady(): boolean {
  return _sdk !== null;
}

function sdk(): BindingLiquidSdk {
  if (!_sdk) throw new Error('Breez SDK not initialised — call init() first');
  return _sdk;
}

export async function getWalletInfo(): Promise<{ balanceSat: number; pubkey: string }> {
  const info = await sdk().getInfo();
  return {
    balanceSat: info.walletInfo.balanceSat,
    pubkey: info.walletInfo.pubkey,
  };
}

// Create a BOLT11 invoice so Bitnob can push the contribution sats into the server wallet.
// The backend Breez wallet holds the circle pool between contributions and the collection payout.
export async function createReceiveInvoice(amountSat: number, description: string): Promise<string> {
  const prepareResponse = await sdk().prepareReceivePayment({
    paymentMethod: 'bolt11Invoice',
    amount: { type: 'bitcoin', payerAmountSat: amountSat },
  });
  const response = await sdk().receivePayment({ prepareResponse, description });
  return response.destination;
}

// Pay a BOLT11 invoice or Lightning address from the server wallet.
// Pass amountSat for zero-amount invoices or Lightning address payments.
export async function sendPayment(destination: string, amountSat?: number): Promise<string> {
  const prepareResponse = await sdk().prepareSendPayment(
    amountSat !== undefined
      ? { destination, amount: { type: 'bitcoin', receiverAmountSat: amountSat } }
      : { destination }
  );
  const response = await sdk().sendPayment({ prepareResponse });
  return response.payment.txId ?? '';
}
