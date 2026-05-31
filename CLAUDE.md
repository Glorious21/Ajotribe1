# Ajotribe
## HACK4FREEDOM 2026 — Build Guide

---

## What We Are Building

Ajotribe digitises the rotating savings circle (ajo/esusu/adashi) for Nigerian market women using Bitcoin Lightning as the settlement rail, Nostr as the trust layer, and a naira-only interface. Users never see Bitcoin, Lightning, or any crypto concept — only naira, their circle, and their savings.

**Hackathon thesis:** The ajo is Africa's oldest DeFi protocol. Ajotribe makes it unstealable, untamperable, and accessible to anyone with a phone number and a Nigerian bank account.

**Primary user:** Mama Tunde — Lagos market woman, WhatsApp-literate, GTBank account, no crypto knowledge required. Every design and copy decision must pass the Mama Tunde test: "Would she understand this in 10 seconds?"

**Core promise:** Put naira in. Get naira out. The circle handles itself trustlessly in between.

**Why we win HACK4FREEDOM:**
- Real product for a real, massive market (400M+ informal savings users in Africa)
- Bitcoin as infrastructure, not ideology — users never know it's there
- Nostr as cryptographic proof layer — immutable, decentralised contribution record
- Live demo with real naira flowing in real-time

---

## Selected Resources (and Why)

### USE THESE — primary build references

| Resource | Role |
|---|---|
| https://bitcoin.design/ | **Primary design system** — strict adherence required |
| https://sdk-doc-liquid.breez.technology/ | Breez SDK Liquid docs — primary wallet SDK |
| https://breez.technology/sdk/ | Breez SDK overview and React Native setup |
| https://docs.bitnob.com/docs/getting-started | Bitnob API — primary naira↔sats conversion and Lightning payouts |
| https://docs.mavapay.co/introduction | Mavapay — backup NGN payout rail |
| https://business.cashwyre.com/doc/api | Cashwyre — tertiary NGN payout rail |
| https://lightningaddress.com/ | Lightning address protocol (LUD-16) reference |

### DO NOT USE — excluded with reason

| Resource | Why Excluded |
|---|---|
| https://sdk-doc-greenlight.breez.technology/ | We use Liquid, not Greenlight — different product |
| https://github.com/ACINQ/phoenixd | Server daemon; we use Breez SDK React Native |
| https://bitcoin-connect.com/ | Web-only component; we are mobile |
| https://bitcoinresearch.xyz/ | Research only — no buildable API or SDK |
| https://www.blink.sv/en/api | Adds complexity; Bitnob covers this use case |
| https://github.com/code-yeongyu/oh-my-openagent | Post-hackathon roadmap — AI assistant |
| https://lightningdecoder.com | Dev debugging tool — not a build dependency |
| https://vinteum.org/wp-content/uploads/... | Research PDF — no build relevance |

---

## Tech Stack (Authoritative)

### Mobile App — React Native (Expo Bare Workflow)

> **CRITICAL:** Breez SDK Liquid requires native modules. Use **Expo bare workflow** (`expo run:android` / `expo run:ios`) — NOT Expo Go. EAS Build for CI/CD and demo APK.

```
- React Native + Expo (bare workflow)
- Expo Router v3 — file-based navigation
- TypeScript — strict mode, no `any`
- NativeWind v4 — Tailwind CSS for React Native
- Zustand — lightweight global state management
- Expo Secure Store — encrypted storage for Nostr keypair
- Expo Linking — deep link handling for circle invites
- @expo-google-fonts/inter — Inter font (bitcoin.design typography)
- react-native-reanimated — smooth animations for money flows
```

### Identity Layer

```
- @nostr-dev-kit/ndk — Nostr Development Kit (NDK)
- NIP-29 — relay-based closed groups (one group per circle)
- NIP-78 — arbitrary app data storage (circle metadata)
- Keypair: generated on device, stored in Expo Secure Store
- Nostr relays: wss://relay.damus.io, wss://nos.lol, wss://relay.primal.net
- NO keypair ever leaves the device — backend never sees nsec
```

**Removed:** NIP-60 (Cashu wallet events) — adds complexity without hackathon value. NIP-29 + NIP-78 are sufficient.

### Wallet & Payment Layer

