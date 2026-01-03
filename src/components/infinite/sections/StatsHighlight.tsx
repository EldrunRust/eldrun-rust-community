'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

interface StatItem {
  label: string
  value: number | string
  holder?: string
}

interface StatsData {
  title: string
  stats: StatItem[]
}

export function StatsHighlight({ data }: { data: StatsData }) {
  return (
    <section className="py-8 px-4">
      <div className="container-rust">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-metal-900 to-metal-950 border border-metal-700 p-6">
          <div className="flex items-center gap-2 mb-4 text-rust-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-display font-bold text-lg uppercase">{data.title}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.stats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-metal-800/50">
                <span className="block font-mono text-2xl text-white mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                <span className="text-xs text-metal-500">{stat.label}</span>
                {stat.holder && <span className="block text-xs text-rust-400 mt-1">by {stat.holder}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
