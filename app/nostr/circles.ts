import { finalizeEvent, getPublicKey } from 'nostr-tools';
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

async function signAndPublish(eventTemplate: {
  kind: number;
  tags: string[][];
  content: string;
}): Promise<string | null> {
  const sk = await getSecretKey();
  if (!sk) return null;

  const event = finalizeEvent(
    { ...eventTemplate, created_at: Math.floor(Date.now() / 1000) },
    sk
  );

  // Fire-and-forget to all relays; succeed if at least one accepts
  await Promise.any(RELAYS.map((r) => publishToRelay(r, event))).catch(() => null);
  return event.id;
}

// NIP-29: send a join request (kind 9021) for a circle's Nostr group
export async function requestGroupJoin(nostrGroupId: string): Promise<void> {
  await signAndPublish({
    kind: 9021,
    tags: [['h', nostrGroupId]],
    content: 'Requesting to join circle',
  });
}

// NIP-29: send a leave request (kind 9022) when exiting a circle
export async function requestGroupLeave(nostrGroupId: string): Promise<void> {
  await signAndPublish({
    kind: 9022,
    tags: [['h', nostrGroupId]],
    content: '',
  });
}
