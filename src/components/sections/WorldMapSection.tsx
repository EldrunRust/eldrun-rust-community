'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Map, Castle, Swords, Crown } from 'lucide-react'

const LOCATIONS = [
  { name: 'Königsbrücke', description: 'Die zentrale Verbindung zwischen den Reichen', x: '48%', y: '48%' },
  { name: 'Festung Eldrin', description: 'Sitz des Hauses Eldrin im Osten', x: '72%', y: '42%' },
  { name: 'Burg Valdris', description: 'Die rote Festung des Westens', x: '25%', y: '42%' },
  { name: 'Der Große Fluss', description: 'Lebensader des Kontinents', x: '50%', y: '65%' },
]

export default function WorldMapSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-emerald-900/5 to-black/0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Map className="w-8 h-8 text-emerald-500" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Die Welt von Eldrun
            </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Erkunde eine riesige, lebendige Welt voller Geheimnisse, Burgen und epischer Schlachtfelder
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
              <Image
                src="/images/branding/server-map-full.png"
                alt="Eldrun World Map"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {LOCATIONS.map((loc, index) => (
                <motion.div
                  key={loc.name}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="absolute group cursor-pointer"
                  style={{ left: loc.x, top: loc.y, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse border-2 border-white shadow-lg shadow-amber-500/50" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 whitespace-nowrap border border-amber-500/30">
                      <p className="text-amber-400 font-bold text-sm">{loc.name}</p>
                      <p className="text-gray-400 text-xs">{loc.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Die Geschichte</h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                Vor Jahrhunderten war Eldrun ein vereintes Königreich unter der Herrschaft von König Aldric dem Weisen. 
                Doch nach seinem Tod zerbrach das Reich in zwei rivalisierende Häuser: <span className="text-blue-400">House Eldrin</span> im Osten 
                und <span className="text-red-400">House Valdris</span> im Westen.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Heute kämpfen beide Fraktionen um die Kontrolle der Königsbrücke - dem strategischen Herzen des Kontinents. 
                Wähle deine Seite und schreibe Geschichte!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/clans">
                <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/60 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Castle className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold text-blue-300">House Eldrin</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Ehre, Tradition, Stärke</p>
                </div>
              </Link>
              
              <Link href="/clans">
                <div className="group bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl p-4 border border-red-500/30 hover:border-red-400/60 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Swords className="w-5 h-5 text-red-400" />
                    <h4 className="font-bold text-red-300">House Valdris</h4>
                  </div>
                  <p className="text-gray-400 text-sm">Macht, Eroberung, Ruhm</p>
                </div>
              </Link>
            </div>

            <Link href="/map">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25"
              >
                <Map className="w-5 h-5" />
                Live-Karte öffnen
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
