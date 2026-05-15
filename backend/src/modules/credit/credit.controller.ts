/**
 * @file modules/credit/credit.controller.ts
 * @description HTTP controller for credit request and repayment endpoints.
 */

import { type Request, type Response, type NextFunction } from 'express'
import { z }              from 'zod'
import { CreditService }  from './credit.service'
import { ValidationError } from '../../utils/errors'

const AddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid 0x address')

const RequestCreditSchema = z.object({
  amountWei: z.string().refine(
    (v) => { try { return BigInt(v) > BigInt(0) } catch { return false } },
    { message: 'amountWei must be a positive integer string' }
  ),
})

export class CreditController {
  constructor(private readonly service: CreditService) {}

  /**
   * POST /api/credit/request
   * Request working capital from CreditVault.
   */
  requestCredit = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const addrParsed = AddressSchema.safeParse(req.params['agentAddress'])
      if (!addrParsed.success) {
        throw new ValidationError('Invalid agent address')
      }

      const bodyParsed = RequestCreditSchema.safeParse(req.body)
      if (!bodyParsed.success) {
        throw new ValidationError(
          'Invalid request body',
          bodyParsed.error.issues.map(i => ({
            path:    i.path.join('.'),
            message: i.message,
          }))
        )
      }

      const privateKey = req.headers['x-agent-private-key'] as string
      if (!privateKey) {
        throw new ValidationError('X-Agent-Private-Key header is required')
      }

      const result = await this.service.requestCredit(
        addrParsed.data,
        bodyParsed.data.amountWei,
        privateKey
      )

      res.status(result.approved ? 201 : 200).json({
        success: true,
        data:    result,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/credit/repay/:agentAddress
   * Repay active loan.
   */
  repay = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const addrParsed = AddressSchema.safeParse(req.params['agentAddress'])
      if (!addrParsed.success) {
        throw new ValidationError('Invalid agent address')
      }

      const privateKey = req.headers['x-agent-private-key'] as string
      if (!privateKey) {
        throw new ValidationError('X-Agent-Private-Key header is required')
      }

      const result = await this.service.repay(addrParsed.data, privateKey)

      res.status(200).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }
}