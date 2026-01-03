'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

type HealthStatus = {
  ok: boolean
  prisma: { ok: boolean; error?: string }
  timestamp: string
}

export async function GET() {
  const result: HealthStatus = {
    ok: true,
    prisma: { ok: true },
    timestamp: new Date().toISOString(),
  }

  try {
    // lightweight ping; avoids heavy queries
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    result.ok = false
    result.prisma = { ok: false, error: error instanceof Error ? error.message : 'unknown error' }
  }

  const status = result.ok ? 200 : 503
  return NextResponse.json(result, { status })
}
