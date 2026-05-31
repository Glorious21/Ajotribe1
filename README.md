# Ajotribe

### Community Finance Infrastructure for Everyday Africans

Ajotribe is a multilingual AI-powered community finance platform designed for informal African communities — market women, food vendors, artisans, transport workers, cooperative groups, and low-income earners.

Ajotribe digitizes traditional savings circles (Ajo, Esusu, Adashe, Susu) while preserving the trust, community coordination, and financial discipline that already exist within these systems.

Users interact using familiar language, simple workflows, and community structures, while Bitcoin, Lightning, Breez SDK, and Nostr operate silently in the background as the infrastructure powering trust, transparency, and settlement.

Built for Hack4Freedom 2026.

---

# Table of Contents

- Why Ajotribe Exists
- Problem Statement
- Market Research & Survey Findings
- User Personas
- Solution Overview
- Core Features
- How Ajofi Works
- User Flow
- AI Architecture
- Bitcoin Infrastructure
- Breez SDK Integration
- Nostr Integration
- Technical Architecture
- API Documentation
- Database Design
- Security & Trust
- Impact
- SDGs Alignment
- Competitive Advantage
- Business Model
- Roadmap
- Tech Stack
- Local Development
- Environment Variables
- Team

---

# Why Ajotribe Exists

Across Africa, millions of women and informal workers already practice financial discipline through traditional savings systems such as:

- Ajo
- Esusu
- Adashe
- Susu
- Cooperative savings groups

These systems work because they are built on trust.

However, they still face major challenges:

- Cash handling risks
- Missing records
- Collector fraud
- No emergency support systems
- No portable reputation
- Limited financial inclusion
- Language barriers
- Poor access to formal banking

Ajotribe exists to preserve what already works while using modern infrastructure to eliminate these limitations.

---

# Problem Statement

How might we help informal African workers safely save, contribute, coordinate, and access emergency financial support in a way that respects how they already live, communicate, and survive together?

---

# Market Research & Survey Findings

## Interview Participants

We conducted interviews with market women and informal traders.

### Key Findings

### 1. Savings Circles Are Already Common

Most participants already participate in:

- Daily contributions
- Weekly contributions
- Monthly contributions

### 2. Trust Is Everything

Participants repeatedly emphasized:

> "She is reliable."

Trust in the collector is more important than technology.

### 3. Ajo Creates Financial Discipline

Participants explained that:

- Contributions help them save consistently
- Money becomes available when needed
- They avoid unnecessary spending

### 4. Emergency Situations Are Common

Common emergencies include:

- School fees
- Medical expenses
- Family support
- Business restocking

### 5. Users Prefer Simplicity

Many participants:

- Use WhatsApp
- Prefer voice communication
- Prefer local languages
- Avoid complicated banking processes

---

# User Persona

## Amina

### Profile

- Age: 42
- Occupation: Tomato Seller
- Location: Kano
- Education: Primary School
- Phone: Low-end Android

### Goals

- Save consistently
- Access emergency support
- Join trusted savings circles
- Grow her business

### Pain Points

- Cash theft
- Unreliable collectors
- Language barriers
- No savings visibility
- Limited financial services

---

# Solution Overview

Ajotribe is a community finance platform powered by:

- AI
- Bitcoin
- Lightning
- Breez SDK
- Nostr

Users experience:

- Savings
- Contributions
- Emergency support
- Community coordination

without needing to understand cryptocurrency.

---

# Core Features

## Phone Number Registration

### Problem

Many users do not have:

- Email addresses
- Bank accounts
- Technical knowledge

### Solution

Users register with:

- Phone Number
- OTP Verification

No wallet setup required.

---

## Multilingual AI Assistant

### Problem

Most fintech applications operate exclusively in English.

### Solution

Ajotribe supports:

- English
- Yoruba
- Hausa
- Igbo
- Nigerian Pidgin

### Example

User:

> "I wan save ₦1000 today"

AI:

> "Your ₦1000 contribution has been recorded successfully."

---

## Voice-First Experience

Users can:

- Speak naturally
- Receive voice responses
- Navigate without reading complex text

---

## Digital Savings Circles

Users can:

- Create circles
- Join circles
- Track contributions
- View collection schedules
- Monitor group progress

---

## Emergency Community Fund

Users can:

- Request emergency assistance
- Receive community support
- Track emergency requests

Supported scenarios:

- School fees
- Medical emergencies
- Business recovery

---

## Trust & Reputation Layer

Ajofi creates portable reputation through Nostr.

Users build trust based on:

- Contribution history
- Completed circles
- Reputation badges

---

## USSD Offline Mode

Users can dial:

```text
*347#
```

Menu:

```text
1. Save Money
2. Check Balance
3. My Circle
4. Emergency Support
5. Change Language
```

Works on:

- Feature phones
- Low-end devices
- No internet connection

---

# How Ajofi Works

## Contribution Flow

```text
User
 ↓
Paystack Virtual Account
 ↓
Paystack Webhook
 ↓
Backend Verification
 ↓
Bitnob Conversion
 ↓
Breez Wallet
 ↓
Nostr Contribution Record
 ↓
Circle Dashboard Update
```

---

## Collection Flow

```text
Collection Day
 ↓
Backend Trigger
 ↓
Breez Treasury Wallet
 ↓
Bitnob Offramp
 ↓
Bank Transfer
 ↓
Beneficiary Receives Naira
```

---

# User Flow

## New User

```text
Install App
 ↓
Enter Phone Number
 ↓
Verify OTP
 ↓
Choose Language
 ↓
Create Profile
 ↓
Join Circle
 ↓
Start Saving
```

---

## Circle Owner

