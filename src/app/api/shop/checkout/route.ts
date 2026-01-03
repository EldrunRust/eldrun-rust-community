import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { createStripeCheckoutSession, isStripeConfigured } from '@/lib/stripe'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { requireAuth } from '@/lib/auth'

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

function parseCasinoCoinsFromDeliveryData(deliveryData: string | null | undefined): number {
  if (!deliveryData) return 0
  const trimmed = deliveryData.trim()
  if (!trimmed) return 0

  // Allow simple numeric payloads
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  // Allow JSON: { "casinoCoins": number }
  try {
    const obj = JSON.parse(trimmed) as { casinoCoins?: unknown }
    const raw = obj?.casinoCoins
    if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.floor(raw))
  } catch {
    // ignore
  }

  return 0
}

// POST /api/shop/checkout - Process checkout and create payment session
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentMethod } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID erforderlich' },
        { status: 400 }
      )
    }

    // Get order
    const order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      )
    }

    if (order.userId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bestellung kann nicht mehr bezahlt werden' },
        { status: 400 }
      )
    }

    // For now, simulate payment processing
    // In production, integrate with Stripe/PayPal here
    
    // Simulate payment based on method
    let paymentId = ''
    let paymentUrl = ''
    
    switch (paymentMethod) {
      case 'stripe':
        if (!isStripeConfigured()) {
          return NextResponse.json(
            { error: 'Stripe ist nicht konfiguriert' },
            { status: 503 }
          )
        }
        try {
          const stripeSession = await createStripeCheckoutSession({
            orderId,
            amount: order.total,
            customerEmail: order.user?.email || undefined,
            successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop/success`,
            cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop/cancel`,
            lineItems: order.items.map(item => ({
              name: item.product.name,
              description: item.product.description || undefined,
              quantity: item.quantity,
              price: item.product.price,
            })),
          })
          paymentId = stripeSession.sessionId
          paymentUrl = stripeSession.url || ''
        } catch (err) {
          console.error('Stripe error:', err)
          return NextResponse.json(
            { error: 'Stripe Checkout fehlgeschlagen' },
            { status: 500 }
          )
        }
        break
        
      case 'paypal':
        if (!isPayPalConfigured()) {
          return NextResponse.json(
            { error: 'PayPal ist nicht konfiguriert' },
            { status: 503 }
          )
        }
        try {
          const paypalOrder = await createPayPalOrder({
            orderId,
            amount: order.total,
            description: `ELDRUN Shop - Bestellung #${orderId}`,
            returnUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop/success?provider=paypal`,
            cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop/cancel`,
          })
          paymentId = paypalOrder.orderId
          paymentUrl = paypalOrder.approvalUrl
        } catch (err) {
          console.error('PayPal error:', err)
          return NextResponse.json(
            { error: 'PayPal Checkout fehlgeschlagen' },
            { status: 500 }
          )
        }
        break
        
      case 'paysafecard':
        paymentId = `psc_${Date.now()}`
        paymentUrl = `/shop/payment/paysafecard?order=${orderId}`
        break
        
      case 'coins':
        // Pay with in-game coins
        if (order.items.some((item) => item.product.category === 'currency')) {
          return NextResponse.json(
            { error: 'Währungsprodukte können nur mit Echtgeld bezahlt werden' },
            { status: 400 }
          )
        }

        const user = await prisma.user.findUnique({
          where: { id: order.userId }
        })
        
        if (!user || (user.coins || 0) < order.total) {
          return NextResponse.json(
            { error: 'Nicht genügend Coins' },
            { status: 400 }
          )
        }
        
        // Deduct coins and complete order
        await prisma.user.update({
          where: { id: order.userId },
          data: { coins: { decrement: Math.floor(order.total) } }
        })
        
        await prisma.shopOrder.update({
          where: { id: orderId },
          data: {
            status: 'paid',
            paymentMethod: 'coins',
            paymentId: `coins_${Date.now()}`
          }
        })
        
        return NextResponse.json({
          success: true,
          paid: true,
          message: 'Zahlung mit Coins erfolgreich!'
        })
        
      default:
        return NextResponse.json(
          { error: 'Ungültige Zahlungsmethode' },
          { status: 400 }
        )
    }

    // Update order with payment info
    await prisma.shopOrder.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentId,
        status: 'processing'
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl,
      paymentId,
      message: 'Weiterleitung zur Zahlung...'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Zahlung' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for payment confirmations
export async function PUT(request: NextRequest) {
  try {
    const webhookSecret = process.env.SHOP_WEBHOOK_SECRET || ''
    const provided = request.headers.get('x-shop-webhook-secret') || ''
    if (isProdDeployment) {
      if (!webhookSecret || provided !== webhookSecret) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { orderId, paymentId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID und Status erforderlich' },
        { status: 400 }
      )
    }

    const order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      )
    }

    if (status === 'paid' || status === 'completed') {
      await prisma.$transaction(async (tx) => {
        // Mark order as paid (idempotent)
        await tx.shopOrder.update({
          where: { id: orderId },
          data: {
            status: 'paid',
            paymentId: paymentId || order.paymentId,
          },
        })

        // Reload items with current delivered flags (idempotent fulfillment)
        const freshOrder = await tx.shopOrder.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } } },
        })
        if (!freshOrder) return

        for (const item of freshOrder.items) {
          if (item.delivered) continue

          if (item.product.category === 'currency') {
            const perUnit = parseCasinoCoinsFromDeliveryData(item.product.deliveryData)
            const totalCoins = perUnit * item.quantity
            if (totalCoins <= 0) {
              continue
            }

            await tx.user.update({
              where: { id: freshOrder.userId },
              data: { casinoCoins: { increment: totalCoins } },
            })

            await tx.shopOrderItem.update({
              where: { id: item.id },
              data: { delivered: true, deliveredAt: new Date() },
            })
            continue
          }

          // Existing instant delivery behavior
          if (item.product.deliveryType === 'instant') {
            await tx.shopOrderItem.update({
              where: { id: item.id },
              data: { delivered: true, deliveredAt: new Date() },
            })
          }
        }

        const after = await tx.shopOrder.findUnique({
          where: { id: orderId },
          include: { items: true },
        })

        if (!after) return

        const allDelivered = after.items.every((i) => i.delivered)
        if (allDelivered) {
          await tx.shopOrder.update({
            where: { id: orderId },
            data: { status: 'completed', deliveredAt: new Date() },
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Zahlung bestätigt!'
      })

    } else if (status === 'cancelled' || status === 'refunded') {
      await prisma.shopOrder.update({
        where: { id: orderId },
        data: { status }
      })

      // Restore stock
      for (const item of order.items) {
        if (item.product.stock !== null) {
          await prisma.shopProduct.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              sold: { decrement: item.quantity }
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: status === 'refunded' ? 'Rückerstattung durchgeführt' : 'Bestellung storniert'
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook-Fehler' },
      { status: 500 }
    )
  }
}
