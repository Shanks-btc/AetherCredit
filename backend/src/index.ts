/**
 * @file index.ts
 * @description AetherCredit backend — Express application entry point.
 *
 * 0G Stack integrated:
 *   - 0G Chain:       contract reads via ChainService
 *   - 0G Compute:     TEE verification via WorkService
 *   - 0G Storage KV:  work history via StorageService
 *   - 0G Storage Log: credit decisions via StorageService
 *
 * Routes:
 *   /api/ledger/*  — credit ledger (issue, deduct, balance)
 *   /api/work/*    — 0G Compute job submission
 *   /api/credit/*  — loan request and repayment
 *   /api/agents/*  — agent profiles from 0G Chain
 *   /api/pool/*    — pool health from 0G Chain
 */

import './config/env'
import express       from 'express'
import helmet        from 'helmet'
import cors          from 'cors'
import morgan        from 'morgan'
import rateLimit     from 'express-rate-limit'
import { env }                from './config/env'
import { connectDatabase }    from './config/database'
import { ledgerRouter }       from './modules/ledger/routes/ledger.routes'
import { workRouter }         from './modules/work/work.routes'
import { creditRouter }       from './modules/credit/credit.routes'
import { agentsRouter }       from './modules/agents/agents.routes'
import { poolRouter }         from './modules/pool/pool.routes'
import { errorMiddleware }    from './middleware/error.middleware'

const app = express()

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? 'https://aethercredit.xyz'
    : 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Agent-Private-Key'],
}))

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }))

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs:        60_000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
}))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'aethercredit-backend',
    version: '0.1.0',
    env:     env.NODE_ENV,
    network: {
      rpc:     env.ZERO_G_RPC,
      chainId: env.ZERO_G_CHAIN_ID,
    },
    contracts: {
      WorkRegistry: env.WORK_REGISTRY_ADDRESS || 'not deployed',
      CreditScorer: env.CREDIT_SCORER_ADDRESS || 'not deployed',
      CreditVault:  env.CREDIT_VAULT_ADDRESS  || 'not deployed',
    },
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/ledger',  ledgerRouter)
app.use('/api/work',    workRouter)
app.use('/api/credit',  creditRouter)
app.use('/api/agents',  agentsRouter)
app.use('/api/pool',    poolRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware)

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDatabase()

  app.listen(env.PORT, () => {
    console.log(`\n🚀 AetherCredit backend running on port ${env.PORT}`)
    console.log(`   Environment: ${env.NODE_ENV}`)
    console.log(`   Network:     ${env.ZERO_G_RPC}`)
    console.log(`   ChainID:     ${env.ZERO_G_CHAIN_ID}`)
    console.log(`   Health:      http://localhost:${env.PORT}/health`)
    console.log(`   Ledger:      http://localhost:${env.PORT}/api/ledger`)
    console.log(`   Work:        http://localhost:${env.PORT}/api/work`)
    console.log(`   Credit:      http://localhost:${env.PORT}/api/credit`)
    console.log(`   Agents:      http://localhost:${env.PORT}/api/agents`)
    console.log(`   Pool:        http://localhost:${env.PORT}/api/pool\n`)
  })
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message)
  console.error(err.stack)
  process.exit(1)
})

export { app }