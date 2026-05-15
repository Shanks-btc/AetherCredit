import fs   from 'fs'
import path from 'path'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

async function migrate(): Promise<void> {
  const pool   = new Pool({ connectionString: process.env['DATABASE_URL'] })
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL       PRIMARY KEY,
        filename    VARCHAR(255) NOT NULL UNIQUE,
        applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)

    const dir   = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()

    for (const filename of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [filename],
      )
      if (rows.length > 0) {
        console.log(`  ⏭  ${filename} — already applied`)
        continue
      }

      const sql = fs.readFileSync(path.join(dir, filename), 'utf-8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [filename])
        await client.query('COMMIT')
        console.log(`  ✅  ${filename} — applied`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log('\n✅ All migrations complete\n')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})