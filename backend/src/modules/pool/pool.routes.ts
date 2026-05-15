/**
 * @file modules/pool/pool.routes.ts
 * @description Routes for pool module.
 */

import { Router }          from 'express'
import { PoolService }     from './pool.service'
import { PoolController }  from './pool.controller'

const service    = new PoolService()
const controller = new PoolController(service)

export const poolRouter = Router()

/**
 * GET /api/pool/health
 * Current credit pool health from CreditVault on 0G Chain.
 */
poolRouter.get('/health', controller.getPoolHealth)