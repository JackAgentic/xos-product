import type { Request, Response } from 'express';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: Request, res: Response) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const type = req.query.type as string || (req.query['[...type]'] as string);
  const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : null;
  if (!clientId) return res.status(400).json({ error: 'clientId is required' });

  switch (type) {
    case 'snapshots': {
      const rows = await sql`SELECT * FROM financial_snapshots WHERE client_id = ${clientId} ORDER BY date DESC`;
      return res.status(200).json(rows);
    }
    case 'assets': {
      const rows = await sql`SELECT * FROM financial_assets WHERE client_id = ${clientId} ORDER BY id`;
      return res.status(200).json(rows);
    }
    case 'liabilities': {
      const rows = await sql`SELECT * FROM financial_liabilities WHERE client_id = ${clientId} ORDER BY id`;
      return res.status(200).json(rows);
    }
    case 'income': {
      const rows = await sql`SELECT * FROM financial_income WHERE client_id = ${clientId} ORDER BY id`;
      return res.status(200).json(rows);
    }
    case 'expenses': {
      const rows = await sql`SELECT * FROM financial_expenses WHERE client_id = ${clientId} ORDER BY id`;
      return res.status(200).json(rows);
    }
    case 'goals': {
      const rows = await sql`SELECT * FROM financial_goals WHERE client_id = ${clientId} ORDER BY id`;
      return res.status(200).json(rows);
    }
    default:
      return res.status(404).json({ error: 'Unknown financial type' });
  }
}