```
- @breeztech/react-native-breez-sdk-liquid — self-custodial Liquid/Lightning wallet
- Backend Breez instance — server-side SDK instance for circle pool coordination
- Bitnob API — naira → sats conversion, Lightning invoices, naira bank payout
- Mavapay API — backup NGN payout when Bitnob is slow
- Cashwyre API — tertiary NGN payout fallback
- Paystack — inbound naira bank transfer detection (virtual accounts)
```

### OTP / Phone Verification

```
- Termii API — Nigerian-optimised SMS OTP (faster delivery than Africa's Talking for NG numbers)
  Docs: https://developer.termii.com/
  Alt: Africa's Talking if Termii unavailable
```

### Backend

```
- Node.js + Express — REST API (TypeScript)
- PostgreSQL — circles, members, contributions, collections
- Redis — OTP storage, session cache, rate limiting, real-time pub/sub for dashboard
- Socket.io — real-time dashboard updates pushed to mobile
- node-cron — rotation scheduler (collection trigger)
```

---

## Payment Architecture (Clarified)

This is the authoritative money flow. Read carefully before building any payment feature.

### Contribution Flow (Naira In)

```
1. User taps "Pay My Own" in app
2. App calls backend → backend generates a unique Paystack virtual account reference for this user+week
3. App shows user: "Transfer ₦10,000 to [GTBank 0123456789] — ref: AJO-TUNDE-W3"
4. User does bank transfer from their GTBank app (off-app)
5. Paystack webhook fires on receipt → backend verifies signature → marks naira as received
6. Backend calls Bitnob API → convert ₦10,000 → sats → send to user's Breez Lightning address
7. User's Breez SDK wallet on device receives sats
8. Backend publishes signed NIP-29 contribution event to Nostr relays
9. Socket.io push → all circle members' dashboards update in real time
10. User sees: "Your money don enter! ₦10,000 saved ✓"
```

### Collection Flow (Naira Out)

```
1. node-cron fires on collection day (or organiser triggers manually for demo)
2. Backend identifies collector for this week (slot rotation order)
3. Backend's Breez server instance generates Lightning invoice for full circle pot amount
4. All members' Breez wallets (via backend coordination) pay their share to the invoice
5. Backend receives pot in Breez wallet
6. Backend calls Bitnob API → sats → naira offramp → transfer to collector's bank account
   (Fallback: Mavapay → Cashwyre if Bitnob payout fails)
7. Backend publishes NIP-29 collection event to Nostr relays
8. Socket.io push → all members see "Mama Tunde don collect her ₦50,000! 🎉"
```

**Demo Day shortcut:** For the live demo, the collection can be triggered manually by the organiser tapping "Release Funds" — do not rely on cron for demo day itself.

### What the Breez SDK Does

- **Mobile (user device):** Holds user's sats. Provides Lightning address. Signs payments.
- **Backend (server):** Coordinates circle payments. Holds pool sats between contributions and collection. Generates invoices.

---

## Design System — bitcoin.design (Strict)

All UI must follow bitcoin.design principles. Read the guide at https://bitcoin.design/guide/ before building any screen.

### Core Design Principles (from bitcoin.design)

1. **Clarity over cleverness** — the user's naira amount is always the most prominent element on screen
2. **Trust through status** — every transaction state (pending, confirmed, failed) has a clear, distinct visual
3. **Progressive disclosure** — never show technical details upfront; reveal only when user asks
4. **Accessible by default** — WCAG AA minimum, large touch targets (48×48dp min), high contrast
5. **Forgiving flows** — every error screen has one clear action ("Try Again", "Contact Support")

### Color Tokens

```
Primary:       #006B3C  (Deep Nigerian Green — heritage, trust)
Accent:        #F4A228  (Market Gold — wealth, warmth)
Success:       #16A34A  (Contribution received, collection done)
Warning:       #D97706  (Pending payment, action needed)
Error:         #DC2626  (Failed payment, overdue)
Background:    #FAFAF9  (Warm white — not cold tech white)
Surface:       #FFFFFF  (Cards, modals)
Surface Alt:   #F3F4F6  (Subtle background for list items)
Text Primary:  #111827  (Headings, amounts)
Text Secondary:#6B7280  (Labels, captions)
Border:        #E5E7EB
```

### Typography (Inter — bitcoin.design recommended)

