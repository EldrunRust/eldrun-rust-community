'use client'

import { motion } from 'framer-motion'
import { 
  Building2, Mail, Phone, Globe, MapPin, User, 
  FileText, Shield, Scale, Clock, AlertTriangle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// Server/Company Information - Replace with real data for production
const COMPANY_INFO = {
  name: 'ELDRUN Gaming Community',
  type: 'Privates Hobby-Projekt',
  operator: 'Max Mustermann', // Replace with real name
  street: 'Musterstraße 123', // Replace with real address
  zip: '12345',
  city: 'Musterstadt',
  country: 'Deutschland',
  email: 'info@eldrun.lol',
  discord: 'https://discord.gg/eldrun',
  website: 'https://eldrun.lol',
}

const LEGAL_SECTIONS = [
  {
    id: 'verantwortlich',
    title: 'Verantwortlich für den Inhalt',
    icon: User,
    content: `
      ${COMPANY_INFO.operator}
      ${COMPANY_INFO.street}
      ${COMPANY_INFO.zip} ${COMPANY_INFO.city}
      ${COMPANY_INFO.country}
    `
  },
  {
    id: 'kontakt',
    title: 'Kontakt',
    icon: Mail,
    content: `
      E-Mail: ${COMPANY_INFO.email}
      Discord: discord.gg/eldrun
      Website: ${COMPANY_INFO.website}
    `
  },
  {
    id: 'haftung-inhalte',
    title: 'Haftung für Inhalte',
    icon: FileText,
    content: `
      Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.

      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
    `
  },
  {
    id: 'haftung-links',
    title: 'Haftung für Links',
    icon: ExternalLink,
    content: `
      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

      Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
    `
  },
  {
    id: 'urheberrecht',
    title: 'Urheberrecht',
    icon: Shield,
    content: `
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

      Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.

      Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
    `
  },
  {
    id: 'streitbeilegung',
    title: 'Streitbeilegung',
    icon: Scale,
    content: `
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/

      Unsere E-Mail-Adresse finden Sie oben im Impressum.

      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
    `
  },
  {
    id: 'hinweis',
    title: 'Wichtiger Hinweis',
    icon: AlertTriangle,
    content: `
      ELDRUN ist ein privates Hobby-Projekt und steht in keiner Verbindung zu Facepunch Studios oder dem Spiel "Rust". Alle Marken und Warenzeichen sind Eigentum ihrer jeweiligen Inhaber.

      Diese Website dient ausschließlich der Community-Organisation für einen privat betriebenen Spieleserver. Es werden keine kommerziellen Absichten verfolgt.

      Spenden und Shop-Käufe sind freiwillige Unterstützungen zur Deckung der Serverkosten und stellen keinen Kaufvertrag dar.
    `
  },
]

export default function ImpressumPage() {
  return (
    <EldrunPageShell
      icon={Building2}
      badge="IMPRESSUM"
      title="IMPRESSUM"
      subtitle="RECHTLICHE INFORMATIONEN"
      description="Rechtliche Informationen gemäß § 5 TMG"
      gradient="from-metal-400 via-metal-500 to-metal-600"
      glowColor="rgba(100,116,139,0.22)"
    >
      <AuthGate>
      <div>
        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
          >
            <Building2 className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="font-bold text-white mb-1">{COMPANY_INFO.name}</h3>
            <p className="text-metal-400 text-sm">{COMPANY_INFO.type}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
          >
            <MapPin className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-bold text-white mb-1">{COMPANY_INFO.city}</h3>
            <p className="text-metal-400 text-sm">{COMPANY_INFO.country}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
          >
            <Mail className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white mb-1">Kontakt</h3>
            <p className="text-metal-400 text-sm">{COMPANY_INFO.email}</p>
          </motion.div>
        </div>

        {/* Legal Sections */}
        <div className="space-y-6">
          {LEGAL_SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-metal-800 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-metal-400" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="text-metal-300 whitespace-pre-line leading-relaxed text-sm">
                  {section.content.trim()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-metal-900/50 border border-metal-800 rounded-full">
            <Clock className="w-4 h-4 text-metal-500" />
            <span className="text-metal-500 text-sm">
              Stand: Dezember 2024
            </span>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 p-6 bg-metal-900/30 border border-metal-800 rounded-xl">
          <h3 className="font-bold text-white mb-4">Weitere rechtliche Informationen</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/terms"
              className="px-4 py-2 bg-metal-800 hover:bg-metal-700 text-metal-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              AGB
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 bg-metal-800 hover:bg-metal-700 text-metal-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              Datenschutz
            </Link>
            <Link
              href="/rules"
              className="px-4 py-2 bg-metal-800 hover:bg-metal-700 text-metal-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              Server Regeln
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-metal-800 hover:bg-metal-700 text-metal-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
