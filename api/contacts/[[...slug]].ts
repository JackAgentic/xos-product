import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db.js';
import { cors, requireAuth, methodGuard } from '../../lib/middleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const slug = req.query.slug as string || (req.query['[...slug]'] as string) || undefined;
  const id = slug ? parseInt(slug) : NaN;

  // /api/contacts/:id
  if (!isNaN(id)) {
    if (!methodGuard(req, res, ['PUT', 'DELETE'])) return;

    if (req.method === 'PUT') {
      const { name, type, email, phone, firstName, lastName, middleName, dateOfBirth, gender, relationship } = req.body;
      const rows = await sql`
        UPDATE contacts SET
          name = COALESCE(${name || null}, name),
          type = COALESCE(${type || null}, type),
          email = COALESCE(${email || null}, email),
          phone = COALESCE(${phone || null}, phone),
          first_name = COALESCE(${firstName || null}, first_name),
          last_name = COALESCE(${lastName || null}, last_name),
          middle_name = COALESCE(${middleName || null}, middle_name),
          date_of_birth = COALESCE(${dateOfBirth || null}, date_of_birth),
          gender = COALESCE(${gender || null}, gender),
          relationship = COALESCE(${relationship || null}, relationship),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM contacts WHERE id = ${id}`;
      return res.status(204).end();
    }
    return;
  }

  // /api/contacts
  if (!methodGuard(req, res, ['GET', 'POST'])) return;

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
