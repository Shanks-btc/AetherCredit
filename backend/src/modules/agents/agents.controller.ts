/**
 * @file modules/agents/agents.controller.ts
 * @description HTTP controller for agent profile endpoints.
 */

import { type Request, type Response, type NextFunction } from 'express'
import { z }              from 'zod'
import { AgentsService }  from './agents.service'
import { ValidationError } from '../../utils/errors'

const AddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid 0x address')

export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  /**
   * GET /api/agents/:address/profile
   * Full agent profile from 0G Chain.
   */
  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = AddressSchema.safeParse(req.params['address'])
      if (!parsed.success) {
        throw new ValidationError('Invalid agent address')
      }

      const profile = await this.service.getProfile(parsed.data)
      res.status(200).json({ success: true, data: profile })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/agents/:address/score
   * Credit score from CreditScorer on 0G Chain.
   */
  getScore = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = AddressSchema.safeParse(req.params['address'])
      if (!parsed.success) {
        throw new ValidationError('Invalid agent address')
      }

      const score = await this.service.getScore(parsed.data)
      res.status(200).json({ success: true, data: score })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/agents/:address/history
   * Work history from 0G Chain and 0G Storage KV.
   */
  getWorkHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = AddressSchema.safeParse(req.params['address'])
      if (!parsed.success) {
        throw new ValidationError('Invalid agent address')
      }

      const history = await this.service.getWorkHistory(parsed.data)
      res.status(200).json({ success: true, data: history })
    } catch (err) {
      next(err)
    }
  }
}