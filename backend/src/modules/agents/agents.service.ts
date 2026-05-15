/**
 * @file modules/agents/agents.service.ts
 * @description Reads agent profiles from 0G Chain and 0G Storage.
 */

import { ChainService }   from '../../services/chain.service'
import { StorageService } from '../../services/storage.service'
import { logger }         from '../../utils/logger'
import { type AgentProfile, type WorkRecord } from '../../types/agent.types'
import { AgentNotFoundError } from '../../utils/errors'

export class AgentsService {
  private readonly chainService:   ChainService
  private readonly storageService: StorageService

  constructor() {
    this.chainService   = new ChainService()
    this.storageService = new StorageService()
  }

  /**
   * Get full agent profile from 0G Chain.
   * Reads: CreditVault.getCreditStatus()
   */
  async getProfile(agentAddress: string): Promise<AgentProfile> {
    try {
      const profile = await this.chainService.getAgentProfile(agentAddress)
      return profile
    } catch (err: unknown) {
      logger.error('AgentsService.getProfile failed', {
        agentAddress,
        error: (err as Error).message,
      })
      throw new AgentNotFoundError(agentAddress)
    }
  }

  /**
   * Get agent work history from both 0G Chain and 0G Storage KV.
   * Chain is authoritative. Storage KV provides richer metadata.
   */
  async getWorkHistory(agentAddress: string): Promise<{
    onChain:   WorkRecord[]
    offChain:  unknown[]
  }> {
    const [onChain, offChain] = await Promise.all([
      this.chainService.getWorkHistory(agentAddress),
      this.storageService.getWorkHistory(agentAddress),
    ])

    return { onChain, offChain }
  }

  /**
   * Get agent credit score from CreditScorer on 0G Chain.
   */
  async getScore(agentAddress: string): Promise<{
    score:    number
    limitWei: string
    limitOG:  string
  }> {
    return this.chainService.getScore(agentAddress)
  }
}