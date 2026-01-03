import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendAppealConfirmationEmail, sendAppealResponseEmail, sendStaffNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, steamId, email, banReason, appealText, evidence } = body

    // Validation
    if (!username || !steamId || !email || !banReason || !appealText) {
      return NextResponse.json(
        { error: 'Bitte fülle alle Pflichtfelder aus.' },
        { status: 400 }
      )
    }

    // Steam ID validation
    const steamIdRegex = /^7656119[0-9]{10}$/
    if (!steamIdRegex.test(steamId)) {
      return NextResponse.json(
        { error: 'Ungültige Steam ID. Format: 76561198xxxxxxxxx' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail Adresse' },
        { status: 400 }
      )
    }

    // Check for existing pending appeal
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        steamId,
        status: 'pending'
      }
    })
    
    if (existingAppeal) {
      return NextResponse.json(
        { error: 'Du hast bereits einen offenen Appeal. Bitte warte auf dessen Bearbeitung.' },
        { status: 409 }
      )
    }

    // Rate limiting - max 1 appeal per steamId per 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000)
    const recentCount = await prisma.appeal.count({
      where: {
        steamId,
        createdAt: { gte: sevenDaysAgo }
      }
    })
    
    if (recentCount >= 1) {
      return NextResponse.json(
        { error: 'Du kannst nur einen Appeal pro Woche einreichen.' },
        { status: 429 }
      )
    }

    // Create appeal in database
    const appeal = await prisma.appeal.create({
      data: {
        username,
        steamId,
        email: email.toLowerCase(),
        banReason,
        appealText,
        evidence: evidence || null,
        status: 'pending',
        priority: 'normal',
      }
    })

    // Send confirmation email (async)
    sendAppealConfirmationEmail(
      appeal.email,
      appeal.username,
      appeal.ticketId
    ).catch(err => console.error('Failed to send appeal confirmation:', err))

    // Notify staff (async)
    sendStaffNotificationEmail(
      'appeal',
      appeal.ticketId,
      `<strong>Spieler:</strong> ${appeal.username}<br>
       <strong>Steam ID:</strong> ${appeal.steamId}<br>
       <strong>E-Mail:</strong> ${appeal.email}<br>
       <strong>Ban-Grund:</strong> ${appeal.banReason}<br><br>
       <strong>Appeal:</strong><br>${appeal.appealText}`
    ).catch(err => console.error('Failed to notify staff:', err))

    return NextResponse.json({
      success: true,
      message: 'Ban Appeal erfolgreich eingereicht!',
      ticketId: appeal.ticketId,
      estimatedTime: '3-7 Werktage'
    })

  } catch (error) {
    console.error('Ban appeal error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get('steamId')
    const status = searchParams.get('status')

    const appeals = await prisma.appeal.findMany({
      where: {
        ...(steamId && { steamId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      appeals,
      total: appeals.length
    })
  } catch (error) {
    console.error('Get appeals error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Appeals' },
      { status: 500 }
    )
  }
}

// Admin endpoint to update appeal status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, status, response, assignedTo } = body

    const appeal = await prisma.appeal.findUnique({
      where: { ticketId }
    })
    
    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal nicht gefunden' },
        { status: 404 }
      )
    }

    // Update appeal
    const updatedAppeal = await prisma.appeal.update({
      where: { ticketId },
      data: {
        status,
        response,
        assignedTo,
        respondedAt: new Date(),
      }
    })

    // Send email to user about decision if approved/denied
    if (status === 'approved' || status === 'denied') {
      sendAppealResponseEmail(
        updatedAppeal.email,
        updatedAppeal.username,
        updatedAppeal.ticketId,
        status,
        response || (status === 'approved' 
          ? 'Dein Ban wurde aufgehoben. Du kannst dich wieder auf dem Server einloggen.' 
          : 'Dein Appeal wurde nach sorgfältiger Prüfung abgelehnt.')
      ).catch(err => console.error('Failed to send appeal response:', err))
    }

    return NextResponse.json({
      success: true,
      appeal: updatedAppeal
    })

  } catch (error) {
    console.error('Appeal update error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
