'use client'

import { motion } from 'framer-motion'
import { Newspaper, Activity } from 'lucide-react'
import { HeatmapNews } from '@/components/heatmap/HeatmapNews'

export function NewsClient() {
  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      {/* Header */}
      <div className="border-b border-metal-800 bg-metal-900/50 backdrop-blur-sm">
        <div className="container-rust py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center">
                <Newspaper className="w-7 h-7 text-rust-400" />
              </div>
              <div>
                <h1 className="font-display font-black text-3xl text-white">SERVER NEWS</h1>
                <p className="text-metal-500 text-sm font-mono">Updates, Events & Patches • Eldrun</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-metal-800 border border-metal-700">
                <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="font-mono text-sm text-metal-300">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-rust py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HeatmapNews />
        </motion.div>
      </div>
    </div>
  )
}
