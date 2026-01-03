'use client'

import { motion } from 'framer-motion'
import { 
  FileText, Shield, Users, CreditCard, AlertTriangle, 
  Scale, CheckCircle, XCircle, Clock, Mail, Gavel
} from 'lucide-react'
import Link from 'next/link'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const SECTIONS = [
  {
    id: 'general',
    title: 'Allgemeine Bestimmungen',
    icon: FileText,
    content: [
      'Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der ELDRUN-Website und der damit verbundenen Dienste.',
      'Mit der Registrierung und Nutzung unserer Dienste akzeptierst du diese AGB vollständig.',
      'ELDRUN behält sich das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden auf der Website veröffentlicht.',
      'Die deutsche Fassung dieser AGB ist rechtlich bindend.'
    ]
  },
  {
    id: 'account',
    title: 'Account & Registrierung',
    icon: Users,
    content: [
      'Du musst mindestens 16 Jahre alt sein, um einen Account zu erstellen.',
      'Du bist für die Sicherheit deines Accounts selbst verantwortlich.',
      'Ein Account pro Person ist erlaubt. Multi-Accounting kann zur Sperrung führen.',
      'Du darfst deinen Account nicht verkaufen, verschenken oder übertragen.',
      'Falsche Angaben bei der Registrierung können zur Account-Löschung führen.'
    ]
  },
  {
    id: 'rules',
    title: 'Verhaltensregeln',
    icon: Gavel,
    content: [
      'Respektvoller Umgang mit anderen Spielern ist Pflicht.',
      'Cheating, Hacking oder Exploiting führt zu permanentem Bann.',
      'Beleidigungen, Diskriminierung und Hassrede sind verboten.',
      'Spam, Werbung und Scam-Versuche werden nicht toleriert.',
      'Das Umgehen von Banns ist verboten und führt zu weiteren Sanktionen.',
      'Die Entscheidungen des Admin-Teams sind endgültig.'
    ]
  },
  {
    id: 'shop',
    title: 'Shop & Zahlungen',
    icon: CreditCard,
    content: [
      'Alle Preise verstehen sich in Euro (€) inklusive Mehrwertsteuer.',
      'Digitale Güter werden sofort nach Zahlungseingang freigeschaltet.',
      'Ein Widerrufsrecht für digitale Inhalte besteht nicht nach Aktivierung.',
      'Chargebacks werden als Betrugsversuch gewertet und führen zum permanenten Bann.',
      'ELDRUN ist nicht für Preisänderungen oder Verfügbarkeit von Produkten haftbar.',
      'Gekaufte Gegenstände/VIP-Status sind nicht übertragbar.'
    ]
  },
  {
    id: 'virtual',
    title: 'Virtuelle Güter & Casino',
    icon: Scale,
    content: [
      'Virtuelle Währungen (Coins) haben keinen realen Geldwert.',
      'Casino-Gewinne sind virtuell und können nicht ausgezahlt werden.',
      'ELDRUN behält sich vor, virtuelle Güter zu ändern oder zu entfernen.',
      'Manipulation des Casino-Systems führt zu Account-Löschung und Verlust aller Güter.',
      'Das Casino ist nur für Unterhaltungszwecke bestimmt.'
    ]
  },
  {
    id: 'liability',
    title: 'Haftung & Gewährleistung',
    icon: Shield,
    content: [
      'ELDRUN haftet nicht für Datenverlust oder Serverausfälle.',
      'Die Nutzung erfolgt auf eigene Gefahr.',
      'ELDRUN übernimmt keine Garantie für ununterbrochene Verfügbarkeit.',
      'Bei Wipes werden alle Spielerdaten zurückgesetzt - dies ist Teil des Spielkonzepts.',
      'ELDRUN haftet nicht für Handlungen Dritter oder anderer Spieler.'
    ]
  },
  {
    id: 'termination',
    title: 'Kündigung & Sperrung',
    icon: AlertTriangle,
    content: [
      'ELDRUN kann Accounts bei Verstößen gegen diese AGB sperren oder löschen.',
      'Bei permanentem Bann besteht kein Anspruch auf Erstattung von Käufen.',
      'Du kannst deinen Account jederzeit über die Profileinstellungen löschen.',
      'Nach Account-Löschung werden personenbezogene Daten nach 30 Tagen gelöscht.'
    ]
  }
]

export default function TermsPage() {
  return (
    <EldrunPageShell
      icon={FileText}
      badge="AGB"
      title="ALLGEMEINE GESCHÄFTSBEDINGUNGEN"
      subtitle="NUTZUNGSBEDINGUNGEN"
      description="Bitte lies dir unsere AGB sorgfältig durch. Mit der Nutzung von ELDRUN akzeptierst du diese Bedingungen."
      gradient="from-blue-300 via-blue-400 to-blue-600"
      glowColor="rgba(59,130,246,0.22)"
    >
      <AuthGate>
      <div>
        <p className="text-metal-500 text-sm mb-8 text-center">
          Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        {/* Quick Navigation */}
        <div className="mb-12 p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
          <h2 className="font-bold text-white mb-4">Schnellnavigation</h2>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 bg-metal-800 hover:bg-blue-600/20 border border-metal-700 hover:border-blue-500/50 rounded-lg text-sm text-metal-300 hover:text-blue-400 transition-all"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
            >
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-blue-400" />
                </div>
                {index + 1}. {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-metal-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        {/* Contact & Acceptance */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Fragen zu den AGB?
            </h3>
            <p className="text-metal-400 text-sm mb-4">
              Bei Fragen oder Unklarheiten zu unseren AGB kannst du uns jederzeit kontaktieren.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Kontakt aufnehmen
            </Link>
          </div>

          <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Akzeptanz
            </h3>
            <p className="text-metal-400 text-sm">
              Durch die Registrierung und Nutzung von ELDRUN bestätigst du, dass du diese 
              Allgemeinen Geschäftsbedingungen gelesen hast und ihnen zustimmst.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
          <h3 className="font-bold text-white mb-4">Weitere rechtliche Dokumente</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
              Datenschutzerklärung
            </Link>
            <Link href="/rules" className="text-blue-400 hover:text-blue-300 underline">
              Server Regeln
            </Link>
            <Link href="/appeals" className="text-blue-400 hover:text-blue-300 underline">
              Ban Appeals
            </Link>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
