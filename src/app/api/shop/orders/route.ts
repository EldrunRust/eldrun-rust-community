import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/shop/orders - Get user's orders
export async function GET(request: NextRequest) {
  // Verify user is authenticated
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Users can only view their own orders
    const userId = auth.user.userId

    const where: Record<string, unknown> = { userId }
    
    if (status) {
      where.status = status
    }

    const orders = await prisma.shopOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellungen' },
      { status: 500 }
    )
  }
}

// POST /api/shop/orders - Create new order
export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, steamId, items } = body
    const userId = auth.user.userId // Use authenticated user's ID

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'E-Mail und Artikel sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Get product details and calculate totals
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await prisma.shopProduct.findMany({
      where: { id: { in: productIds } }
    })

    // Calculate order totals
    let subtotal = 0
    const orderItems: Array<{
      productId: string
      quantity: number
      priceEach: number
      totalPrice: number
    }> = []

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produkt nicht gefunden: ${item.productId}` },
          { status: 404 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Produkt nicht verfügbar: ${product.name}` },
          { status: 400 }
        )
      }

      // Check stock
      if (product.stock !== null && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Nicht genug auf Lager: ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceEach: product.price,
        totalPrice: itemTotal
      })
    }

    const tax = subtotal * 0.19 // 19% German VAT
    const total = subtotal + tax

    // Create order
    const order = await prisma.shopOrder.create({
      data: {
        user: { connect: { id: userId } },
        email,
        steamId,
        subtotal,
        tax,
        total,
        status: 'pending',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update stock for each product
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.productId)
      if (product && product.stock !== null) {
        await prisma.shopProduct.update({
          where: { id: product.id },
          data: { 
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Bestellung erstellt! Bitte fahre mit der Zahlung fort.'
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung' },
      { status: 500 }
    )
  }
}
