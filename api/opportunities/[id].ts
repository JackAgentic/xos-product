import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'PUT'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid opportunity ID' });

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT o.*, c.name as client, u.full_name as advisor
      FROM opportunities o
      JOIN clients c ON o.client_id = c.id
      LEFT JOIN users u ON o.advisor_id = u.id
      WHERE o.id = ${id}
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });

    const notes = await sql`
      SELECT * FROM opportunity_notes WHERE opportunity_id = ${id} ORDER BY created_at DESC
    `;

    return res.status(200).json({ ...rows[0], notes });
  }

  if (req.method === 'PUT') {
    const { name, stage, value, probability, description } = req.body;
    const rows = await sql`
      UPDATE opportunities SET
        name = COALESCE(${name || null}, name),
        stage = COALESCE(${stage || null}, stage),
        value = COALESCE(${value || null}, value),
        probability = COALESCE(${probability ?? null}, probability),
        description = COALESCE(${description || null}, description),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    return res.status(200).json(rows[0]);
  }
}
