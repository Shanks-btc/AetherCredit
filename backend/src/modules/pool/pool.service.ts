/**
 * @file modules/pool/pool.service.ts
 * @description Reads credit pool health from CreditVault on 0G Chain.
 */

import { ChainService }  from '../../services/chain.service'
import { logger }        from '../../utils/logger'
import { type PoolHealth } from '../../types/loan.types'

export class PoolService {
  private readonly chainService: ChainService

  constructor() {
    this.chainService = new ChainService()
  }

  /**
   * Get current pool health from CreditVault on 0G Chain.
   */
  async getPoolHealth(): Promise<PoolHealth> {
    try {
      return await this.chainService.getPoolHealth()
    } catch (err: unknown) {
      logger.error('PoolService.getPoolHealth failed', {
        error: (err as Error).message,
      })
      throw err
    }
  }
}