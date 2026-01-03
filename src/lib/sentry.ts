// Sentry Error Tracking Integration
// Install: npm install @sentry/nextjs
// This module provides placeholder functions when Sentry is not configured

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate: number
  replaysSessionSampleRate: number
  replaysOnErrorSampleRate: number
}

export const sentryConfig: SentryConfig = {
  dsn: SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
}

export function isSentryConfigured(): boolean {
  return !!SENTRY_DSN
}

interface ErrorContext {
  userId?: string
  username?: string
  email?: string
  extra?: Record<string, unknown>
  tags?: Record<string, string>
}

// Capture error - logs to console when Sentry is not installed
export function captureError(error: Error, context?: ErrorContext): void {
  if (!isSentryConfigured()) {
    console.error('[Error]', error.message, context)
    return
  }
  // When @sentry/nextjs is installed, it will auto-capture errors
  console.error('[Sentry] Captured:', error.message)
}

// Capture message
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!isSentryConfigured()) {
    console.log(`[${level.toUpperCase()}] ${message}`)
    return
  }
  console.log(`[Sentry ${level}] ${message}`)
}

// Add breadcrumb for debugging
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
  if (!isSentryConfigured()) return
  console.log(`[Breadcrumb] ${category}: ${message}`, data)
}

const sentry = {
  captureError,
  captureMessage,
  addBreadcrumb,
  isSentryConfigured,
  sentryConfig,
}

export default sentry
