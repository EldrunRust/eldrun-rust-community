'use client'

import { motion } from 'framer-motion'
import { 
  Shield, AlertTriangle, Users, Sword, MessageSquare, 
  Ban, CheckCircle, XCircle, Scale, Gavel, Heart,
  Volume2, Camera, Zap, Clock, Trophy
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const RULE_CATEGORIES = [
  {
    id: 'general',
    title: 'Allgemeine Regeln',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    rules: [
      { rule: 'Respektvoller Umgang miteinander ist Pflicht', severity: 'high' },
      { rule: 'Kein Rassismus, Sexismus oder Diskriminierung jeglicher Art', severity: 'critical' },
      { rule: 'Deutsche oder englische Sprache im globalen Chat', severity: 'medium' },
      { rule: 'Keine Werbung für andere Server oder Dienste', severity: 'high' },
      { rule: 'Admin-Entscheidungen sind final und zu respektieren', severity: 'high' },
      { rule: 'Bugs und Exploits müssen gemeldet werden', severity: 'critical' },
    ]
  },
  {
    id: 'gameplay',
    title: 'Gameplay Regeln',
    icon: Sword,
    color: 'text-rust-400',
    bgColor: 'bg-rust-500/10',
    borderColor: 'border-rust-500/30',
    rules: [
      { rule: 'Cheating, Hacking oder Scripting führt zum permanenten Bann', severity: 'critical' },
      { rule: 'Teaming über das Teamlimit hinaus ist verboten', severity: 'high' },
      { rule: 'Griefing und Trolling wird bestraft', severity: 'medium' },
      { rule: 'Keine absichtlichen Lag-Verursachungen (Lag Machines)', severity: 'high' },
      { rule: 'Respektiert die Safe Zones - kein PvP dort erlaubt', severity: 'high' },
      { rule: 'Fraktionswechsel nur alle 7 Tage möglich', severity: 'medium' },
    ]
  },
  {
    id: 'building',
    title: 'Bau-Regeln',
    icon: Users,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    rules: [
      { rule: 'Maximale TC-Anzahl pro Spieler/Team beachten', severity: 'medium' },
      { rule: 'Keine absichtliche Blockierung von Monumenten', severity: 'high' },
      { rule: 'Cave-Bases sind erlaubt, aber fair zu gestalten', severity: 'medium' },
      { rule: 'Trap Bases sind erlaubt', severity: 'low' },
      { rule: 'Keine extremen Honeycomb-Strukturen (Max 3 Schichten)', severity: 'medium' },
      { rule: 'Roof Camping auf eigenem Base ist erlaubt', severity: 'low' },
    ]
  },
  {
    id: 'chat',
    title: 'Chat & Kommunikation',
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    rules: [
      { rule: 'Kein Spam im globalen oder Voice-Chat', severity: 'medium' },
      { rule: 'Keine extremen Beleidigungen oder Drohungen', severity: 'critical' },
      { rule: 'Voice-Chat Missbrauch (Lärm, Musik) wird bestraft', severity: 'medium' },
      { rule: 'Keine persönlichen Daten anderer Spieler teilen (Doxxing)', severity: 'critical' },
      { rule: 'Keine falschen Admin-Impersonationen', severity: 'high' },
      { rule: 'Support-Anfragen über Ticket-System, nicht im Chat', severity: 'low' },
    ]
  },
  {
    id: 'trading',
    title: 'Handel & Economy',
    icon: Scale,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    rules: [
      { rule: 'Scamming anderer Spieler ist verboten', severity: 'high' },
      { rule: 'Real-Money-Trading (RMT) ist nicht gestattet', severity: 'critical' },
      { rule: 'Casino-Manipulation führt zum Coin-Reset', severity: 'high' },
      { rule: 'Account-Sharing ist auf eigenes Risiko', severity: 'medium' },
      { rule: 'Keine Ausnutzung von Shop-Bugs', severity: 'high' },
      { rule: 'Handel in Safe Zones empfohlen', severity: 'low' },
    ]
  },
]

const PUNISHMENT_TIERS = [
  { level: 1, name: 'Verwarnung', description: 'Mündliche/schriftliche Verwarnung', icon: AlertTriangle, color: 'text-yellow-400' },
  { level: 2, name: 'Mute', description: '1-24 Stunden Chat-Sperre', icon: Volume2, color: 'text-orange-400' },
  { level: 3, name: 'Kick', description: 'Entfernung vom Server', icon: Zap, color: 'text-amber-400' },
  { level: 4, name: 'Temp-Ban', description: '1-30 Tage Sperre', icon: Clock, color: 'text-red-400' },
  { level: 5, name: 'Perm-Ban', description: 'Permanenter Ausschluss', icon: Ban, color: 'text-red-600' },
]

export default function RulesPage() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30'
      default: return 'text-metal-400 bg-metal-500/10 border-metal-500/30'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Kritisch'
      case 'high': return 'Hoch'
      case 'medium': return 'Mittel'
      case 'low': return 'Niedrig'
      default: return 'Info'
    }
  }

  return (
    <EldrunPageShell
      icon={Gavel}
      badge="REGELN"
      title="SERVER REGELN"
      subtitle="FAIR PLAY"
      description="Für ein faires und spaßiges Spielerlebnis. Unwissenheit schützt nicht vor Strafe. Bitte lies dir alle Regeln sorgfältig durch."
      gradient="from-blue-300 via-blue-400 to-blue-600"
      glowColor="rgba(59,130,246,0.22)"
    >
      <AuthGate>
      <div>
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold">Fair Play</p>
            <p className="text-metal-500 text-sm">Respekt & Fairness</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-bold">Anti-Cheat</p>
            <p className="text-metal-500 text-sm">Aktiver Schutz</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Users className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-white font-bold">Community</p>
            <p className="text-metal-500 text-sm">Aktive Admins</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white font-bold">Spaß</p>
            <p className="text-metal-500 text-sm">Für alle</p>
          </div>
        </div>

        {/* Rule Categories */}
        <div className="space-y-8">
          {RULE_CATEGORIES.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
              className={`p-6 ${category.bgColor} border ${category.borderColor} rounded-xl`}
            >
              <div className="flex items-center gap-3 mb-6">
                <category.icon className={`w-8 h-8 ${category.color}`} />
                <h2 className="font-display text-2xl font-bold text-white">{category.title}</h2>
              </div>
              
              <div className="grid gap-3">
                {category.rules.map((item, ruleIndex) => (
                  <div
                    key={ruleIndex}
                    className="flex items-center justify-between p-4 bg-metal-900/50 rounded-lg border border-metal-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-metal-800 rounded-lg text-metal-400 font-mono text-sm">
                        {ruleIndex + 1}
                      </span>
                      <p className="text-white">{item.rule}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}>
                      {getSeverityLabel(item.severity)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Punishment Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-metal-900/50 border border-metal-800 rounded-xl"
        >
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Gavel className="w-8 h-8 text-rust-400" />
            Strafmaßnahmen
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PUNISHMENT_TIERS.map((tier) => (
              <div
                key={tier.level}
                className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg text-center"
              >
                <tier.icon className={`w-8 h-8 ${tier.color} mx-auto mb-2`} />
                <p className="text-white font-bold">{tier.name}</p>
                <p className="text-metal-500 text-sm">{tier.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-metal-700 rounded text-xs text-metal-400">
                  Stufe {tier.level}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Note */}
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-bold">Wichtiger Hinweis</p>
            <p className="text-metal-300 text-sm">
              Diese Regeln können jederzeit angepasst werden. Es liegt in der Verantwortung jedes Spielers,
              sich über aktuelle Regeln zu informieren. Bei Fragen wendet euch an das Admin-Team.
            </p>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
