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
      SELECT * FROM documents WHERE client_id = ${clientId} ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { clientId, name, folder, size, description, confidential } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const rows = await sql`
      INSERT INTO documents (client_id, name, folder, size, status)
      VALUES (${clientId || null}, ${name}, ${folder || 'Other'}, ${size || '0 KB'}, ${confidential ? 'confidential' : 'pending'})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
