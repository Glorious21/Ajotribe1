import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { getServerPubkey } from '../services/nostr';
import { Circle } from '../types';

const router = Router();

// POST /circles — create a new circle
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, amount_naira, frequency, size, start_date, rules } = req.body as {
    name?: string;
    amount_naira?: number;
    frequency?: string;
    size?: number;
    start_date?: string;
    rules?: Record<string, unknown>;
  };

  if (!name || !amount_naira || !frequency || !size || !start_date) {
    res.status(400).json({ error: 'All circle details required' });
    return;
  }

  if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
    res.status(400).json({ error: 'Frequency must be weekly, biweekly, or monthly' });
    return;
  }

  if (size < 2 || size > 50) {
    res.status(400).json({ error: 'Circle must have 2–50 members' });
    return;
  }

  if (amount_naira < 100000) { // minimum ₦1,000 (in kobo)
    res.status(400).json({ error: 'Minimum contribution is ₦1,000' });
    return;
  }

  const inviteCode = nanoid(10).toUpperCase();
  const organiserId = req.user!.userId;

  // NIP-29 group ID: server pubkey + circle invite code uniquely identifies this group
  const serverPubkey = getServerPubkey();
  const nostrGroupId = `${serverPubkey.slice(0, 8)}-${inviteCode}`.toLowerCase();

  const result = await pool.query<Circle>(
    `INSERT INTO circles (name, organiser_id, amount_naira, frequency, size, start_date, invite_code, nostr_group_id, rules)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, organiserId, amount_naira, frequency, size, start_date, inviteCode, nostrGroupId, JSON.stringify(rules ?? {})]
  );

  const circle = result.rows[0];

  // Add organiser as first member (slot 1)
  await pool.query(
    `INSERT INTO memberships (circle_id, user_id, slot_number) VALUES ($1, $2, 1)`,
    [circle.id, organiserId]
  );

  res.status(201).json({
    circle,
    inviteLink: `ajotribe://circle/${inviteCode}`,
    inviteUrl: `https://ajotribe.ng/join/${inviteCode}`,
  });
});

// GET /circles/invite/:code — preview circle before joining
router.get('/invite/:code', async (req: Request, res: Response) => {
  const result = await pool.query<Circle & { organiser_name: string; member_count: number }>(
    `SELECT c.*, u.display_name AS organiser_name,
            (SELECT COUNT(*) FROM memberships m WHERE m.circle_id = c.id AND m.status = 'active') AS member_count
     FROM circles c
     JOIN users u ON u.id = c.organiser_id
     WHERE c.invite_code = $1`,
    [req.params.code]
  );

  if (!result.rows.length) {
    res.status(404).json({ error: 'Circle not found' });
    return;
  }

  const circle = result.rows[0];
  res.json({
    id: circle.id,
    name: circle.name,
    organiser_name: circle.organiser_name,
    amount_naira: circle.amount_naira,
    frequency: circle.frequency,
    size: circle.size,
    member_count: Number(circle.member_count),
    spots_left: circle.size - Number(circle.member_count),
    start_date: circle.start_date,
    status: circle.status,
  });
});

// POST /circles/join/:code — join a circle
router.post('/join/:code', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const circleResult = await pool.query<Circle>(
    `SELECT * FROM circles WHERE invite_code = $1`,
    [req.params.code]
  );

  if (!circleResult.rows.length) {
    res.status(404).json({ error: 'Circle not found' });
    return;
  }

  const circle = circleResult.rows[0];

  if (circle.status === 'completed') {
    res.status(400).json({ error: 'This circle don finish' });
    return;
  }

  // Check already joined
  const existing = await pool.query(
    `SELECT id FROM memberships WHERE circle_id = $1 AND user_id = $2`,
    [circle.id, userId]
  );
  if (existing.rows.length) {
    res.status(400).json({ error: 'You don already join this circle' });
    return;
  }

  // Find next available slot
  const slotResult = await pool.query<{ max_slot: number }>(
    `SELECT COALESCE(MAX(slot_number), 0) AS max_slot FROM memberships WHERE circle_id = $1 AND status = 'active'`,
    [circle.id]
  );
  const nextSlot = Number(slotResult.rows[0].max_slot) + 1;

  if (nextSlot > circle.size) {
    res.status(400).json({ error: 'Circle don full — no slot remaining' });
    return;
  }

  await pool.query(
    `INSERT INTO memberships (circle_id, user_id, slot_number) VALUES ($1, $2, $3)`,
    [circle.id, userId, nextSlot]
  );

  // Mark circle active when full
  if (nextSlot === circle.size) {
    await pool.query(`UPDATE circles SET status = 'active' WHERE id = $1`, [circle.id]);
  }

  res.json({ success: true, slotNumber: nextSlot, circleId: circle.id });
});

// GET /circles/:id — circle dashboard data
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const circleResult = await pool.query(
    `SELECT c.*, u.display_name AS organiser_name
     FROM circles c
     JOIN users u ON u.id = c.organiser_id
     WHERE c.id = $1`,
    [req.params.id]
  );

  if (!circleResult.rows.length) {
    res.status(404).json({ error: 'Circle not found' });
    return;
  }

  // Verify membership
  const memberCheck = await pool.query(
    `SELECT slot_number FROM memberships WHERE circle_id = $1 AND user_id = $2 AND status = 'active'`,
    [req.params.id, userId]
  );
  if (!memberCheck.rows.length) {
    res.status(403).json({ error: 'You no be member of this circle' });
    return;
  }

  const circle = circleResult.rows[0] as Circle & { organiser_name: string };

  // Get all members with contribution status for current round
  const currentRound = await getCurrentRound(circle.id);
  const members = await pool.query(
    `SELECT u.id, u.display_name, u.phone_number, m.slot_number,
            co.status AS contribution_status, co.paid_at
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     LEFT JOIN contributions co ON co.user_id = m.user_id
       AND co.circle_id = m.circle_id AND co.round_number = $2
     WHERE m.circle_id = $1 AND m.status = 'active'
     ORDER BY m.slot_number`,
    [circle.id, currentRound]
  );

  res.json({
    circle,
    currentRound,
    mySlot: memberCheck.rows[0].slot_number,
    members: members.rows,
    totalPot: circle.amount_naira * circle.size,
  });
});

// GET /circles — list my circles
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await pool.query(
    `SELECT c.*, m.slot_number,
            (SELECT COUNT(*) FROM memberships m2 WHERE m2.circle_id = c.id AND m2.status = 'active') AS member_count
     FROM circles c
     JOIN memberships m ON m.circle_id = c.id AND m.user_id = $1 AND m.status = 'active'
     ORDER BY c.created_at DESC`,
    [userId]
  );

  res.json(result.rows);
});

async function getCurrentRound(circleId: string): Promise<number> {
  const result = await pool.query<{ max_round: number }>(
    `SELECT COALESCE(MAX(round_number), 1) AS max_round FROM contributions WHERE circle_id = $1`,
    [circleId]
  );
  return Number(result.rows[0].max_round);
}

export default router;
