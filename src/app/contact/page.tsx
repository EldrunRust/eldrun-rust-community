'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, MessageSquare, Send, Clock, CheckCircle,
  AlertCircle, User, FileText, HelpCircle, Bug,
  CreditCard, Shield, Zap, ExternalLink
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const CONTACT_REASONS = [
  { value: 'general', label: 'Allgemeine Anfrage', icon: HelpCircle },
  { value: 'support', label: 'Technischer Support', icon: Zap },
  { value: 'bug', label: 'Bug melden', icon: Bug },
  { value: 'payment', label: 'Zahlung / Shop', icon: CreditCard },
  { value: 'report', label: 'Spieler melden', icon: Shield },
  { value: 'partnership', label: 'Partnerschaft', icon: MessageSquare },
  { value: 'other', label: 'Sonstiges', icon: FileText },
]

const QUICK_LINKS = [
  { title: 'Discord Server', description: 'Schnellster Support', href: 'https://discord.gg/eldrun', icon: '💬' },
  { title: 'FAQ', description: 'Häufige Fragen', href: '/faq', icon: '❓' },
  { title: 'Ban Appeal', description: 'Entbannung beantragen', href: '/appeals', icon: '⚖️' },
  { title: 'Server Regeln', description: 'Alle Regeln', href: '/rules', icon: '📜' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    steamId: '',
    reason: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ticketId, setTicketId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate
    if (!formData.name || !formData.email || !formData.reason || !formData.message) {
      setError('Bitte fülle alle Pflichtfelder aus.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten.')
        setIsSubmitting(false)
        return
      }

      setTicketId(data.ticketId)
      setSubmitted(true)
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es später erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center p-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-4">
            Nachricht gesendet!
          </h1>
          <p className="text-metal-400 mb-6">
            Vielen Dank für deine Nachricht! Wir werden uns so schnell wie möglich 
            bei dir melden. Die durchschnittliche Antwortzeit beträgt 24 Stunden.
          </p>
          <p className="text-sm text-metal-500 mb-6">
            Ticket-ID: <span className="text-amber-400 font-mono">#{ticketId}</span>
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
          >
            Zurück zur Startseite
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <EldrunPageShell
      icon={Mail}
      badge="KONTAKT"
      title="KONTAKT"
      subtitle="WIR SIND FÜR DICH DA"
      description="Hast du Fragen, Anregungen oder brauchst Hilfe? Wir sind für dich da!"
      gradient="from-cyan-300 via-cyan-400 to-cyan-600"
      glowColor="rgba(34,211,238,0.22)"
    >
      <AuthGate>
      <div>
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {QUICK_LINKS.map((link, index) => (
            <motion.a
              key={link.title}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl hover:border-cyan-500/50 transition-all group"
            >
              <span className="text-3xl mb-2 block">{link.icon}</span>
              <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors">{link.title}</h3>
              <p className="text-metal-500 text-sm">{link.description}</p>
            </motion.a>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Antwortzeiten
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between text-metal-400">
                  <span>Discord Support</span>
                  <span className="text-green-400">~1 Stunde</span>
                </li>
                <li className="flex justify-between text-metal-400">
                  <span>E-Mail / Kontaktformular</span>
                  <span className="text-amber-400">~24 Stunden</span>
                </li>
                <li className="flex justify-between text-metal-400">
                  <span>Ban Appeals</span>
                  <span className="text-amber-400">24-48 Stunden</span>
                </li>
                <li className="flex justify-between text-metal-400">
                  <span>Partnerschaftsanfragen</span>
                  <span className="text-orange-400">3-5 Tage</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                Discord
              </h3>
              <p className="text-metal-400 text-sm mb-4">
                Der schnellste Weg für Support! Unser Team ist täglich online.
              </p>
              <a
                href="https://discord.gg/eldrun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-lg transition-colors"
              >
                Discord beitreten
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                E-Mail
              </h3>
              <p className="text-metal-400 text-sm mb-2">Allgemeine Anfragen:</p>
              <a href="mailto:info@eldrun.lol" className="text-cyan-400 hover:text-cyan-300">
                info@eldrun.lol
              </a>
              <p className="text-metal-400 text-sm mt-4 mb-2">Support:</p>
              <a href="mailto:support@eldrun.lol" className="text-cyan-400 hover:text-cyan-300">
                support@eldrun.lol
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl space-y-6">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Kontaktformular
              </h2>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Dein Name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-cyan-500"
                    placeholder="deine@email.de"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Steam ID */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    Steam ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.steamId}
                    onChange={(e) => setFormData({...formData, steamId: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-cyan-500"
                    placeholder="76561198xxxxxxxxx"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    Grund *
                  </label>
                  <select
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Bitte auswählen</option>
                    {CONTACT_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>{reason.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Betreff
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-cyan-500"
                  placeholder="Kurze Beschreibung deines Anliegens"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Nachricht *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Beschreibe dein Anliegen so detailliert wie möglich..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Nachricht senden
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
