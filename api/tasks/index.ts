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
          SELECT t.*, u.full_name as assigned_to_name, c.name as client_name
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN clients c ON t.client_id = c.id
          WHERE t.client_id = ${clientId}
          ORDER BY t.created_at DESC
        `
      : await sql`
          SELECT t.*, u.full_name as assigned_to_name, c.name as client_name
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN clients c ON t.client_id = c.id
          ORDER BY t.created_at DESC
        `;

    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { title, description, priority, dueDate, dueTime, assignedTo, clientId, sendReminder } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const rows = await sql`
      INSERT INTO tasks (title, description, priority, due_date, due_time, assigned_to, created_by, client_id, send_reminder)
      VALUES (${title}, ${description || null}, ${priority || 'Medium'}, ${dueDate || null}, ${dueTime || null}, ${assignedTo || auth.userId}, ${auth.userId}, ${clientId || null}, ${sendReminder || false})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
