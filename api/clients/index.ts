import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM clients ORDER BY name`;

    // Fetch managers for all clients in one query
    const managers = await sql`
      SELECT cm.client_id, u.full_name as name, u.initials
      FROM client_managers cm
      JOIN users u ON cm.user_id = u.id
    `;
    const managerMap: Record<number, Array<{ name: string; initials: string }>> = {};
    for (const m of managers) {
      if (!managerMap[m.client_id]) managerMap[m.client_id] = [];
      managerMap[m.client_id].push({ name: m.name, initials: m.initials });
    }

    const result = rows.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      advice: c.advice,
      adviceProgress: c.advice_progress,
      managers: managerMap[c.id] || [],
      email: c.email,
      phone: c.phone,
    }));

    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const { name, type, status, advice, adviceProgress, email, phone } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    const rows = await sql`
      INSERT INTO clients (name, type, status, advice, advice_progress, email, phone)
      VALUES (${name}, ${type}, ${status || 'PROSPECT'}, ${advice || []}, ${JSON.stringify(adviceProgress || {})}, ${email || null}, ${phone || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
