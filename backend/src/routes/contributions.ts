import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /contributions/circle/:circleId/instructions
router.get('/circle/:circleId/instructions', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const circleId = req.params.circleId as string;

  const circleResult = await pool.query(
    `SELECT c.amount_naira, c.frequency, c.name
     FROM circles c
     JOIN memberships m ON m.circle_id = c.id
     WHERE c.id = $1 AND m.user_id = $2 AND m.status = 'active'`,
    [circleId, userId]
  );

  if (!circleResult.rows.length) {
    res.status(403).json({ error: 'You no be member of this circle' });
    return;
  }

  const circle = circleResult.rows[0] as { amount_naira: number; frequency: string; name: string };

  // Look up user's Paystack virtual account
  const userResult = await pool.query<{ paystack_virtual_account: string | null; paystack_bank_name: string | null }>(
    'SELECT paystack_virtual_account, paystack_bank_name FROM users WHERE id = $1',
    [userId]
  );
  const virtualAccount = userResult.rows[0]?.paystack_virtual_account ?? null;

  if (!virtualAccount) {
    res.status(400).json({
      error: 'Your account setup no complete — update your profile to get your bank details',
    });
    return;
  }

  const bankName = userResult.rows[0]?.paystack_bank_name ?? 'Wema Bank (ALAT)';
  const reference = `AJO-${circleId.slice(0, 8).toUpperCase()}-${userId.slice(0, 6).toUpperCase()}-${Date.now()}`;

  res.json({
    amountNaira: circle.amount_naira / 100,
    reference,
    instructions: {
      bankName,
      accountNumber: virtualAccount,
      accountName: `Ajotribe - ${circle.name}`,
      narration: reference,
    },
    message: `Transfer ₦${(circle.amount_naira / 100).toLocaleString('en-NG')} to the account below. Use "${reference}" as your narration. Your money go enter the circle immediately we confirm am.`,
  });
});

// GET /contributions/circle/:circleId
router.get('/circle/:circleId', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const circleId = req.params.circleId as string;

  const memberCheck = await pool.query(
    `SELECT id FROM memberships WHERE circle_id = $1 AND user_id = $2 AND status = 'active'`,
    [circleId, userId]
  );
  if (!memberCheck.rows.length) {
    res.status(403).json({ error: 'You no be member of this circle' });
    return;
  }

  const result = await pool.query(
    `SELECT co.*, u.display_name
     FROM contributions co
     JOIN users u ON u.id = co.user_id
     WHERE co.circle_id = $1
     ORDER BY co.round_number, co.created_at`,
    [circleId]
  );

  res.json(result.rows);
});

export default router;
