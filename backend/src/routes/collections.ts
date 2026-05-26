import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { payoutWithCascade } from '../services/payout';
import * as nostr from '../services/nostr';
import { getIo } from '../app';

const router = Router();

// POST /collections/trigger/:circleId — manual trigger (organiser only, for demo)
router.post('/trigger/:circleId', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const circleId = req.params.circleId as string;

  // Verify organiser
  const circleResult = await pool.query(
    `SELECT c.*, u.bank_code, u.bank_account, u.nostr_pubkey, u.display_name
     FROM circles c
     JOIN memberships m ON m.circle_id = c.id
     LEFT JOIN users u ON u.id = m.user_id
     WHERE c.id = $1 AND c.organiser_id = $2 AND c.status = 'active'`,
    [circleId, userId]
  );

  if (!circleResult.rows.length) {
    res.status(403).json({ error: 'Only the circle organiser can trigger collection' });
    return;
  }

  const circle = circleResult.rows[0] as {
    id: string;
    amount_naira: number;
    size: number;
    nostr_group_id: string | null;
  };

  // Determine current round and collector
  const roundResult = await pool.query<{ max_round: number }>(
    `SELECT COALESCE(MAX(round_number), 0) AS max_round FROM collections WHERE circle_id = $1`,
    [circleId]
  );
  const roundNumber = Number(roundResult.rows[0].max_round) + 1;

  const collectorResult = await pool.query<{
    user_id: string;
    slot_number: number;
    bank_code: string;
    bank_account: string;
    nostr_pubkey: string;
    display_name: string;
  }>(
    `SELECT m.user_id, m.slot_number, u.bank_code, u.bank_account, u.nostr_pubkey, u.display_name
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.circle_id = $1 AND m.slot_number = $2 AND m.status = 'active'`,
    [circleId, roundNumber]
  );

  if (!collectorResult.rows.length) {
    res.status(400).json({ error: `No member in slot ${roundNumber}` });
    return;
  }

  const collector = collectorResult.rows[0];
  const totalPot = circle.amount_naira * circle.size;

  // Create collection record
  const colResult = await pool.query<{ id: string }>(
    `INSERT INTO collections (circle_id, collector_id, round_number, amount_naira, status)
     VALUES ($1, $2, $3, $4, 'processing')
     RETURNING id`,
    [circleId, collector.user_id, roundNumber, totalPot]
  );
  const collectionId = colResult.rows[0].id;

  res.json({
    message: `Collection started for ${collector.display_name ?? 'Member'}`,
    collectionId,
    collector: collector.display_name,
    amountNaira: totalPot / 100,
    roundNumber,
  });

  // Async: do the actual payout
  setImmediate(async () => {
    try {
      const reference = `COL-${collectionId.slice(0, 8).toUpperCase()}`;
      const payout = await payoutWithCascade({
        amountNaira: totalPot,
        bankCode: collector.bank_code,
        accountNumber: collector.bank_account,
        reference,
      });

      const nostrEventId = circle.nostr_group_id
        ? await nostr.publishCollectionEvent({
            circleId,
            nostrGroupId: circle.nostr_group_id,
            collectorPubkey: collector.nostr_pubkey,
            roundNumber,
            amountNaira: totalPot,
          })
        : null;

      await pool.query(
        `UPDATE collections SET status = 'completed', payout_rail = $1, payout_tx_id = $2,
         nostr_event_id = $3, collected_at = NOW() WHERE id = $4`,
        [payout.rail, payout.txId, nostrEventId, collectionId]
      );

      // Push real-time update
      getIo().to(`circle:${circleId}`).emit('collection:completed', {
        roundNumber,
        collector: collector.display_name,
        amountNaira: totalPot / 100,
        rail: payout.rail,
      });
    } catch (err) {
      console.error('Collection payout failed:', err);
      await pool.query(`UPDATE collections SET status = 'failed' WHERE id = $1`, [collectionId]);
      getIo().to(`circle:${circleId}`).emit('collection:failed', { roundNumber });
    }
  });
});

export default router;
