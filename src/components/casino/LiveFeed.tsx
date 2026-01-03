'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Skull, Sparkles, TrendingUp, TrendingDown, Coins, Package } from 'lucide-react'
import { useCasinoLive, getLiveStats } from '@/hooks/useCasinoLive'
import { CasinoActivity } from '@/data/casinoPlayers'
import { RARITY_CONFIG } from '@/data/rustSkins'
import { useStore } from '@/store/useStore'

// Activity type styling
const getActivityStyle = (activity: CasinoActivity) => {
  const isWin = ['win', 'big_win', 'jackpot', 'skin_win', 'rare_drop', 'multiplier', 'streak', 'comeback', 'close_call'].includes(activity.type)
  
  if (activity.type === 'jackpot') return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', icon: Trophy }
  if (activity.type === 'big_win') return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', icon: Sparkles }
  if (activity.type === 'rare_drop') return { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', icon: Package }
  if (activity.type === 'disaster') return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: Skull }
  if (activity.type === 'streak') return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', icon: TrendingUp }
  if (activity.type === 'bust') return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: TrendingDown }
  if (isWin) return { bg: 'bg-metal-800/50', border: 'border-green-500/30', text: 'text-green-400', icon: Coins }
  return { bg: 'bg-metal-800/50', border: 'border-red-500/30', text: 'text-red-400', icon: Coins }
}

export function LiveFeed() {
  const { activities, specialEvent, clearSpecialEvent } = useCasinoLive()
  const currentUser = useStore((state) => state.currentUser)
  const casinoPopupsEnabled = currentUser?.settings?.casinoPopupsEnabled ?? true
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ totalWagered: 0, totalWon: 0, biggestWin: 0, activePlayers: 0, gamesPlayed: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (activities.length > 0) {
      setStats(getLiveStats(activities))
    }
  }, [activities])

  const isWinType = (type: string) => 
    ['win', 'big_win', 'jackpot', 'skin_win', 'rare_drop', 'multiplier', 'streak', 'comeback', 'close_call'].includes(type)

  return (
    <>
      {/* Special Event Popup - Bottom Right Corner (respects user settings) */}
      <AnimatePresence>
        {specialEvent && casinoPopupsEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
            onClick={clearSpecialEvent}
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl border-2 ${
              specialEvent.type === 'jackpot' ? 'bg-amber-900/90 border-amber-500' :
              specialEvent.type === 'disaster' ? 'bg-red-900/90 border-red-500' :
              specialEvent.type === 'rare_drop' ? 'bg-purple-900/90 border-purple-500' :
              'bg-green-900/90 border-green-500'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  specialEvent.type === 'jackpot' ? 'bg-amber-500' :
                  specialEvent.type === 'disaster' ? 'bg-red-500' :
                  specialEvent.type === 'rare_drop' ? 'bg-purple-500' :
                  'bg-green-500'
                }`}>
                  {specialEvent.type === 'jackpot' && <Trophy className="w-7 h-7 text-white" />}
                  {specialEvent.type === 'disaster' && <Skull className="w-7 h-7 text-white" />}
                  {specialEvent.type === 'rare_drop' && <Package className="w-7 h-7 text-white" />}
                  {specialEvent.type === 'big_win' && <Sparkles className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    {specialEvent.type === 'jackpot' && '🏆 JACKPOT!'}
                    {specialEvent.type === 'disaster' && '💀 TOTALVERLUST!'}
                    {specialEvent.type === 'rare_drop' && '💎 SELTENER DROP!'}
                    {specialEvent.type === 'big_win' && '🎉 MEGA WIN!'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {specialEvent.player.name} - {specialEvent.amount.toLocaleString()} Coins
                  </p>
                  {specialEvent.skin && (
                    <p className="text-sm" style={{ color: RARITY_CONFIG[specialEvent.skin.rarity].color }}>
                      {specialEvent.skin.image} {specialEvent.skin.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Feed Panel */}
      <div className="bg-metal-900/50 border border-metal-800 p-4">
        <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          Live Aktivität
          <span className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-metal-500">{stats.activePlayers} Online</span>
          </span>
        </h3>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-metal-800/50 p-2 rounded">
            <p className="text-metal-500">24h Gewettet</p>
            <p className="text-white font-mono">{(stats.totalWagered / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-metal-800/50 p-2 rounded">
            <p className="text-metal-500">Größter Win</p>
            <p className="text-green-400 font-mono">{(stats.biggestWin / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-hidden">
          {!mounted ? (
            <div className="text-center py-4 text-metal-500 text-sm">Lade...</div>
          ) : (
          <AnimatePresence mode="popLayout">
            {activities.slice(0, 12).map((activity) => {
              const style = getActivityStyle(activity)
              const isWin = isWinType(activity.type)
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${style.bg} border ${style.border} p-2 text-xs rounded ${activity.isSpecial ? 'ring-1 ring-white/20' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {/* Player Avatar */}
                    <span className="text-lg flex-shrink-0">{activity.player.avatar}</span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-medium truncate">{activity.player.name}</span>
                        {activity.player.vip && <span className="text-amber-400 text-[10px]">VIP</span>}
                      </div>
                      <p className="text-metal-400 truncate text-[11px]">
                        {activity.skin ? (
                          <span style={{ color: RARITY_CONFIG[activity.skin.rarity].color }}>
                            {activity.skin.image} {activity.skin.name}
                          </span>
                        ) : (
                          activity.message.substring(activity.message.indexOf(' ') + 1, 50)
                        )}
                      </p>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-mono font-bold ${style.text}`}>
                        {isWin ? '+' : '-'}{activity.amount.toLocaleString()}
                      </p>
                      {activity.multiplier && activity.multiplier > 1 && (
                        <p className="text-metal-500 text-[10px]">{activity.multiplier.toFixed(2)}x</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          )}
        </div>
      </div>
    </>
  )
}
