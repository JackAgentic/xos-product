import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { hashPassword, comparePassword, signToken } from '../../lib/auth';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

  const action = (req.query.action as string[])?.[0];

  if (action === 'login') {
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

  if (action === 'signup') {
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

  if (action === 'me') {
    if (!methodGuard(req, res, ['GET'])) return;
    const auth = requireAuth(req, res);
    if (!auth) return;
    const rows = await sql`SELECT id, email, full_name, initials, role, created_at FROM users WHERE id = ${auth.userId}`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];
    return res.status(200).json({
      id: user.id, email: user.email, fullName: user.full_name,
      initials: user.initials, role: user.role, createdAt: user.created_at,
    });
  }

  return res.status(404).json({ error: 'Not found' });
}
