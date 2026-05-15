/**
 * @file modules/pool/pool.controller.ts
 * @description HTTP controller for pool health endpoint.
 */

import { type Request, type Response, type NextFunction } from 'express'
import { PoolService } from './pool.service'

export class PoolController {
  constructor(private readonly service: PoolService) {}

  /**
   * GET /api/pool/health
   * Current credit pool health from 0G Chain.
   */
  getPoolHealth = async (
    _req: Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const health = await this.service.getPoolHealth()
      res.status(200).json({ success: true, data: health })

    } catch (err) {
      next(err)
    }
  }
}