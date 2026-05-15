/**
 * @file modules/agents/agents.routes.ts
 * @description Routes for agents module.
 */

import { Router }             from 'express'
import { AgentsService }      from './agents.service'
import { AgentsController }   from './agents.controller'

const service    = new AgentsService()
const controller = new AgentsController(service)

export const agentsRouter = Router()

/**
 * GET /api/agents/:address/profile
 * Full agent credit profile from 0G Chain.
 */
agentsRouter.get('/:address/profile', controller.getProfile)

/**
 * GET /api/agents/:address/score
 * Live credit score from CreditScorer.
 */
agentsRouter.get('/:address/score', controller.getScore)

/**
 * GET /api/agents/:address/history
 * Work history from 0G Chain + 0G Storage KV.
 */
agentsRouter.get('/:address/history', controller.getWorkHistory)