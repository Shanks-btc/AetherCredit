#!/usr/bin/env ts-node
/**
 * @file scripts/validate.ts
 * @description AetherCredit backend validation script.
 */

import * as http  from 'http'
import * as https from 'https'
import { Pool }   from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const CONFIG = {
  API_BASE:         process.env['API_BASE'] ?? 'http://localhost:3001',
  DATABASE_URL:     process.env['DATABASE_URL'] ?? '',
  TESTNET_RPC:      'https://evmrpc-testnet.0g.ai',
  TESTNET_CHAIN_ID: 16602,
  TESTNET_EXPLORER: 'https://chainscan-galileo.0g.ai',
  MAINNET_RPC:      'https://evmrpc.0g.ai',
  MAINNET_CHAIN_ID: 16661,
  MAINNET_EXPLORER: 'https://chainscan.0g.ai',
  TEST_AGENT: '0xabcdef1234567890abcdef1234567890abcdef12',
  TEST_TX:    '0x' + 'a'.repeat(64),
  ONE_OG:     '1000000000000000000',
  HALF_OG:    '500000000000000000',
}

interface TestResult {
  name:    string
  passed:  boolean
  message: string
  detail?: string
}

const results: TestResult[] = []
let pool: Pool | null = null

function pass(name: string, message: string, detail?: string): void {
  results.push({ name, passed: true, message, detail })
  console.log(`  ✅ ${name}: ${message}`)
  if (detail) console.log(`     ${detail}`)
}

function fail(name: string, message: string, detail?: string): void {
  results.push({ name, passed: false, message, detail })
  console.log(`  ❌ ${name}: ${message}`)
  if (detail) console.log(`     ${detail}`)
}

function section(title: string): void {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('─'.repeat(60))
}

function httpRequest(
  url: string,
  options: { method: 'GET' | 'POST'; body?: object; timeout?: number }
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const isHttps   = parsedUrl.protocol === 'https:'
    const transport = isHttps ? https : http
    const bodyStr   = options.body ? JSON.stringify(options.body) : undefined

    const reqOptions: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port:     parsedUrl.port || (isHttps ? 443 : 80),
      path:     parsedUrl.pathname + parsedUrl.search,
      method:   options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr).toString() } : {}),
      },
      timeout: options.timeout ?? 10_000,
    }

    const req = transport.request(reqOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode ?? 0, body: data })
        }
      })
    })

    req.on('timeout', () => { req.destroy(); reject(new Error(`Timed out`)) })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function ethChainId(rpcUrl: string): Promise<number> {
  const response = await httpRequest(rpcUrl, {
    method: 'POST',
    body: { jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 },
    timeout: 8_000,
  })
  const body = response.body as { result?: string; error?: { message: string } }
  if (body.error) throw new Error(`RPC error: ${body.error.message}`)
  if (!body.result) throw new Error('RPC returned no result')
  return parseInt(body.result, 16)
}

async function ethBlockNumber(rpcUrl: string): Promise<number> {
  const response = await httpRequest(rpcUrl, {
    method: 'POST',
    body: { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 },
    timeout: 8_000,
  })
  const body = response.body as { result?: string; error?: { message: string } }
  if (body.error) throw new Error(`RPC error: ${body.error.message}`)
  if (!body.result) throw new Error('No block number returned')
  return parseInt(body.result, 16)
}

async function testEnvironment(): Promise<void> {
  section('SECTION 1: Environment Variables')
  const required = ['DATABASE_URL', 'NODE_ENV', 'PORT']
  for (const key of required) {
    const value = process.env[key]
    if (!value) {
      fail(`ENV_${key}`, `${key} is missing`, 'Add it to your .env file')
    } else {
      pass(`ENV_${key}`, `${key} is set`, key === 'DATABASE_URL' ? '(value hidden)' : value)
    }
  }
  const dbUrl = process.env['DATABASE_URL'] ?? ''
  if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    fail('ENV_DATABASE_URL_FORMAT', 'DATABASE_URL does not look like a valid PostgreSQL connection string')
  } else if (dbUrl) {
    pass('ENV_DATABASE_URL_FORMAT', 'DATABASE_URL format looks valid')
  }
}

