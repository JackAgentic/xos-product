// Load .env.local for local development (no-op on Workers/production)
try {
  const { config } = await import('dotenv');
  config({ path: '.env.local' });
} catch {
  // dotenv unavailable (e.g. Cloudflare Workers) — env vars set by runtime
}

type SqlTaggedTemplate = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<Record<string, any>[]>;

let sql: SqlTaggedTemplate;

if (process.env.USE_LOCAL_DB === 'true') {
  // Local PostgreSQL via node-postgres
  // Clear Neon PG* env vars so pg doesn't use them as fallbacks
  delete process.env.PGUSER;
  delete process.env.PGHOST;
  delete process.env.PGPASSWORD;
  delete process.env.PGDATABASE;

  const pg = await import('pg');
  const Pool = pg.default.Pool;
  const pool = new Pool({ connectionString: process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL });

  sql = async function localSql(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Promise<Record<string, any>[]> {
    // Build parameterized query: tagged template → "$1, $2, ..." placeholders
    let query = '';
    strings.forEach((str, i) => {
      query += str;
      if (i < values.length) query += `$${i + 1}`;
    });
    const { rows } = await pool.query(query, values);
    return rows;
  };
} else {
  // Neon serverless (production / Cloudflare Workers)
  const { neon } = await import('@neondatabase/serverless');
  sql = neon(process.env.DATABASE_URL!);
}

export { sql };
