'use client'

import { motion } from 'framer-motion'
import { 
  Shield, Eye, Database, Cookie, Lock, Mail, 
  Globe, Trash2, Settings, CheckCircle, AlertTriangle,
  Server, Share2, Clock, FileText
} from 'lucide-react'
import Link from 'next/link'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const SECTIONS = [
  {
    id: 'overview',
    title: 'Überblick',
    icon: Eye,
    content: [
      'Diese Datenschutzerklärung informiert dich über die Verarbeitung deiner personenbezogenen Daten bei ELDRUN.',
      'Verantwortlicher: ELDRUN Gaming Community',
      'Kontakt: privacy@eldrun.lol',
      'Wir nehmen den Schutz deiner Daten sehr ernst und behandeln sie vertraulich.'
    ]
  },
  {
    id: 'data-collection',
    title: 'Erhobene Daten',
    icon: Database,
    content: [
      'Bei der Registrierung: Benutzername, E-Mail-Adresse, Passwort (verschlüsselt)',
      'Bei Steam-Login: Steam-ID, Steam-Name, Avatar-URL',
      'Bei Discord-Login: Discord-ID, Benutzername, Avatar',
      'Automatisch: IP-Adresse, Browser-Typ, Besuchszeit, Geräte-Informationen',
      'Im Spiel: Spielstatistiken, Chat-Logs, Spielzeit, Inventar',
      'Im Casino: Einsätze, Gewinne, Spielverlauf',
      'Freiwillig: Profilbeschreibung, Avatar, Banner'
    ]
  },
  {
    id: 'purpose',
    title: 'Verwendungszweck',
    icon: Settings,
    content: [
      'Bereitstellung und Verbesserung unserer Dienste',
      'Account-Verwaltung und Authentifizierung',
      'Kommunikation (Support, Newsletter mit Einwilligung)',
      'Betrugsprävention und Anti-Cheat-Maßnahmen',
      'Leaderboards und Statistiken',
      'Personalisierung des Spielerlebnisses',
      'Rechtliche Verpflichtungen und Streitbeilegung'
    ]
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking',
    icon: Cookie,
    content: [
      'Notwendige Cookies: Session-Management, Authentifizierung',
      'Funktionale Cookies: Spracheinstellungen, Präferenzen',
      'Analytische Cookies: Nutzungsstatistiken (anonymisiert)',
      'Du kannst Cookies in deinen Browser-Einstellungen verwalten',
      'Ohne notwendige Cookies ist die Nutzung eingeschränkt möglich'
    ]
  },
  {
    id: 'storage',
    title: 'Datenspeicherung',
    icon: Server,
    content: [
      'Deine Daten werden auf Servern in der EU gespeichert',
      'Wir verwenden SSL/TLS-Verschlüsselung für alle Übertragungen',
      'Passwörter werden mit bcrypt gehasht (nicht im Klartext)',
      'Regelmäßige Backups zum Schutz vor Datenverlust',
      'Speicherdauer: Solange dein Account aktiv ist + 30 Tage nach Löschung'
    ]
  },
  {
    id: 'sharing',
    title: 'Datenweitergabe',
    icon: Share2,
    content: [
      'Wir verkaufen deine Daten NIEMALS an Dritte',
      'Weitergabe nur an: Zahlungsdienstleister (für Käufe), Anti-Cheat-Systeme',
      'Bei rechtlicher Verpflichtung an Behörden',
      'Öffentlich sichtbar (wenn aktiviert): Spielername, Statistiken, Achievements',
      'Du kontrollierst die Sichtbarkeit deines Profils in den Einstellungen'
    ]
  },
  {
    id: 'rights',
    title: 'Deine Rechte (DSGVO)',
    icon: Shield,
    content: [
      'Auskunftsrecht: Du kannst Auskunft über deine gespeicherten Daten verlangen',
      'Berichtigungsrecht: Du kannst fehlerhafte Daten korrigieren lassen',
      'Löschungsrecht: Du kannst die Löschung deiner Daten verlangen',
      'Widerspruchsrecht: Du kannst der Verarbeitung widersprechen',
      'Datenübertragbarkeit: Du kannst deine Daten exportieren',
      'Beschwerderecht: Du kannst dich bei der Aufsichtsbehörde beschweren'
    ]
  },
  {
    id: 'deletion',
    title: 'Account-Löschung',
    icon: Trash2,
    content: [
      'Du kannst deinen Account jederzeit in den Profileinstellungen löschen',
      'Nach der Löschung werden alle personenbezogenen Daten innerhalb von 30 Tagen entfernt',
      'Anonymisierte Spielstatistiken können zu Analysezwecken erhalten bleiben',
      'Forum-Beiträge werden anonymisiert (Name durch "Gelöschter Benutzer" ersetzt)',
      'Käufe werden aus rechtlichen Gründen 10 Jahre aufbewahrt'
    ]
  },
  {
    id: 'security',
    title: 'Sicherheitsmaßnahmen',
    icon: Lock,
    content: [
      '256-bit SSL/TLS-Verschlüsselung',
      'Regelmäßige Sicherheitsaudits',
      'Zugriffskontrolle und Protokollierung',
      'Automatische Sperren bei verdächtigen Aktivitäten',
      'Zwei-Faktor-Authentifizierung (optional)',
      'Regelmäßige Software-Updates'
    ]
  },
  {
    id: 'minors',
    title: 'Minderjährige',
    icon: AlertTriangle,
    content: [
      'Unsere Dienste sind für Personen ab 16 Jahren bestimmt',
      'Wir erheben wissentlich keine Daten von Kindern unter 16',
      'Bei Verdacht auf minderjährige Nutzer wird der Account überprüft',
      'Erziehungsberechtigte können die Löschung von Kinderdaten verlangen'
    ]
  }
]

