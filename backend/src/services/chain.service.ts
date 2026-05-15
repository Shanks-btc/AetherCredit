/**
 * @file services/chain.service.ts
 * @description Reads credit state from AetherCredit contracts on 0G Chain.
 *
 * All methods are read-only — no transactions sent here.
 * Uses ethers.js with verified 0G Mainnet RPC: https://evmrpc.0g.ai
 * ChainID: 16661 (verified from docs.0g.ai/mainnet)
 *
 * Contracts read:
 *   WorkRegistry  — agent work history and scoring inputs
 *   CreditScorer  — credit score and limit calculation
 *   CreditVault   — loan status and pool balance
 */

import { ethers }          from 'ethers'
import {
  getWorkRegistry,
  getCreditScorer,
  getCreditVault,
} from '../config/contracts'
import { type AgentProfile, type WorkRecord } from '../types/agent.types'
import { type Loan, type PoolHealth, LoanStatus } from '../types/loan.types'
import { logger } from '../utils/logger'

export class ChainService {

  // ── Agent profile ───────────────────────────────────────────────────────────

  /**
   * Reads full credit profile for an agent from CreditScorer and CreditVault.
   * Calls getCreditStatus() which aggregates all data in one contract call.
   */
  async getAgentProfile(agentAddress: string): Promise<AgentProfile> {
    try {
      const vault  = getCreditVault()
      const status = await vault.getCreditStatus(agentAddress)

      return {
        address:        agentAddress,
        score:          Number(status.score),
        limitWei:       status.limitWei.toString(),
        limitOG:        ethers.formatEther(status.limitWei),
        verifiedJobs:   Number(status.verifiedJobs),
        totalSpendWei:  '0', // not returned by getCreditStatus — read separately
        defaultCount:   Number(status.defaults),
        totalRepaidWei: status.repaidTotal.toString(),
      }
    } catch (err: unknown) {
      logger.error('ChainService.getAgentProfile failed', {
        agentAddress,
        error: (err as Error).message,
      })
      throw err
    }
  }

  // ── Score ───────────────────────────────────────────────────────────────────

  /**
   * Reads live credit score and limit from CreditScorer.calculateScore().
   * Always authoritative — never cached.
   */
  async getScore(agentAddress: string): Promise<{ score: number; limitWei: string; limitOG: string }> {
    try {
      const scorer = getCreditScorer()
      const [score, limitWei] = await scorer.calculateScore(agentAddress)

      return {
        score:    Number(score),
        limitWei: limitWei.toString(),
        limitOG:  ethers.formatEther(limitWei),
      }
    } catch (err: unknown) {
      logger.error('ChainService.getScore failed', {
        agentAddress,
        error: (err as Error).message,
      })
      throw err
    }
  }

  // ── Work history ────────────────────────────────────────────────────────────

  /**
   * Reads all work records for an agent from WorkRegistry.
   * Returns empty array if agent has no history.
   */
  async getWorkHistory(agentAddress: string): Promise<WorkRecord[]> {
    try {
      const registry = getWorkRegistry()
      const records  = await registry.getAllWorkRecords(agentAddress)

      return records.map((r: {
        agent: string
        provider: string
        chatIDHash: string
        responseHash: string
        computeCostWei: bigint
        timestamp: bigint
        teeVerified: boolean
      }) => ({
        agent:          r.agent,
        provider:       r.provider,
        chatIDHash:     r.chatIDHash,
        responseHash:   r.responseHash,
        computeCostWei: r.computeCostWei.toString(),
        timestamp:      Number(r.timestamp),
        teeVerified:    r.teeVerified,
      }))
    } catch (err: unknown) {
      logger.error('ChainService.getWorkHistory failed', {
        agentAddress,
        error: (err as Error).message,
      })
      throw err
    }
  }

  // ── Loan ────────────────────────────────────────────────────────────────────

  /**
   * Reads active loan status for an agent from CreditVault.
   * Returns null if no active loan exists.
   */
  async getActiveLoan(agentAddress: string): Promise<Loan | null> {
    try {
      const vault   = getCreditVault()
      const hasLoan = await vault.hasActiveLoan(agentAddress)

      if (!hasLoan) return null

      const loan = await vault.getActiveLoan(agentAddress)

      let status = LoanStatus.ACTIVE
      if (loan.repaid)    status = LoanStatus.REPAID
      if (loan.defaulted) status = LoanStatus.DEFAULTED

      return {
        agentAddress,
        principalWei: loan.principal.toString(),
        principalOG:  ethers.formatEther(loan.principal),
        issuedAt:     Number(loan.issuedAt),
        dueBy:        Number(loan.dueBy),
        storageRootHash: loan.storageRootHash,
        status,
        txHash: null,
      }
    } catch (err: unknown) {
      logger.error('ChainService.getActiveLoan failed', {
        agentAddress,
        error: (err as Error).message,
      })
      throw err
    }
  }

  // ── Pool ────────────────────────────────────────────────────────────────────

  /**
   * Reads current pool balance from CreditVault.
   */
  async getPoolHealth(): Promise<PoolHealth> {
    try {
      const vault    = getCreditVault()
      const balWei   = await vault.poolBalance()
      const balOG    = ethers.formatEther(balWei)

      return {
        availableWei:    balWei.toString(),
        availableOG:     balOG,
        totalFundedWei:  '0', // requires indexer for full history
        totalLentWei:    '0', // requires indexer for full history
        totalBadDebtWei: '0', // requires indexer for full history
        utilizationPct:  0,
      }
    } catch (err: unknown) {
      logger.error('ChainService.getPoolHealth failed', {
        error: (err as Error).message,
      })
      throw err
    }
  }

  // ── Eligibility check ───────────────────────────────────────────────────────

  /**
   * Checks if an agent qualifies for a specific loan amount.
   * Calls CreditScorer.qualifies() — reads live from chain.
   */
  async checkEligibility(
    agentAddress: string,
    amountWei: string
  ): Promise<{ eligible: boolean; score: number; limitWei: string }> {
    try {
      const scorer   = getCreditScorer()
      const eligible = await scorer.qualifies(agentAddress, BigInt(amountWei))
      const { score, limitWei } = await this.getScore(agentAddress)

      return { eligible, score, limitWei }
    } catch (err: unknown) {
      logger.error('ChainService.checkEligibility failed', {
        agentAddress,
        amountWei,
        error: (err as Error).message,
      })
      throw err
    }
  }
}