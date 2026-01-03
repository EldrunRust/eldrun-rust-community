import { NextRequest, NextResponse } from 'next/server'
import { ALL_CONTENT } from '@/data/infiniteContent'

// GET /api/content - Get paginated content for infinite scroll (Simulation Mode)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    // Use simulation data from infiniteContent
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const items = ALL_CONTENT.slice(startIndex, endIndex)
    const hasMore = endIndex < ALL_CONTENT.length

    return NextResponse.json({
      items,
      hasMore,
      page,
      total: ALL_CONTENT.length
    })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({
      items: [],
      hasMore: false,
      page: 0,
      total: 0
    })
  }
}
