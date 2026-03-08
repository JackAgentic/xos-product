import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { cors, requireAuth, methodGuard } from '../../lib/middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = requireAuth(req, res);
  if (!auth) return;

  const [revenueData, clientCounts, upcomingMeetings, recentActivities] = await Promise.all([
    sql`SELECT * FROM revenue_data ORDER BY id`,
    sql`SELECT status, COUNT(*)::int as count FROM clients GROUP BY status`,
    sql`
      SELECT m.*, c.name as client, u.full_name as advisor
      FROM meetings m
      LEFT JOIN clients c ON m.client_id = c.id
      LEFT JOIN users u ON m.advisor_id = u.id
      WHERE m.date >= CURRENT_DATE
      ORDER BY m.date, m.start_time
      LIMIT 8
    `,
    sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT 12`,
  ]);

  // Pipeline data aggregated from opportunities
  const pipelineData = await sql`
    SELECT stage as name, COUNT(*)::int as value
    FROM opportunities
    GROUP BY stage
  `;

  return res.status(200).json({
    revenueData,
    pipelineData,
    clientCounts,
    upcomingMeetings,
    recentActivities,
  });
}
