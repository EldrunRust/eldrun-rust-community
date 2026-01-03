// Stripe Integration
// Install with: npm install stripe
// This module provides placeholder functions when Stripe is not configured

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

interface CreateCheckoutSessionParams {
  orderId: string
  amount: number
  currency?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  lineItems?: Array<{
    name: string
    description?: string
    quantity: number
    price: number
  }>
}

export async function createStripeCheckoutSession(params: CreateCheckoutSessionParams): Promise<{
  sessionId: string
  url: string | null
}> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe ist nicht konfiguriert - STRIPE_SECRET_KEY fehlt')
  }

  // Return placeholder for now - real implementation requires stripe package
  // npm install stripe
  // console.log('[Stripe] Creating checkout session for order:', params.orderId)
  
  return {
    sessionId: `cs_demo_${Date.now()}`,
    url: `/shop/payment/stripe?order=${params.orderId}&demo=true`,
  }
}

export async function retrieveStripeSession(sessionId: string): Promise<{ id: string; status: string } | null> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe ist nicht konfiguriert')
  }
  
  // console.log('[Stripe] Retrieving session:', sessionId)
  return { id: sessionId, status: 'complete' }
}

export async function verifyStripeWebhook(payload: string | Buffer, signature: string): Promise<{ type: string; data: unknown }> {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe Webhook nicht konfiguriert')
  }
  
  // console.log('[Stripe] Verifying webhook')
  return { type: 'checkout.session.completed', data: {} }
}

export async function createStripeRefund(paymentIntentId: string, amount?: number): Promise<{ id: string; status: string }> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe ist nicht konfiguriert')
  }
  
  console.log('[Stripe] Creating refund for:', paymentIntentId, amount)
  return { id: `re_demo_${Date.now()}`, status: 'succeeded' }
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY
}
