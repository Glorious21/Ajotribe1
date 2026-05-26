import * as SecureStore from 'expo-secure-store';
import { generateSecretKey, getPublicKey } from 'nostr-tools';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr;
}

const NSEC_KEY = 'nostr_nsec';

export async function getOrCreateKeypair(): Promise<{ nsec: string; npub: string }> {
  const existing = await SecureStore.getItemAsync(NSEC_KEY);

  if (existing) {
    const npub = getPublicKey(hexToBytes(existing));
    return { nsec: existing, npub };
  }

  const sk = generateSecretKey();
  const nsec = bytesToHex(sk);
  const npub = getPublicKey(sk);

  await SecureStore.setItemAsync(NSEC_KEY, nsec);
  return { nsec, npub };
}

export async function getNpub(): Promise<string | null> {
  const nsec = await SecureStore.getItemAsync(NSEC_KEY);
  if (!nsec) return null;
  return getPublicKey(hexToBytes(nsec));
}

export async function hasKeypair(): Promise<boolean> {
  const nsec = await SecureStore.getItemAsync(NSEC_KEY);
  return !!nsec;
}
