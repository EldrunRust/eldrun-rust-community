'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, X } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useStore } from '@/store/useStore'
import { VoiceRoom } from './VoiceRoom'
import { VoiceChannelList } from './VoiceChannelList'
import { CreateVoiceChannelModal } from './CreateVoiceChannelModal'
import { UltimateChatInterface } from './UltimateChatInterface'
import { Channel, ChatUser } from '@/store/chatTypes'

export function ChatWithVoiceIntegration() {
  const { channels, onlineUsers, currentChannelId, setCurrentChannel, createChannel } = useChatStore()
  const { currentUser } = useStore()

  // Voice state
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null)
  const [voiceParticipants, setVoiceParticipants] = useState<ChatUser[]>([])
  const [showCreateVoiceModal, setShowCreateVoiceModal] = useState(false)
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([])

  // Initialize voice channels from demo data
  useEffect(() => {
    const demoVoiceChannels: Channel[] = [
      {
        id: 'voice-gaming',
        name: '🎮 Gaming Squad',
        description: 'Für Raids und Clan-Fights',
        type: 'voice',
        icon: '🎮',
        color: '#EF4444',
        isLocked: false,
        inviteOnly: false,
        minLevel: 0,
        minPlaytime: 0,
        vipOnly: false,
        maxUsers: 20,
        userCount: 3,
        waitlistEnabled: false,
        autoKickMinutes: 0,
        slowMode: 0,
        allowImages: true,
        allowGifs: true,
        allowVoice: true,
        allowLinks: true,
        allowSmileys: 'all',
        allowEldruns: true,
        allowGifts: true,
        allowRoses: true,
        moderators: [],
        bannedUsers: [],
        mutedUsers: [],
        wordFilter: [],
        autoModEnabled: true,
        welcomeMessage: 'Willkommen im Gaming Squad Voice-Raum!',
        miniGamesEnabled: false,
        messageCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        monetizationEnabled: false,
        totalEarnings: 0,
      },
      {
        id: 'voice-events',
        name: '📢 Event Broadcast',
        description: 'Für Live-Events und Ankündigungen',
        type: 'voice',
        icon: '📢',
        color: '#F59E0B',
        isLocked: false,
        inviteOnly: false,
        minLevel: 0,
        minPlaytime: 0,
        vipOnly: false,
        maxUsers: 100,
        userCount: 0,
        waitlistEnabled: false,
        autoKickMinutes: 0,
        slowMode: 0,
        allowImages: true,
        allowGifs: true,
        allowVoice: true,
        allowLinks: true,
        allowSmileys: 'all',
        allowEldruns: true,
        allowGifts: true,
        allowRoses: true,
        moderators: [],
        bannedUsers: [],
        mutedUsers: [],
        wordFilter: [],
        autoModEnabled: true,
        welcomeMessage: 'Event-Broadcast läuft!',
        miniGamesEnabled: false,
        messageCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        monetizationEnabled: false,
        totalEarnings: 0,
      },
      {
        id: 'voice-vip',
        name: '👑 VIP Lounge',
        description: 'Exklusiv für VIP-Mitglieder',
        type: 'voice',
        icon: '👑',
        color: '#FBBF24',
        isLocked: true,
        inviteOnly: true,
        minLevel: 0,
        minPlaytime: 0,
        vipOnly: true,
        maxUsers: 15,
        userCount: 2,
        waitlistEnabled: false,
        autoKickMinutes: 0,
        slowMode: 0,
        allowImages: true,
        allowGifs: true,
        allowVoice: true,
        allowLinks: true,
        allowSmileys: 'all',
        allowEldruns: true,
        allowGifts: true,
        allowRoses: true,
        moderators: [],
        bannedUsers: [],
        mutedUsers: [],
        wordFilter: [],
        autoModEnabled: true,
        welcomeMessage: 'Willkommen in der VIP Lounge!',
        miniGamesEnabled: false,
        messageCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        monetizationEnabled: false,
        totalEarnings: 0,
      },
      {
        id: 'voice-clan',
        name: '⚔️ Clan War Room',
        description: 'Für Clan-Strategien und Koordination',
        type: 'voice',
        icon: '⚔️',
        color: '#8B5CF6',
        isLocked: false,
        inviteOnly: true,
        minLevel: 0,
        minPlaytime: 0,
        vipOnly: false,
        maxUsers: 30,
        userCount: 5,
        waitlistEnabled: false,
        autoKickMinutes: 0,
        slowMode: 0,
        allowImages: true,
        allowGifs: true,
        allowVoice: true,
        allowLinks: true,
        allowSmileys: 'all',
        allowEldruns: true,
        allowGifts: true,
        allowRoses: true,
        moderators: [],
        bannedUsers: [],
        mutedUsers: [],
        wordFilter: [],
        autoModEnabled: true,
        welcomeMessage: 'Clan War Room aktiv!',
        miniGamesEnabled: false,
        messageCount: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        monetizationEnabled: false,
        totalEarnings: 0,
      },
    ]
    setVoiceChannels(demoVoiceChannels)
  }, [])

  // Get current voice channel
  const currentVoiceChannel = useMemo(
    () => voiceChannels.find(c => c.id === activeVoiceChannelId),
    [voiceChannels, activeVoiceChannelId]
  )

  // Handle join voice
  const handleJoinVoice = (channelId: string) => {
    const channel = voiceChannels.find(c => c.id === channelId)
    if (!channel || channel.userCount >= channel.maxUsers) return

    setActiveVoiceChannelId(channelId)

    // Simulate adding some participants
    const simulatedParticipants = onlineUsers.slice(0, Math.min(3, onlineUsers.length))
    setVoiceParticipants(simulatedParticipants)

    // Update channel user count
    setVoiceChannels(prev =>
      prev.map(c =>
        c.id === channelId
          ? { ...c, userCount: c.userCount + 1 }
          : c
      )
    )
  }

  // Handle leave voice
  const handleLeaveVoice = () => {
    if (activeVoiceChannelId) {
      setVoiceChannels(prev =>
        prev.map(c =>
          c.id === activeVoiceChannelId
            ? { ...c, userCount: Math.max(0, c.userCount - 1) }
            : c
        )
      )
    }
    setActiveVoiceChannelId(null)
    setVoiceParticipants([])
  }

  // Handle create voice channel
  const handleCreateVoiceChannel = (data: {
    name: string
    description: string
    isPrivate: boolean
    maxUsers: number
    icon: string
  }) => {
    const userId = chatUser?.id ?? 'system'
    const newChannel: Channel = {
      id: `voice-${Date.now()}`,
      name: data.icon + ' ' + data.name,
      description: data.description,
      type: 'voice',
      icon: data.icon,
      color: '#EC4899',
      isLocked: data.isPrivate,
      inviteOnly: data.isPrivate,
      minLevel: 0,
      minPlaytime: 0,
      vipOnly: false,
      maxUsers: data.maxUsers,
      userCount: 1,
      waitlistEnabled: false,
      autoKickMinutes: 0,
      slowMode: 0,
      allowImages: true,
      allowGifs: true,
      allowVoice: true,
      allowLinks: true,
      allowSmileys: 'all',
      allowEldruns: true,
      allowGifts: true,
      allowRoses: true,
      moderators: [userId],
      bannedUsers: [],
      mutedUsers: [],
      wordFilter: [],
      autoModEnabled: true,
      welcomeMessage: `Willkommen in ${data.name}!`,
      miniGamesEnabled: false,
      messageCount: 0,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      monetizationEnabled: false,
      totalEarnings: 0,
    }

    setVoiceChannels(prev => [...prev, newChannel])
    setShowCreateVoiceModal(false)
  }

  // Convert UserProfile to ChatUser for voice components
  const chatUser: ChatUser | null = currentUser ? {
    id: currentUser.id,
    username: currentUser.username || 'User',
    displayName: currentUser.displayName || currentUser.username || 'User',
    avatar: currentUser.avatar,
    level: currentUser.level || 1,
    xp: currentUser.xp || 0,
    status: 'online',
    role: (currentUser.role as any) || 'user',
    loyaltyTier: 'copper',
    loyaltyPoints: 0,
    badges: [],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 0,
    eldrunsReceived: 0,
    eldrunsSent: 0,
    hearts: 0,
    heartsGiven: null,
    roses: 0,
    rosesReceived: 0,
    kisses: 0,
    profileViews: 0,
  } : null

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-full bg-metal-900">
        <p className="text-metal-400">Bitte melden Sie sich an</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-metal-950">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <UltimateChatInterface />
      </div>

      {/* Voice Channels Sidebar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 300, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        className="border-l border-metal-800 bg-metal-900/50 backdrop-blur-sm overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-metal-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-rust-400" />
            Voice
          </h3>
          {activeVoiceChannelId && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-rust-500"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <VoiceChannelList
            channels={voiceChannels}
            currentUser={chatUser}
            onJoinVoice={handleJoinVoice}
            activeVoiceChannelId={activeVoiceChannelId || undefined}
            onCreateVoiceChannel={() => setShowCreateVoiceModal(true)}
          />
        </div>
      </motion.div>

      {/* Voice Room Modal */}
      <AnimatePresence>
        {activeVoiceChannelId && currentVoiceChannel && (
          <VoiceRoom
            roomId={currentVoiceChannel.id}
            roomName={currentVoiceChannel.name}
            roomIcon={currentVoiceChannel.icon}
            maxUsers={currentVoiceChannel.maxUsers}
            isPrivate={currentVoiceChannel.isLocked}
            currentUser={chatUser}
            participants={voiceParticipants}
            onLeave={handleLeaveVoice}
          />
        )}
      </AnimatePresence>

      {/* Create Voice Channel Modal */}
      <AnimatePresence>
        {showCreateVoiceModal && (
          <CreateVoiceChannelModal
            onClose={() => setShowCreateVoiceModal(false)}
            onCreate={handleCreateVoiceChannel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
