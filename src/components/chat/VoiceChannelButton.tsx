'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Users, Lock, Zap } from 'lucide-react'
import { Channel, ChatUser } from '@/store/chatTypes'

interface VoiceChannelButtonProps {
  channel: Channel
  currentUser: ChatUser
  onJoinVoice: (channelId: string) => void
  activeVoiceChannelId?: string
}

export function VoiceChannelButton({
  channel,
  currentUser,
  onJoinVoice,
  activeVoiceChannelId
}: VoiceChannelButtonProps) {
  const [isHovering, setIsHovering] = useState(false)
  const isActive = activeVoiceChannelId === channel.id
  const isFull = channel.userCount >= channel.maxUsers
  const canJoin = !isFull && channel.allowVoice

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => canJoin && onJoinVoice(channel.id)}
      disabled={!canJoin}
      className={`w-full p-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'bg-rust-500/20 border-rust-500 shadow-lg shadow-rust-500/20'
          : canJoin
          ? 'bg-metal-800/50 border-metal-700 hover:border-rust-500/50 hover:bg-metal-800'
          : 'bg-metal-900/50 border-metal-800 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Voice Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
          isActive
            ? 'bg-rust-500/30 text-rust-400'
            : 'bg-metal-700 text-metal-400'
        }`}>
          <Phone className="w-5 h-5" />
        </div>

        {/* Channel Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{channel.name}</span>
            {channel.isLocked && <Lock className="w-3 h-3 text-rust-400" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-metal-400">
            <Users className="w-3 h-3" />
            <span>{channel.userCount}/{channel.maxUsers}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-rust-500"
            />
          )}
          {isFull && (
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
              Voll
            </span>
          )}
          {!channel.allowVoice && (
            <span className="text-xs px-2 py-1 bg-metal-700 text-metal-400 rounded">
              Deaktiviert
            </span>
          )}
        </div>
      </div>

      {/* Hover Info */}
      {isHovering && canJoin && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 pt-2 border-t border-metal-700 text-xs text-metal-400"
        >
          Klicke zum Beitreten
        </motion.div>
      )}
    </motion.button>
  )
}
