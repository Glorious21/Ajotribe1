import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /users/me/savings — savings summary for the current user
router.get('/me/savings', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const [contribRow, collectRow, repRow, activeRow] = await Promise.all([
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_naira), 0) AS total
       FROM contributions WHERE user_id = $1 AND status = 'confirmed'`,
      [userId]
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_naira), 0) AS total
       FROM collections WHERE collector_id = $1 AND status = 'completed'`,
      [userId]
    ),
    pool.query<{ circles_completed: number; missed_payments: number }>(
      `SELECT circles_completed, missed_payments FROM reputation WHERE user_id = $1`,
      [userId]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM memberships m
       JOIN circles c ON c.id = m.circle_id
       WHERE m.user_id = $1 AND m.status = 'active' AND c.status = 'active'`,
      [userId]
    ),
  ]);

  res.json({
    totalSaved:        Number(contribRow.rows[0].total),
    totalCollected:    Number(collectRow.rows[0].total),
    circlesCompleted:  repRow.rows[0]?.circles_completed ?? 0,
    missedPayments:    repRow.rows[0]?.missed_payments ?? 0,
    activeCircles:     Number(activeRow.rows[0].count),
  });
});

export default router;
