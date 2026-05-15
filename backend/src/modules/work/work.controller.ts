/**
 * @file modules/work/work.controller.ts
 * @description HTTP controller for work submission endpoint.
 */

import { type Request, type Response, type NextFunction } from 'express'
import { z }            from 'zod'
import { WorkService }  from './work.service'
import { ValidationError } from '../../utils/errors'

const SubmitWorkSchema = z.object({
  provider:       z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid provider address'),
  chatID:         z.string().min(1, 'chatID is required'),
  responseHash:   z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid responseHash'),
  computeCostWei: z.string().refine(
    (v) => { try { return BigInt(v) > BigInt(0) } catch { return false } },
    { message: 'computeCostWei must be a positive integer string' }
  ),
})

export class WorkController {
  constructor(private readonly service: WorkService) {}

  submitWork = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = SubmitWorkSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid request body',
          parsed.error.issues.map(i => ({
            path:    i.path.join('.'),
            message: i.message,
          }))
        )
      }

      const privateKey = req.headers['x-agent-private-key'] as string
      if (!privateKey) {
        throw new ValidationError('X-Agent-Private-Key header is required')
      }

      const result = await this.service.submitWork(parsed.data, privateKey)
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }
}