// PayPal SDK Integration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox' // 'sandbox' or 'live'

const isDemoOrSimulation = process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true'

const PAYPAL_API_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  if (!isDemoOrSimulation) {
    console.warn('⚠️ PayPal Credentials nicht konfiguriert - PayPal Zahlungen deaktiviert')
  }
}

interface PayPalAccessToken {
  access_token: string
  token_type: string
  expires_in: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal ist nicht konfiguriert')
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('PayPal Authentifizierung fehlgeschlagen')
  }

  const data: PayPalAccessToken = await response.json()
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Expire 1 minute early
  }

  return data.access_token
}

interface CreateOrderParams {
  orderId: string
  amount: number
  currency?: string
  description?: string
  returnUrl: string
  cancelUrl: string
}

interface PayPalOrder {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

export async function createPayPalOrder({
  orderId,
  amount,
  currency = 'EUR',
  description = 'ELDRUN Shop Bestellung',
  returnUrl,
  cancelUrl,
}: CreateOrderParams): Promise<{ orderId: string; approvalUrl: string }> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        description,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'ELDRUN',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal Order Erstellung fehlgeschlagen: ${JSON.stringify(error)}`)
  }

  const order: PayPalOrder = await response.json()
  const approvalLink = order.links.find(link => link.rel === 'approve')

  if (!approvalLink) {
    throw new Error('PayPal Approval URL nicht gefunden')
  }

  return {
    orderId: order.id,
    approvalUrl: approvalLink.href,
  }
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  success: boolean
  transactionId?: string
  status: string
}> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      status: 'FAILED',
    }
  }

  const data = await response.json()
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]

  return {
    success: data.status === 'COMPLETED',
    transactionId: capture?.id,
    status: data.status,
  }
}

export async function getPayPalOrderDetails(paypalOrderId: string): Promise<PayPalOrder> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('PayPal Order nicht gefunden')
  }

  return response.json()
}

export async function refundPayPalPayment(captureId: string, amount?: number, currency = 'EUR'): Promise<boolean> {
  const accessToken = await getAccessToken()

  const body: Record<string, unknown> = {}
  if (amount) {
    body.amount = {
      value: amount.toFixed(2),
      currency_code: currency,
    }
  }

  const response = await fetch(`${PAYPAL_API_URL}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return response.ok
}

export function isPayPalConfigured(): boolean {
  return !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET)
}