async function testPostgres(): Promise<void> {
  section('SECTION 2: PostgreSQL Connectivity and Schema')

  if (!CONFIG.DATABASE_URL) {
    fail('PG_CONNECT', 'DATABASE_URL not set — skipping all PostgreSQL tests')
    return
  }

  pool = new Pool({ connectionString: CONFIG.DATABASE_URL, max: 2 })

  try {
    const client = await pool.connect()
    const result = await client.query('SELECT version()')
    client.release()
    const version = (result.rows[0] as { version: string }).version
    pass('PG_CONNECT', 'Connected to PostgreSQL', version.split(',')[0])
  } catch (err: unknown) {
    fail('PG_CONNECT', 'Cannot connect to PostgreSQL', (err as Error).message)
    return
  }

  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM _migrations')
    const count  = Number((result.rows[0] as { count: string }).count)
    pass('PG_MIGRATIONS_TABLE', '_migrations table exists', `${count} migration(s) applied`)
  } catch (err: unknown) {
    fail('PG_MIGRATIONS_TABLE', '_migrations table not found — run: npm run migrate', (err as Error).message)
    return
  }

  try {
    await pool.query('SELECT 1 FROM ledger_entries LIMIT 1')
    pass('PG_TABLE_LEDGER', 'ledger_entries table exists')
  } catch (err: unknown) {
    fail('PG_TABLE_LEDGER', 'ledger_entries table not found — run: npm run migrate', (err as Error).message)
    return
  }

  try {
    await pool.query('SELECT * FROM agent_balances LIMIT 1')
    pass('PG_VIEW_AGENT_BALANCES', 'agent_balances view exists')
  } catch (err: unknown) {
    fail('PG_VIEW_AGENT_BALANCES', 'agent_balances view not found', (err as Error).message)
  }

  try {
    await pool.query('SELECT * FROM pool_balance LIMIT 1')
    pass('PG_VIEW_POOL_BALANCE', 'pool_balance view exists')
  } catch (err: unknown) {
    fail('PG_VIEW_POOL_BALANCE', 'pool_balance view not found', (err as Error).message)
  }

  try {
    const result  = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ledger_entries' ORDER BY ordinal_position
    `)
    const cols    = (result.rows as { column_name: string }[]).map(r => r.column_name)
    const needed  = ['id','entry_type','agent_address','debit_account','credit_account','amount_wei','tx_hash','block_number','status','created_at']
    const missing = needed.filter(c => !cols.includes(c))
    if (missing.length > 0) {
      fail('PG_LEDGER_COLUMNS', `Missing columns: ${missing.join(', ')}`)
    } else {
      pass('PG_LEDGER_COLUMNS', `All ${needed.length} required columns present`)
    }
  } catch (err: unknown) {
    fail('PG_LEDGER_COLUMNS', 'Could not verify columns', (err as Error).message)
  }

  try {
    const result = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'ledger_entries' AND indexname = 'idx_ledger_tx_hash_unique'
    `)
    if (result.rows.length > 0) {
      pass('PG_UNIQUE_TX_HASH', 'Unique index on tx_hash exists (idempotency guard)')
    } else {
      fail('PG_UNIQUE_TX_HASH', 'Unique index idx_ledger_tx_hash_unique not found')
    }
  } catch (err: unknown) {
    fail('PG_UNIQUE_TX_HASH', 'Could not verify unique index', (err as Error).message)
  }

  // Test 2.8 — Write and read (BAD_DEBT -> POOL satisfies debit_credit_must_differ)
  try {
    const writeResult = await pool.query(`
      INSERT INTO ledger_entries
        (entry_type, agent_address, debit_account, credit_account, amount_wei, status)
      VALUES
        ('CREDIT_ISSUED', NULL, 'BAD_DEBT', 'POOL', '999999999999999', 'PENDING')
      RETURNING id, amount_wei, status
    `)
    const row = writeResult.rows[0] as { id: string; amount_wei: string; status: string }
    if (row.status === 'PENDING' && row.amount_wei === '999999999999999') {
      pass('PG_WRITE_READ', 'Can write and read a ledger entry', `id: ${row.id}`)
    } else {
      fail('PG_WRITE_READ', 'Write/read returned unexpected values', JSON.stringify(row))
    }
    await pool.query('DELETE FROM ledger_entries WHERE id = $1', [row.id])
  } catch (err: unknown) {
    fail('PG_WRITE_READ', 'Write/read test failed', (err as Error).message)
  }

  // Test 2.9 — Duplicate tx_hash rejected
  try {
    const uniqueTx = '0x' + 'f'.repeat(64)
    await pool.query(`
      INSERT INTO ledger_entries
        (entry_type, debit_account, credit_account, amount_wei, tx_hash, status)
      VALUES ('CREDIT_ISSUED', 'BAD_DEBT', 'POOL', '1000', $1, 'CONFIRMED')
    `, [uniqueTx])
    try {
      await pool.query(`
        INSERT INTO ledger_entries
          (entry_type, debit_account, credit_account, amount_wei, tx_hash, status)
        VALUES ('CREDIT_ISSUED', 'BAD_DEBT', 'POOL', '2000', $1, 'CONFIRMED')
      `, [uniqueTx])
      fail('PG_DUPLICATE_TX_HASH', 'Duplicate tx_hash was NOT rejected — idempotency broken')
    } catch {
      pass('PG_DUPLICATE_TX_HASH', 'Duplicate tx_hash correctly rejected by unique constraint')
    }
    await pool.query('DELETE FROM ledger_entries WHERE tx_hash = $1', [uniqueTx])
  } catch (err: unknown) {
    fail('PG_DUPLICATE_TX_HASH', 'Could not run duplicate test', (err as Error).message)
  }
}

