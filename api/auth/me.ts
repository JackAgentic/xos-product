import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const rows = await sql`SELECT id, email, full_name, initials, role, created_at FROM users WHERE id = ${auth.userId}`;
  if (rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = rows[0];
  return res.status(200).json({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    initials: user.initials,
    role: user.role,
    createdAt: user.created_at,
  });
}
