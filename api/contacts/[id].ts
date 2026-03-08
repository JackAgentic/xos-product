import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['PUT', 'DELETE'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid contact ID' });

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
}
