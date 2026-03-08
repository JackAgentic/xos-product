import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { comparePassword, signToken } from '../../lib/auth';
import { cors, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const rows = await sql`SELECT id, email, password_hash, full_name, initials, role FROM users WHERE email = ${email}`;
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = rows[0];
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, initials: user.initials, role: user.role },
  });
}
