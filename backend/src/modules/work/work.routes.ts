/**
 * @file modules/work/work.routes.ts
 * @description Routes for work submission module.
 */

import { Router }          from 'express'
import { WorkService }     from './work.service'
import { WorkController }  from './work.controller'

const service    = new WorkService()
const controller = new WorkController(service)

export const workRouter = Router()

/**
 * POST /api/work/submit
 * Submit a completed 0G Compute job to build credit history.
 */
workRouter.post('/submit', controller.submitWork)