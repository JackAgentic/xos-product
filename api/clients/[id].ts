import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PUT', 'DELETE'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid client ID' });

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM clients WHERE id = ${id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    const managers = await sql`
      SELECT u.full_name as name, u.initials
      FROM client_managers cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.client_id = ${id}
    `;

    const c = rows[0];
    return res.status(200).json({
      id: c.id, name: c.name, type: c.type, status: c.status,
      advice: c.advice, adviceProgress: c.advice_progress,
      managers, email: c.email, phone: c.phone,
    });
  }

  if (req.method === 'PUT') {
    const { name, type, status, advice, adviceProgress, email, phone } = req.body;
    const rows = await sql`
      UPDATE clients SET
        name = COALESCE(${name || null}, name),
        type = COALESCE(${type || null}, type),
        status = COALESCE(${status || null}, status),
        advice = COALESCE(${advice || null}, advice),
        advice_progress = COALESCE(${adviceProgress ? JSON.stringify(adviceProgress) : null}, advice_progress),
        email = COALESCE(${email || null}, email),
        phone = COALESCE(${phone || null}, phone),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM clients WHERE id = ${id}`;
    return res.status(204).end();
  }
}