```
Amount Display: Inter 56px Bold   — naira amount, always ₦ prefixed
Screen Title:   Inter 28px Bold   — page headers
Section Head:   Inter 18px SemiBold
Body:           Inter 16px Regular
Caption:        Inter 13px Regular, Text Secondary
Button:         Inter 16px SemiBold
```

### Component Patterns (from bitcoin.design — adapted for Ajotribe)

**Amount Display:**
- Naira amount always at 56px bold, centre-aligned
- Never show sats equivalent — not even in small text
- Separator: ₦10,000 (comma, no decimals for naira)

**Transaction Status Dots:**
```
⬤ #16A34A = Paid / Collected
⬤ #D97706 = Pending / Awaiting transfer
⬤ #DC2626 = Missed / Overdue
⬤ #6B7280 = Upcoming / Not yet due
```

**Circle Progress Ring:**
- Full ring = full circle pot collected this round
- Each segment = one member's contribution
- Green segment = paid, grey = pending, red = missed

**Member Card:**
- Name (or phone last 4 digits if no name set)
- Status dot + status text in Pidgin
- Week number (not slot index)
- Amount ₦ in bold

**Invite Link Banner:**
- Prominent, one-tap share button
- Deep link: `ajotribe://circle/{circleId}`
- Human-readable: "Join Mama Tunde's Circle — ajotribe.ng/join/abc123"

**Empty States:**
- Warm illustration (market scene, not crypto icons)
- Clear Pidgin CTA: "Start Your Circle" / "Join a Circle"

### Screens Required

```
Auth:
  - /welcome          Welcome + "Start Saving" CTA
  - /phone            Phone number input
  - /otp              OTP verification (6-digit)
  - /name             First name (for personalization)
  - /bank-setup       Bank account for payouts

Home:
  - /home             Active circles summary, total savings

Circle:
  - /circle/create    Multi-step: name → amount → size → frequency → start → rules
  - /circle/[id]      Circle dashboard (real-time)
  - /circle/[id]/members  Member list with status
  - /circle/join      Preview before joining (via deep link)

Wallet:
  - /savings          Total savings across all circles
  - /contribute/[id]  Payment instructions for this week

Organiser:
  - /circle/[id]/manage   Manual collection trigger, member management
```

---

## Project Structure

```
ajotribe/
├── app/                          # Expo Router — mobile app
│   ├── (auth)/
│   │   ├── welcome.tsx
│   │   ├── phone.tsx
│   │   ├── otp.tsx
│   │   ├── name.tsx
│   │   └── bank-setup.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   └── savings.tsx
│   ├── circle/
│   │   ├── create.tsx
│   │   ├── join.tsx
│   │   ├── [id].tsx              # Circle dashboard
│   │   ├── [id]/members.tsx
│   │   └── [id]/manage.tsx
│   ├── contribute/
│   │   └── [id].tsx
│   └── _layout.tsx
│
├── components/                   # Shared UI components
│   ├── AmountDisplay.tsx         # ₦ amount — 56px bold
│   ├── CircleProgressRing.tsx    # SVG contribution ring
│   ├── MemberCard.tsx
│   ├── StatusDot.tsx
│   ├── ContributionList.tsx
│   └── InviteBanner.tsx
│
├── store/                        # Zustand state
│   ├── authStore.ts
│   ├── circleStore.ts
│   └── walletStore.ts
│
├── lib/                          # Utilities
│   ├── formatNaira.ts            # ₦ formatting
│   ├── formatPidgin.ts           # Status → Pidgin copy
│   ├── deepLinks.ts              # Circle invite link generation
│   └── socket.ts                 # Socket.io client
│
├── nostr/                        # Nostr layer
│   ├── identity.ts               # Keypair gen + Expo Secure Store
│   ├── circles.ts                # NIP-29 group create/join/list
│   └── events.ts                 # Contribution + collection event publish
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts           # OTP, phone, JWT
│   │   │   ├── circles.ts        # CRUD + invite
│   │   │   ├── contributions.ts  # Payment instructions, status
│   │   │   └── collections.ts    # Rotation trigger, payout
│   │   ├── services/
│   │   │   ├── breez.ts          # Breez SDK Liquid (server)
│   │   │   ├── bitnob.ts         # Naira↔sats, Lightning, payout
│   │   │   ├── mavapay.ts        # Backup payout
│   │   │   ├── cashwyre.ts       # Tertiary payout
│   │   │   ├── paystack.ts       # Inbound naira detection
│   │   │   ├── termii.ts         # OTP SMS
│   │   │   └── nostr.ts          # Relay publishing (server-side)
│   │   ├── webhooks/
│   │   │   ├── paystack.ts       # Inbound transfer confirmed
│   │   │   └── bitnob.ts         # Sats sent confirmed
│   │   ├── jobs/
│   │   │   └── rotation.ts       # node-cron collection trigger
│   │   ├── models/               # TypeORM or raw pg queries
│   │   └── app.ts
│   ├── .env
│   └── package.json
│
└── CLAUDE.md
```

