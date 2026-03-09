import type { Request, Response } from 'express';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: Request, res: Response) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const rows = clientId
    ? await sql`SELECT * FROM activities WHERE client_id = ${clientId} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT ${limit}`;

  return res.status(200).json(rows);
}
