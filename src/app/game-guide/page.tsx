'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { AuthGate } from '@/components/AuthGate'

interface FeatureCategory {
  title: string
  description: string
  icon: string
  color: string
  link?: string
  items: { name: string; icon: string; description: string }[]
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: 'Kampf & PvP',
    description: 'Kämpfe gegen andere Spieler und beweise deine Stärke',
    icon: '/images/icons/icon_pvp.svg',
    color: 'from-red-500/20 to-red-900/20',
    items: [
      { name: 'PvP Arena', icon: '/images/icons/icon_pvp.svg', description: 'Kämpfe in der Arena gegen andere Spieler' },
      { name: 'Duelle', icon: '/images/icons/icon_duel.svg', description: '1v1 Kämpfe mit Wetten' },
      { name: 'Kopfgelder', icon: '/images/icons/icon_bounty.svg', description: 'Setze Kopfgelder auf Spieler aus' },
      { name: 'Raids', icon: '/images/icons/icon_raid.svg', description: 'Überfalle feindliche Basen' },
    ]
  },
  {
    title: 'Territorium & Basen',
    description: 'Erobere Land und baue dein Imperium auf',
    icon: '/images/icons/icon_territory.svg',
    color: 'from-amber-500/20 to-amber-900/20',
    items: [
      { name: 'Territorien', icon: '/images/icons/icon_territory.svg', description: 'Erobere und verteidige Gebiete' },
      { name: 'Burgen', icon: '/images/icons/icon_castle.svg', description: 'Baue und upgrade deine Burg' },
      { name: 'Zonen', icon: '/images/icons/icon_zone.svg', description: 'Verschiedene Spielzonen erkunden' },
      { name: 'Teleporter', icon: '/images/icons/icon_teleport.svg', description: 'Schnellreise zwischen Orten' },
    ]
  },
  {
    title: 'Dungeons & Bosse',
    description: 'Erkunde gefährliche Dungeons und besiege mächtige Bosse',
    icon: '/images/icons/icon_dungeon.svg',
    color: 'from-purple-500/20 to-purple-900/20',
    items: [
      { name: 'Dungeons', icon: '/images/icons/icon_dungeon.svg', description: 'Instanzierte PvE-Herausforderungen' },
      { name: 'Bosse', icon: '/images/icons/icon_boss.svg', description: 'Epische Boss-Kämpfe mit Loot' },
      { name: 'Quests', icon: '/images/icons/icon_quest.svg', description: 'Story-Missionen und Aufgaben' },
      { name: 'Loot', icon: '/images/icons/icon_loot.svg', description: 'Seltene Belohnungen sammeln' },
    ]
  },
  {
    title: 'Gilden & Soziales',
    description: 'Schließe dich mit anderen Spielern zusammen',
    icon: '/images/icons/icon_guild.svg',
    color: 'from-blue-500/20 to-blue-900/20',
    items: [
      { name: 'Gilden', icon: '/images/icons/icon_guild.svg', description: 'Gründe oder trete einer Gilde bei' },
      { name: 'Gruppen', icon: '/images/icons/icon_party.svg', description: 'Spiele mit Freunden zusammen' },
      { name: 'Nachrichten', icon: '/images/icons/icon_mail.svg', description: 'Private Nachrichten senden' },
      { name: 'Events', icon: '/images/icons/icon_event.svg', description: 'Community-Events und Turniere' },
    ]
  },
  {
    title: 'Wirtschaft & Handel',
    description: 'Verdiene Gold und handle mit anderen Spielern',
    icon: '/images/icons/icon_trade.svg',
    color: 'from-green-500/20 to-green-900/20',
    items: [
      { name: 'Handel', icon: '/images/icons/icon_trade.svg', description: 'Spieler-zu-Spieler Handel' },
      { name: 'Auktionshaus', icon: '/images/icons/icon_auction.svg', description: 'Kaufe und verkaufe Items' },
      { name: 'Bank', icon: '/images/icons/icon_bank.svg', description: 'Sichere dein Gold' },
      { name: 'Shop', icon: '/images/icons/icon_shop.svg', description: 'Kaufe Items und Vorteile' },
    ]
  },
  {
    title: 'Fortschritt & Belohnungen',
    description: 'Steige auf und verdiene Belohnungen',
    icon: '/images/icons/icon_achievement.svg',
    color: 'from-gold-500/20 to-gold-900/20',
    items: [
      { name: 'Achievements', icon: '/images/icons/icon_achievement.svg', description: 'Erfolge freischalten' },
      { name: 'Erfahrung', icon: '/images/icons/icon_xp.svg', description: 'Sammle XP und steige auf' },
      { name: 'Reputation', icon: '/images/icons/icon_reputation.svg', description: 'Baue deinen Ruf auf' },
      { name: 'Season Pass', icon: '/images/icons/icon_season.svg', description: 'Saisonale Belohnungen' },
    ]
  },
  {
    title: 'Ausrüstung & Items',
    description: 'Rüste dich für den Kampf aus',
    icon: '/images/icons/icon_inventory.svg',
    color: 'from-orange-500/20 to-orange-900/20',
    items: [
      { name: 'Inventar', icon: '/images/icons/icon_inventory.svg', description: 'Verwalte deine Items' },
      { name: 'Kits', icon: '/images/icons/icon_kit.svg', description: 'Vorgefertigte Ausrüstungssets' },
      { name: 'Kosmetik', icon: '/images/icons/icon_cosmetic.svg', description: 'Skins und Aussehen' },
      { name: 'Fahrzeuge', icon: '/images/icons/icon_vehicle.svg', description: 'Autos, Boote und mehr' },
    ]
  },
  {
    title: 'Casino & Glücksspiel',
    description: 'Teste dein Glück im Eldrun Casino',
    icon: '/images/icons/icon_gambling.svg',
    color: 'from-pink-500/20 to-pink-900/20',
    link: '/casino',
    items: [
      { name: 'Casino', icon: '/images/icons/icon_gambling.svg', description: 'Verschiedene Glücksspiele' },
      { name: 'Einstellungen', icon: '/images/icons/icon_settings.svg', description: 'Spiel anpassen' },
    ]
  },
]

