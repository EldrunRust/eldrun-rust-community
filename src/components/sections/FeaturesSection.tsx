'use client'

import { motion } from 'framer-motion'
import { 
  Pickaxe, 
  Shield, 
  Trophy, 
  Lock, 
  Crown, 
  Users,
  Swords,
  Map,
  Zap,
  Target,
  Flame,
  Skull
} from 'lucide-react'
import { SERVER_FEATURES } from '@/data/serverData'

const ICON_MAP: { [key: string]: React.ElementType } = {
  pickaxe: Pickaxe,
  shield: Shield,
  trophy: Trophy,
  lock: Lock,
  crown: Crown,
  users: Users,
  swords: Swords,
  map: Map,
  zap: Zap,
  target: Target,
  flame: Flame,
  skull: Skull,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-metal-950 via-metal-900 to-metal-950">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-rust-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-rust-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container-rust relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-rust-500/10 border border-rust-500/30 rounded-full"
          >
            <Zap className="w-4 h-4 text-rust-400" />
            <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Server Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl text-white mb-4"
          >
            Warum <span className="text-rust-400">Eldrun</span>?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-metal-400 max-w-2xl mx-auto"
          >
            Entdecke die Features die unseren Server einzigartig machen. Optimiert für das beste Rust-Erlebnis.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVER_FEATURES.map((feature, index) => {
            const IconComponent = ICON_MAP[feature.icon] || Shield
            
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative p-6 bg-gradient-to-br from-metal-900/80 to-metal-950/80 border border-metal-700 backdrop-blur-sm hover:border-rust-500/50 transition-all duration-500"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-rust-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rust-500/20 to-rust-600/10 border border-rust-500/30 flex items-center justify-center group-hover:border-rust-400 transition-colors duration-300"
                       style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <IconComponent className="w-6 h-6 text-rust-400" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-rust-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-metal-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-rust-500/20 group-hover:border-rust-500/50 transition-colors duration-300" />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '10K+', label: 'Registrierte Spieler', icon: Users },
            { value: '99.9%', label: 'Uptime', icon: Zap },
            { value: '50ms', label: 'Avg. Ping', icon: Target },
            { value: '24/7', label: 'Support', icon: Shield },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center p-6 bg-metal-900/50 border border-metal-800 hover:border-rust-500/30 transition-colors duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            >
              <stat.icon className="w-6 h-6 text-rust-400 mx-auto mb-3" />
              <p className="font-display font-black text-3xl text-white mb-1">{stat.value}</p>
              <p className="font-mono text-xs text-metal-500 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
