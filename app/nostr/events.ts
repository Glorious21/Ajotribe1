import { finalizeEvent, verifyEvent } from 'nostr-tools';
import * as SecureStore from 'expo-secure-store';

const RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
const NSEC_KEY = 'nostr_nsec';

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return arr;
}

async function getSecretKey(): Promise<Uint8Array | null> {
  const hex = await SecureStore.getItemAsync(NSEC_KEY);
  return hex ? hexToBytes(hex) : null;
}

async function publishToRelay(relay: string, event: ReturnType<typeof finalizeEvent>): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay);
    const timeout = setTimeout(() => { ws.close(); reject(new Error('timeout')); }, 6000);
    ws.onopen = () => ws.send(JSON.stringify(['EVENT', event]));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data as string) as unknown[];
      if (msg[0] === 'OK') { clearTimeout(timeout); ws.close(); resolve(); }
    };
    ws.onerror = () => { clearTimeout(timeout); reject(new Error(`ws error: ${relay}`)); };
  });
}

// Publish a signed contribution acknowledgment from the user's device keypair
export async function acknowledgeContribution(params: {
  circleId: string;
  nostrGroupId: string;
  roundNumber: number;
  amountNaira: number;
}): Promise<string | null> {
  const sk = await getSecretKey();
  if (!sk) return null;

  const event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['h', params.nostrGroupId],
        ['circle', params.circleId],
        ['round', String(params.roundNumber)],
        ['t', 'contribution'],
      ],
      content: `I don pay my own! ₦${(params.amountNaira / 100).toLocaleString('en-NG')} for round ${params.roundNumber} ✓`,
    },
    sk
  );

  await Promise.any(RELAYS.map((r) => publishToRelay(r, event))).catch(() => null);
  return event.id;
}

// Verify a Nostr event signed by the backend server
export function verifyNostrEvent(eventJson: string): boolean {
  try {
    const event = JSON.parse(eventJson) as Parameters<typeof verifyEvent>[0];
    return verifyEvent(event);
  } catch {
    return false;
  }
}
