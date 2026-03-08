import { neon } from '@neondatabase/serverless';

// Load .env.local for local development only (dotenv is a devDependency)
try { require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') }); } catch {}

const sql = neon(process.env.DATABASE_URL!);

export { sql };
