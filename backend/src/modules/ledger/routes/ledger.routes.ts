import { Router } from 'express'
import { pool }   from '../../../config/database'
import { LedgerRepository } from '../repository/ledger.repository'
import { LedgerService }    from '../service/ledger.service'
import { LedgerController } from '../controller/ledger.controller'

const repo       = new LedgerRepository(pool)
const service    = new LedgerService(repo)
const controller = new LedgerController(service)

export const ledgerRouter = Router()

ledgerRouter.post('/issue',               controller.issueCredit)
ledgerRouter.post('/deduct',              controller.deductCredit)
ledgerRouter.get('/balance/:agentAddress', controller.fetchBalance)