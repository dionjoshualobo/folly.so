import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function loadEnv() {
  try {
    const text = readFileSync(join(__dirname, '..', '.env'), 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
    }
  } catch {
    // no .env file present — use env vars / defaults
  }
}

loadEnv()

export const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || 'postgres://folly:folly@localhost:5432/folly',
  seedDemo: process.env.SEED_DEMO !== 'false',
}

export const pool = new pg.Pool({ connectionString: config.databaseUrl })

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forms (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id text PRIMARY KEY,
      form_id text NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS submissions_form_id_idx ON submissions (form_id);
  `)
}