// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN - Email Service
// Nodemailer integration with HTML templates
// ═══════════════════════════════════════════════════════════════════════════

import nodemailer from 'nodemailer'
import prisma from './db'

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Email-Konfiguration - Werte werden aus .env geladen
// Bei fehlenden Werten wird der Email-Versand übersprungen (Development Mode)
const config = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
  from: process.env.SMTP_FROM || 'noreply@eldrun.lol',
  replyTo: process.env.CONTACT_EMAIL || 'support@eldrun.lol',
}

// Check if email is properly configured
const isEmailConfigured = () => {
  return config.host && config.auth.user && config.auth.pass
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!isEmailConfigured()) return null
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth.user ? config.auth : undefined,
  })
  return transporter
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const baseTemplate = (content: string, title: string = 'ELDRUN') => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      border-bottom: 2px solid #D4AF37;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #D4AF37;
      letter-spacing: 4px;
    }
    .content {
      padding: 40px 30px;
      background-color: #111111;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #D4AF37 0%, #b8952e 100%);
      color: #000000 !important;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      margin: 20px 0;
    }
    .button:hover {
      background: linear-gradient(135deg, #e5c347 0%, #D4AF37 100%);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666666;
      font-size: 12px;
      background-color: #0a0a0a;
      border-top: 1px solid #222222;
    }
    .highlight {
      color: #D4AF37;
      font-weight: bold;
    }
    .code {
      background-color: #1a1a1a;
      padding: 15px 20px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 4px;
      text-align: center;
      color: #D4AF37;
      margin: 20px 0;
    }
    .info-box {
      background-color: #1a1a1a;
      border-left: 3px solid #D4AF37;
      padding: 15px 20px;
      margin: 20px 0;
    }
    h1, h2, h3 {
      color: #ffffff;
      margin-top: 0;
    }
    p {
      color: #cccccc;
      line-height: 1.6;
    }
    a {
      color: #D4AF37;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚔️ ELDRUN</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ELDRUN - Rust Community Server</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte nicht direkt antworten.</p>
      <p><a href="https://eldrun.lol">eldrun.lol</a> | <a href="https://discord.gg/eldrun">Discord</a></p>
    </div>
  </div>
</body>
</html>
`

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const templates = {
  // Email Verification
  verification: (username: string, verifyUrl: string) => baseTemplate(`
    <h1>Willkommen bei ELDRUN, ${username}! 🎮</h1>
    <p>Danke für deine Registrierung auf unserem Server.</p>
    <p>Bitte bestätige deine E-Mail-Adresse, um alle Funktionen nutzen zu können:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">E-Mail bestätigen</a>
    </p>
    <p>Oder kopiere diesen Link in deinen Browser:</p>
    <div class="info-box">
      <a href="${verifyUrl}" style="word-break: break-all;">${verifyUrl}</a>
    </div>
    <p><strong>Dieser Link ist 24 Stunden gültig.</strong></p>
    <p>Wenn du diese Registrierung nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
  `, 'E-Mail bestätigen - ELDRUN'),

  // Password Reset
  passwordReset: (username: string, resetUrl: string) => baseTemplate(`
    <h1>Passwort zurücksetzen</h1>
    <p>Hallo ${username},</p>
    <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Neues Passwort setzen</a>
    </p>
    <p>Oder kopiere diesen Link in deinen Browser:</p>
    <div class="info-box">
      <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
    </div>
    <p><strong>Dieser Link ist 1 Stunde gültig.</strong></p>
    <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.</p>
  `, 'Passwort zurücksetzen - ELDRUN'),

  // Welcome (after verification)
  welcome: (username: string) => baseTemplate(`
    <h1>Willkommen in der ELDRUN Community! 🎉</h1>
    <p>Hallo ${username},</p>
    <p>Deine E-Mail wurde erfolgreich bestätigt!</p>
    <p>Du hast jetzt Zugang zu allen Features:</p>
    <ul style="color: #cccccc;">
      <li>🎰 Casino mit Coins spielen</li>
      <li>💬 Im Forum diskutieren</li>
      <li>🗳️ Für den Server voten</li>
      <li>🏆 Achievements freischalten</li>
      <li>🛒 Im Shop einkaufen</li>
    </ul>
    <p style="text-align: center;">
      <a href="https://eldrun.lol" class="button">Jetzt loslegen</a>
    </p>
    <div class="info-box">
      <strong>Server IP:</strong> play.eldrun.lol:28015<br>
      <strong>Discord:</strong> discord.gg/eldrun
    </div>
  `, 'Willkommen - ELDRUN'),

  // Contact Form Confirmation
  contactConfirmation: (name: string, ticketId: string, subject: string) => baseTemplate(`
    <h1>Anfrage erhalten ✉️</h1>
    <p>Hallo ${name},</p>
    <p>Wir haben deine Anfrage erhalten und werden uns so schnell wie möglich bei dir melden.</p>
    <div class="info-box">
      <strong>Ticket-ID:</strong> <span class="highlight">${ticketId}</span><br>
      <strong>Betreff:</strong> ${subject}
    </div>
    <p>Bitte bewahre diese Ticket-ID auf, falls du den Status deiner Anfrage überprüfen möchtest.</p>
    <p>Übliche Bearbeitungszeit: <strong>24-48 Stunden</strong></p>
    <p style="text-align: center;">
      <a href="https://eldrun.lol/contact" class="button">Kontaktseite</a>
    </p>
  `, 'Anfrage erhalten - ELDRUN'),

  // Appeal Confirmation
  appealConfirmation: (username: string, ticketId: string) => baseTemplate(`
    <h1>Ban-Appeal eingereicht 📋</h1>
    <p>Hallo ${username},</p>
    <p>Dein Ban-Appeal wurde erfolgreich eingereicht und wird von unserem Team geprüft.</p>
    <div class="info-box">
      <strong>Ticket-ID:</strong> <span class="highlight">${ticketId}</span>
    </div>
    <p>Was passiert jetzt?</p>
    <ol style="color: #cccccc;">
      <li>Unser Team prüft deinen Appeal</li>
      <li>Wir recherchieren den ursprünglichen Ban-Grund</li>
      <li>Du erhältst eine E-Mail mit unserer Entscheidung</li>
    </ol>
    <p>Bearbeitungszeit: <strong>3-7 Werktage</strong></p>
    <p style="color: #ff6b6b;">⚠️ Bitte reiche keinen weiteren Appeal ein, während dieser bearbeitet wird.</p>
  `, 'Appeal eingereicht - ELDRUN'),

  // Appeal Response
  appealResponse: (username: string, ticketId: string, status: 'approved' | 'denied', reason: string) => baseTemplate(`
    <h1>Appeal-Entscheidung ${status === 'approved' ? '✅' : '❌'}</h1>
    <p>Hallo ${username},</p>
    <p>Dein Ban-Appeal <span class="highlight">${ticketId}</span> wurde bearbeitet.</p>
    <div class="info-box" style="border-color: ${status === 'approved' ? '#22c55e' : '#ef4444'};">
      <strong>Status:</strong> <span style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'};">
        ${status === 'approved' ? 'GENEHMIGT' : 'ABGELEHNT'}
      </span>
    </div>
    <p><strong>Begründung:</strong></p>
    <p>${reason}</p>
    ${status === 'approved' ? `
      <p>Du kannst dich jetzt wieder auf dem Server einloggen:</p>
      <div class="code">play.eldrun.lol:28015</div>
    ` : `
      <p>Wenn du weitere Fragen hast, kannst du uns über Discord kontaktieren.</p>
    `}
  `, 'Appeal-Entscheidung - ELDRUN'),

  // Vote Reward
  voteReward: (username: string, siteName: string, coins: number, xp: number) => baseTemplate(`
    <h1>Danke fürs Voten! 🗳️</h1>
    <p>Hallo ${username},</p>
    <p>Danke, dass du für ELDRUN auf <span class="highlight">${siteName}</span> gevotet hast!</p>
    <div class="info-box">
      <strong>Deine Belohnung:</strong><br>
      💰 <span class="highlight">+${coins}</span> Coins<br>
      ⭐ <span class="highlight">+${xp}</span> XP
    </div>
    <p>Vergiss nicht, auch morgen wieder zu voten!</p>
    <p style="text-align: center;">
      <a href="https://eldrun.lol/vote" class="button">Erneut voten</a>
    </p>
  `, 'Vote-Belohnung - ELDRUN'),

  // Order Confirmation
  orderConfirmation: (username: string, orderId: string, items: {name: string, quantity: number, price: number}[], total: number) => baseTemplate(`
    <h1>Bestellung bestätigt! 🛒</h1>
    <p>Hallo ${username},</p>
    <p>Danke für deinen Einkauf im ELDRUN Shop!</p>
    <div class="info-box">
      <strong>Bestellnummer:</strong> <span class="highlight">${orderId}</span>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #333;">
        <th style="text-align: left; padding: 10px; color: #888;">Artikel</th>
        <th style="text-align: center; padding: 10px; color: #888;">Menge</th>
        <th style="text-align: right; padding: 10px; color: #888;">Preis</th>
      </tr>
      ${items.map(item => `
        <tr style="border-bottom: 1px solid #222;">
          <td style="padding: 10px; color: #fff;">${item.name}</td>
          <td style="text-align: center; padding: 10px; color: #ccc;">${item.quantity}x</td>
          <td style="text-align: right; padding: 10px; color: #D4AF37;">${item.price.toFixed(2)}€</td>
        </tr>
      `).join('')}
      <tr>
        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Gesamt:</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: #D4AF37; font-size: 18px;">${total.toFixed(2)}€</td>
      </tr>
    </table>
    <p>Deine Artikel werden automatisch auf deinem Account aktiviert.</p>
  `, 'Bestellung bestätigt - ELDRUN'),

  // Achievement Unlocked
  achievementUnlocked: (username: string, achievementName: string, description: string, rewardCoins: number, rewardXp: number) => baseTemplate(`
    <h1>Achievement freigeschaltet! 🏆</h1>
    <p>Hallo ${username},</p>
    <p>Herzlichen Glückwunsch! Du hast ein neues Achievement freigeschaltet:</p>
    <div class="info-box" style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
      <h2 style="color: #D4AF37; margin: 0;">${achievementName}</h2>
      <p style="margin: 10px 0 0 0;">${description}</p>
    </div>
    ${(rewardCoins > 0 || rewardXp > 0) ? `
      <p><strong>Belohnung:</strong></p>
      <div class="code">
        ${rewardCoins > 0 ? `💰 +${rewardCoins} Coins` : ''}
        ${rewardCoins > 0 && rewardXp > 0 ? ' | ' : ''}
        ${rewardXp > 0 ? `⭐ +${rewardXp} XP` : ''}
      </div>
    ` : ''}
    <p style="text-align: center;">
      <a href="https://eldrun.lol/achievements" class="button">Alle Achievements</a>
    </p>
  `, 'Achievement freigeschaltet - ELDRUN'),

  // Staff Notification (new appeal/contact)
  staffNotification: (type: 'appeal' | 'contact', ticketId: string, details: string) => baseTemplate(`
    <h1>Neue ${type === 'appeal' ? 'Ban-Appeal' : 'Kontaktanfrage'} 📬</h1>
    <p>Es wurde eine neue ${type === 'appeal' ? 'Ban-Appeal' : 'Kontaktanfrage'} eingereicht.</p>
    <div class="info-box">
      <strong>Ticket-ID:</strong> <span class="highlight">${ticketId}</span>
    </div>
    <p><strong>Details:</strong></p>
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px;">
      ${details}
    </div>
    <p style="text-align: center;">
      <a href="https://eldrun.lol/admin" class="button">Im Admin-Panel öffnen</a>
    </p>
  `, `Neue ${type === 'appeal' ? 'Appeal' : 'Anfrage'} - ELDRUN Admin`),
}

// ═══════════════════════════════════════════════════════════════════════════
// SEND EMAIL FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  template?: string
  replyTo?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, template, replyTo } = options

  // Log email attempt
  const emailLog = await prisma.emailLog.create({
    data: {
      to,
      from: config.from,
      subject,
      template,
      status: 'pending',
    },
  })

  try {
    // Check if SMTP is configured
    const tx = getTransporter()
    if (!tx) {
      // console.log('[EMAIL] SMTP not configured, skipping email send')
      // console.log('[EMAIL] To:', to)
      // console.log('Sending email:', { to, subject, template })
      
      // Update log as skipped (dev mode)
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { 
          status: 'sent', 
          sentAt: new Date(),
          error: 'DEV_MODE: SMTP not configured'
        },
      })
      
      return { success: true }
    }

    // Send email
    await tx.sendMail({
      from: `ELDRUN <${config.from}>`,
      to,
      subject,
      html,
      replyTo: replyTo || config.replyTo,
    })

    // Update log as sent
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'sent', sentAt: new Date() },
    })

    // console.log(`[EMAIL] Sent to ${to}: ${subject}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Update log as failed
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'failed', error: errorMessage },
    })

    console.error(`[EMAIL] Failed to send to ${to}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eldrun.lol'}/verify?token=${token}`
  
  return sendEmail({
    to: email,
    subject: '✉️ E-Mail bestätigen - ELDRUN',
    html: templates.verification(username, verifyUrl),
    template: 'verification',
  })
}

