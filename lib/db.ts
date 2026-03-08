import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for local development (no-op in production where env vars are set)
config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

export { sql };
