import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const dynamic = 'force-dynamic'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)

function isValidVerifyToken(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${SITE_URL}/verify?error=no_token`)
    }

    if (!isValidVerifyToken(token)) {
      return NextResponse.redirect(`${SITE_URL}/verify?error=invalid_token`)
    }

    if (!hasDb) {
      return NextResponse.redirect(`${SITE_URL}/verify?error=server_error`)
    }

    const prisma = (await import('@/lib/db')).default

    // Find user with valid verify token
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: { gt: new Date() }
      }
    })

    if (!user) {
      return NextResponse.redirect(`${SITE_URL}/verify?error=invalid_token`)
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyExpires: null,
      }
    })

    // Send welcome email
    sendWelcomeEmail(user.email, user.username).catch(err => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.redirect(`${SITE_URL}/verify?success=true`)

  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(`${SITE_URL}/verify?error=server_error`)
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail Adresse erforderlich' },
        { status: 400 }
      )
    }

    if (!hasDb) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'Falls ein unbestätigter Account existiert, erhältst du eine neue E-Mail.'
      })
    }

    const prisma = (await import('@/lib/db')).default

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'Falls ein unbestätigter Account existiert, erhältst du eine neue E-Mail.'
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Deine E-Mail ist bereits bestätigt.'
      })
    }

    // Generate new token
    const crypto = await import('crypto')
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyExpires }
    })

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/email')
    await sendVerificationEmail(user.email, user.username, verifyToken)

    return NextResponse.json({
      success: true,
      message: 'Verifizierungs-E-Mail wurde gesendet!'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
