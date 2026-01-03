'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Gift, Plane, Ship } from 'lucide-react'

interface EventData {
  title: string
  description: string
  type: string
  countdown: boolean
  reward: string
}

export function ServerEventCard({ data }: { data: EventData }) {
  const icons: { [key: string]: any } = {
    helicopter: Plane,
    cargo: Ship,
  }
  const Icon = icons[data.type] || AlertTriangle

  return (
    <section className="py-6 px-4">
      <div className="container-rust">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-rust-600/20 via-rust-500/10 to-rust-600/20 border-2 border-rust-500 p-6 relative overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rust-500 to-transparent animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-rust-500/30 border border-rust-500 flex items-center justify-center animate-pulse">
              <Icon className="w-8 h-8 text-rust-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rust-400" />
                <span className="font-mono text-xs text-rust-400 uppercase animate-pulse">Live Event</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">{data.title}</h3>
              <p className="text-metal-400 text-sm">{data.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-radiation-400">
                <Gift className="w-4 h-4" />
                <span className="text-sm">{data.reward}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
