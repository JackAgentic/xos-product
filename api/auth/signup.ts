import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { hashPassword, signToken } from '../../lib/auth';
import { cors, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password, and fullName are required' });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await hashPassword(password);
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 3);

  const rows = await sql`
    INSERT INTO users (email, password_hash, full_name, initials)
    VALUES (${email}, ${passwordHash}, ${fullName}, ${initials})
    RETURNING id, email, full_name, initials, role
  `;

  const user = rows[0];
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, initials: user.initials, role: user.role },
  });
}
