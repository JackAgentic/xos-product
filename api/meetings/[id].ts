import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PUT', 'DELETE'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid meeting ID' });

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT m.*, c.name as client, u.full_name as advisor
      FROM meetings m
      LEFT JOIN clients c ON m.client_id = c.id
      LEFT JOIN users u ON m.advisor_id = u.id
      WHERE m.id = ${id}
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    const { title, type, date, startTime, duration, location, notes } = req.body;
    const rows = await sql`
      UPDATE meetings SET
        title = COALESCE(${title || null}, title),
        type = COALESCE(${type || null}, type),
        date = COALESCE(${date || null}, date),
        start_time = COALESCE(${startTime || null}, start_time),
        duration = COALESCE(${duration || null}, duration),
        location = COALESCE(${location || null}, location),
        notes = COALESCE(${notes || null}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM meetings WHERE id = ${id}`;
    return res.status(204).end();
  }
}