---

## Database Schema (Complete)

```sql
-- Core tables

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    VARCHAR(15) UNIQUE NOT NULL,
  display_name    VARCHAR(100),
  nostr_pubkey    VARCHAR(64),                    -- hex pubkey only, never nsec
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(20),
  bank_code       VARCHAR(10),
  breez_node_id   VARCHAR(100),                   -- Breez SDK node ID on device
  lightning_addr  VARCHAR(200),                   -- user's Lightning address
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE circles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  organiser_id    UUID REFERENCES users(id),
  amount_naira    INTEGER NOT NULL,               -- in kobo (₦1 = 100 kobo)
  frequency       VARCHAR(20) NOT NULL,           -- 'weekly' | 'biweekly' | 'monthly'
  size            INTEGER NOT NULL,               -- number of members
  start_date      DATE NOT NULL,
  nostr_group_id  VARCHAR(100),                   -- NIP-29 group identifier
  invite_code     VARCHAR(20) UNIQUE NOT NULL,
  status          VARCHAR(20) DEFAULT 'forming',  -- 'forming' | 'active' | 'completed'
  rules           JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id),
  user_id         UUID REFERENCES users(id),
  slot_number     INTEGER NOT NULL,               -- 1-indexed position in rotation
  status          VARCHAR(20) DEFAULT 'active',
  deposit_paid    BOOLEAN DEFAULT FALSE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, slot_number),
  UNIQUE(circle_id, user_id)
);

CREATE TABLE contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id),
  user_id         UUID REFERENCES users(id),
  round_number    INTEGER NOT NULL,               -- not "week_number" — frequency-agnostic
  amount_naira    INTEGER NOT NULL,               -- kobo
  paystack_ref    VARCHAR(100),
  bitnob_tx_id    VARCHAR(100),
  nostr_event_id  VARCHAR(64),
  status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'missed'
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID REFERENCES circles(id),
  collector_id    UUID REFERENCES users(id),
  round_number    INTEGER NOT NULL,
  amount_naira    INTEGER NOT NULL,               -- kobo
  payout_rail     VARCHAR(20),                    -- 'bitnob' | 'mavapay' | 'cashwyre'
  payout_tx_id    VARCHAR(100),
  nostr_event_id  VARCHAR(64),
  status          VARCHAR(20) DEFAULT 'pending',
  collected_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reputation (
  user_id             UUID PRIMARY KEY REFERENCES users(id),
  circles_completed   INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,          -- count, not amount
  missed_payments     INTEGER DEFAULT 0,
  nostr_badge_event   VARCHAR(64),                -- NIP-58 badge event ID
  last_updated        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE otps (
  phone_number  VARCHAR(15) PRIMARY KEY,
  code          VARCHAR(6) NOT NULL,
  attempts      INTEGER DEFAULT 0,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Integrations

### Breez SDK Liquid (Mobile)

```typescript
// Docs: https://sdk-doc-liquid.breez.technology/
// Package: @breeztech/react-native-breez-sdk-liquid

// Init on registration
import { connect, defaultConfig, Network, PaymentMethod } from '@breeztech/react-native-breez-sdk-liquid'

const config = await defaultConfig(Network.MAINNET, BREEZ_API_KEY)
await connect({ config })

// Receive payment — generate invoice for contribution
const prepareResponse = await prepareReceivePayment({
  paymentMethod: PaymentMethod.LIGHTNING,
  payerAmountSat: satsAmount,
})
const receiveResponse = await receivePayment({ prepareResponse })
// receiveResponse.destination is the BOLT11 invoice

