import { type Pool, type PoolClient } from 'pg'
import {
  type LedgerEntry,
  type AgentCreditBalance,
  type PoolBalance,
  EntryType,
  AccountType,
  EntryStatus,
} from '../../../types/ledger.types'
import { DuplicateEntryError } from '../../../utils/errors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEntry(row: any): LedgerEntry {
  return {
    id:            row.id            as string,
    entryType:     row.entry_type    as EntryType,
    agentAddress:  row.agent_address as string | null,
    debitAccount:  row.debit_account as AccountType,
    creditAccount: row.credit_account as AccountType,
    amountWei:     String(row.amount_wei),
    txHash:        row.tx_hash       as string | null,
    blockNumber:   row.block_number != null ? Number(row.block_number) : null,
    status:        row.status        as EntryStatus,
    createdAt:     (row.created_at as Date).toISOString(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAgentBalance(row: any, agentAddress: string): AgentCreditBalance {
  return {
    agentAddress,
    outstandingWei:   String(row.outstanding_wei   ?? '0'),
    totalBorrowedWei: String(row.total_borrowed_wei ?? '0'),
    totalRepaidWei:   String(row.total_repaid_wei  ?? '0'),
    defaultCount:     Number(row.default_count     ?? 0),
    lastActivityAt:   row.last_activity_at
      ? (row.last_activity_at as Date).toISOString()
      : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPoolBalance(row: any): PoolBalance {
  return {
    availableWei:    String(row.available_wei    ?? '0'),
    totalFundedWei:  String(row.total_funded_wei ?? '0'),
    totalLentWei:    String(row.total_lent_wei   ?? '0'),
    totalBadDebtWei: String(row.total_bad_debt_wei ?? '0'),
  }
}

export class LedgerRepository {
  constructor(private readonly pool: Pool) {}

  private db(client?: PoolClient | null): Pool | PoolClient {
    return client ?? this.pool
  }

  async createEntry(
    params: {
      entryType:     EntryType
      agentAddress:  string | null
      debitAccount:  AccountType
      creditAccount: AccountType
      amountWei:     string
      txHash:        string | null
      blockNumber:   number | null
      status:        EntryStatus
    },
    client?: PoolClient | null,
  ): Promise<LedgerEntry> {
    const sql = `
      INSERT INTO ledger_entries
        (entry_type, agent_address, debit_account, credit_account,
         amount_wei, tx_hash, block_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    try {
      const result = await this.db(client).query(sql, [
        params.entryType,
        params.agentAddress,
        params.debitAccount,
        params.creditAccount,
        params.amountWei,
        params.txHash,
        params.blockNumber,
        params.status,
      ])
      return toEntry(result.rows[0])
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === '23505' &&
        params.txHash
      ) {
        throw new DuplicateEntryError(params.txHash)
      }
      throw err
    }
  }

  async confirmEntry(
    id: string,
    txHash: string,
    blockNumber: number,
    client?: PoolClient | null,
  ): Promise<LedgerEntry | null> {
    const result = await this.db(client).query(
      `UPDATE ledger_entries
       SET status       = 'CONFIRMED',
           tx_hash      = COALESCE(tx_hash, $2),
           block_number = COALESCE(block_number, $3)
       WHERE id = $1 AND status = 'PENDING'
       RETURNING *`,
      [id, txHash, blockNumber],
    )
    return result.rows[0] ? toEntry(result.rows[0]) : null
  }

  async findById(
    id: string,
    client?: PoolClient | null,
  ): Promise<LedgerEntry | null> {
    const result = await this.db(client).query(
      'SELECT * FROM ledger_entries WHERE id = $1', [id],
    )
    return result.rows[0] ? toEntry(result.rows[0]) : null
  }

  async findByAgent(
    agentAddress: string,
    limit  = 50,
    offset = 0,
    client?: PoolClient | null,
  ): Promise<LedgerEntry[]> {
    const result = await this.db(client).query(
      `SELECT * FROM ledger_entries
       WHERE agent_address = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [agentAddress, limit, offset],
    )
    return result.rows.map(toEntry)
  }

  async getAgentBalance(
    agentAddress: string,
    client?: PoolClient | null,
  ): Promise<AgentCreditBalance> {
    const result = await this.db(client).query(
      'SELECT * FROM agent_balances WHERE agent_address = $1',
      [agentAddress],
    )
    if (!result.rows[0]) {
      return {
        agentAddress,
        outstandingWei:   '0',
        totalBorrowedWei: '0',
        totalRepaidWei:   '0',
        defaultCount:     0,
        lastActivityAt:   null,
      }
    }
    return toAgentBalance(result.rows[0], agentAddress)
  }

  async getPoolBalance(client?: PoolClient | null): Promise<PoolBalance> {
    const result = await this.db(client).query('SELECT * FROM pool_balance')
    return toPoolBalance(result.rows[0])
  }

  async txHashExists(
    txHash: string,
    client?: PoolClient | null,
  ): Promise<boolean> {
    const result = await this.db(client).query(
      'SELECT 1 FROM ledger_entries WHERE tx_hash = $1 LIMIT 1',
      [txHash],
    )
    return result.rows.length > 0
  }
}