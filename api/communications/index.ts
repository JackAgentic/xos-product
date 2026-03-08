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
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const rows = await sql`
      SELECT * FROM communications WHERE client_id = ${clientId} ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { clientId, subject, preview, type, fromName } = req.body;
    if (!subject) {
      return res.status(400).json({ error: 'subject is required' });
    }

    const userRows = await sql`SELECT full_name FROM users WHERE id = ${auth.userId}`;
    const userName = userRows.length > 0 ? userRows[0].full_name : 'Unknown';

    const rows = await sql`
      INSERT INTO communications (client_id, from_name, subject, preview, type, unread)
      VALUES (${clientId || null}, ${fromName || userName}, ${subject}, ${preview || ''}, ${type || 'email'}, false)
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
