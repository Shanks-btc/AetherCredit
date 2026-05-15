import { env } from '../config/env'

type LogLevel   = 'info' | 'warn' | 'error' | 'debug'
type LogContext = Record<string, unknown>

function write(level: LogLevel, message: string, ctx?: LogContext): void {
  const entry = { timestamp: new Date().toISOString(), level, message, ...ctx }
  const line  = env.NODE_ENV === 'production'
    ? JSON.stringify(entry)
    : `[${entry.timestamp}] ${level.toUpperCase().padEnd(5)} ${message}` +
      (ctx ? ` ${JSON.stringify(ctx)}` : '')
  level === 'error' ? console.error(line) : console.log(line)
}

export const logger = {
  info:  (msg: string, ctx?: LogContext) => write('info',  msg, ctx),
  warn:  (msg: string, ctx?: LogContext) => write('warn',  msg, ctx),
  error: (msg: string, ctx?: LogContext) => write('error', msg, ctx),
  debug: (msg: string, ctx?: LogContext) => {
    if (env.NODE_ENV !== 'production') write('debug', msg, ctx)
  },
}