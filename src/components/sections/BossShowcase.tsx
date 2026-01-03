'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Skull, Shield, Swords, Trophy } from 'lucide-react'

const BOSSES = [
  {
    id: 'toxic-golem',
    name: 'Toxischer Golem',
    title: 'Wächter des Verfallenen Waldes',
    description: 'Ein uralter Steinriese, durchzogen von giftiger Energie. Seine Angriffe vergiften das Land um ihn herum.',
    image: '/images/bosses/toxic-golem.png',
    difficulty: 5,
    rewards: ['Legendäre Waffen', 'Toxische Rüstung', '5000 Gold'],
    location: 'Verfallener Wald',
    hp: '500,000'
  }
]

const GAMEPLAY_SCENES = [
  {
    id: 'mounted-combat',
    title: 'Berittener Kampf',
    description: 'Kämpfe zu Pferd mit einzigartigen Waffen',
    image: '/images/gameplay/mounted-knight.png'
  },
  {
    id: 'siege-warfare',
    title: 'Belagerungskrieg',
    description: 'Erobere feindliche Festungen',
    image: '/images/gameplay/siege-battle.png'
  },
  {
    id: 'arena-battles',
    title: 'Arena Kämpfe',
    description: 'PvP Schlachten in der Arena',
    image: '/images/gameplay/arena-battle.png'
  },
  {
    id: 'night-raids',
    title: 'Nacht-Raids',
    description: 'Überfälle unter dem Schutz der Dunkelheit',
    image: '/images/gameplay/night-assault.png'
  },
  {
    id: 'epic-duels',
    title: 'Epische Duelle',
    description: '1v1 Kämpfe um Ehre und Ruhm',
    image: '/images/gameplay/epic-duel.png'
  },
  {
    id: 'castle-defense',
    title: 'Burgverteidigung',
    description: 'Verteidige deine Festung gegen Angreifer',
    image: '/images/gameplay/castle-siege.png'
  }
]

export default function BossShowcase() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-purple-900/5 to-black/0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skull className="w-8 h-8 text-purple-500" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Epische Bosse & Gameplay
            </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stelle dich gewaltigen Bossen und erlebe actiongeladenes Gameplay
          </p>
        </motion.div>

        {BOSSES.map((boss, index) => (
          <motion.div
            key={boss.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-green-500/30 shadow-2xl shadow-green-500/20">
                <Image
                  src={boss.image}
                  alt={boss.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Skull className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-bold">WORLD BOSS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">HP:</span>
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-full" />
                    </div>
                    <span className="text-green-400 font-mono text-sm">{boss.hp}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">{boss.name}</h3>
                  <p className="text-green-400 italic">{boss.title}</p>
                </div>
                
                <p className="text-gray-300 leading-relaxed">{boss.description}</p>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Schwierigkeit:</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skull 
                        key={i} 
                        className={`w-5 h-5 ${i < boss.difficulty ? 'text-red-500' : 'text-gray-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white">Belohnungen</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {boss.rewards.map((reward, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>

                <Link href="/challenges">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
                  >
                    <Swords className="w-5 h-5" />
                    Boss bekämpfen
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-2">Gameplay Highlights</h3>
          <p className="text-gray-400">Erlebe epische Schlachten und unvergessliche Momente</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GAMEPLAY_SCENES.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-video rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <Image
                src={scene.image}
                alt={scene.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-white font-bold text-sm">{scene.title}</h4>
                <p className="text-gray-400 text-xs">{scene.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
