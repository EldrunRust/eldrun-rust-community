import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// GET /api/shop/products - Get all products or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const products = await prisma.shopProduct.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Group by category for frontend
    const categorySet = new Set<string>()
    products.forEach((p) => categorySet.add(p.category))
    const categories = Array.from(categorySet)
    const groupedProducts = categories.map((cat) => ({
      category: cat,
      products: products.filter((p) => p.category === cat)
    }))

    return NextResponse.json({
      products,
      grouped: groupedProducts,
      total: products.length
    })

  } catch (error) {
    console.error('Get shop products error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkte' },
      { status: 500 }
    )
  }
}

// POST /api/shop/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      description,
      image,
      price,
      originalPrice,
      category,
      rarity,
      stock,
      isActive,
      isFeatured,
      isLimited,
      deliveryType,
      deliveryData
    } = body

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, Preis und Kategorie sind erforderlich' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existing = await prisma.shopProduct.findUnique({
      where: { slug }
    })

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const product = await prisma.shopProduct.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        rarity: rarity || 'common',
        stock: stock ? parseInt(stock) : null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isLimited: isLimited ?? false,
        deliveryType: deliveryType || 'instant',
        deliveryData
      }
    })

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Create shop product error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Produkts' },
      { status: 500 }
    )
  }
}
