import { type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { LedgerService }   from '../service/ledger.service'
import { ValidationError } from '../../../utils/errors'

const WeiAmountSchema = z
  .string({ required_error: 'amountWei is required' })
  .refine(
    (v) => { try { return BigInt(v) > BigInt(0) } catch { return false } },
    { message: 'amountWei must be a positive integer string (e.g. "500000000000000000")' },
  )

const AddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid 0x-prefixed Ethereum address (42 chars)')

const TxHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, 'Must be a valid 0x-prefixed bytes32 tx hash (66 chars)')
  .nullable()

const IssueCreditSchema = z.object({
  agentAddress: AddressSchema.nullable().default(null),
  amountWei:    WeiAmountSchema,
  txHash:       TxHashSchema.default(null),
  blockNumber:  z.number().int().positive().nullable().default(null),
})

const DeductCreditSchema = z.object({
  agentAddress: AddressSchema,
  amountWei:    WeiAmountSchema,
  txHash:       TxHashSchema.default(null),
  blockNumber:  z.number().int().positive().nullable().default(null),
})

export class LedgerController {
  constructor(private readonly service: LedgerService) {}

  issueCredit = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = IssueCreditSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid request body',
          parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        )
      }
      const result = await this.service.issueCredit(parsed.data)
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }

  deductCredit = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = DeductCreditSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid request body',
          parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        )
      }
      const result = await this.service.deductCredit(parsed.data)
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }

  fetchBalance = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = AddressSchema.safeParse(req.params['agentAddress'])
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid agent address',
          [{ path: 'agentAddress', message: parsed.error.issues[0]?.message ?? 'Invalid format' }],
        )
      }
      const result = await this.service.fetchBalance(parsed.data)
      res.status(200).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }
}