import { NextRequest, NextResponse } from 'next/server'

type RateLimitEntry = {
  count: number
  resetAt: number
}

const WINDOW_MS = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)
const MAX_REQUESTS = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

const shouldBypassRateLimit =
  !isProdDeployment &&
  (process.env.DISABLE_RATE_LIMIT === 'true' ||
    process.env.DEMO_MODE === 'true' ||
    process.env.SIMULATION_MODE === 'true')

const store: Map<string, RateLimitEntry> =
  ((globalThis as unknown as { __eldrunRateLimitStore?: Map<string, RateLimitEntry> })
    .__eldrunRateLimitStore as Map<string, RateLimitEntry>) || new Map<string, RateLimitEntry>()

;(globalThis as unknown as { __eldrunRateLimitStore?: Map<string, RateLimitEntry> }).__eldrunRateLimitStore =
  store

let lastCleanupAt =
  ((globalThis as unknown as { __eldrunRateLimitCleanupAt?: number }).__eldrunRateLimitCleanupAt as
    | number
    | undefined) || 0
;(globalThis as unknown as { __eldrunRateLimitCleanupAt?: number }).__eldrunRateLimitCleanupAt = lastCleanupAt

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  return request.ip || 'unknown'
}

function cleanupExpired(now: number) {
  // Avoid doing a full scan on every request; run periodically.
  if (now - lastCleanupAt < 60_000) return
  lastCleanupAt = now
  ;(globalThis as unknown as { __eldrunRateLimitCleanupAt?: number }).__eldrunRateLimitCleanupAt = lastCleanupAt

  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}

export function middleware(request: NextRequest) {
  if (shouldBypassRateLimit) return NextResponse.next()
  if (request.method === 'OPTIONS') return NextResponse.next()

  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/api/health')) return NextResponse.next()

  const now = Date.now()
  cleanupExpired(now)

  const ip = getClientIp(request)
  const key = `${ip}:${request.method}:${pathname}`

  const current = store.get(key)
  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  current.count += 1

  if (current.count > MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))

    return NextResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
