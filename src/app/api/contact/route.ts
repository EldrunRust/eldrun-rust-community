import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendContactConfirmationEmail, sendStaffNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, reason, subject, message } = body

    // Validation
    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        { error: 'Bitte fülle alle Pflichtfelder aus.' },
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

    // Rate limiting - check recent submissions from this email
    const oneHourAgo = new Date(Date.now() - 3600000)
    const recentCount = await prisma.contact.count({
      where: {
        email: email.toLowerCase(),
        createdAt: { gte: oneHourAgo }
      }
    })
    
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte warte eine Stunde.' },
        { status: 429 }
      )
    }

    // Create contact submission in database
    const contact = await prisma.contact.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject: subject || `Anfrage: ${reason}`,
        category: reason,
        message,
        status: 'open',
        priority: 'normal',
      }
    })

    // Send confirmation email to user (async)
    sendContactConfirmationEmail(
      contact.email, 
      contact.name, 
      contact.ticketId, 
      contact.subject
    ).catch(err => console.error('Failed to send contact confirmation:', err))

    // Notify staff (async)
    sendStaffNotificationEmail(
      'contact',
      contact.ticketId,
      `<strong>Von:</strong> ${contact.name} (${contact.email})<br>
       <strong>Kategorie:</strong> ${contact.category}<br>
       <strong>Betreff:</strong> ${contact.subject}<br><br>
       <strong>Nachricht:</strong><br>${contact.message}`
    ).catch(err => console.error('Failed to notify staff:', err))

    return NextResponse.json({
      success: true,
      message: 'Nachricht erfolgreich gesendet!',
      ticketId: contact.ticketId
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const contacts = await prisma.contact.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      submissions: contacts,
      total: contacts.length
    })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfragen' },
      { status: 500 }
    )
  }
}
