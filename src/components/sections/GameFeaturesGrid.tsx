'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const FEATURE_ICONS = [
  { id: 'pvp', name: 'PvP Arena', icon: '/images/icons/icon_pvp.svg', href: '/features', color: 'border-red-500/30 hover:border-red-500' },
  { id: 'dungeon', name: 'Dungeons', icon: '/images/icons/icon_dungeon.svg', href: '/features', color: 'border-purple-500/30 hover:border-purple-500' },
  { id: 'boss', name: 'Bosse', icon: '/images/icons/icon_boss.svg', href: '/features', color: 'border-red-600/30 hover:border-red-600' },
  { id: 'raid', name: 'Raids', icon: '/images/icons/icon_raid.svg', href: '/features', color: 'border-orange-600/30 hover:border-orange-600' },
  { id: 'guild', name: 'Gilden', icon: '/images/icons/icon_guild.svg', href: '/clans', color: 'border-blue-500/30 hover:border-blue-500' },
  { id: 'party', name: 'Gruppen', icon: '/images/icons/icon_party.svg', href: '/features', color: 'border-indigo-500/30 hover:border-indigo-500' },
  { id: 'territory', name: 'Territorien', icon: '/images/icons/icon_territory.svg', href: '/features', color: 'border-lime-500/30 hover:border-lime-500' },
  { id: 'castle', name: 'Burgen', icon: '/images/icons/icon_castle.svg', href: '/features', color: 'border-stone-500/30 hover:border-stone-500' },
  { id: 'trade', name: 'Handel', icon: '/images/icons/icon_trade.svg', href: '/trading', color: 'border-green-500/30 hover:border-green-500' },
  { id: 'shop', name: 'Shop', icon: '/images/icons/icon_shop.svg', href: '/shop', color: 'border-amber-500/30 hover:border-amber-500' },
  { id: 'auction', name: 'Auktionen', icon: '/images/icons/icon_auction.svg', href: '/shop/auction', color: 'border-orange-500/30 hover:border-orange-500' },
  { id: 'bank', name: 'Bank', icon: '/images/icons/icon_bank.svg', href: '/features', color: 'border-yellow-500/30 hover:border-yellow-500' },
  { id: 'quest', name: 'Quests', icon: '/images/icons/icon_quest.svg', href: '/challenges', color: 'border-cyan-500/30 hover:border-cyan-500' },
  { id: 'achievement', name: 'Erfolge', icon: '/images/icons/icon_achievement.svg', href: '/achievements', color: 'border-gold-500/30 hover:border-gold-500' },
  { id: 'season', name: 'Battle Pass', icon: '/images/icons/icon_season.svg', href: '/battlepass', color: 'border-violet-500/30 hover:border-violet-500' },
  { id: 'bounty', name: 'Kopfgelder', icon: '/images/icons/icon_bounty.svg', href: '/features', color: 'border-rose-500/30 hover:border-rose-500' },
  { id: 'duel', name: 'Duelle', icon: '/images/icons/icon_duel.svg', href: '/features', color: 'border-red-400/30 hover:border-red-400' },
  { id: 'event', name: 'Events', icon: '/images/icons/icon_event.svg', href: '/features', color: 'border-fuchsia-500/30 hover:border-fuchsia-500' },
  { id: 'casino', name: 'Casino', icon: '/images/icons/icon_gambling.svg', href: '/casino', color: 'border-pink-500/30 hover:border-pink-500' },
  { id: 'teleport', name: 'Teleport', icon: '/images/icons/icon_teleport.svg', href: '/features', color: 'border-sky-500/30 hover:border-sky-500' },
  { id: 'inventory', name: 'Inventar', icon: '/images/icons/icon_inventory.svg', href: '/features', color: 'border-slate-500/30 hover:border-slate-500' },
  { id: 'loot', name: 'Beute', icon: '/images/icons/icon_loot.svg', href: '/features', color: 'border-amber-600/30 hover:border-amber-600' },
  { id: 'cosmetic', name: 'Skins', icon: '/images/icons/icon_cosmetic.svg', href: '/shop', color: 'border-pink-400/30 hover:border-pink-400' },
  { id: 'vehicle', name: 'Fahrzeuge', icon: '/images/icons/icon_vehicle.svg', href: '/features', color: 'border-teal-500/30 hover:border-teal-500' },
]

const CURRENCY_DISPLAY = [
  { name: 'Gold', icon: '/images/currency/gold.svg', description: 'Hauptwährung für Handel & Items' },
  { name: 'Drachenmünzen', icon: '/images/currency/dragons.svg', description: 'Premium-Währung für Exklusives' },
]

export function GameFeaturesGrid() {
  return (
    <section className="relative py-20 bg-metal-900">
      <div className="container-rust">
        {/* Currency Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="font-medieval text-2xl text-gold-400 mb-2">💰 Währungssystem</h3>
            <p className="text-metal-400">Zwei Währungen für alle deine Bedürfnisse</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {CURRENCY_DISPLAY.map((currency, index) => (
              <motion.div
                key={currency.name}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 bg-metal-800/50 border border-metal-700 rounded-xl"
              >
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image src={currency.icon} alt={currency.name} fill className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{currency.name}</h4>
                  <p className="text-sm text-metal-400">{currency.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h3 className="font-medieval text-2xl text-white mb-2">🎮 Spielfeatures</h3>
          <p className="text-metal-400">Entdecke alle Möglichkeiten in Eldrun</p>
        </motion.div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {FEATURE_ICONS.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={feature.href}>
                <div className={`
                  group relative p-4 bg-metal-800/50 border ${feature.color} rounded-xl
                  transition-all duration-300 hover:bg-metal-800 hover:scale-105
                `}>
                  <div className="w-12 h-12 mx-auto mb-2 relative">
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      fill
                      className="object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs text-center text-metal-400 group-hover:text-white transition-colors">
                    {feature.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link 
            href="/game-guide"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rust-500 to-rust-600 rounded-lg text-white font-bold hover:from-rust-400 hover:to-rust-500 transition-all"
          >
            📖 Kompletter Spieler-Guide
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
