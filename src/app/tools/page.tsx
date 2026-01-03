'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calculator, Bomb, Building2, Hammer, Clock, 
  Package, Crosshair, Map, Bell, Zap
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const TOOLS = [
  {
    id: 'raid',
    name: 'Raid Calculator',
    description: 'Berechne Sulfur, Explosives und C4 für jeden Raid',
    icon: Bomb,
    color: 'from-red-500 to-orange-600',
    href: '/tools/raid',
    stats: ['Alle Strukturen', 'Optimale Routen', 'Kosten-Analyse']
  },
  {
    id: 'base',
    name: 'Base Calculator',
    description: 'Plane deine Base und berechne alle Materialkosten',
    icon: Building2,
    color: 'from-blue-500 to-cyan-600',
    href: '/tools/base',
    stats: ['Material-Listen', 'Upkeep Kosten', 'TC Berechnung']
  },
  {
    id: 'craft',
    name: 'Craft Calculator',
    description: 'Alle Rezepte und Crafting-Zeiten auf einen Blick',
    icon: Hammer,
    color: 'from-amber-500 to-yellow-600',
    href: '/tools/craft',
    stats: ['500+ Rezepte', 'Workbench Level', 'Zeitberechnung']
  },
  {
    id: 'decay',
    name: 'Decay Timer',
    description: 'Wann verfällt deine Base? Berechne den Decay',
    icon: Clock,
    color: 'from-purple-500 to-pink-600',
    href: '/tools/decay',
    stats: ['Alle Materialien', 'TC Reichweite', 'Countdown']
  },
  {
    id: 'loot',
    name: 'Loot Tables',
    description: 'Durchsuche alle Loot-Tabellen und Drop-Chancen',
    icon: Package,
    color: 'from-green-500 to-emerald-600',
    href: '/tools/loot',
    stats: ['Alle Kisten', 'Drop-Raten', 'Monument Loot']
  }
]

export default function ToolsPage() {
  return (
    <EldrunPageShell
      icon={Calculator}
      badge="TOOLS"
      title="RUST TOOLS"
      subtitle="PROFESSIONELLE RECHNER"
      description="Plane deine Raids, berechne deine Base-Kosten und optimiere dein Gameplay mit unseren Tools."
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <div>
        <AuthGate>
        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <div className="group relative bg-metal-900/50 border border-metal-800 rounded-xl p-6 hover:border-gold-500/50 transition-all duration-300 h-full">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-medieval font-bold text-xl text-white mb-2 group-hover:text-gold-400 transition-colors tracking-wide">
                    {tool.name}
                  </h3>
                  <p className="text-metal-400 text-sm mb-4">
                    {tool.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    {tool.stats.map((stat, i) => (
                      <span key={i} className="px-2 py-1 bg-metal-800/50 rounded text-xs text-metal-300">
                        {stat}
                      </span>
                    ))}
                  </div>
                  
                  {/* Arrow */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-metal-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4 text-gold-400" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}
