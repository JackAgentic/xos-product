import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const slug = (req.query.slug as string[])?.[0];
  const id = slug ? parseInt(slug) : NaN;

  // /api/meetings/:id
  if (!isNaN(id)) {
    if (!methodGuard(req, res, ['GET', 'PUT', 'DELETE'])) return;

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
    return;
  }

  // /api/meetings
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;
    const rows = clientId
      ? await sql`
          SELECT m.*, c.name as client, u.full_name as advisor
          FROM meetings m LEFT JOIN clients c ON m.client_id = c.id
          LEFT JOIN users u ON m.advisor_id = u.id
          WHERE m.client_id = ${clientId}
          ORDER BY m.date DESC, m.start_time DESC
        `
      : await sql`
          SELECT m.*, c.name as client, u.full_name as advisor
          FROM meetings m LEFT JOIN clients c ON m.client_id = c.id
          LEFT JOIN users u ON m.advisor_id = u.id
          ORDER BY m.date DESC, m.start_time DESC
        `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { title, clientId, type, date, startTime, duration, location, notes } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'title and date are required' });
    }
    const rows = await sql`
      INSERT INTO meetings (title, client_id, advisor_id, type, date, start_time, duration, location, notes)
      VALUES (${title}, ${clientId || null}, ${auth.userId}, ${type || null}, ${date}, ${startTime || null}, ${duration || null}, ${location || null}, ${notes || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