export async function sendPasswordResetEmail(email: string, username: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eldrun.lol'}/reset-password?token=${token}`
  
  return sendEmail({
    to: email,
    subject: '🔐 Passwort zurücksetzen - ELDRUN',
    html: templates.passwordReset(username, resetUrl),
    template: 'password-reset',
  })
}

export async function sendWelcomeEmail(email: string, username: string) {
  return sendEmail({
    to: email,
    subject: '🎉 Willkommen bei ELDRUN!',
    html: templates.welcome(username),
    template: 'welcome',
  })
}

export async function sendContactConfirmationEmail(email: string, name: string, ticketId: string, subject: string) {
  return sendEmail({
    to: email,
    subject: '📬 Anfrage erhalten - ELDRUN',
    html: templates.contactConfirmation(name, ticketId, subject),
    template: 'contact-confirmation',
  })
}

export async function sendAppealConfirmationEmail(email: string, username: string, ticketId: string) {
  return sendEmail({
    to: email,
    subject: '📋 Appeal eingereicht - ELDRUN',
    html: templates.appealConfirmation(username, ticketId),
    template: 'appeal-confirmation',
  })
}

export async function sendAppealResponseEmail(
  email: string, 
  username: string, 
  ticketId: string, 
  status: 'approved' | 'denied',
  reason: string
) {
  return sendEmail({
    to: email,
    subject: `${status === 'approved' ? '✅' : '❌'} Appeal-Entscheidung - ELDRUN`,
    html: templates.appealResponse(username, ticketId, status, reason),
    template: 'appeal-response',
  })
}

