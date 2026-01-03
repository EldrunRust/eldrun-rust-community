// Centralized logging utility for Eldrun
// Provides structured, environment-aware logging with optional Sentry integration

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  source?: string
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private logLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level] >= levels[this.logLevel]
  }

  private format(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const sourceStr = entry.source ? `[${entry.source}] ` : ''
    return `${entry.timestamp} ${sourceStr}${entry.level.toUpperCase()}: ${entry.message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, source?: string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      source,
    }

    const formatted = this.format(entry)

    // Console output in development
    if (this.isDev) {
      switch (level) {
        case 'debug':
          console.debug(formatted)
          break
        case 'info':
          console.info(formatted)
          break
        case 'warn':
          console.warn(formatted)
          break
        case 'error':
          console.error(formatted)
          break
      }
      return
    }

    // In production, only log errors and warnings to console
    if (level === 'error' || level === 'warn') {
      console.error(formatted)
    }

    // Send to Sentry if configured
    if (level === 'error' && typeof window !== 'undefined') {
      import('@/lib/sentry').then(({ captureError }) => {
        const error = new Error(message)
        captureError(error, context)
      }).catch(() => {
        // Sentry not available, silently ignore
      })
    }
  }

  debug(message: string, context?: Record<string, unknown>, source?: string) {
    this.log('debug', message, context, source)
  }

  info(message: string, context?: Record<string, unknown>, source?: string) {
    this.log('info', message, context, source)
  }

  warn(message: string, context?: Record<string, unknown>, source?: string) {
    this.log('warn', message, context, source)
  }

  error(message: string, context?: Record<string, unknown>, source?: string) {
    this.log('error', message, context, source)
  }

  // Performance logging
  time(label: string, source?: string) {
    if (this.isDev) {
      console.time(`${source ? `[${source}] ` : ''}${label}`)
    }
  }

  timeEnd(label: string, source?: string) {
    if (this.isDev) {
      console.timeEnd(`${source ? `[${source}] ` : ''}${label}`)
    }
  }

  // API request logging
  apiRequest(method: string, url: string, duration?: number, status?: number, error?: string) {
    const context = {
      method,
      url,
      duration,
      status,
      ...(error && { error }),
    }

    if (error) {
      this.error(`API request failed: ${method} ${url}`, context, 'API')
    } else {
      this.info(`API request: ${method} ${url}`, context, 'API')
    }
  }

  // User action logging
  userAction(action: string, userId?: string, context?: Record<string, unknown>) {
    this.info(`User action: ${action}`, { userId, ...context }, 'USER')
  }

  // Performance metrics
  performance(metric: string, value: number, unit: string = 'ms', context?: Record<string, unknown>) {
    this.info(`Performance: ${metric}`, { value, unit, ...context }, 'PERF')
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export const log = {
  debug: (message: string, context?: Record<string, unknown>, source?: string) => 
    logger.debug(message, context, source),
  info: (message: string, context?: Record<string, unknown>, source?: string) => 
    logger.info(message, context, source),
  warn: (message: string, context?: Record<string, unknown>, source?: string) => 
    logger.warn(message, context, source),
  error: (message: string, context?: Record<string, unknown>, source?: string) => 
    logger.error(message, context, source),
  time: (label: string, source?: string) => logger.time(label, source),
  timeEnd: (label: string, source?: string) => logger.timeEnd(label, source),
  apiRequest: (method: string, url: string, duration?: number, status?: number, error?: string) => 
    logger.apiRequest(method, url, duration, status, error),
  userAction: (action: string, userId?: string, context?: Record<string, unknown>) => 
    logger.userAction(action, userId, context),
  performance: (metric: string, value: number, unit?: string, context?: Record<string, unknown>) => 
    logger.performance(metric, value, unit, context),
}

export default logger
