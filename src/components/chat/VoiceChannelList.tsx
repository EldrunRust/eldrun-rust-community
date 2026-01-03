'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChevronDown, ChevronUp, Plus, Zap, Users } from 'lucide-react'
import { Channel, ChatUser } from '@/store/chatTypes'
import { VoiceChannelButton } from './VoiceChannelButton'

interface VoiceChannelListProps {
  channels: Channel[]
  currentUser: ChatUser
  onJoinVoice: (channelId: string) => void
  activeVoiceChannelId?: string
  onCreateVoiceChannel?: () => void
}

export function VoiceChannelList({
  channels,
  currentUser,
  onJoinVoice,
  activeVoiceChannelId,
  onCreateVoiceChannel
}: VoiceChannelListProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const voiceChannels = channels.filter(c => c.type === 'voice' && c.allowVoice)
  const activeChannels = voiceChannels.filter(c => c.userCount > 0)
  const emptyChannels = voiceChannels.filter(c => c.userCount === 0)

  return (
    <div className="border-t border-metal-800 pt-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-metal-800/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-rust-400" />
          <span className="text-sm font-semibold text-white">Voice Räume</span>
          <span className="text-xs px-2 py-0.5 bg-rust-500/20 text-rust-400 rounded-full">
            {voiceChannels.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-metal-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-metal-400" />
        )}
      </button>

      {/* Channels List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 px-2"
          >
            {/* Active Channels */}
            {activeChannels.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-metal-400 uppercase tracking-wider px-2 mb-2">
                  Aktiv ({activeChannels.length})
                </div>
                <div className="space-y-2">
                  {activeChannels.map(channel => (
                    <VoiceChannelButton
                      key={channel.id}
                      channel={channel}
                      currentUser={currentUser}
                      onJoinVoice={onJoinVoice}
                      activeVoiceChannelId={activeVoiceChannelId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty Channels */}
            {emptyChannels.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-metal-400 uppercase tracking-wider px-2 mb-2 mt-4">
                  Verfügbar ({emptyChannels.length})
                </div>
                <div className="space-y-2">
                  {emptyChannels.map(channel => (
                    <VoiceChannelButton
                      key={channel.id}
                      channel={channel}
                      currentUser={currentUser}
                      onJoinVoice={onJoinVoice}
                      activeVoiceChannelId={activeVoiceChannelId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Create Voice Channel Button */}
            {onCreateVoiceChannel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateVoiceChannel}
                className="w-full mt-4 p-3 rounded-lg border-2 border-dashed border-metal-700 hover:border-rust-500/50 text-metal-400 hover:text-rust-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Neuer Voice Raum</span>
              </motion.button>
            )}

            {/* Empty State */}
            {voiceChannels.length === 0 && (
              <div className="text-center py-6 px-4">
                <Phone className="w-8 h-8 text-metal-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-metal-500">Keine Voice Räume verfügbar</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