async function test0GRPC(): Promise<void> {
  section('SECTION 3: 0G RPC Connectivity')
  console.log('  (URLs verified from docs.0g.ai — official 0G documentation)')

  console.log(`\n  Testing Testnet RPC: ${CONFIG.TESTNET_RPC}`)
  try {
    const chainId = await ethChainId(CONFIG.TESTNET_RPC)
    if (chainId === CONFIG.TESTNET_CHAIN_ID) {
      pass('RPC_TESTNET_CHAIN_ID', 'Testnet RPC live — chainId matches', `Got ${chainId}, expected ${CONFIG.TESTNET_CHAIN_ID}`)
    } else {
      fail('RPC_TESTNET_CHAIN_ID', 'Chain ID mismatch', `Got ${chainId}, expected ${CONFIG.TESTNET_CHAIN_ID}`)
    }
  } catch (err: unknown) {
    fail('RPC_TESTNET_CHAIN_ID', `Testnet RPC unreachable`, (err as Error).message)
  }

  try {
    const blockNumber = await ethBlockNumber(CONFIG.TESTNET_RPC)
    if (blockNumber > 0) {
      pass('RPC_TESTNET_BLOCKS', 'Testnet is producing blocks', `Current block: ${blockNumber}`)
    } else {
      fail('RPC_TESTNET_BLOCKS', 'Testnet block number is 0')
    }
  } catch (err: unknown) {
    fail('RPC_TESTNET_BLOCKS', 'Could not fetch testnet block number', (err as Error).message)
  }

  console.log(`\n  Testing Mainnet RPC: ${CONFIG.MAINNET_RPC}`)
  try {
    const chainId = await ethChainId(CONFIG.MAINNET_RPC)
    if (chainId === CONFIG.MAINNET_CHAIN_ID) {
      pass('RPC_MAINNET_CHAIN_ID', 'Mainnet RPC live — chainId matches', `Got ${chainId}, expected ${CONFIG.MAINNET_CHAIN_ID}`)
    } else {
      fail('RPC_MAINNET_CHAIN_ID', 'Chain ID mismatch', `Got ${chainId}, expected ${CONFIG.MAINNET_CHAIN_ID}`)
    }
  } catch (err: unknown) {
    fail('RPC_MAINNET_CHAIN_ID', 'Mainnet RPC unreachable', (err as Error).message)
  }

  try {
    const blockNumber = await ethBlockNumber(CONFIG.MAINNET_RPC)
    if (blockNumber > 0) {
      pass('RPC_MAINNET_BLOCKS', 'Mainnet is producing blocks', `Current block: ${blockNumber}`)
    } else {
      fail('RPC_MAINNET_BLOCKS', 'Mainnet block number is 0')
    }
  } catch (err: unknown) {
    fail('RPC_MAINNET_BLOCKS', 'Could not fetch mainnet block number', (err as Error).message)
  }
}

