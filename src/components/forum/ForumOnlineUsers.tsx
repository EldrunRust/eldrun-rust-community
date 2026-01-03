'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Users, Eye, EyeOff, ChevronDown, ChevronUp, 
  Crown, Shield, Zap, MapPin
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, OnlineUser } from '@/store/forumStore'

export function ForumOnlineUsers() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const { onlineUsers, stats } = useForumStore()

  const visibleUsers = onlineUsers.filter(u => !u.isInvisible)
  const displayUsers = showAll ? visibleUsers : visibleUsers.slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b border-metal-800 bg-gradient-to-r from-metal-900 to-metal-900/50 hover:from-metal-800 hover:to-metal-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          <h3 className="font-display font-bold text-white">Wer ist online?</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-bold">{stats.onlineUsers + stats.onlineGuests}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-metal-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-metal-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Online Summary */}
            <div className="p-3 border-b border-metal-800 bg-metal-900/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-metal-400">
                  <span className="text-green-400 font-bold">{stats.onlineUsers}</span> Mitglieder, 
                  <span className="text-metal-300 font-bold ml-1">{stats.onlineGuests}</span> Gäste
                </span>
              </div>
            </div>

            {/* User List */}
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {displayUsers.map((user) => (
                  <OnlineUserBadge key={user.id} user={user} />
                ))}
              </div>

              {visibleUsers.length > 8 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 text-xs text-rust-400 hover:text-rust-300 transition-colors"
                >
                  {showAll ? 'Weniger anzeigen' : `+${visibleUsers.length - 8} weitere anzeigen`}
                </button>
              )}

              {visibleUsers.length === 0 && (
                <p className="text-metal-500 text-sm text-center py-4">
                  Keine Mitglieder online
                </p>
              )}
            </div>

            {/* Legend */}
            <div className="p-3 border-t border-metal-800 bg-metal-900/30">
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 text-rust-400">
                  <Crown className="w-3 h-3" /> Admin
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Shield className="w-3 h-3" /> Mod
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3 h-3" /> Elite
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function OnlineUserBadge({ user }: { user: OnlineUser }) {
  const rankInfo = getRankInfo(user.rank)
  const factionInfo = user.faction ? getFactionInfo(user.faction) : null

  const getRankIcon = () => {
    switch (user.rank) {
      case 'admin': return <Crown className="w-3 h-3" />
      case 'moderator': return <Shield className="w-3 h-3" />
      case 'legend': case 'elite': return <Zap className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <Link
      href={`/profile/${user.id}`}
      className="group relative"
    >
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors ${
        factionInfo 
          ? `bg-gradient-to-r ${factionInfo.gradient} hover:opacity-80` 
          : 'bg-metal-800 hover:bg-metal-700'
      }`}>
        {/* Online Indicator */}
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        
        {/* Rank Icon */}
        {getRankIcon() && (
          <span className={rankInfo.color}>{getRankIcon()}</span>
        )}
        
        {/* Name */}
        <span className={`font-medium ${factionInfo ? factionInfo.color : rankInfo.color}`}>
          {user.name}
        </span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
        <div className="px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg shadow-xl text-xs whitespace-nowrap">
          <p className={`font-bold ${rankInfo.color}`}>
            {rankInfo.icon} {rankInfo.name}
          </p>
          {factionInfo && (
            <p className={factionInfo.color}>
              {factionInfo.icon} {factionInfo.name}
            </p>
          )}
          <p className="text-metal-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {user.currentLocation}
          </p>
        </div>
      </div>
    </Link>
  )
}
