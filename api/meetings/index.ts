import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;

    const rows = clientId
      ? await sql`
          SELECT m.*, c.name as client, u.full_name as advisor
          FROM meetings m
          LEFT JOIN clients c ON m.client_id = c.id
          LEFT JOIN users u ON m.advisor_id = u.id
          WHERE m.client_id = ${clientId}
          ORDER BY m.date DESC, m.start_time DESC
        `
      : await sql`
          SELECT m.*, c.name as client, u.full_name as advisor
          FROM meetings m
          LEFT JOIN clients c ON m.client_id = c.id
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