async function testAPIEndpoints(): Promise<void> {
  section('SECTION 4: Backend API Endpoints')
  console.log(`  (Testing against ${CONFIG.API_BASE})`)
  console.log('  ⚠️  Backend must be running: npm run dev\n')

  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/health`, { method: 'GET' })
    if (res.status === 200) {
      const body = res.body as { status: string; service: string }
      pass('API_HEALTH', 'Health endpoint responding', `status: ${body.status}, service: ${body.service}`)
    } else {
      fail('API_HEALTH', `Health check returned ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_HEALTH', 'Backend not reachable — is it running?', (err as Error).message)
    fail('API_ISSUE', 'Skipping — backend not running')
    fail('API_DEDUCT', 'Skipping — backend not running')
    fail('API_BALANCE', 'Skipping — backend not running')
    return
  }

  // Pool funding
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/issue`, {
      method: 'POST',
      body: { agentAddress: null, amountWei: CONFIG.ONE_OG, txHash: null, blockNumber: null },
    })
    if (res.status === 201) {
      const body = res.body as { success: boolean; data: { entry: { id: string } } }
      if (body.success && body.data.entry.id) {
        pass('API_ISSUE_POOL', 'POST /api/ledger/issue — pool funding', `entryId: ${body.data.entry.id}`)
      } else {
        fail('API_ISSUE_POOL', 'Response missing expected fields', JSON.stringify(body))
      }
    } else {
      fail('API_ISSUE_POOL', `Unexpected status ${res.status}`, JSON.stringify(res.body))
    }
  } catch (err: unknown) {
    fail('API_ISSUE_POOL', 'Request failed', (err as Error).message)
  }

  // Agent credit
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/issue`, {
      method: 'POST',
      body: { agentAddress: CONFIG.TEST_AGENT, amountWei: CONFIG.ONE_OG, txHash: null, blockNumber: null },
    })
    if (res.status === 201) {
      pass('API_ISSUE_AGENT', 'POST /api/ledger/issue — agent credit', `agent: ${CONFIG.TEST_AGENT.slice(0, 10)}...`)
    } else {
      fail('API_ISSUE_AGENT', `Unexpected status ${res.status}`, JSON.stringify(res.body))
    }
  } catch (err: unknown) {
    fail('API_ISSUE_AGENT', 'Request failed', (err as Error).message)
  }

  // Deduct success
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/deduct`, {
      method: 'POST',
      body: { agentAddress: CONFIG.TEST_AGENT, amountWei: CONFIG.HALF_OG, txHash: null, blockNumber: null },
    })
    if (res.status === 201) {
      pass('API_DEDUCT_SUCCESS', 'POST /api/ledger/deduct — deduction succeeded')
    } else {
      fail('API_DEDUCT_SUCCESS', `Unexpected status ${res.status}`, JSON.stringify(res.body))
    }
  } catch (err: unknown) {
    fail('API_DEDUCT_SUCCESS', 'Request failed', (err as Error).message)
  }

  // Insufficient balance
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/deduct`, {
      method: 'POST',
      body: { agentAddress: CONFIG.TEST_AGENT, amountWei: '999999999999999999999', txHash: null, blockNumber: null },
    })
    if (res.status === 400) {
      const body = res.body as { error: { code: string } }
      if (body.error.code === 'INSUFFICIENT_BALANCE') {
        pass('API_DEDUCT_INSUFFICIENT', 'POST /api/ledger/deduct — correctly rejected', `code: ${body.error.code}`)
      } else {
        fail('API_DEDUCT_INSUFFICIENT', `Wrong error code: ${body.error.code}`)
      }
    } else {
      fail('API_DEDUCT_INSUFFICIENT', `Expected 400, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_DEDUCT_INSUFFICIENT', 'Request failed', (err as Error).message)
  }

  // Zero amount
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/issue`, {
      method: 'POST',
      body: { agentAddress: null, amountWei: '0', txHash: null, blockNumber: null },
    })
    if (res.status === 400) {
      pass('API_ISSUE_ZERO_AMOUNT', 'POST /api/ledger/issue — zero amount correctly rejected')
    } else {
      fail('API_ISSUE_ZERO_AMOUNT', `Expected 400, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_ISSUE_ZERO_AMOUNT', 'Request failed', (err as Error).message)
  }

  // Invalid address
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/issue`, {
      method: 'POST',
      body: { agentAddress: 'not-a-valid-address', amountWei: CONFIG.ONE_OG, txHash: null, blockNumber: null },
    })
    if (res.status === 400) {
      pass('API_ISSUE_INVALID_ADDR', 'POST /api/ledger/issue — invalid address correctly rejected')
    } else {
      fail('API_ISSUE_INVALID_ADDR', `Expected 400, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_ISSUE_INVALID_ADDR', 'Request failed', (err as Error).message)
  }

  // Balance found
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/balance/${CONFIG.TEST_AGENT}`, { method: 'GET' })
    if (res.status === 200) {
      const body = res.body as { success: boolean; data: { agentBalance: { outstandingWei: string }; poolBalance: object } }
      if (body.success && body.data.agentBalance && body.data.poolBalance) {
        pass('API_BALANCE_FOUND', 'GET /api/ledger/balance — agent balance returned', `outstanding: ${body.data.agentBalance.outstandingWei} wei`)
      } else {
        fail('API_BALANCE_FOUND', 'Response missing expected fields', JSON.stringify(body))
      }
    } else {
      fail('API_BALANCE_FOUND', `Unexpected status ${res.status}`, JSON.stringify(res.body))
    }
  } catch (err: unknown) {
    fail('API_BALANCE_FOUND', 'Request failed', (err as Error).message)
  }

  // Balance not found
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/balance/0x1111111111111111111111111111111111111111`, { method: 'GET' })
    if (res.status === 404) {
      const body = res.body as { error: { code: string } }
      pass('API_BALANCE_NOT_FOUND', 'GET /api/ledger/balance — unknown agent returns 404', `code: ${body.error?.code}`)
    } else {
      fail('API_BALANCE_NOT_FOUND', `Expected 404, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_BALANCE_NOT_FOUND', 'Request failed', (err as Error).message)
  }

  // Invalid address format
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/ledger/balance/not-an-address`, { method: 'GET' })
    if (res.status === 400) {
      pass('API_BALANCE_INVALID_ADDR', 'GET /api/ledger/balance — invalid address correctly rejected')
    } else {
      fail('API_BALANCE_INVALID_ADDR', `Expected 400, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_BALANCE_INVALID_ADDR', 'Request failed', (err as Error).message)
  }

  // 404 unknown route
  try {
    const res = await httpRequest(`${CONFIG.API_BASE}/api/does-not-exist`, { method: 'GET' })
    if (res.status === 404) {
      pass('API_404_UNKNOWN_ROUTE', 'Unknown route correctly returns 404')
    } else {
      fail('API_404_UNKNOWN_ROUTE', `Expected 404, got ${res.status}`)
    }
  } catch (err: unknown) {
    fail('API_404_UNKNOWN_ROUTE', 'Request failed', (err as Error).message)
  }
}