export default function PrivacyPage() {
  return (
    <EldrunPageShell
      icon={Shield}
      badge="DATENSCHUTZ"
      title="DATENSCHUTZERKLÄRUNG"
      subtitle="DEINE PRIVATSPHÄRE"
      description="Deine Privatsphäre ist uns wichtig. Hier erfährst du, wie wir deine Daten schützen."
      gradient="from-green-300 via-green-400 to-green-600"
      glowColor="rgba(34,197,94,0.22)"
    >
      <AuthGate>
      <div>
        {/* DSGVO Badge */}
        <div className="mb-12 p-6 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-green-400 mb-1">DSGVO-Konform</h2>
            <p className="text-metal-400 text-sm">
              Diese Datenschutzerklärung entspricht den Anforderungen der Europäischen Datenschutz-Grundverordnung (DSGVO).
            </p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12 p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
          <h2 className="font-bold text-white mb-4">Schnellnavigation</h2>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 bg-metal-800 hover:bg-green-600/20 border border-metal-700 hover:border-green-500/50 rounded-lg text-sm text-metal-300 hover:text-green-400 transition-all"
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
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
            >
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-green-400" />
                </div>
                {index + 1}. {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-metal-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        {/* Contact & Data Request */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              Datenschutzanfragen
            </h3>
            <p className="text-metal-400 text-sm mb-4">
              Für Auskunft, Löschung oder andere datenschutzrechtliche Anfragen:
            </p>
            <a
              href="mailto:privacy@eldrun.lol"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              privacy@eldrun.lol
            </a>
          </div>

          <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Bearbeitungszeit
            </h3>
            <p className="text-metal-400 text-sm">
              Wir bearbeiten datenschutzrechtliche Anfragen innerhalb von <span className="text-white font-bold">30 Tagen</span> gemäß DSGVO. 
              Bei komplexen Anfragen kann die Frist auf 90 Tage verlängert werden.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
          <h3 className="font-bold text-white mb-4">Weitere Informationen</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="text-green-400 hover:text-green-300 underline">
              AGB
            </Link>
            <Link href="/rules" className="text-green-400 hover:text-green-300 underline">
              Server Regeln
            </Link>
            <Link href="/contact" className="text-green-400 hover:text-green-300 underline">
              Kontakt
            </Link>
            <Link href="/profile?tab=settings" className="text-green-400 hover:text-green-300 underline">
              Datenschutz-Einstellungen
            </Link>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
