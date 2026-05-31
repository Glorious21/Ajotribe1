import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { verifyWebhookSignature } from '../services/paystack';
import * as bitnob from '../services/bitnob';
import * as breez from '../services/breez';
import * as nostr from '../services/nostr';
import { getIo } from '../app';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string;

  if (!verifyWebhookSignature(JSON.stringify(req.body), signature)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  const event = req.body as {
    event: string;
    data: {
      reference: string;
      amount: number; // in kobo
      customer?: { customer_code?: string };
    };
  };

  if (event.event !== 'charge.success') {
    res.sendStatus(200);
    return;
  }

  const { reference, amount } = event.data;

  res.sendStatus(200); // Acknowledge quickly

  setImmediate(async () => {
    try {
      // Primary: match user by Paystack customer_code (virtual account payments)
      // Fallback: parse reference AJO-{circleId8}-{userId6}-{timestamp}
      let userResult: { rows: Array<{ id: string; nostr_pubkey: string | null }> };
      const customerCode = event.data.customer?.customer_code;

      if (customerCode) {
        userResult = await pool.query<{ id: string; nostr_pubkey: string | null }>(
          `SELECT id, nostr_pubkey FROM users WHERE paystack_customer_code = $1`,
          [customerCode]
        );
      } else {
        const parts = reference.split('-');
        if (parts.length < 4 || parts[0] !== 'AJO') {
          console.error('Unrecognised payment reference and no customer_code:', reference);
          return;
        }
        userResult = await pool.query<{ id: string; nostr_pubkey: string | null }>(
          `SELECT id, nostr_pubkey FROM users WHERE UPPER(id::text) LIKE $1`,
          [`${parts[2]}%`]
        );
      }

      if (!userResult.rows.length) {
        console.error('No user found for payment — customer_code:', customerCode, 'reference:', reference);
        return;
      }

      const user = userResult.rows[0];

      // Find the circle: prefer reference prefix match, fall back to amount + active membership
      const refParts = reference.split('-');
      let circleResult: { rows: Array<{ id: string; amount_naira: number; nostr_group_id: string | null }> };

      if (refParts.length >= 2 && refParts[0] === 'AJO') {
        circleResult = await pool.query(
          `SELECT c.id, c.amount_naira, c.nostr_group_id
           FROM circles c
           JOIN memberships m ON m.circle_id = c.id
           WHERE UPPER(c.id::text) LIKE $1 AND m.user_id = $2 AND m.status = 'active'`,
          [`${refParts[1]}%`, user.id]
        );
      } else {
        circleResult = await pool.query(
          `SELECT c.id, c.amount_naira, c.nostr_group_id
           FROM circles c
           JOIN memberships m ON m.circle_id = c.id
           WHERE m.user_id = $1 AND m.status = 'active' AND c.amount_naira = $2 AND c.status = 'active'
           LIMIT 1`,
          [user.id, amount]
        );
      }

      if (!circleResult.rows.length) {
        console.error('No circle found for reference:', reference);
        return;
      }

      const circle = circleResult.rows[0];

      // Get current round
      const roundResult = await pool.query<{ max_round: number }>(
        `SELECT COALESCE(MAX(round_number), 1) AS max_round FROM contributions WHERE circle_id = $1`,
        [circle.id]
      );
      const roundNumber = Number(roundResult.rows[0].max_round);

      // Upsert contribution
      const contribResult = await pool.query<{ id: string }>(
        `INSERT INTO contributions (circle_id, user_id, round_number, amount_naira, paystack_ref, status, paid_at)
         VALUES ($1, $2, $3, $4, $5, 'confirmed', NOW())
         ON CONFLICT (circle_id, user_id, round_number) DO UPDATE
         SET status = 'confirmed', paystack_ref = $5, paid_at = NOW()
         RETURNING id`,
        [circle.id, user.id, roundNumber, amount, reference]
      );

      // Convert naira → sats via Bitnob, then pull sats into the backend Breez wallet.
      // The Breez wallet holds the circle pool until the collection payout.
      try {
        const { sats } = await bitnob.nairaToBtcQuote(amount);

        let settleTxId: string | null = null;
        if (breez.isReady()) {
          try {
            const invoice = await breez.createReceiveInvoice(
              sats,
              `Ajotribe contribution — ${reference}`
            );
            settleTxId = await bitnob.payLightningInvoice(invoice, sats);
          } catch (lightningErr) {
            console.error('[Breez] Lightning settlement failed (non-fatal):', (lightningErr as Error).message);
          }
        }

        await pool.query(
          `UPDATE contributions SET bitnob_tx_id = $1 WHERE id = $2`,
          [settleTxId ?? `quote:${sats}sats`, contribResult.rows[0].id]
        );
      } catch (bitnobErr) {
        console.error('Bitnob quote failed (non-fatal):', (bitnobErr as Error).message);
      }

      // Publish Nostr contribution event
      let nostrEventId: string | null = null;
      if (circle.nostr_group_id && user.nostr_pubkey) {
        try {
          nostrEventId = await nostr.publishContributionEvent({
            circleId: circle.id,
            nostrGroupId: circle.nostr_group_id,
            userPubkey: user.nostr_pubkey,
            roundNumber,
            amountNaira: amount,
          });
          await pool.query(
            `UPDATE contributions SET nostr_event_id = $1 WHERE id = $2`,
            [nostrEventId, contribResult.rows[0].id]
          );
        } catch (nostrErr) {
          console.error('Nostr publish failed (non-fatal):', nostrErr);
        }
      }

      // Push real-time update to circle room
      getIo().to(`circle:${circle.id}`).emit('contribution:confirmed', {
        userId: user.id,
        amountNaira: amount / 100,
        roundNumber,
        nostrEventId,
      });

      console.log(`Contribution confirmed: ₦${amount / 100} from user ${user.id} to circle ${circle.id}`);
    } catch (err) {
      console.error('Paystack webhook processing error:', err);
    }
  });
});

export default router;
