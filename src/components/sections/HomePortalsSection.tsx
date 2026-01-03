'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Map, MessageSquare, Users, Trophy, Zap } from 'lucide-react'

const PORTALS = [
  {
    id: 'ufo-castle',
    title: 'UFO-Invasion',
    subtitle: 'Mysteriöse Ereignisse',
    description: 'Alien-Angriffe über Eldrun – verteidige das Reich gegen außerirdische Bedrohungen.',
    image: '/images/home/portal-ufo.png',
    href: '/events',
    icon: Zap,
    color: 'from-blue-600/20 to-cyan-600/20',
    borderColor: 'border-blue-500/50 hover:border-blue-400',
    glowColor: 'shadow-blue-500/20'
  },
  {
    id: 'green-boss',
    title: 'Toxischer Titan',
    subtitle: 'World Boss',
    description: 'Ein uraltes Wesen verseucht das Land. Sammle deine Gruppe für epische Beute.',
    image: '/images/home/portal-boss.png',
    href: '/features',
    icon: Trophy,
    color: 'from-emerald-600/20 to-green-600/20',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
    glowColor: 'shadow-emerald-500/20'
  },
  {
    id: 'hell-knight',
    title: 'Höllenritter',
    subtitle: 'Dungeon Event',
    description: 'Das Tor zur Unterwelt öffnet sich. Kämpfe gegen Dämonen und sichere legendäre Rüstungen.',
    image: '/images/home/portal-hell.png',
    href: '/features',
    icon: Users,
    color: 'from-red-600/20 to-orange-600/20',
    borderColor: 'border-red-500/50 hover:border-red-400',
    glowColor: 'shadow-red-500/20'
  },
  {
    id: 'storm-castle',
    title: 'Sturmfestung',
    subtitle: 'Territory Control',
    description: 'Erobere die mächtigste Festung Eldruns. Strategische PvP-Kämpfe um die Vorherrschaft.',
    image: '/images/home/portal-storm.png',
    href: '/clans',
    icon: Map,
    color: 'from-purple-600/20 to-indigo-600/20',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    glowColor: 'shadow-purple-500/20'
  },
  {
    id: 'bridge-castle',
    title: 'Königsbrücke',
    subtitle: 'Trade Hub',
    description: 'Das Zentrum des Handels. Treffe Händler, tausche Waren und plane deine nächsten Raids.',
    image: '/images/home/portal-bridge.png',
    href: '/trading',
    icon: MessageSquare,
    color: 'from-amber-600/20 to-yellow-600/20',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    glowColor: 'shadow-amber-500/20'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 0.6, 0.36, 1]
    }
  }
}

export function HomePortalsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-metal-900 via-metal-950 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-metal-800/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      
      <div className="container-rust relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 mb-6 bg-rust-500/10 border border-rust-500/30 rounded-full">
            <span className="text-2xl">🌟</span>
            <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Entdecke Eldrun</span>
          </div>
          <h2 className="font-medieval-decorative font-black text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600">
              Portale zum Abenteuer
            </span>
          </h2>
          <p className="text-metal-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Wähle deinen Weg durch das Reich. Jedes Portal öffnet Türen zu epischen Events, knallharten Kämpfen und legendären Belohnungen.
          </p>
        </motion.div>

        {/* Portal Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {PORTALS.map((portal) => (
            <motion.div
              key={portal.id}
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.22, 0.6, 0.36, 1] }
              }}
              className="group relative"
            >
              <Link 
                href={portal.href}
                className="block h-full"
              >
                <div className={`
                  relative h-80 rounded-2xl overflow-hidden border backdrop-blur-sm transition-all duration-500
                  ${portal.borderColor}
                  ${portal.color}
                  hover:shadow-2xl hover:${portal.glowColor}
                `}>
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${portal.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6">
                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                        <portal.icon className="w-4 h-4 text-white" />
                        <span className="text-xs font-mono text-white uppercase tracking-wider">
                          {portal.subtitle}
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="space-y-3">
                      <h3 className="font-medieval-decorative font-black text-2xl text-white">
                        {portal.title}
                      </h3>
                      <p className="text-metal-200 text-sm leading-relaxed line-clamp-3">
                        {portal.description}
                      </p>
                      <div className="flex items-center gap-2 text-rust-400 text-xs font-mono uppercase tracking-wider group-hover:text-rust-300 transition-colors duration-300">
                        <span>Entdecken</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
                    bg-gradient-to-t ${portal.color}
                  `} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/features"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rust-600 to-rust-700 text-white font-display font-bold uppercase tracking-wider rounded-xl hover:from-rust-500 hover:to-rust-600 transition-all duration-300 hover:shadow-rust-lg hover:scale-105"
          >
            <span>Alle Features entdecken</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
