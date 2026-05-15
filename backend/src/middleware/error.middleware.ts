import {
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from 'express'
import { AppError, ValidationError } from '../utils/errors'
import { logger } from '../utils/logger'
import { env }    from '../config/env'

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (env.NODE_ENV !== 'production' && err instanceof Error) {
    logger.error(err.message, { stack: err.stack })
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      code:    err.code,
      message: err.message,
    }
    if (err instanceof ValidationError && err.issues) {
      body['issues'] = err.issues
    }
    res.status(err.statusCode).json({ success: false, error: body })
    return
  }

  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
  })

  res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  })
}