// Send payment — for collection payout
const prepareSend = await prepareSendPayment({ destination: bolt11Invoice })
await sendPayment({ prepareResponse: prepareSend })
```

### Bitnob API

```typescript
// Docs: https://docs.bitnob.com/docs/getting-started
// Base URL: https://api.bitnob.co/api/v1/
// Auth: Bearer token in Authorization header

// Convert naira to sats quote
POST /transactions/initiate
{ amount: 10000, currency: "NGN", type: "buy" }

// Lightning payout to user
POST /lightning/pay
{ invoice: string, amount_sats: number }

// Naira offramp — sats to bank account
POST /transactions/offramp
{
  amount: number,          // sats
  bank_code: string,
  account_number: string,
  currency: "NGN"
}

// Webhook events to handle:
// transaction.completed — inbound naira confirmed
// lightning.payment.success — Lightning send confirmed
```

### Mavapay API (Backup Payout)

```typescript
// Docs: https://docs.mavapay.co/introduction
// Use when Bitnob payout fails or is delayed > 5 minutes
// Wrap in try/catch — fall through to Cashwyre on failure
```

### Cashwyre API (Tertiary Payout)

```typescript
// Docs: https://business.cashwyre.com/doc/api
// Last resort payout rail
// Only called if both Bitnob AND Mavapay fail
```

### Payout Cascade Logic

```typescript
async function payoutCollector(collectorId: string, amountNaira: number) {
  try {
    return await bitnob.offramp(collectorId, amountNaira)
  } catch {
    try {
      return await mavapay.payout(collectorId, amountNaira)
    } catch {
      return await cashwyre.transfer(collectorId, amountNaira)
    }
  }
}
```

### Paystack

```typescript
// Dedicated virtual account per user
// Match inbound transfers by account reference
// Webhook: 'charge.success' event
// Verify signature: crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
POST /dedicated_account  → creates virtual account tied to user
GET  /dedicated_account  → check balance / transactions
```

### Termii (OTP)

```typescript
// Docs: https://developer.termii.com/
// Nigerian-first SMS delivery
POST https://api.ng.termii.com/api/sms/otp/send
{
  api_key: TERMII_API_KEY,
  message_type: "NUMERIC",
  to: phoneNumber,           // +234XXXXXXXXXX
  from: "Ajotribe",
  channel: "generic",
  pin_attempts: 3,
  pin_time_to_live: 5,       // minutes
  pin_length: 6,
  pin_placeholder: "< 1234 >",
  message_text: "Your Ajotribe code: < 1234 >. Valid for 5 minutes.",
  pin_type: "NUMERIC"
}
```

---

## Code Style

- TypeScript strict mode — no `any` types, no type assertions without comment explaining why
- ES modules (`import/export`) — never CommonJS `require`
- Destructure imports: `import { foo } from 'bar'`
- Async/await — never raw Promises or `.then()` chains
- Error handling — always try/catch on every external API call
- No comments explaining WHAT — only WHY (hidden constraints, non-obvious decisions)
- Component files: PascalCase (`CircleDashboard.tsx`)
- Utility files: camelCase (`formatNaira.ts`)
- Constants: SCREAMING_SNAKE_CASE
- Never hardcode amounts, limits, or API URLs — constants file only
- Store amounts in kobo (integer) internally — format to ₦ only at display layer

---

## Language and UX Rules — CRITICAL — NEVER VIOLATE

**Never show these words to users (anywhere — copy, toast, error, log that is user-visible):**
- Bitcoin, BTC, Lightning, sats, satoshis, wallet, crypto, blockchain, node
- Nostr, keypair, nsec, npub, relay, pubkey
- Lightning address, BOLT11, invoice, channel, liquidity
- Hash, transaction ID, signature, smart contract
- "Technical error" — always give a human action instead

**Always use these words:**
| Wrong | Right (Pidgin) |
|---|---|
| Your wallet | Your savings |
| Group | Circle |
| Send payment | Pay your own |
| Receive Lightning payment | Collect your money |
| Transaction confirmed | Your money don enter |
| Transaction failed | E no go through — try again |
| Pending | On the way |
| slot index 6 | Week 7 |
| 0.000023 BTC | ₦10,000 |
| Error 422 | Something no work — abeg try again |

**Pidgin copy rules:**
- All status messages in Nigerian Pidgin
- All error messages in Pidgin with one clear action
- Amount always: ₦10,000 (comma separated, no decimals)
- Addresses/names: "Mama Tunde" not "User #3847"
- Dates: "Wednesday, 28 May" not "2026-05-28T00:00:00Z"
- Weeks: "Week 3 of 12" not "Round 3" or "Slot 2"

**Pidgin glossary for consistency:**
```
"Pay your own"        → make your contribution
"Collect your money"  → receive the circle payout
"Your turn soon"      → you collect next round
"Na your week!"       → it's your collection week
"Circle don full"     → all slots filled
"Member don comot"    → member left
"Dem don confirm am"  → payment confirmed
"E don send"          → payout sent
```

---

## Security Rules

- Nostr nsec **never** leaves the device — backend only ever receives npub (public key)
- Never log: nsec, bank account numbers, OTP codes, JWT tokens
- All API keys in `.env` — never hardcoded, never in git
- Webhook signature verification is **mandatory** — reject any unverified webhook immediately (return 401, log attempt)
- OTP: 6 digits, expires 5 minutes, max 3 attempts, then lock phone for 1 hour
- Rate limit OTP requests: 3 per phone number per hour (Redis counter)
- JWT: 24-hour expiry, refresh token pattern for mobile
- All database queries use parameterised statements — no string interpolation
- Security deposits tracked in DB but held in Breez — never in Ajotribe operating accounts
- Never return full bank account numbers in API responses — mask last 4 digits only

---

## Environment Variables

```bash
# Breez SDK
BREEZ_API_KEY=

