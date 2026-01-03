import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 1x1 transparent PNG
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2f5ZcAAAAASUVORK5CYII='

export async function GET() {
  const bytes = Uint8Array.from(Buffer.from(PNG_BASE64, 'base64'))

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      // This is a static placeholder; cache aggressively.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
