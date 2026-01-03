'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Activity } from 'lucide-react'
import { HeatmapLeaderboard } from '@/components/heatmap/HeatmapLeaderboard'
import { useHeatmapData } from '@/hooks/useHeatmapData'

export function LeaderboardClient() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  
  const { players, stats } = useHeatmapData(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <HeatmapLeaderboard
        stats={stats}
        players={players}
        selectedPlayer={selectedPlayer}
        onSelectPlayer={setSelectedPlayer}
      />
    </motion.div>
  )
}
