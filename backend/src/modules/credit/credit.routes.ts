/**
 * @file modules/credit/credit.routes.ts
 * @description Routes for credit module.
 */

import { Router }            from 'express'
import { CreditService }     from './credit.service'
import { CreditController }  from './credit.controller'

const service    = new CreditService()
const controller = new CreditController(service)

export const creditRouter = Router()

/**
 * POST /api/credit/request/:agentAddress
 * Request working capital from CreditVault.
 */
creditRouter.post('/request/:agentAddress', controller.requestCredit)

/**
 * POST /api/credit/repay/:agentAddress
 * Repay active loan to CreditVault.
 */
creditRouter.post('/repay/:agentAddress', controller.repay)