const CURRENCY_INFO = [
  {
    name: 'Gold',
    image: '/images/currency/gold.svg',
    description: 'Die Hauptwährung in Eldrun. Verdiene Gold durch Quests, PvP, Handel und Berufe.',
    uses: ['Items kaufen', 'Gilden-Upgrades', 'Auktionshaus', 'Reparaturen']
  },
  {
    name: 'Drachenmünzen',
    image: '/images/currency/dragons.svg',
    description: 'Premium-Währung für exklusive Items. Erhältlich im Shop oder durch Events.',
    uses: ['Kosmetik', 'Battle Pass', 'Boosts', 'Exklusive Items']
  }
]

export default function GameGuidePage() {
  return (
    <AuthGate>
      <div 
        className="min-h-screen pt-32 pb-12 relative"
        style={{
          backgroundImage: 'url(/images/backgrounds/ui-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-metal-950/85 backdrop-blur-sm" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-medieval text-gold-400 mb-4 drop-shadow-lg">
            📖 Spieler-Guide
          </h1>
          <p className="text-xl text-metal-300 max-w-3xl mx-auto">
            Alles was du über Eldrun wissen musst. Features, Systeme und Tipps für deinen Erfolg.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Link href="/classes" className="bg-metal-800/50 border border-metal-700 hover:border-gold-500/50 rounded-xl p-4 text-center transition-all group">
            <span className="text-3xl mb-2 block">⚔️</span>
            <span className="text-white font-medium group-hover:text-gold-400 transition-colors">Klassen</span>
          </Link>
          <Link href="/professions" className="bg-metal-800/50 border border-metal-700 hover:border-gold-500/50 rounded-xl p-4 text-center transition-all group">
            <span className="text-3xl mb-2 block">🛠️</span>
            <span className="text-white font-medium group-hover:text-gold-400 transition-colors">Berufe</span>
          </Link>
          <Link href="/factions" className="bg-metal-800/50 border border-metal-700 hover:border-gold-500/50 rounded-xl p-4 text-center transition-all group">
            <span className="text-3xl mb-2 block">🏰</span>
            <span className="text-white font-medium group-hover:text-gold-400 transition-colors">Fraktionen</span>
          </Link>
          <Link href="/features" className="bg-metal-800/50 border border-metal-700 hover:border-gold-500/50 rounded-xl p-4 text-center transition-all group">
            <span className="text-3xl mb-2 block">✨</span>
            <span className="text-white font-medium group-hover:text-gold-400 transition-colors">Features</span>
          </Link>
        </motion.div>

        {/* Currency Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-medieval text-gold-400 mb-6 text-center">💰 Währungen</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CURRENCY_INFO.map((currency, index) => (
              <div
                key={currency.name}
                className="bg-metal-900/80 border border-metal-700 rounded-2xl p-6 flex gap-6"
              >
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={currency.image}
                    alt={currency.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medieval text-white mb-2">{currency.name}</h3>
                  <p className="text-metal-400 text-sm mb-3">{currency.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {currency.uses.map((use) => (
                      <span key={use} className="px-2 py-1 bg-metal-800 rounded text-xs text-metal-300">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Categories */}
        <div className="space-y-8">
          {FEATURE_CATEGORIES.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
              className={`bg-gradient-to-br ${category.color} bg-metal-900/60 border border-metal-700 rounded-2xl overflow-hidden`}
            >
              {/* Category Header */}
              <div className="p-6 border-b border-metal-700/50 flex items-center gap-4">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src={category.icon}
                    alt={category.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medieval text-white">{category.title}</h2>
                  <p className="text-metal-400">{category.description}</p>
                </div>
                {category.link && (
                  <Link 
                    href={category.link}
                    className="px-4 py-2 bg-gold-500/20 border border-gold-500/50 rounded-lg text-gold-400 hover:bg-gold-500/30 transition-colors"
                  >
                    Mehr →
                  </Link>
                )}
              </div>

              {/* Category Items */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-metal-800/50 border border-metal-700/50 rounded-xl p-4 hover:border-metal-600 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-medium text-white group-hover:text-gold-400 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-metal-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Classes & Professions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <Link href="/classes" className="block">
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-purple-900/80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  {['warrior', 'mage', 'rogue'].map((cls) => (
                    <div key={cls} className="w-24 h-24 relative">
                      <Image src={`/images/classes/${cls}.png`} alt={cls} fill className="object-contain" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                <h3 className="text-3xl font-medieval text-white mb-2">Klassen entdecken</h3>
                <p className="text-metal-300 mb-4">6 einzigartige Spielklassen warten auf dich</p>
                <span className="px-6 py-2 bg-gold-500 text-metal-950 font-bold rounded-lg group-hover:bg-gold-400 transition-colors">
                  Alle Klassen →
                </span>
              </div>
            </div>
          </Link>

          <Link href="/professions" className="block">
            <div className="relative h-64 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-amber-900/80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  {['mining', 'crafting', 'fishing'].map((prof) => (
                    <div key={prof} className="w-24 h-24 relative">
                      <Image src={`/images/professions/${prof}.png`} alt={prof} fill className="object-contain" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                <h3 className="text-3xl font-medieval text-white mb-2">Berufe meistern</h3>
                <p className="text-metal-300 mb-4">5 Berufe zum Erlernen und Meistern</p>
                <span className="px-6 py-2 bg-gold-500 text-metal-950 font-bold rounded-lg group-hover:bg-gold-400 transition-colors">
                  Alle Berufe →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
    </AuthGate>
  )
}
