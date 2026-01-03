import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url)
  // Always redirect any missing avatar jpg/png requests to the default SVG avatar
  return NextResponse.redirect(new URL('/images/avatars/default.svg', baseUrl), 307)
}
