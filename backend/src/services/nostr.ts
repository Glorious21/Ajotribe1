import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools';
import WebSocket from 'ws';

const RELAYS = (process.env.NOSTR_RELAYS ?? 'wss://relay.damus.io').split(',');

// Server-side signing key for publishing circle events (not user keys — those stay on device)
let _serverSecretKey: Uint8Array | null = null;

function getServerKey(): Uint8Array {
  if (!_serverSecretKey) {
    const hex = process.env.NOSTR_SERVER_NSEC;
    if (hex) {
      _serverSecretKey = Buffer.from(hex, 'hex');
    } else {
      _serverSecretKey = generateSecretKey();
      console.warn('NOSTR_SERVER_NSEC not set — generated ephemeral key. Set it in .env for persistence.');
    }
  }
  return _serverSecretKey;
}

export function getServerPubkey(): string {
  return getPublicKey(getServerKey());
}

async function publishToRelay(relay: string, event: ReturnType<typeof finalizeEvent>): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`Relay timeout: ${relay}`));
    }, 5000);

    ws.on('open', () => {
      ws.send(JSON.stringify(['EVENT', event]));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString()) as unknown[];
      if (msg[0] === 'OK') {
        clearTimeout(timeout);
        ws.close();
        resolve();
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function publishEvent(content: string, tags: string[][]): Promise<string> {
  const sk = getServerKey();
  const event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
    },
    sk
  );

  await Promise.any(RELAYS.map((relay) => publishToRelay(relay, event)));
  return event.id;
}

export async function publishContributionEvent(params: {
  circleId: string;
  nostrGroupId: string;
  userPubkey: string;
  roundNumber: number;
  amountNaira: number;
}): Promise<string> {
  const tags = [
    ['h', params.nostrGroupId],
    ['circle', params.circleId],
    ['round', String(params.roundNumber)],
    ['amount_naira', String(params.amountNaira)],
    ['p', params.userPubkey],
    ['t', 'contribution'],
  ];
  const content = `Contribution confirmed: ₦${(params.amountNaira / 100).toLocaleString('en-NG')} for round ${params.roundNumber}`;
  return publishEvent(content, tags);
}

export async function publishCollectionEvent(params: {
  circleId: string;
  nostrGroupId: string;
  collectorPubkey: string;
  roundNumber: number;
  amountNaira: number;
}): Promise<string> {
  const tags = [
    ['h', params.nostrGroupId],
    ['circle', params.circleId],
    ['round', String(params.roundNumber)],
    ['amount_naira', String(params.amountNaira)],
    ['p', params.collectorPubkey],
    ['t', 'collection'],
  ];
  const content = `Collection sent: ₦${(params.amountNaira / 100).toLocaleString('en-NG')} to collector for round ${params.roundNumber}`;
  return publishEvent(content, tags);
}
