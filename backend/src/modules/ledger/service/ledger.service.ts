import {
  type IssueCreditRequest,
  type DeductCreditRequest,
  type LedgerOperationResult,
  type BalanceFetchResult,
  EntryType,
  AccountType,
  EntryStatus,
} from '../../../types/ledger.types'
import {
  InsufficientBalanceError,
  InvalidAmountError,
  AgentNotFoundError,
  LedgerInvariantError,
} from '../../../utils/errors'
import { withTransaction } from '../../../config/database'
import { logger }          from '../../../utils/logger'
import { LedgerRepository } from '../repository/ledger.repository'

function assertPositiveWei(amountWei: string): void {
  try {
    const n = BigInt(amountWei)
    if (n <= BigInt(0)) throw new InvalidAmountError(amountWei)
  } catch {
    throw new InvalidAmountError(amountWei)
  }
}

function weiGte(a: string, b: string): boolean {
  return BigInt(a) >= BigInt(b)
}

export class LedgerService {
  constructor(private readonly repo: LedgerRepository) {}

  async issueCredit(req: IssueCreditRequest): Promise<LedgerOperationResult> {
    assertPositiveWei(req.amountWei)

    return withTransaction(async (client) => {
      const entry = await this.repo.createEntry(
        {
          entryType:     EntryType.CREDIT_ISSUED,
          agentAddress:  req.agentAddress,
          // Pool funding (no agent): BAD_DEBT → POOL records external inflow
          // Agent credit (with agent): POOL → AGENT records loan disbursement
          debitAccount:  req.agentAddress ? AccountType.POOL     : AccountType.BAD_DEBT,
          creditAccount: req.agentAddress ? AccountType.AGENT    : AccountType.POOL,
          amountWei:     req.amountWei,
          txHash:        req.txHash,
          blockNumber:   req.blockNumber,
          status:        req.txHash ? EntryStatus.CONFIRMED : EntryStatus.PENDING,
        },
        client,
      )

      const agentBalance = req.agentAddress
        ? await this.repo.getAgentBalance(req.agentAddress, client)
        : null

      const poolBalance = await this.repo.getPoolBalance(client)

      if (BigInt(poolBalance.availableWei) < BigInt(0)) {
        throw new LedgerInvariantError('pool_available_negative_after_issue', {
          poolBalance,
          amountWei: req.amountWei,
        })
      }

      logger.info('Credit issued', {
        entryId:      entry.id,
        agentAddress: req.agentAddress,
        amountWei:    req.amountWei,
      })

      return { entry, agentBalance, poolBalance }
    })
  }

  async deductCredit(req: DeductCreditRequest): Promise<LedgerOperationResult> {
    assertPositiveWei(req.amountWei)

    return withTransaction(async (client) => {
      const poolBalance = await this.repo.getPoolBalance(client)

      if (!weiGte(poolBalance.availableWei, req.amountWei)) {
        throw new InsufficientBalanceError(req.amountWei, poolBalance.availableWei)
      }

      const entry = await this.repo.createEntry(
        {
          entryType:     EntryType.CREDIT_DEDUCTED,
          agentAddress:  req.agentAddress,
          debitAccount:  AccountType.POOL,
          creditAccount: AccountType.AGENT,
          amountWei:     req.amountWei,
          txHash:        req.txHash,
          blockNum