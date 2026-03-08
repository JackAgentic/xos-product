import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;
  if (!clientId) return res.status(400).json({ error: 'clientId is required' });

  const rows = await sql`SELECT * FROM financial_snapshots WHERE client_id = ${clientId} ORDER BY date DESC`;
  return res.status(200).json(rows);
}
