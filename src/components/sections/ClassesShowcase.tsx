'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const CLASSES = [
  { id: 'warrior', name: 'Krieger', image: '/images/classes/warrior.png', color: 'from-red-500 to-red-700' },
  { id: 'archer', name: 'Bogenschütze', image: '/images/classes/archer.png', color: 'from-green-500 to-green-700' },
  { id: 'mage', name: 'Magier', image: '/images/classes/mage.png', color: 'from-blue-500 to-blue-700' },
  { id: 'rogue', name: 'Schurke', image: '/images/classes/rogue.png', color: 'from-purple-500 to-purple-700' },
  { id: 'paladin', name: 'Paladin', image: '/images/classes/paladin.png', color: 'from-amber-500 to-amber-700' },
  { id: 'necromancer', name: 'Nekromant', image: '/images/classes/necromancer.png', color: 'from-emerald-500 to-emerald-700' },
]

const PROFESSIONS = [
  { id: 'mining', name: 'Bergbau', image: '/images/professions/mining.png' },
  { id: 'woodcutting', name: 'Holzfällerei', image: '/images/professions/woodcutting.png' },
  { id: 'fishing', name: 'Angeln', image: '/images/professions/fishing.png' },
  { id: 'crafting', name: 'Handwerk', image: '/images/professions/crafting.png' },
  { id: 'farming', name: 'Landwirtschaft', image: '/images/professions/farming.png' },
]

export function ClassesShowcase() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-metal-950 to-metal-900 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/images/backgrounds/ui-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-metal-950/90 via-transparent to-metal-950/90" />

      <div className="container-rust relative z-10">
        {/* Classes Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-rust-500/10 border border-rust-500/30 rounded-full">
              <span className="text-2xl">⚔️</span>
              <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Wähle deinen Pfad</span>
            </span>
            <h2 className="font-medieval text-4xl sm:text-5xl text-white mb-4">
              <span className="text-gold-400">6 Spielklassen</span> warten auf dich
            </h2>
            <p className="text-metal-400 max-w-2xl mx-auto">
              Jede Klasse bietet einzigartige Fähigkeiten und Spielstile. Wähle weise!
            </p>
          </motion.div>

          {/* Classes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CLASSES.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className={`
                  relative overflow-hidden rounded-xl bg-gradient-to-br ${cls.color} p-[2px]
                  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0
                  group-hover:before:opacity-100 before:transition-opacity
                `}>
                  <div className="relative bg-metal-900 rounded-xl p-4 h-full">
                    <div className="relative w-full aspect-square mb-3">
                      <Image
                        src={cls.image}
                        alt={cls.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="text-center font-medieval text-white text-sm group-hover:text-gold-400 transition-colors">
                      {cls.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link 
              href="/classes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400 hover:bg-gold-500/20 transition-colors"
            >
              Alle Klassen entdecken →
            </Link>
          </motion.div>
        </div>

        {/* Professions Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <span className="text-2xl">🛠️</span>
              <span className="font-mono text-sm text-amber-400 uppercase tracking-wider">Meistere dein Handwerk</span>
            </span>
            <h2 className="font-medieval text-4xl sm:text-5xl text-white mb-4">
              <span className="text-amber-400">5 Berufe</span> zum Erlernen
            </h2>
            <p className="text-metal-400 max-w-2xl mx-auto">
              Sammle Ressourcen, stelle Gegenstände her und verdiene Gold mit deinen Fähigkeiten.
            </p>
          </motion.div>

          {/* Professions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {PROFESSIONS.map((prof, index) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="relative bg-metal-800/50 border border-metal-700 rounded-xl p-6 hover:border-amber-500/50 transition-all">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <Image
                      src={prof.image}
                      alt={prof.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-center font-medium text-white group-hover:text-amber-400 transition-colors">
                    {prof.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link 
              href="/professions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Alle Berufe ansehen →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
