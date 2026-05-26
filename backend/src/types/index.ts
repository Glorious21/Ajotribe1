export interface User {
  id: string;
  phone_number: string;
  display_name: string | null;
  nostr_pubkey: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_code: string | null;
  breez_node_id: string | null;
  lightning_addr: string | null;
  paystack_customer_code: string | null;
  paystack_virtual_account: string | null;
  paystack_bank_name: string | null;
  created_at: Date;
}

export interface Circle {
  id: string;
  name: string;
  organiser_id: string;
  amount_naira: number; // kobo
  frequency: 'weekly' | 'biweekly' | 'monthly';
  size: number;
  start_date: Date;
  nostr_group_id: string | null;
  invite_code: string;
  status: 'forming' | 'active' | 'completed';
  rules: Record<string, unknown> | null;
  created_at: Date;
}

export interface Membership {
  id: string;
  circle_id: string;
  user_id: string;
  slot_number: number;
  status: 'active' | 'removed';
  deposit_paid: boolean;
  joined_at: Date;
}

export interface Contribution {
  id: string;
  circle_id: string;
  user_id: string;
  round_number: number;
  amount_naira: number; // kobo
  paystack_ref: string | null;
  bitnob_tx_id: string | null;
  nostr_event_id: string | null;
  status: 'pending' | 'confirmed' | 'missed';
  paid_at: Date | null;
  created_at: Date;
}

export interface Collection {
  id: string;
  circle_id: string;
  collector_id: string;
  round_number: number;
  amount_naira: number; // kobo
  payout_rail: 'bitnob' | 'mavapay' | 'cashwyre' | null;
  payout_tx_id: string | null;
  nostr_event_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  collected_at: Date | null;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  phoneNumber: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
