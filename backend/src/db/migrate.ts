import { pool } from './pool';

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    VARCHAR(15) UNIQUE NOT NULL,
  display_name    VARCHAR(100),
  nostr_pubkey    VARCHAR(64),
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(20),
  bank_code       VARCHAR(10),
  breez_node_id   VARCHAR(100),
  lightning_addr  VARCHAR(200),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  organiser_id    UUID REFERENCES users(id),
  amount_naira    INTEGER NOT NULL,
  frequency       VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly')),
  size            INTEGER NOT NULL CHECK (size BETWEEN 2 AND 50),
  start_date      DATE NOT NULL,
  nostr_group_id  VARCHAR(100),
  invite_code     VARCHAR(20) UNIQUE NOT NULL,
  status          VARCHAR(20) DEFAULT 'forming' CHECK (status IN ('forming','active','completed')),
  rules           JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  slot_number     INTEGER NOT NULL,
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','removed')),
  deposit_paid    BOOLEAN DEFAULT FALSE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, slot_number),
  UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  round_number    INTEGER NOT NULL,
  amount_naira    INTEGER NOT NULL,
  paystack_ref    VARCHAR(100),
  bitnob_tx_id    VARCHAR(100),
  nostr_event_id  VARCHAR(64),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','missed')),
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id) ON DELETE CASCADE,
  collector_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  round_number    INTEGER NOT NULL,
  amount_naira    INTEGER NOT NULL,
  payout_rail     VARCHAR(20) CHECK (payout_rail IN ('bitnob','mavapay','cashwyre')),
  payout_tx_id    VARCHAR(100),
  nostr_event_id  VARCHAR(64),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  collected_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reputation (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  circles_completed   INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  missed_payments     INTEGER DEFAULT 0,
  nostr_badge_event   VARCHAR(64),
  last_updated        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  phone_number  VARCHAR(15) PRIMARY KEY,
  code          VARCHAR(6) NOT NULL,
  attempts      INTEGER DEFAULT 0,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_circle ON memberships(circle_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_circle_round ON contributions(circle_id, round_number);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_circle ON collections(circle_id);

-- Paystack virtual account columns (idempotent)
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_virtual_account VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_bank_name VARCHAR(100);

-- Required for ON CONFLICT in paystack webhook upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_contributions_unique_round
  ON contributions(circle_id, user_id, round_number);
`;

export async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log('✓ Database schema applied');
  } finally {
    client.release();
  }
}

// Allow running as a standalone script: ts-node src/db/migrate.ts
if (require.main === module) {
  migrate()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