# Bitnob
BITNOB_API_KEY=
BITNOB_WEBHOOK_SECRET=

# Mavapay
MAVAPAY_API_KEY=
MAVAPAY_BASE_URL=https://api.mavapay.co

# Cashwyre
CASHWYRE_API_KEY=
CASHWYRE_BASE_URL=https://business.cashwyre.com/api

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_PUBLIC_KEY=                    # mobile app only

# Termii (OTP)
TERMII_API_KEY=
TERMII_SENDER_ID=Ajotribe

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# App
JWT_SECRET=                             # min 32 chars, random
ENCRYPTION_KEY=                         # AES-256 key, 32 bytes hex
APP_ENV=development                     # development | production

# Nostr
NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.primal.net
```

---

## Build Commands

```bash
# --- Mobile App (run from /app) ---

npx expo run:android          # Run on Android (required — not Expo Go)
npx expo run:ios              # Run on iOS
npx expo start                # Metro bundler only (pair with device build)
eas build --platform android --profile preview  # Demo APK
npx tsc --noEmit              # TypeScript check

# --- Backend (run from /backend) ---

npm run dev                   # nodemon + ts-node
npm run build                 # tsc compile
npm test                      # Jest test suite
npm run db:migrate            # Run pending migrations
npm run db:seed               # Seed demo circle + members

# --- Both ---

npm run lint                  # ESLint
npm run format                # Prettier

# --- Nostr (test relay connection) ---

wscat -c wss://relay.damus.io   # Verify relay is reachable
```

---

## Build Priority Order

Build in this exact order. Complete each item before starting the next. No skipping ahead.

```
PHASE 1 — Foundation (must work before anything else)
  [ ] 1. Backend: PostgreSQL schema + migrations
  [ ] 2. Backend: Termii OTP send + verify
  [ ] 3. Backend: JWT auth (phone → OTP → token)
  [ ] 4. Mobile: Auth screens (welcome → phone → OTP → name → bank)
  [ ] 5. Mobile: Nostr keypair generation on device + Expo Secure Store
  [ ] 6. Backend: Breez SDK server-side init

