import type { Request, Response } from 'express';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: Request, res: Response) {
  if (cors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = req.query.id ? parseInt(req.query.id as string) : NaN;

  // /api/clients/:id
  if (!isNaN(id)) {
    if (!methodGuard(req, res, ['GET', 'PUT', 'DELETE'])) return;

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM clients WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
      const managers = await sql`
        SELECT u.full_name as name, u.initials
        FROM client_managers cm JOIN users u ON cm.user_id = u.id
        WHERE cm.client_id = ${id}
      `;
      const c = rows[0];
      return res.status(200).json({
        id: c.id, name: c.name, type: c.type, status: c.status,
        advice: c.advice, adviceProgress: c.advice_progress,
        managers, email: c.email, phone: c.phone,
      });
    }

    if (req.method === 'PUT') {
      const { name, type, status, advice, adviceProgress, email, phone } = req.body;
      const rows = await sql`
        UPDATE clients SET
          name = COALESCE(${name || null}, name),
          type = COALESCE(${type || null}, type),
          status = COALESCE(${status || null}, status),
          advice = COALESCE(${advice || null}, advice),
          advice_progress = COALESCE(${adviceProgress ? JSON.stringify(adviceProgress) : null}, advice_progress),
          email = COALESCE(${email || null}, email),
          phone = COALESCE(${phone || null}, phone),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM clients WHERE id = ${id}`;
      return res.status(204).end();
    }
    return;
  }

  // /api/clients
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM clients ORDER BY name`;
    const managers = await sql`
      SELECT cm.client_id, u.full_name as name, u.initials
      FROM client_managers cm JOIN users u ON cm.user_id = u.id
    `;
    const managerMap: Record<number, Array<{ name: string; initials: string }>> = {};
    for (const m of managers) {
      if (!managerMap[m.client_id]) managerMap[m.client_id] = [];
      managerMap[m.client_id].push({ name: m.name, initials: m.initials });
    }
    const result = rows.map(c => ({
      id: c.id, name: c.name, type: c.type, status: c.status,
      advice: c.advice, adviceProgress: c.advice_progress,
      managers: managerMap[c.id] || [], email: c.email, phone: c.phone,
    }));
    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const { name, type, status, advice, adviceProgress, email, phone } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }
    const rows = await sql`
      INSERT INTO clients (name, type, status, advice, advice_progress, email, phone)
      VALUES (${name}, ${type}, ${status || 'PROSPECT'}, ${advice || []}, ${JSON.stringify(adviceProgress || {})}, ${email || null}, ${phone || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
