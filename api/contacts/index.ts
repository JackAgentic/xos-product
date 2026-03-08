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

    const rows = await sql`SELECT * FROM contacts WHERE client_id = ${clientId} ORDER BY id`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { clientId, name, type, email, phone, firstName, lastName, middleName, dateOfBirth, gender, relationship } = req.body;
    if (!clientId || !name) {
      return res.status(400).json({ error: 'clientId and name are required' });
    }

    const rows = await sql`
      INSERT INTO contacts (client_id, name, type, email, phone, first_name, last_name, middle_name, date_of_birth, gender, relationship)
      VALUES (${clientId}, ${name}, ${type || null}, ${email || null}, ${phone || null}, ${firstName || null}, ${lastName || null}, ${middleName || null}, ${dateOfBirth || null}, ${gender || null}, ${relationship || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }
}
