import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, type TokenPayload } from './auth.js';

export function cors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function requireAuth(req: VercelRequest, res: VercelResponse): TokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

export function methodGuard(req: VercelRequest, res: VercelResponse, allowed: string[]): boolean {
  if (!allowed.includes(req.method || '')) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}
