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
          SELECT o.*, c.name as client, u.full_name as advisor
          FROM opportunities o
          JOIN clients c ON o.client_id = c.id
          LEFT JOIN users u ON o.advisor_id = u.id
          WHERE o.client_id = ${clientId}
          ORDER BY o.created_at DESC
        `
      : await sql`
          SELECT o.*, c.name as client, u.full_name as advisor
          FROM opportunities o
          JOIN clients c ON o.client_id = c.id
          LEFT JOIN users u ON o.advisor_id = u.id
          ORDER BY o.created_at DESC
        `;

    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, clientId, stage, value, probability, type, description, clientDetails } = req.body;
    if (!name || !clientId || !type) {
      return res.status(400).json({ error: 'name, clientId, and type are required' });
    }

    const rows = await sql`
      INSERT INTO opportunities (name, client_id, advisor_id, date, stage, value, probability, type, description, client_details)
      VALUES (${name}, ${clientId}, ${auth.userId}, CURRENT_DATE, ${stage || 'Prospect'}, ${value || '$0'}, ${probability || 0}, ${type}, ${description || ''}, ${JSON.stringify(clientDetails || {})})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