async function testLedgerIntegrity(): Promise<void> {
  section('SECTION 5: Ledger Integrity (Database Invariant Check)')

  if (!pool) {
    fail('INVARIANT_POOL', 'No database connection — skipping invariant check')
    return
  }

  try {
    const poolResult = await pool.query('SELECT * FROM pool_balance')
    const poolRow    = poolResult.rows[0] as {
      available_wei: string; total_funded_wei: string
      total_lent_wei: string; total_bad_debt_wei: string
    }

    const available = BigInt(poolRow.available_wei)

    if (available >= BigInt(0)) {
      pass('INVARIANT_POOL_NON_NEGATIVE', 'Pool available balance is non-negative', `available: ${poolRow.available_wei} wei`)
    } else {
      fail('INVARIANT_POOL_NON_NEGATIVE', `CRITICAL: Pool available is NEGATIVE: ${poolRow.available_wei}`)
    }

    const agentResult = await pool.query(`SELECT agent_address, outstanding_wei FROM agent_balances WHERE outstanding_wei < 0`)
    if (agentResult.rows.length === 0) {
      pass('INVARIANT_AGENT_NON_NEGATIVE', 'No agent has negative outstanding balance')
    } else {
      fail('INVARIANT_AGENT_NON_NEGATIVE', `CRITICAL: ${agentResult.rows.length} agent(s) have negative balance`, JSON.stringify(agentResult.rows))
    }

    console.log('\n  Current pool state:')
    console.log(`    available_wei:      ${poolRow.available_wei}`)
    console.log(`    total_funded_wei:   ${poolRow.total_funded_wei}`)
    console.log(`    total_lent_wei:     ${poolRow.total_lent_wei}`)
    console.log(`    total_bad_debt_wei: ${poolRow.total_bad_debt_wei}`)

  } catch (err: unknown) {
    fail('INVARIANT_CHECK', 'Invariant check failed', (err as Error).message)
  }
}