PHASE 2 — Circle Core
  [ ] 7. Backend: Circle CRUD (create, get, invite code generation)
  [ ] 8. Backend: NIP-29 group creation on circle create
  [ ] 9. Mobile: Circle creation flow (multi-step form)
  [ ] 10. Mobile: Deep link handling (ajotribe://circle/{inviteCode})
  [ ] 11. Mobile: Join circle via invite link
  [ ] 12. Backend: Slot assignment on join

PHASE 3 — Money In
  [ ] 13. Backend: Paystack virtual account per user
  [ ] 14. Backend: Paystack webhook handler (charge.success)
  [ ] 15. Backend: Bitnob naira→sats conversion on confirmed receipt
  [ ] 16. Backend: Breez Lightning send to user's wallet
  [ ] 17. Backend: Nostr contribution event publish
  [ ] 18. Mobile: Contribute screen (payment instructions)
  [ ] 19. Backend: Socket.io push on contribution confirmed

PHASE 4 — Dashboard
  [ ] 20. Mobile: Circle dashboard (real-time via Socket.io)
  [ ] 21. Mobile: CircleProgressRing component
  [ ] 22. Mobile: Member contribution status list

PHASE 5 — Money Out
  [ ] 23. Backend: node-cron rotation scheduler
  [ ] 24. Backend: Manual collection trigger endpoint (for demo)
  [ ] 25. Backend: Payout cascade (Bitnob → Mavapay → Cashwyre)
  [ ] 26. Backend: Nostr collection event publish
  [ ] 27. Mobile: Collection success screen

PHASE 6 — Polish
  [ ] 28. Mobile: Savings summary screen
  [ ] 29. Mobile: Reputation badge (NIP-58 Nostr badge)
  [ ] 30. UI: bitcoin.design tokens applied consistently
  [ ] 31. Copy: Full Pidgin pass on every user-facing string
  [ ] 32. QA: Mama Tunde test on every screen
```

---

## Demo Day Checklist (Non-Negotiable — Must Work with Real Money)

```
[ ] Create a circle in under 3 minutes on a live device
[ ] 3+ members join via shared invite link in real time
[ ] All members see each other in circle dashboard
[ ] Member 1 makes real ₦ bank transfer → dashboard updates in < 60 seconds
[ ] Member 2 makes real ₦ bank transfer → dashboard updates in < 60 seconds
[ ] Member 3 makes real ₦ bank transfer → dashboard updates in < 60 seconds
[ ] Organiser triggers collection → real naira lands in collector's bank account
[ ] Demo device has: pre-seeded circle, pre-registered members (backup demo path)
[ ] Pre-built APK on 3 physical Android devices (iOS as bonus)
[ ] Backend deployed on a stable server (Railway / Render / VPS) — not localhost
```

---

## Workflow Rules

1. Always typecheck after changes: `npx tsc --noEmit` — fix all errors before committing
2. Run lint before committing: `npm run lint`
3. Test Bitnob and Breez against their sandboxes before touching mainnet
4. Every external API call: try/catch + payout cascade fallback where applicable
5. Every user-facing string: Pidgin pass + Mama Tunde test before it ships
6. Commit messages: `feat:`, `fix:`, `chore:`, `docs:` prefixes only
7. Never commit any `.env` file — `.gitignore` it from day one
8. After every payment flow change: manually test the full contribution → dashboard → collection cycle
9. Socket.io events must be tested with 2+ simultaneous clients before demo

---

## What NOT to Build (Scope Boundaries — Do Not Touch)

- No AI assistant (Pidgin/Yoruba) — post-hackathon
- No WhatsApp bot — post-hackathon
- No SMS transaction notifications — post-hackathon (OTP only is fine)
- No USSD — post-hackathon
- No microloans or credit products
- No crypto exchange or trading features
- No user-visible Bitcoin/Lightning management interface
- No web app — mobile only for v1
- No multi-currency — naira only for v1
- No P2P Lightning between user devices — backend coordinates all payments
- No NIP-60 (Cashu wallet) — unnecessary complexity for hackathon scope
- No custom Lightning node — use Breez SDK only

---

## Hackathon Judging Criteria — How We Win

| Criterion | Our Answer |
|---|---|
| Bitcoin usage | Lightning as the settlement rail for every contribution and collection |
| Real-world impact | 400M+ informal savings users in Africa; digitising a centuries-old practice |
| Working demo | Real naira in, real naira out, live on stage |
| UX quality | Mama Tunde can use it without any explanation |
| Trust/decentralisation | Nostr events are the immutable, decentralised proof of every payment |
| Financial inclusion | No crypto knowledge, no bank card required — just a phone number and a Nigerian account |

**Elevator pitch (memorise this):**
"Ajo has existed in Nigeria for centuries. You put money in a pot every week. The pot rotates. Everyone gets their turn. Ajotribe makes it digital, trustless, and automatic — using Bitcoin as the rails and Nostr as the proof — but the only thing Mama Tunde ever sees is naira."
