import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Running migrations...');

  // 1. Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name     VARCHAR(255) NOT NULL,
      initials      VARCHAR(10),
      role          VARCHAR(50) DEFAULT 'advisor',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ users');

  // 2. Clients
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255) NOT NULL,
      type             VARCHAR(20) NOT NULL,
      status           VARCHAR(20) NOT NULL,
      advice           TEXT[] DEFAULT '{}',
      advice_progress  JSONB DEFAULT '{}',
      email            VARCHAR(255),
      phone            VARCHAR(50),
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ clients');

  // 3. Client Managers (junction)
  await sql`
    CREATE TABLE IF NOT EXISTS client_managers (
      id         SERIAL PRIMARY KEY,
      client_id  INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(client_id, user_id)
    )
  `;
  console.log('  ✓ client_managers');

  // 4. Opportunities
  await sql`
    CREATE TABLE IF NOT EXISTS opportunities (
      id              SERIAL PRIMARY KEY,
      name            VARCHAR(255) NOT NULL,
      client_id       INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      advisor_id      INT REFERENCES users(id),
      date            DATE,
      stage           VARCHAR(50) NOT NULL DEFAULT 'Prospect',
      value           VARCHAR(50),
      probability     INT DEFAULT 0,
      type            VARCHAR(50) NOT NULL,
      description     TEXT,
      client_details  JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ opportunities');

  // 5. Opportunity Notes
  await sql`
    CREATE TABLE IF NOT EXISTS opportunity_notes (
      id              SERIAL PRIMARY KEY,
      opportunity_id  INT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      text            TEXT NOT NULL,
      user_id         INT REFERENCES users(id),
      user_name       VARCHAR(255),
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ opportunity_notes');

  // 6. Meetings
  await sql`
    CREATE TABLE IF NOT EXISTS meetings (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      client_id   INT REFERENCES clients(id) ON DELETE SET NULL,
      advisor_id  INT REFERENCES users(id),
      type        VARCHAR(255),
      date        DATE,
      start_time  TIME,
      end_time    TIME,
      duration    VARCHAR(20),
      location    VARCHAR(255),
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ meetings');

  // 7. Activities
  await sql`
    CREATE TABLE IF NOT EXISTS activities (
      id          SERIAL PRIMARY KEY,
      type        VARCHAR(50) NOT NULL,
      title       VARCHAR(255) NOT NULL,
      subtitle    TEXT,
      client_id   INT REFERENCES clients(id) ON DELETE SET NULL,
      client_name VARCHAR(255),
      user_id     INT REFERENCES users(id),
      status      VARCHAR(20) DEFAULT 'completed',
      metadata    JSONB DEFAULT '{}',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ activities');

  // 8. Contacts
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id            SERIAL PRIMARY KEY,
      client_id     INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      type          VARCHAR(50),
      email         VARCHAR(255),
      phone         VARCHAR(50),
      first_name    VARCHAR(100),
      last_name     VARCHAR(100),
      middle_name   VARCHAR(100),
      date_of_birth VARCHAR(20),
      gender        VARCHAR(20),
      relationship  VARCHAR(100),
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ contacts');

  // 9. Communications
  await sql`
    CREATE TABLE IF NOT EXISTS communications (
      id          SERIAL PRIMARY KEY,
      client_id   INT REFERENCES clients(id) ON DELETE SET NULL,
      from_name   VARCHAR(255) NOT NULL,
      subject     VARCHAR(500),
      preview     TEXT,
      type        VARCHAR(20),
      unread      BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ communications');

  // 10. Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id          SERIAL PRIMARY KEY,
      client_id   INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      folder      VARCHAR(100) NOT NULL,
      name        VARCHAR(500) NOT NULL,
      size        VARCHAR(20),
      status      VARCHAR(30),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ documents');

  // 11. Financial tables
  await sql`
    CREATE TABLE IF NOT EXISTS financial_snapshots (
      id                 SERIAL PRIMARY KEY,
      client_id          INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name               VARCHAR(255) NOT NULL,
      date               DATE,
      status             VARCHAR(30),
      progress           INT DEFAULT 0,
      net_worth          NUMERIC(15,2),
      total_assets       NUMERIC(15,2),
      total_liabilities  NUMERIC(15,2),
      created_at         TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_snapshots');

  await sql`
    CREATE TABLE IF NOT EXISTS financial_assets (
      id          SERIAL PRIMARY KEY,
      client_id   INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      type        VARCHAR(50),
      description TEXT,
      value       VARCHAR(50),
      ownership   VARCHAR(50),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_assets');

  await sql`
    CREATE TABLE IF NOT EXISTS financial_liabilities (
      id             SERIAL PRIMARY KEY,
      client_id      INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      type           VARCHAR(50),
      description    TEXT,
      balance        VARCHAR(50),
      interest_rate  VARCHAR(20),
      payment        VARCHAR(50),
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_liabilities');

  await sql`
    CREATE TABLE IF NOT EXISTS financial_income (
      id          SERIAL PRIMARY KEY,
      client_id   INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      source      TEXT,
      amount      VARCHAR(50),
      frequency   VARCHAR(30),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_income');

  await sql`
    CREATE TABLE IF NOT EXISTS financial_expenses (
      id          SERIAL PRIMARY KEY,
      client_id   INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      category    VARCHAR(255),
      amount      VARCHAR(50),
      frequency   VARCHAR(30),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_expenses');

  await sql`
    CREATE TABLE IF NOT EXISTS financial_goals (
      id             SERIAL PRIMARY KEY,
      client_id      INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name           VARCHAR(255),
      target_amount  VARCHAR(50),
      target_date    DATE,
      priority       VARCHAR(20),
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('  ✓ financial_goals');

  // 12. Revenue Data (seeded)
  await sql`
    CREATE TABLE IF NOT EXISTS revenue_data (
      id        SERIAL PRIMARY KEY,
      month     VARCHAR(10) NOT NULL,
      revenue   NUMERIC(12,2),
      target    NUMERIC(12,2),
      last_year NUMERIC(12,2)
    )
  `;
  console.log('  ✓ revenue_data');

  console.log('\nAll migrations completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
