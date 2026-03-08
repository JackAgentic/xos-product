import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load .env.local for local development (no-op on Vercel production)
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

export { sql };
