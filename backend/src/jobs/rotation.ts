import cron from 'node-cron';
import { pool } from '../db/pool';
import { payoutWithCascade } from '../services/payout';
import * as nostr from '../services/nostr';

interface ActiveCircle {
  id: string;
  name: string;
  amount_naira: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  size: number;
  start_date: string;
  nostr_group_id: string | null;
}

function isDueToday(startDate: Date, frequency: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  if (today < start) return false;
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  switch (frequency) {
    case 'weekly':   return daysDiff % 7 === 0;
    case 'biweekly': return daysDiff % 14 === 0;
    case 'monthly':  return today.getDate() === start.getDate();
    default:         return false;
  }
}

function currentRoundFor(startDate: Date, frequency: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  if (today <= start) return 1;
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  switch (frequency) {
    case 'weekly':   return Math.floor(daysDiff / 7) + 1;
    case 'biweekly': return Math.floor(daysDiff / 14) + 1;
    case 'monthly': {
      const m = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
      return m + 1;
    }
    default: return 1;
  }
}

async function processCollection(circle: ActiveCircle): Promise<void> {
  const roundNumber = currentRoundFor(new Date(circle.start_date), circle.frequency);

  const existing = await pool.query(
    `SELECT id FROM collections WHERE circle_id = $1 AND round_number = $2`,
    [circle.id, roundNumber]
  );
  if (existing.rows.length) return; // already done

  const collectorResult = await pool.query<{
    user_id: string;
    display_name: string | null;
    bank_code: string;
    bank_account: string;
    nostr_pubkey: string | null;
  }>(
    `SELECT m.user_id, u.display_name, u.bank_code, u.bank_account, u.nostr_pubkey
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.circle_id = $1 AND m.slot_number = $2 AND m.status = 'active'`,
    [circle.id, roundNumber]
  );

  if (!collectorResult.rows.length) {
    console.warn(`[cron] No collector for circle ${circle.id} round ${roundNumber} — slot may be empty`);
    return;
  }

  const collector = collectorResult.rows[0];
  const totalPot = circle.amount_naira * circle.size;

  const colResult = await pool.query<{ id: string }>(
    `INSERT INTO collections (circle_id, collector_id, round_number, amount_naira, status)
     VALUES ($1, $2, $3, $4, 'processing') RETURNING id`,
    [circle.id, collector.user_id, roundNumber, totalPot]
  );
  const collectionId = colResult.rows[0].id;

  try {
    const payout = await payoutWithCascade({
      amountNaira: totalPot,
      bankCode: collector.bank_code,
      accountNumber: collector.bank_account,
      reference: `COL-${collectionId.slice(0, 8).toUpperCase()}`,
    });

    let nostrEventId: string | null = null;
    if (circle.nostr_group_id && collector.nostr_pubkey) {
      nostrEventId = await nostr.publishCollectionEvent({
        circleId: circle.id,
        nostrGroupId: circle.nostr_group_id,
        collectorPubkey: collector.nostr_pubkey,
        roundNumber,
        amountNaira: totalPot,
      }).catch((err: unknown) => {
        console.error('[cron] Nostr publish failed (non-fatal):', err);
        return null;
      });
    }

    await pool.query(
      `UPDATE collections SET status = 'completed', payout_rail = $1, payout_tx_id = $2,
       nostr_event_id = $3, collected_at = NOW() WHERE id = $4`,
      [payout.rail, payout.txId, nostrEventId, collectionId]
    );

    // Update reputation for all members
    await pool.query(
      `UPDATE reputation
       SET total_contributions = total_contributions + 1
       WHERE user_id IN (
         SELECT user_id FROM memberships WHERE circle_id = $1 AND status = 'active'
       )`,
      [circle.id]
    );

    // Close circle when all rounds complete
    if (roundNumber >= circle.size) {
      await pool.query(`UPDATE circles SET status = 'completed' WHERE id = $1`, [circle.id]);
      await pool.query(
        `UPDATE reputation SET circles_completed = circles_completed + 1
         WHERE user_id IN (SELECT user_id FROM memberships WHERE circle_id = $1)`,
        [circle.id]
      );
      console.log(`[cron] Circle ${circle.name} completed after ${circle.size} rounds`);
    }

    console.log(
      `[cron] ₦${totalPot / 100} sent to ${collector.display_name ?? collector.user_id} via ${payout.rail} (circle: ${circle.name}, round: ${roundNumber})`
    );
  } catch (err) {
    await pool.query(`UPDATE collections SET status = 'failed' WHERE id = $1`, [collectionId]);
    throw err;
  }
}

export function startRotationJob(): void {
  // 8:00 AM UTC = 9:00 AM WAT (Nigeria time)
  cron.schedule('0 8 * * *', async () => {
    console.log('[cron] Rotation check running...');
    try {
      const result = await pool.query<ActiveCircle>(
        `SELECT id, name, amount_naira, frequency, size, start_date, nostr_group_id
         FROM circles WHERE status = 'active'`
      );

      for (const circle of result.rows) {
        if (isDueToday(new Date(circle.start_date), circle.frequency)) {
          processCollection(circle).catch((err: unknown) =>
            console.error(`[cron] Collection failed for circle ${circle.id}:`, err)
          );
        }
      }
    } catch (err) {
      console.error('[cron] Rotation check error:', err);
    }
  });

  console.log('[cron] Rotation scheduler started (fires 08:00 UTC daily)');
}