```text
Create Circle
 ↓
Set Contribution Rules
 ↓
Invite Members
 ↓
Track Contributions
 ↓
Release Funds
```

---

# AI Architecture

## Layer 1 — Language Detection

Detects:

- Yoruba
- Hausa
- Igbo
- Pidgin
- English

---

## Layer 2 — Intent Detection

Examples:

```text
Save Money
Join Circle
Check Balance
Request Support
```

---

## Layer 3 — Financial Education

Provides:

- Savings tips
- Contribution reminders
- Financial literacy content

---

## Layer 4 — Recommendation Engine

Suggests:

- Savings goals
- Contribution schedules
- Emergency preparedness

---

# Why Bitcoin

Users do not interact directly with Bitcoin.

Bitcoin serves as infrastructure.

Benefits:

- Fast settlement
- Open financial rails
- Cross-border compatibility
- Inflation protection
- Financial freedom

---

# Breez SDK Integration

## Why Breez

Breez provides:

- Lightning infrastructure
- Self-custodial treasury
- Settlement layer
- Wallet functionality

Without Breez:

- No Lightning settlement
- No pooled treasury
- No decentralized financial infrastructure

---

## Contribution Lifecycle

```text
Naira Deposit
 ↓
Paystack
 ↓
Bitnob
 ↓
Lightning Payment
 ↓
Breez Treasury Wallet
```

---

## Collection Lifecycle

```text
Collection Trigger
 ↓
Breez Wallet
 ↓
Bitnob Offramp
 ↓
Bank Transfer
```

---

# Nostr Integration

## Why Nostr

Nostr provides:

- Identity
- Reputation
- Transparency
- Portability

---

## NIPs Used

### NIP-29

Closed Group Coordination

Used for:

- Savings circles
- Membership management

---

### NIP-78

Application Data Storage

Used for:

- Circle metadata
- Group settings

---

### NIP-58

Badges

Used for:

- Reputation
- Completed circles
- Community recognition

---

## Contribution Record

Every contribution becomes:

```text
Signed
Timestamped
Immutable
Portable
```

---

# Technical Architecture

```text
Frontend
│
├── React Native
├── Expo
├── TypeScript
│
Backend
│
├── Node.js
├── Express
├── PostgreSQL
├── Redis
│
Infrastructure
│
├── Breez SDK
├── Nostr
├── Bitnob
├── Paystack
├── Termii
│
AI Layer
│
├── GPT
├── Translation Engine
├── Voice Interface
```

---

# API Documentation

## Authentication

### Send OTP

```http
POST /auth/send-otp
```

Request:

```json
{
  "phone": "+2348012345678"
}
```

---

### Verify OTP

```http
POST /auth/verify-otp
```

Request:

```json
{
  "phone": "+2348012345678",
  "code": "123456"
}
```

---

## Profile

### Create Profile

```http
POST /auth/profile
```

Request:

```json
{
  "name": "Amina"
}
```

---

## Savings Circles

### Create Circle

```http
POST /circles
```

### Get Circles

```http
GET /circles
```

### Join Circle

```http
POST /circles/join/:inviteCode
```

---

## Contributions

### Get Payment Instructions

```http
GET /contributions/:circleId/instructions
```

---

## Collections

### Trigger Collection

```http
POST /collections/:circleId/trigger
```

---

## Savings

### Get Savings Summary

```http
GET /users/me/savings
```

---

# Database Design

## Users

```sql
id
name
phone
language
nostr_pubkey
created_at
```

---

## Circles

```sql
id
name
owner_id
contribution_amount
frequency
invite_code
```

---

## Contributions

```sql
id
circle_id
user_id
amount
status
nostr_event_id
```

---

## Collections

```sql
id
circle_id
beneficiary_id
amount
status
```

---

# Security & Trust

## Authentication

- OTP Verification
- JWT Sessions

## Data Protection

- AES Encryption
- Encrypted Secrets

## Infrastructure

- Breez Treasury
- Nostr Verification
- Immutable Records

---

# SDGs Alignment

### SDG 1

No Poverty

### SDG 5

Gender Equality

### SDG 8

Decent Work & Economic Growth

### SDG 9

Industry Innovation & Infrastructure

### SDG 10

Reduced Inequalities

---

# Competitive Advantage

| Feature | Ajofi | Traditional Ajo | PiggyVest | Cowrywise |
|----------|----------|----------|----------|----------|
| Multilingual AI | ✅ | ❌ | ❌ | ❌ |
| Voice Interface | ✅ | ❌ | ❌ | ❌ |
| Community Savings | ✅ | ✅ | ❌ | ❌ |
| Emergency Support | ✅ | ❌ | ❌ | ❌ |
| USSD Access | ✅ | ❌ | ❌ | ❌ |
| Portable Reputation | ✅ | ❌ | ❌ | ❌ |
| Nostr Identity | ✅ | ❌ | ❌ | ❌ |

---

# Roadmap

## Phase 1

Core Savings Infrastructure

## Phase 2

AI Assistant

## Phase 3

USSD Expansion

## Phase 4

Cross-Border Communities

## Phase 5

Cooperative Finance Infrastructure

---

# Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React Native |
| Backend | Node.js |
| Database | PostgreSQL |
| Cache | Redis |
| AI | GPT |
| Payments | Paystack |
| Bitcoin | Breez SDK |
| Identity | Nostr |
| SMS | Termii |
| Conversion | Bitnob |

---

# Team

Built by Team Ajotribe for Hack4Freedom 2026.

Powered by:

- Bitcoin
- Lightning
- Breez SDK
- Nostr
- AI

Financial freedom should not require financial expertise.
Ajotribe makes community finance accessible to everyone.
