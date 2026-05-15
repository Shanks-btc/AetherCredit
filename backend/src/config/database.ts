import { Pool, type PoolClient } from 'pg'
import { env } from './env'

export const pool = new Pool({
  connectionString:        env.DATABASE_URL,
  max:                     10,
  idleTimeoutMillis:       30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message)
})

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
    console.log('[DB] PostgreSQL connected')
  } finally {
    client.release()
  }
}