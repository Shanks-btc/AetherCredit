import * as dotenv from 'dotenv'
import { z }       from 'zod'

dotenv.config()

const EnvSchema = z.object({
  NODE_ENV:     z.enum(['development', 'test', 'production']).default('development'),
  PORT:         z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // 0G Chain
  ZERO_G_RPC:      z.string().default('https://evmrpc.0g.ai'),
  ZERO_G_CHAIN_ID: z.string().default('16661').transform(Number),

  // Contract addresses (optional until deployed)
  WORK_REGISTRY_ADDRESS: z.string().default(''),
  CREDIT_SCORER_ADDRESS: z.string().default(''),
  CREDIT_VAULT_ADDRESS:  z.string().default(''),

  // Wallet addresses
  AGENT_ADDRESS:    z.string().default(''),
  PROTOCOL_ADDRESS: z.string().default(''),

  // 0G Storage
  STORAGE_INDEXER: z.string().default('https://indexer-storage-turbo.0g.ai'),
  KV_ENDPOINT:     z.string().default('http://3.101.147.150:6789'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Missing or invalid environment variables:')
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data
export type  Env = typeof parsed.data