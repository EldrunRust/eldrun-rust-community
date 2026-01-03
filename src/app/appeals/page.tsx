'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Scale, AlertTriangle, FileText, Send, Clock, 
  CheckCircle, XCircle, HelpCircle, User, Mail,
  MessageSquare, Calendar, Shield, Info, AlertCircle
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const BAN_REASONS = [
  'Cheating / Hacking',
  'Exploiting',
  'Toxisches Verhalten',
  'Teaming über Limit',
  'Scamming',
  'Spam / Werbung',
  'Falscher Ban (Irrtum)',
  'Sonstiges'
]

export default function AppealsPage() {
  const [formData, setFormData] = useState({
    username: '',
    steamId: '',
    email: '',
    banReason: '',
    appealText: '',
    evidence: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [ticketId, setTicketId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/appeals', {
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
            Appeal eingereicht!
          </h1>
          <p className="text-metal-400 mb-6">
            Dein Ban-Appeal wurde erfolgreich eingereicht. Wir werden deine Anfrage 
            innerhalb von 24-48 Stunden bearbeiten. Du erhältst eine Benachrichtigung per E-Mail.
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
      icon={Scale}
      badge="APPEALS"
      title="BAN APPEALS"
      subtitle="DEIN FALL WIRD GEPRÜFT"
      description="Du wurdest gebannt und glaubst, dass dies ein Fehler war? Reiche hier deinen Appeal ein und wir prüfen deinen Fall."
      gradient="from-red-300 via-red-400 to-red-600"
      glowColor="rgba(239,68,68,0.22)"
    >
      <div>
        <AuthGate>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Wichtige Hinweise
              </h3>
              <ul className="space-y-3 text-sm text-metal-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Sei ehrlich in deinem Appeal
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Liefere Beweise wenn möglich
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Ein Appeal pro Ban
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Keine Spam-Appeals
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  Keine falschen Angaben
                </li>
              </ul>
            </div>

            <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Bearbeitungszeit
              </h3>
              <p className="text-metal-400 text-sm">
                Appeals werden in der Regel innerhalb von <span className="text-white font-bold">24-48 Stunden</span> bearbeitet.
                Bei hohem Aufkommen kann es länger dauern.
              </p>
            </div>

            <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">Achtung</span>
              </div>
              <p className="text-metal-400 text-sm">
                Falsche oder manipulierte Appeals führen zu einer Verlängerung des Banns!
              </p>
            </div>
          </div>

          {/* Appeal Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl space-y-6">
                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rust-400" />
                  Ban Appeal Formular
                </h2>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Spielername *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500"
                    placeholder="Dein Ingame-Name"
                  />
                </div>

                {/* Steam ID */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Steam ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.steamId}
                    onChange={(e) => setFormData({...formData, steamId: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500"
                    placeholder="76561198xxxxxxxxx"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-Mail Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500"
                    placeholder="deine@email.de"
                  />
                </div>

                {/* Ban Reason */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <HelpCircle className="w-4 h-4 inline mr-2" />
                    Ban-Grund *
                  </label>
                  <select
                    required
                    value={formData.banReason}
                    onChange={(e) => setFormData({...formData, banReason: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white focus:outline-none focus:border-rust-500"
                  >
                    <option value="">Wähle den Ban-Grund</option>
                    {BAN_REASONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                {/* Appeal Text */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Dein Appeal *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.appealText}
                    onChange={(e) => setFormData({...formData, appealText: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500 resize-none"
                    placeholder="Erkläre, warum du glaubst, dass der Ban ungerechtfertigt ist. Sei so detailliert wie möglich..."
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Beweise / Links (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.evidence}
                    onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                    className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500 resize-none"
                    placeholder="Links zu Screenshots, Videos oder anderen Beweisen..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-rust-600 to-rust-500 hover:from-rust-500 hover:to-rust-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wird eingereicht...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Appeal einreichen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}
