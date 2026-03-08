import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const slug = (req.query.slug as string[])?.[0];
  const id = slug ? parseInt(slug) : NaN;

  // /api/opportunities/:id
  if (!isNaN(id)) {
    if (!methodGuard(req, res, ['GET', 'PUT'])) return;

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT o.*, c.name as client, u.full_name as advisor
        FROM opportunities o
        JOIN clients c ON o.client_id = c.id
        LEFT JOIN users u ON o.advisor_id = u.id
        WHERE o.id = ${id}
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
      const notes = await sql`SELECT * FROM opportunity_notes WHERE opportunity_id = ${id} ORDER BY created_at DESC`;
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
    return;
  }

  // /api/opportunities
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;
    const rows = clientId
      ? await sql`
          SELECT o.*, c.name as client, u.full_name as advisor
          FROM opportunities o JOIN clients c ON o.client_id = c.id
          LEFT JOIN users u ON o.advisor_id = u.id
          WHERE o.client_id = ${clientId}
          ORDER BY o.created_at DESC
        `
      : await sql`
          SELECT o.*, c.name as client, u.full_name as advisor
          FROM opportunities o JOIN clients c ON o.client_id = c.id
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
