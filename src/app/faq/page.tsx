'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, ChevronDown, Search, MessageSquare,
  Server, Coins, Shield, Users, Gamepad2, Zap,
  Gift, Crown, Settings, AlertTriangle
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN FAQ - Die Weisheit des Reiches
// 35+ häufig gestellte Fragen in 8 Kategorien
// ═══════════════════════════════════════════════════════════════════════════

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Erste Schritte',
    icon: Gamepad2,
    color: 'text-green-400',
    questions: [
      { q: 'Wie kann ich auf Eldrun spielen?', a: 'Öffne Rust, drücke F1 und gib "client.connect play.eldrun.lol:28015" ein, oder suche nach "Eldrun" in der Serverliste. Nach dem Verbinden wählst du deine Fraktion (Seraphar oder Vorgaroth) und deine Klasse.' },
      { q: 'Welche Fraktion soll ich wählen?', a: 'Seraphar steht für Ehre und Licht mit Heilungs-Boni. Vorgaroth für Macht und Dunkelheit mit Angriffs-Boni. Beide Fraktionen sind ausgeglichen - wähle nach deinem Spielstil! Ein Wechsel ist alle 7 Tage möglich.' },
      { q: 'Was sind die verfügbaren Klassen?', a: 'Es gibt 6 Klassen: Warrior (Tank/DPS), Archer (Fernkampf), Mage (Magie/Support), Rogue (Assassine), Paladin (Hybrid Tank/Heiler) und Necromancer (Beschwörer). Jede Klasse hat 5 einzigartige Fähigkeiten und einen Skill Tree.' },
      { q: 'Wie verdiene ich Coins?', a: 'Coins erhältst du durch: Kills, Quest-Abschlüsse, Raid-Teilnahme, tägliche Belohnungen (/daily), Voting (/vote), Casino-Gewinne und Events. Der Shop bietet auch Coin-Pakete.' },
      { q: 'Was passiert wenn ich sterbe?', a: 'Bei Tod verlierst du dein Inventar (kann gelootet werden), aber NICHT: Coins, XP, Level, Skills, Achievements oder VIP-Status. Dein Körper bleibt 5 Minuten liegen.' },
      { q: 'Gibt es einen Starter-Bonus?', a: 'Ja! Neue Spieler erhalten: 1.000 Coins, Starter-Kit mit Werkzeugen und Waffen, 7 Tage +25% XP-Boost und Zugang zum Starter-Bereich (PvP-frei für 24h).' },
    ]
  },
  {
    id: 'gameplay',
    name: 'Gameplay & Features',
    icon: Zap,
    color: 'text-amber-400',
    questions: [
      {
        q: 'Wie funktioniert das XP-System?',
        a: 'Du erhältst XP für fast alle Aktivitäten: Kills, Farming, Crafting, Quests. Mit jedem Level schaltest du Skill-Punkte frei. Es gibt 20 verschiedene Skills in 5 Kategorien. Max Level: 100, danach Prestige.'
      },
      {
        q: 'Was sind Raid Bases?',
        a: 'Automatisch generierte Basen mit NPCs und Loot. Es gibt Schwierigkeitsgrade von Easy bis Nightmare. Je schwieriger, desto besser der Loot! Finde sie auf der Karte (/map) oder nutze /raidbase.'
      },
      {
        q: 'Wie funktionieren Gilden?',
        a: 'Erstelle eine Gilde mit /guild create [Name]. Gilden haben Bank, Perks, Upgrades und können Kriege führen. Gilden-Aktivität bringt Honor-Punkte für Upgrades. Max 50 Mitglieder (upgradebar).'
      },
      {
        q: 'Was ist das Artefakt-System?',
        a: 'Ein einzigartiges Artefakt ("Krone der ewigen Herrschaft") existiert auf dem Server. Der Träger erhält Boni, wird aber zur Zielscheibe. Bei Tod droppt es und kann gestohlen werden!'
      },
      {
        q: 'Wie funktioniert das Pet-System?',
        a: 'Zähme Tiere mit dem richtigen Futter. Pets können kämpfen, Items tragen und leveln. Befehle: Follow, Attack, Stay. Höherstufige Pets haben bessere Stats.'
      },
    ]
  },
  {
    id: 'economy',
    name: 'Economy & Shop',
    icon: Coins,
    color: 'text-yellow-400',
    questions: [
      {
        q: 'Welche Währungen gibt es?',
        a: 'Coins (Hauptwährung), Dragons (Premium), Honor (Gilden), Loyalty (VIP-Belohnungen). Coins erhält man im Spiel, Dragons im Shop, Honor durch Gilden-Aktivität.'
      },
      {
        q: 'Was bietet der Shop?',
        a: 'VIP-Ränge, Kits, Skins, Items, Währung, Bundles und Services. Preise sind fair, alles ist auch ingame erreichbar. VIPs bekommen Rabatte!'
      },
      {
        q: 'Wie funktioniert das Casino?',
        a: '10 Spiele: Coinflip, Blackjack, Slots, Roulette, Crash, Jackpot, Cases, Mines, Dice, Wheel. Coins können gewonnen oder verloren werden. Spielverantwortung liegt beim Spieler!'
      },
      {
        q: 'Was passiert beim Wipe mit meinen Items?',
        a: 'Bei Wipe werden Basen und Items zurückgesetzt. ABER: Coins, VIP-Status, Skins, Achievements und Level bleiben erhalten! Fahrzeug-Lizenzen respawnen nach Wipe.'
      },
    ]
  },
  {
    id: 'vip',
    name: 'VIP & Ranks',
    icon: Crown,
    color: 'text-purple-400',
    questions: [
      {
        q: 'Welche VIP-Ränge gibt es?',
        a: 'Bronze, Silver, Gold, Diamond und Legendary. Jeder Rang bietet bessere Kits, kürzere Cooldowns, mehr Teleports, höhere Gather-Rates und exklusive Features.'
      },
      {
        q: 'Sind VIP-Ränge Pay-to-Win?',
        a: 'Nein! VIP bietet Komfort und Zeitersparnis, aber keine unfairen Vorteile im PvP. Alle Items sind auch für normale Spieler erhältlich. Wir achten auf Balance.'
      },
      {
        q: 'Wie lange gilt mein VIP?',
        a: 'VIP läuft je nach Paket 7, 30 oder 90 Tage. Verlängerungen vor Ablauf addieren die Zeit. VIP-Status bleibt auch offline erhalten.'
      },
    ]
  },
  {
    id: 'technical',
    name: 'Technisches',
    icon: Settings,
    color: 'text-blue-400',
    questions: [
      {
        q: 'Warum habe ich Lag/FPS-Drops?',
        a: 'Reduziere Grafikeinstellungen, schließe Hintergrundprogramme. Eldrun nutzt viele Plugins - bei älteren PCs können Einstellungen helfen. Melde anhaltende Probleme im Discord.'
      },
      {
        q: 'Mein Fortschritt ist weg, was tun?',
        a: 'Daten werden regelmäßig gespeichert. Bei Problemen kontaktiere den Support im Discord mit deiner Steam-ID. Wir können Backups wiederherstellen.'
      },
      {
        q: 'Gibt es eine Mobile App?',
        a: 'Keine dedizierte App, aber die Website (eldrun.lol) ist mobil-optimiert. Du kannst Stats, Shop und Forum auch unterwegs nutzen.'
      },
    ]
  },
  {
    id: 'rules',
    name: 'Regeln & Bans',
    icon: Shield,
    color: 'text-red-400',
    questions: [
      {
        q: 'Wofür kann ich gebannt werden?',
        a: 'Cheating, Hacking, Exploiting, extremes toxisches Verhalten, Scamming, RMT. Alle Regeln findest du unter /rules. Unwissenheit schützt nicht!'
      },
      {
        q: 'Ich wurde unfair gebannt, was nun?',
        a: 'Reiche einen Ban-Appeal unter eldrun.lol/appeals ein. Sei ehrlich und liefere Beweise. Bearbeitung dauert 24-48 Stunden. Spam-Appeals verlängern den Ban.'
      },
      {
        q: 'Kann ich Regelverstöße melden?',
        a: 'Ja! Nutze /report ingame oder das Ticket-System im Discord. Liefere Beweise (Screenshots, Video). Bestätigte Meldungen werden mit Coins belohnt.'
      },
    ]
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0 || searchQuery === '')

  return (
    <EldrunPageShell
      icon={HelpCircle}
      badge="FAQ"
      title="HÄUFIGE FRAGEN"
      subtitle="HILFE & SUPPORT"
      description="Finde Antworten auf die häufigsten Fragen rund um Eldrun. Deine Frage ist nicht dabei? Kontaktiere uns!"
      gradient="from-green-300 via-green-400 to-green-600"
      glowColor="rgba(34,197,94,0.22)"
    >
      <AuthGate>
      <div>
        {/* Search */}
        <div className="max-w-xl mx-auto relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
          <input
            type="text"
            placeholder="Suche nach Fragen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-green-500"
          />
        </div>
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-green-500 text-white'
                : 'bg-metal-800 text-metal-400 hover:bg-metal-700'
            }`}
          >
            Alle
          </button>
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-green-500 text-white'
                  : 'bg-metal-800 text-metal-400 hover:bg-metal-700'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {filteredCategories
            .filter(cat => activeCategory === null || cat.id === activeCategory)
            .map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <category.icon className={`w-6 h-6 ${category.color}`} />
                <h2 className="font-display text-xl font-bold text-white">{category.name}</h2>
                <span className="px-2 py-0.5 bg-metal-800 rounded text-xs text-metal-400">
                  {category.questions.length} Fragen
                </span>
              </div>
              
              <div className="space-y-2">
                {category.questions.map((item, index) => {
                  const itemId = `${category.id}-${index}`
                  const isOpen = openItems.includes(itemId)
                  
                  return (
                    <div
                      key={index}
                      className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-metal-800/50 transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{item.q}</span>
                        <ChevronDown className={`w-5 h-5 text-metal-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-metal-400 border-t border-metal-800 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.every(cat => cat.questions.length === 0) && searchQuery && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-metal-600 mx-auto mb-4" />
            <p className="text-metal-400">Keine Fragen gefunden für &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl text-center">
          <MessageSquare className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-white mb-2">
            Frage nicht beantwortet?
          </h3>
          <p className="text-metal-400 mb-4">
            Kontaktiere uns direkt und wir helfen dir gerne weiter!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
            >
              Kontakt aufnehmen
            </a>
            <a
              href="https://discord.gg/eldrun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-lg transition-colors"
            >
              Discord beitreten
            </a>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
