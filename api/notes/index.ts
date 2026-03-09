import type { Request, Response } from 'express';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: Request, res: Response) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    const opportunityId = req.query.opportunityId ? parseInt(req.query.opportunityId as string) : null;
    if (!opportunityId) return res.status(400).json({ error: 'opportunityId is required' });

    const rows = await sql`
      SELECT * FROM opportunity_notes WHERE opportunity_id = ${opportunityId} ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { opportunityId, text } = req.body;
    if (!opportunityId || !text) {
      return res.status(400).json({ error: 'opportunityId and text are required' });
    }

    const userRows = await sql`SELECT full_name FROM users WHERE id = ${auth.userId}`;
    const userName = userRows.length > 0 ? userRows[0].full_name : 'Unknown';

    const rows = await sql`
      INSERT INTO opportunity_notes (opportunity_id, text, user_id, user_name)
      VALUES (${opportunityId}, ${text}, ${auth.userId}, ${userName})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