export async function sendVoteRewardEmail(
  email: string,
  username: string,
  siteName: string,
  coins: number,
  xp: number
) {
  return sendEmail({
    to: email,
    subject: '🗳️ Danke fürs Voten! - ELDRUN',
    html: templates.voteReward(username, siteName, coins, xp),
    template: 'vote-reward',
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  username: string,
  orderId: string,
  items: {name: string, quantity: number, price: number}[],
  total: number
) {
  return sendEmail({
    to: email,
    subject: '🛒 Bestellung bestätigt - ELDRUN',
    html: templates.orderConfirmation(username, orderId, items, total),
    template: 'order-confirmation',
  })
}

export async function sendAchievementEmail(
  email: string,
  username: string,
  achievementName: string,
  description: string,
  rewardCoins: number,
  rewardXp: number
) {
  return sendEmail({
    to: email,
    subject: '🏆 Achievement freigeschaltet! - ELDRUN',
    html: templates.achievementUnlocked(username, achievementName, description, rewardCoins, rewardXp),
    template: 'achievement',
  })
}

export async function sendStaffNotificationEmail(
  type: 'appeal' | 'contact',
  ticketId: string,
  details: string
) {
  const staffEmail = process.env.CONTACT_EMAIL || 'support@eldrun.lol'
  
  return sendEmail({
    to: staffEmail,
    subject: `📬 Neue ${type === 'appeal' ? 'Appeal' : 'Anfrage'}: ${ticketId}`,
    html: templates.staffNotification(type, ticketId, details),
    template: 'staff-notification',
  })
}

const email = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactConfirmationEmail,
  sendAppealConfirmationEmail,
  sendAppealResponseEmail,
  sendVoteRewardEmail,
  sendOrderConfirmationEmail,
  sendAchievementEmail,
  sendStaffNotificationEmail,
  templates,
}

export default email
