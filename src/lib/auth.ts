// Authentication & Authorization Helpers
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET?.trim()
  if (secret && secret.length >= 32) return secret

  const deployEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
  const isProdDeployment = deployEnv ? deployEnv === 'production' : process.env.NODE_ENV === 'production'

  if (isProdDeployment) {
    return null
  }

  return secret && secret.length > 0 ? secret : 'eldrun-dev-jwt-secret'
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthUser {
  userId: string
  username: string
  email: string
  role: string
  discordId?: string
  faction?: 'seraphar' | 'vorgaroth' | null
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
}

export type OptionalUser = {
  userId: string
  username?: string
  role: string
  faction?: 'seraphar' | 'vorgaroth' | null
}

export async function optionalAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) return null

    const decoded = jwt.verify(token, jwtSecret) as AuthUser
    if (!decoded?.userId) return null

    return decoded
  } catch {
    return null
  }
}

export async function optionalUser(request: NextRequest): Promise<OptionalUser | null> {
  const decoded = await optionalAuth(request)
  if (!decoded) return null

  const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
  if (!hasDb) {
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      faction: decoded.faction ?? null,
    }
  }

  try {
    const prisma = (await import('@/lib/db')).default
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, faction: true },
    })

    if (!user) return null

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      faction: (user.faction === 'seraphar' || user.faction === 'vorgaroth') ? user.faction : null,
    }
  } catch {
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      faction: decoded.faction ?? null,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return { success: false, error: 'Nicht authentifiziert' }
    }

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
      return { success: false, error: 'Server ist nicht korrekt konfiguriert' }
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret) as AuthUser
    
    if (!decoded.userId) {
      return { success: false, error: 'Ungültiges Token' }
    }

    const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
    const deployEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
    const isProdDeployment = deployEnv ? deployEnv === 'production' : process.env.NODE_ENV === 'production'
    const allowDbSkip =
      !isProdDeployment &&
      (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')

    if (!hasDb && allowDbSkip) {
      return { success: true, user: decoded }
    }

    const prisma = (await import('@/lib/db')).default

    // Verify user still exists and get current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true, discordId: true }
    })

    if (!user) {
      return { success: false, error: 'Benutzer nicht gefunden' }
    }

    return {
      success: true,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        discordId: user.discordId || undefined
      }
    }

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token abgelaufen' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Ungültiges Token' }
    }
    console.error('Token verification error:', error)
    return { success: false, error: 'Authentifizierungsfehler' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-BASED ACCESS CONTROL
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_HIERARCHY: Record<string, number> = {
  player: 1,
  vip: 2,
  moderator: 3,
  admin: 4,
  superadmin: 5
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 999
  return userLevel >= requiredLevel
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  return verifyToken(request)
}

export async function requireRole(request: NextRequest, role: string): Promise<AuthResult> {
  const auth = await verifyToken(request)
  
  if (!auth.success || !auth.user) {
    return auth
  }

  if (!hasRole(auth.user.role, role)) {
    return { success: false, error: 'Keine Berechtigung' }
  }

  return auth
}

export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, 'admin')
}

export async function requireModerator(request: NextRequest): Promise<AuthResult> {
  return requireRole(request, 'moderator')
}

// ═══════════════════════════════════════════════════════════════════════════
// API KEY VERIFICATION (for server-to-server communication)
// ═══════════════════════════════════════════════════════════════════════════

export function verifyApiKey(request: NextRequest, keyName: string): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '')
  const expectedKey = process.env[keyName]
  
  if (!expectedKey || !apiKey) {
    return false
  }
  
  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== expectedKey.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i)
  }
  
  return result === 0
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK SIGNATURE VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

import crypto from 'crypto'

export function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// Stripe webhook verification
export function verifyStripeWebhook(
  payload: string,
  signature: string
): boolean {
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeSecret) return false
  
  // Stripe uses a specific format: t=timestamp,v1=signature
  const parts = signature.split(',')
  const timestampPart = parts.find(p => p.startsWith('t='))
  const signaturePart = parts.find(p => p.startsWith('v1='))
  
  if (!timestampPart || !signaturePart) return false
  
  const timestamp = timestampPart.replace('t=', '')
  const sig = signaturePart.replace('v1=', '')
  
  const signedPayload = `${timestamp}.${payload}`
  
  return verifyWebhookSignature(signedPayload, sig, stripeSecret)
}