function printSummary(): void {
  console.log(`\n${'═'.repeat(60)}`)
  console.log('  VALIDATION SUMMARY')
  console.log('═'.repeat(60))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total  = results.length

  if (failed > 0) {
    console.log('\n  ❌ Failed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`     • ${r.name}: ${r.message}`)
      if (r.detail) console.log(`       ${r.detail}`)
    })
  }

  console.log(`\n  Total:  ${total}`)
  console.log(`  Passed: ${passed} ✅`)
  console.log(`  Failed: ${failed} ${failed > 0 ? '❌' : ''}`)

  if (failed === 0) {
    console.log('\n  ✅ All tests passed — system is ready\n')
  } else {
    console.log('\n  ❌ Some tests failed — fix before proceeding\n')
  }
  console.log('═'.repeat(60))
  console.log()
}

async function main(): Promise<void> {
  console.log('\n' + '═'.repeat(60))
  console.log('  AetherCredit — Backend Validation Script')
  console.log('  0G APAC Hackathon 2026')
  console.log('═'.repeat(60))
  console.log()
  console.log('  This script validates:')
  console.log('  1. Environment variables')
  console.log('  2. PostgreSQL connectivity and schema')
  console.log('  3. 0G RPC endpoints (testnet + mainnet)')
  console.log('  4. Backend API endpoints (all three operations)')
  console.log('  5. Ledger financial invariants')
  console.log()
  console.log('  Unverified integrations (explicitly excluded):')
  console.log('  • 0G Compute SDK  — not yet integrated')
  console.log('  • 0G Storage SDK  — not yet integrated')
  console.log('  • Smart contracts — not yet deployed')

  try {
    await testEnvironment()
    await testPostgres()
    await test0GRPC()
    await testAPIEndpoints()
    await testLedgerIntegrity()
  } finally {
    printSummary()
    if (pool) await pool.end()
  }

  const failed = results.filter(r => !r.passed).length
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('\n❌ Validation script crashed:', err.message)
  process.exit(1)
})