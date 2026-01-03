'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_CHAT_CHANNELS,
  DEMO_CHAT_CHANNEL_SEED_MESSAGES,
  type DemoChannelSeedMessage,
} from '@/data/demoChatChannels'
import { useStore } from '@/store/useStore'
import type {
  Channel,
  ChannelType,
  ChatAdminSettings,
  ChatMessage,
  ChatUser,
  MessageType,
  Notification,
  PrivateConversation,
  Reaction,
  UserRole,
  UserStatus,
} from '@/store/chatTypes'

const CHANNEL_SEED_MESSAGES = DEMO_CHAT_CHANNEL_SEED_MESSAGES

interface ChatState {
  // Data
  channels: Channel[]
  messages: Record<string, ChatMessage[]>
  onlineUsers: ChatUser[]
  privateConversations: PrivateConversation[]
  notifications: Notification[]
  // Admin Settings
  adminSettings: ChatAdminSettings
  // Current state
  currentChannelId: string | null
  currentDMId: string | null
  typingUsers: Record<string, string[]>
  // User preferences
  soundEnabled: boolean
  notificationsEnabled: boolean
  compactMode: boolean
  showTimestamps: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'dark' | 'light' | 'got'
  // Emoji & Reactions
  recentEmojis: string[]
  frequentEmojis: Array<{ emoji: string; count: number }>
  customEmojis: Array<{ id: string; name: string; url: string; animated?: boolean; category?: string }>
  favoriteEmojis: string[]
  skinTone: 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  emojiSearchHistory: string[]
  // Advanced Chat Features
  threads: Record<string, { id: string; messageId: string; messages: ChatMessage[]; participants: string[]; createdAt: Date }>
  scheduledMessages: Array<{ id: string; channelId: string; content: string; scheduledFor: Date; userId: string }>
  voiceNotes: Record<string, { id: string; url: string; duration: number; userId: string; timestamp: Date }>
  polls: Record<string, { id: string; question: string; options: Array<{ text: string; votes: number; voters: string[] }>; messageId: string; endTime: Date; active: boolean }>
  // Slash Commands
  slashCommands: Array<{ name: string; description: string; usage: string; permission: UserRole[] }>
  commandHistory: string[]
  // VIP & Premium Features
  vipNotifications: boolean
  customThemes: Array<{ id: string; name: string; colors: Record<string, string> }>
  animatedEmojiAccess: boolean
  customEmojiSlots: number
  // AI Features
  aiSummaries: Record<string, { summary: string; generatedAt: Date; messageId: string }>
  aiSuggestions: Array<{ type: 'reply' | 'emoji' | 'gif'; content: string; confidence: number }>
  smartSearchEnabled: boolean
  // Canvas & Collaboration
  canvases: Record<string, Array<{ id: string; title: string; content: string; collaborators: string[]; createdAt: Date; updatedAt: Date }>>
  sharedFiles: Record<string, Array<{ id: string; name: string; url: string; type: string; size: number; uploadedBy: string; uploadedAt: Date }>>
  // Actions - Channels
  setCurrentChannel: (channelId: string) => void
  createChannel: (channel: Partial<Channel>) => Channel
  updateChannel: (channelId: string, updates: Partial<Channel>) => void
  deleteChannel: (channelId: string) => void
  isApiEnabled: boolean
  isApiSyncing: boolean
  apiError: string | null
  syncChannels: () => Promise<void>
  syncMessagesForChannel: (channelId: string) => Promise<void>
  // Actions - Messages
  sendMessage: (channelId: string, message: Partial<ChatMessage>) => ChatMessage
  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
  addReaction: (messageId: string, emoji: string, userId: string) => void
  removeReaction: (messageId: string, emoji: string, userId: string) => void
  pinMessage: (messageId: string) => void
  sendEldruns: (fromUserId: string, toUserId: string, amount: number) => boolean
  sendHeart: (fromUserId: string, toUserId: string) => boolean
  sendRose: (fromUserId: string, toUserId: string, color: string, message: string) => boolean
  sendKiss: (fromUserId: string, toUserId: string) => boolean
  updateAdminSettings: (settings: Partial<ChatAdminSettings>) => void
  banUser: (userId: string, channelId?: string) => void
  unbanUser: (userId: string, channelId?: string) => void
  muteUser: (userId: string, channelId: string, duration: number) => void
  kickUser: (userId: string, channelId: string) => void
  // Actions - User
  setUserStatus: (userId: string, status: UserStatus) => void
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void
  // Actions - Notifications
  addNotification: (notification: Partial<Notification>) => void
  markNotificationRead: (notificationId: string) => void
  clearNotifications: () => void
  // Actions - Settings
  toggleSound: () => void
  toggleNotifications: () => void
  toggleCompactMode: () => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setTheme: (theme: 'dark' | 'light' | 'got') => void
  // Getters
  getChannelMessages: (channelId: string) => ChatMessage[]
  getOnlineUsersInChannel: (channelId: string) => ChatUser[]
  getUnreadCount: () => number
  // Actions - Emoji & Reactions
  addRecentEmoji: (emoji: string) => void
  addFrequentEmoji: (emoji: string) => void
  addCustomEmoji: (emoji: { id: string; name: string; url: string; animated?: boolean; category?: string }) => void
  removeCustomEmoji: (emojiId: string) => void
  setFavoriteEmojis: (emojis: string[]) => void
  setSkinTone: (tone: 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark') => void
  addEmojiSearchHistory: (query: string) => void
  // Actions - Advanced Features
  createThread: (messageId: string, channelId: string) => void
  addMessageToThread: (threadId: string, message: ChatMessage) => void
  scheduleMessage: (channelId: string, content: string, scheduledFor: Date, userId: string) => void
  cancelScheduledMessage: (messageId: string) => void
  addVoiceNote: (channelId: string, voiceNote: { url: string; duration: number; userId: string }) => void
  createPoll: (messageId: string, question: string, options: string[], endTime: Date) => void
  voteInPoll: (pollId: string, optionIndex: number, userId: string) => void
  endPoll: (pollId: string) => void
  // Actions - Slash Commands
  executeSlashCommand: (command: string, args: string[], channelId: string, userId: string) => void
  addCommandToHistory: (command: string) => void
  // Actions - VIP Features
  toggleVipNotifications: () => void
  addCustomTheme: (theme: { id: string; name: string; colors: Record<string, string> }) => void
  setAnimatedEmojiAccess: (hasAccess: boolean) => void
  setCustomEmojiSlots: (slots: number) => void
  // Actions - AI Features
  generateAISummary: (channelId: string, messageId: string) => void
  addAISuggestion: (suggestion: { type: 'reply' | 'emoji' | 'gif'; content: string; confidence: number }) => void
  toggleSmartSearch: () => void
  // Actions - Canvas & Collaboration
  createCanvas: (channelId: string, title: string, content: string) => void
  updateCanvas: (canvasId: string, content: string) => void
  addCanvasCollaborator: (canvasId: string, userId: string) => void
  addSharedFile: (channelId: string, file: { name: string; url: string; type: string; size: number; uploadedBy: string }) => void
}

// Demo data seeds for die Eldrun Great Hall experience
const DEMO_CHANNELS = DEMO_CHAT_CHANNELS.map((channel) => ({
  id: channel.id,
  name: channel.name,
  description: channel.description,
  type: channel.type,
  icon: channel.icon,
  color: channel.color,
  isLocked: channel.isLocked,
  inviteOnly: channel.inviteOnly,
  minLevel: channel.minLevel,
  minPlaytime: channel.minPlaytime,
  vipOnly: channel.vipOnly,
  maxUsers: channel.maxUsers,
  userCount: channel.userCount,
  waitlistEnabled: channel.waitlistEnabled,
  autoKickMinutes: channel.autoKickMinutes,
  slowMode: channel.slowMode,
  allowImages: channel.allowImages,
  allowGifs: channel.allowGifs,
  allowVoice: channel.allowVoice,
  allowLinks: channel.allowLinks,
  allowSmileys: channel.allowSmileys,
  allowEldruns: channel.allowEldruns,
  allowGifts: channel.allowGifts,
  allowRoses: channel.allowRoses,
  moderators: channel.moderators,
  bannedUsers: channel.bannedUsers,
  mutedUsers: channel.mutedUsers,
  wordFilter: channel.wordFilter,
  autoModEnabled: channel.autoModEnabled,
  welcomeMessage: channel.welcomeMessage,
  miniGamesEnabled: channel.miniGamesEnabled,
  messageCount: channel.messageCount,
  createdBy: channel.createdBy,
  createdAt: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  monetizationEnabled: channel.monetizationEnabled,
  totalEarnings: channel.totalEarnings,
}))

const DEMO_USERS: ChatUser[] = [
  {
    id: 'bot_admin',
    username: 'AdminSavant',
    displayName: 'Admin Savant',
    avatar: '/images/avatars/admin-savant.jpg',
    level: 85,
    xp: 120000,
    status: 'online',
    statusMessage: 'LiveOps Monitoring',
    role: 'admin',
    loyaltyTier: 'legendary',
    loyaltyPoints: 9999,
    badges: ['LiveOps', 'Legend'],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 50000,
    eldrunsReceived: 120000,
    eldrunsSent: 82000,
    hearts: 3,
    heartsGiven: null,
    roses: 12,
    rosesReceived: 44,
    kisses: 5,
    profileViews: 1444,
    vipUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    vipTier: 'gold',
    customColor: '#FCD34D',
    customNickEffect: 'glow-gold',
  },
  {
    id: 'bot_strat',
    username: 'ShadowOps',
    displayName: 'Shadow Ops',
    avatar: '/images/avatars/shadow-ops.jpg',
    level: 77,
    xp: 98000,
    status: 'online',
    statusMessage: 'Deploying fixes',
    role: 'moderator',
    loyaltyTier: 'obsidian',
    loyaltyPoints: 8200,
    badges: ['QA', 'Ops'],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 18000,
    eldrunsReceived: 21000,
    eldrunsSent: 9000,
    hearts: 2,
    heartsGiven: null,
    roses: 6,
    rosesReceived: 11,
    kisses: 1,
    profileViews: 980,
  },
  {
    id: 'bot_market',
    username: 'TradeBaron',
    displayName: 'Trade Baron',
    avatar: '/images/avatars/trade-baron.jpg',
    level: 64,
    xp: 63000,
    status: 'online',
    statusMessage: 'Watchlists: live',
    role: 'vip_gold',
    loyaltyTier: 'dragongold',
    loyaltyPoints: 6400,
    badges: ['Economy', 'VIP'],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 45000,
    eldrunsReceived: 72000,
    eldrunsSent: 30000,
    hearts: 1,
    heartsGiven: null,
    roses: 8,
    rosesReceived: 20,
    kisses: 0,
    profileViews: 740,
  },
  {
    id: 'bot_mech',
    username: 'EngineerKyra',
    displayName: 'Engineer Kyra',
    avatar: '/images/avatars/engineer-kyra.jpg',
    level: 58,
    xp: 54000,
    status: 'online',
    statusMessage: 'Calibrating Mechs',
    role: 'vip_silver',
    loyaltyTier: 'platinum',
    loyaltyPoints: 5200,
    badges: ['Mech Lab'],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 12000,
    eldrunsReceived: 22000,
    eldrunsSent: 9000,
    hearts: 1,
    heartsGiven: null,
    roses: 4,
    rosesReceived: 12,
    kisses: 0,
    profileViews: 610,
  },
  {
    id: 'bot_caster',
    username: 'EventCaster',
    displayName: 'Event Caster',
    avatar: '/images/avatars/event-caster.jpg',
    level: 52,
    xp: 46000,
    status: 'online',
    statusMessage: 'Streaming Dispatch TV',
    role: 'vip_bronze',
    loyaltyTier: 'gold',
    loyaltyPoints: 4800,
    badges: ['Caster'],
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    eldruns: 9000,
    eldrunsReceived: 16000,
    eldrunsSent: 6000,
    hearts: 1,
    heartsGiven: null,
    roses: 3,
    rosesReceived: 9,
    kisses: 0,
    profileViews: 420,
  },
]

const BOT_LINES = [
  // Announcements & Alerts
  'Dispatch meldet: Stormwall öffnet sich in 7 Minuten. Wer stellt die Counter?️',
  'Heatmap-Alert: Seraphar-Korridor im Norden ist heiß. Packt Schilde ein.',
  'Vorgaroth-Ritual bei Minute 12 – bringt Anti-Magic oder bleibt fern.',
  'Market Intel: Runenstahl +12 % seit letzter Stunde. Kauft früh, verkauft hart.',
  'QA Ping: Bitte /bug logcode an die Labs schicken. Wir fixen gerade den Panel-Flicker.',
  'Ops: Wir stacken Phantomrüstung + Aether-Schilde für den nächsten Dive.',
  'Eventcast: BossRush Scoreboard flackern gefixt – testet bitte mit 30+ Spielern.',
  'Economy: Watchlists refresh in 3 Minuten. Droppt eure Mindestpreise.',
  'Lab: Cascade Array buffed – Cooldown -15 %. Prüft eure Overclock-Profile.',
  'Kampfbefehl: Loyalität unter 50 % = weniger Schild. Erst Factions, dann Fight.',
  'Auktion: Zwei Legendary Sigils im Rad. Bitte nicht alles auf einmal ziehen. 😉',
  // Questions
  'Hat jemand Tipps für Launch Site? Werde immer von Scientists gesnipet 😅',
  'Wie viel Sulfur braucht man eigentlich für einen 2x2 Raid?',
  'Kann mir jemand bei der Base-Elektrik helfen? Meine Turrets gehen nicht an...',
  'Gibt es heute Abend einen Clan-Fight? Würde gerne zuschauen!',
  'Welche Waffe ist gerade Meta? AK oder LR?',
  'Sucht noch jemand Leute für Oil Rig? Bin solo unterwegs',
  'Wann ist der nächste Wipe? Hab die Ankündigung verpasst',
  'Welche Fraktion hat gerade die meisten Territorien?',
  'Hat jemand Erfahrung mit dem neuen Raid-Calculator?',
  'Wo farmt ihr am besten Scrap? Dome oder Airfield?',
  // Answers & Tips
  'Pro-Tipp: Immer Meds mitnehmen beim Monument-Run. Trust me.',
  'Wenn du Sulfur brauchst, geh zu den Caves. Beste Spots!',
  'Die neuen Custom-Skins im Shop sind echt nice, kann ich empfehlen',
  'Für Elektrik schau dir die Tutorials im Forum an, super erklärt!',
  'AK ist immer noch King, aber LR ist einfacher zu kontrollieren',
  'Oil Rig lohnt sich zu zweit am meisten. Solo ist risky.',
  'Wipe ist nächsten Donnerstag, steht im Discord',
  'Seraphar führt gerade mit 5 Territorien, Vorgaroth hat 3',
  // Discussions
  'Die Raid-Mechanik ist echt gut balanciert seit dem letzten Update',
  'Ich find die Faction Wars sind das Beste an Eldrun!',
  'Vorgaroth Clan hat gestern unsere Base geraided... Revenge incoming! 💪',
  'Das Event letzte Woche war legendär! Hoffe auf mehr davon',
  'Bin seit 500h auf Eldrun und es wird nicht langweilig',
  'Die Community hier ist echt chill, nicht wie auf anderen Servern',
  'Hat jemand den Jackpot im Casino gesehen? 2.3 Millionen!',
  'Mein erster Big Win heute! 50k im Crash 🎉',
  // Social & Fun
  'GG an alle vom letzten Fight! War spannend',
  'Wer will Duo farmen gehen? Hab grad Zeit',
  'Suche aktiven Clan, bin Level 45 mit 200h Spielzeit',
  'Stream läuft gerade auf Twitch, schaut vorbei!',
  'Hat noch jemand Lust auf Casino? Coinflip anyone?',
  'Die neuen Skins sehen mega aus! Hab mir direkt den Dragon-Set geholt',
  'Danke an die Admins für den geilen Server! 🙏',
  'Willkommen an alle Neuen! Fragt wenn ihr Hilfe braucht',
  // Trading
  '💰 Verkaufe 5k Sulfur, PM für Preis',
  '🔧 Suche jemanden der mir bei der Base hilft - zahle gut!',
  '📦 Tausche AK-Skins gegen Scrap - faire Preise',
  '🎨 Rare Skins im Angebot - schaut im Shop vorbei!',
  '⚔️ Verkaufe komplettes Raid-Set, PM an mich',
  // Reactions & Responses
  'Nice! Das war ein geiler Move!',
  'Stimmt, das hab ich auch bemerkt',
  'Ja genau, so mach ich das auch immer',
  'Haha, kenn ich 😂',
  'Das ist echt helpful, danke!',
  'Bin dabei! Wann gehts los?',
  'Gute Idee, machen wir!',
  'Ich bin dabei!',
  'Das ist super!',
  'Danke für die Info!',
]

let botInterval: ReturnType<typeof setInterval> | null = null

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'error' in data && (data as { error: string }).error) || res.statusText
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return data as T
}

function mapRoleToChatRole(role?: string): UserRole {
  switch ((role || '').toLowerCase()) {
    case 'admin':
    case 'superadmin':
      return 'admin'
    case 'moderator':
      return 'moderator'
    case 'vip':
      return 'vip_gold'
    default:
      return 'user'
  }
}

function mapReactionsToArray(reactions: unknown): Reaction[] {
  if (!reactions || typeof reactions !== 'object') return []
  const entries = Object.entries(reactions as Record<string, unknown>)
  return entries.map(([emoji, users]) => {
    const arr = Array.isArray(users) ? users.filter((u): u is string => typeof u === 'string') : []
    return { emoji, users: arr, count: arr.length }
  })
}

interface ApiAuthor {
  id?: string
  username?: string
  displayName?: string
  avatar?: string
  role?: string
}

interface ApiMessage {
  id?: string
  channelId?: string
  authorId?: string
  author?: ApiAuthor
  content?: string
  type?: string
  attachments?: any[]
  reactions?: Record<string, string[]>
  replyTo?: { id?: string; content?: string }
  createdAt?: string | number
  updatedAt?: string | number
  isEdited?: boolean
  isDeleted?: boolean
  isPinned?: boolean
}

interface ApiChannel {
  id?: string
  name?: string
  description?: string
  type?: string
  icon?: string
  color?: string
  isLocked?: boolean
  memberCount?: number
  slowMode?: number
  messageCount?: number
}

function mapApiMessageToChatMessage(api: unknown): ChatMessage {
  const data = api as ApiMessage
  const author = data?.author || null
  
  let createdAt = new Date().toISOString()
  if (data?.createdAt) {
    createdAt = typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt).toISOString()
  }

  const replyTo = data?.replyTo
  return {
    id: String(data?.id || `msg_${Date.now()}`),
    channelId: String(data?.channelId || ''),
    userId: String(data?.authorId || author?.id || ''),
    username: String(author?.username || 'Unknown'),
    displayName: String(author?.displayName || author?.username || 'Unknown'),
    avatar: author?.avatar || undefined,
    userRole: mapRoleToChatRole(author?.role),
    userBadges: [],
    type: String(data?.type || 'text') as MessageType,
    content: String(data?.content || ''),
    attachments: Array.isArray(data?.attachments) ? data.attachments : [],
    reactions: mapReactionsToArray(data?.reactions),
    replyTo: replyTo
      ? {
          id: String(replyTo?.id || ''),
          username: 'Unknown',
          content: String(replyTo?.content || ''),
        }
      : undefined,
    mentions: [],
    createdAt,
    editedAt: data?.isEdited ? String(data?.updatedAt || createdAt) : undefined,
    isDeleted: Boolean(data?.isDeleted),
    isPinned: Boolean(data?.isPinned),
    isHighlighted: false,
    readBy: [],
  }
}

interface ApiChannel {
  id?: string
  name?: string
  description?: string
  type?: string
  icon?: string
  color?: string
  isLocked?: boolean
  memberCount?: number
  slowMode?: number
  messageCount?: number
}

function mapApiChannelToChannel(api: unknown): Channel {
  const data = api as ApiChannel
  return {
    id: String(data?.id || ''),
    name: String(data?.name || 'Channel'),
    description: String(data?.description || ''),
    type: (data?.type || 'public') as ChannelType,
    icon: String(data?.icon || ''),
    color: data?.color || undefined,
    backgroundImage: undefined,
    isLocked: Boolean(data?.isLocked),
    password: undefined,
    inviteOnly: false,
    minLevel: 0,
    minPlaytime: 0,
    vipOnly: data?.type === 'vip',
    clanOnly: undefined,
    maxUsers: 500,
    userCount: typeof data?.memberCount === 'number' ? data.memberCount : 0,
    waitlistEnabled: false,
    autoKickMinutes: 0,
    slowMode: typeof data?.slowMode === 'number' ? data.slowMode : 0,
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
    welcomeMessage: undefined,
    rulesText: undefined,
    musicStreamUrl: undefined,
    miniGamesEnabled: false,
    messageCount: typeof data?.messageCount === 'number' ? data.messageCount : 0,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    monetizationEnabled: false,
    totalEarnings: 0,
  }
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildInitialMessages(): Record<string, ChatMessage[]> {
  const now = new Date()
  const intro = (channelId: string, content: string): ChatMessage => ({
    id: `intro_${channelId}`,
    channelId,
    userId: 'system',
    username: 'Eldrun System',
    displayName: 'Eldrun System',
    userRole: 'admin',
    userBadges: ['system'],
    type: 'system',
    content,
    reactions: [],
    mentions: [],
    createdAt: now.toISOString(),
    isDeleted: false,
    isPinned: true,
    isHighlighted: true,
    readBy: [],
  })

  const map: Record<string, ChatMessage[]> = {}
  const defaultAuthor = {
    userId: 'bot_admin',
    username: 'AdminSavant',
    displayName: 'Admin Savant',
    role: 'admin' as UserRole,
    badges: ['LiveOps'],
  }

  for (const channel of DEMO_CHANNELS) {
    const channelMessages: ChatMessage[] = [
      intro(channel.id, `Willkommen in ${channel.name}! Melde dich und bringe deine Fraktion voran.`),
    ]

    const seeds = CHANNEL_SEED_MESSAGES[channel.id] || CHANNEL_SEED_MESSAGES['__default'] || []
    seeds.forEach((seed: DemoChannelSeedMessage, index: number) => {
      const createdOffset = seed.createdOffsetMinutes ?? (index + 1) * 2
      channelMessages.push({
        id: `seed_${channel.id}_${index}`,
        channelId: channel.id,
        userId: seed.userId ?? defaultAuthor.userId,
        username: seed.username ?? defaultAuthor.username,
        displayName: seed.displayName ?? defaultAuthor.displayName,
        userRole: seed.role ?? defaultAuthor.role,
        userBadges: seed.badges ?? defaultAuthor.badges,
        type: seed.type ?? 'text',
        content: seed.content,
        reactions: [],
        mentions: [],
        createdAt: new Date(now.getTime() - createdOffset * 60_000).toISOString(),
        isDeleted: false,
        isPinned: Boolean(seed.highlight),
        isHighlighted: Boolean(seed.highlight),
        readBy: [],
      })
    })

    map[channel.id] = channelMessages
  }
  return map
}

function startBotLoop(
  get: () => ChatState,
  set: (fn: (state: ChatState) => Partial<ChatState>) => void
) {
  if (botInterval) return
  botInterval = setInterval(() => {
    const state = get()
    if (state.isApiEnabled) return
    const channel = randomFrom(state.channels)
    const botUser = randomFrom(state.onlineUsers)
    const line = randomFrom(BOT_LINES)
    if (!channel || !botUser) return
    state.sendMessage(channel.id, {
      userId: botUser.id,
      username: botUser.username,
      displayName: botUser.displayName,
      userRole: botUser.role,
      userBadges: botUser.badges,
      type: 'text',
      content: line,
      mentions: [],
    })

    // Rotate statuses lightly to keep presence vivid
    const statuses: UserStatus[] = ['online', 'away', 'busy']
    const newStatus = randomFrom(statuses)
    set((s) => ({
      onlineUsers: s.onlineUsers.map((u) =>
        u.id === botUser.id ? { ...u, status: newStatus, lastSeen: new Date().toISOString() } : u
      ),
    }))
  }, 8_000)
}


const DEFAULT_ADMIN_SETTINGS: ChatAdminSettings = {
  chatEnabled: true,
  maintenanceMode: false,
  maxMessageLength: 2000,
  messageRateLimit: 20,
  
  minLevelToChat: 0,
  minPlaytimeToChat: 0,
  
  globalWordFilter: [],
  linkWhitelist: ['eldrun.lol', 'discord.gg', 'youtube.com', 'twitch.tv'],
  autoModEnabled: true,
  spamProtection: true,
  floodProtection: true,
  capsLockLimit: 70,
  
  privateMessagesEnabled: true,
  customChannelsEnabled: true,
  voiceMessagesEnabled: true,
  gifSearchEnabled: true,
  eldrunsEnabled: true,
  heartsEnabled: true,
  rosesEnabled: true,
  kissesEnabled: true,
  
  maxChannelsPerUser: 3,
  maxDMsPerDay: 50,
  maxGiftsPerDay: 20,
  
  vipBonusEldruns: {
    bronze: 100,
    silver: 300,
    gold: 1000,
  },
  
  loyaltyPointsPerMessage: 1,
  loyaltyPointsPerGift: 10,
  loyaltyBonusPercentages: {
    copper: 0,
    bronze: 2,
    silver: 3,
    gold: 4,
    platinum: 5,
    diamond: 6,
    obsidian: 8,
    mythril: 10,
    dragongold: 12,
    legendary: 15,
  },
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      // kick off autonomous bot chatter once store exists
      setTimeout(() => startBotLoop(get, set), 0)

      return {
      // Initial Data - Eldrun demo fill
      channels: DEMO_CHANNELS,
      messages: buildInitialMessages(),
      onlineUsers: DEMO_USERS,
      privateConversations: [],
      notifications: [],
      adminSettings: DEFAULT_ADMIN_SETTINGS,
      
      currentChannelId: DEMO_CHANNELS[0]?.id || null,
      currentDMId: null,
      typingUsers: {},
      
      soundEnabled: true,
      notificationsEnabled: true,
      compactMode: false,
      showTimestamps: true,
      fontSize: 'medium',
      theme: 'got',
      
      // Emoji & Reactions
      recentEmojis: [],
      frequentEmojis: [],
      customEmojis: [],
      favoriteEmojis: [],
      skinTone: 'default',
      emojiSearchHistory: [],
      
      // Advanced Chat Features
      threads: {},
      scheduledMessages: [],
      voiceNotes: {},
      polls: {},
      
      // Slash Commands
      slashCommands: [
        { name: 'help', description: 'Show available commands', usage: '/help', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'clear', description: 'Clear chat history', usage: '/clear', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'ban', description: 'Ban a user', usage: '/ban <user> [reason]', permission: ['moderator', 'admin', 'owner'] },
        { name: 'kick', description: 'Kick a user', usage: '/kick <user> [reason]', permission: ['moderator', 'admin', 'owner'] },
        { name: 'mute', description: 'Mute a user', usage: '/mute <user> <duration>', permission: ['moderator', 'admin', 'owner'] },
        { name: 'poll', description: 'Create a poll', usage: '/poll <question> <options...>', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'summarize', description: 'AI summarize conversation', usage: '/summarize', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'thread', description: 'Create a thread', usage: '/thread <message>', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'schedule', description: 'Schedule a message', usage: '/schedule <time> <message>', permission: ['user', 'moderator', 'admin', 'owner'] },
        { name: 'giphy', description: 'Search and send GIF', usage: '/giphy <query>', permission: ['user', 'moderator', 'admin', 'owner'] },
      ],
      commandHistory: [],
      
      // VIP & Premium Features
      vipNotifications: false,
      customThemes: [],
      animatedEmojiAccess: false,
      customEmojiSlots: 5,
      
      // AI Features
      aiSummaries: {},
      aiSuggestions: [],
      smartSearchEnabled: false,
      
      // Canvas & Collaboration
      canvases: {},
      sharedFiles: {},

      isApiEnabled: false,
      isApiSyncing: false,
      apiError: null,

      syncChannels: async () => {
        set({ isApiSyncing: true, apiError: null })
        try {
          const data = await fetchJson<{ channels: any[] }>('/api/chat/channels')
          const mapped = Array.isArray(data?.channels) ? data.channels.map(mapApiChannelToChannel) : []
          if (!mapped.length) {
            set({ isApiEnabled: true, channels: [], isApiSyncing: false })
            return
          }

          const current = get().currentChannelId
          const nextCurrent = current && mapped.some(c => c.id === current) ? current : mapped[0]?.id || null
          set({
            isApiEnabled: true,
            channels: mapped,
            currentChannelId: nextCurrent,
            isApiSyncing: false,
          })

          if (nextCurrent) {
            await get().syncMessagesForChannel(nextCurrent)
          }
        } catch (e) {
          set({ isApiEnabled: false, apiError: e instanceof Error ? e.message : 'API error', isApiSyncing: false })
        }
      },

      syncMessagesForChannel: async (channelId) => {
        if (!channelId) return
        set({ isApiSyncing: true, apiError: null })
        try {
          const url = `/api/chat/messages?channelId=${encodeURIComponent(channelId)}&limit=50&mode=all`
          const data = await fetchJson<{ messages: any[] }>(url)
          const mapped = Array.isArray(data?.messages) ? data.messages.map(mapApiMessageToChatMessage) : []
          set((state) => ({
            isApiEnabled: true,
            messages: {
              ...state.messages,
              [channelId]: mapped,
            },
            isApiSyncing: false,
          }))
        } catch (e) {
          set({ apiError: e instanceof Error ? e.message : 'API error', isApiSyncing: false })
        }
      },

      // Channel actions
      setCurrentChannel: (channelId) => {
        set({ currentChannelId: channelId, currentDMId: null })
        if (get().isApiEnabled) {
          void get().syncMessagesForChannel(channelId)
        }
      },
      
      createChannel: (channelData) => {
        const newChannel: Channel = {
          id: `channel_${Date.now()}`,
          name: channelData.name || 'Neuer Channel',
          description: channelData.description || '',
          type: channelData.type || 'public',
          icon: channelData.icon || '💬',
          isLocked: channelData.isLocked || false,
          inviteOnly: channelData.inviteOnly || false,
          minLevel: channelData.minLevel || 0,
          minPlaytime: channelData.minPlaytime || 0,
          vipOnly: channelData.vipOnly || false,
          maxUsers: channelData.maxUsers || 100,
          userCount: 0,
          waitlistEnabled: channelData.waitlistEnabled || false,
          autoKickMinutes: channelData.autoKickMinutes || 0,
          slowMode: channelData.slowMode || 0,
          allowImages: channelData.allowImages ?? true,
          allowGifs: channelData.allowGifs ?? true,
          allowVoice: channelData.allowVoice ?? true,
          allowLinks: channelData.allowLinks ?? true,
          allowSmileys: channelData.allowSmileys || 'all',
          allowEldruns: channelData.allowEldruns ?? true,
          allowGifts: channelData.allowGifts ?? true,
          allowRoses: channelData.allowRoses ?? true,
          moderators: channelData.moderators || [],
          bannedUsers: [],
          mutedUsers: [],
          wordFilter: channelData.wordFilter || [],
          autoModEnabled: channelData.autoModEnabled ?? true,
          welcomeMessage: channelData.welcomeMessage,
          miniGamesEnabled: channelData.miniGamesEnabled ?? false,
          messageCount: 0,
          createdBy: channelData.createdBy || 'system',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          monetizationEnabled: channelData.monetizationEnabled || false,
          totalEarnings: 0,
          ...channelData,
        } as Channel
        
        set((state) => ({
          channels: [...state.channels, newChannel],
          messages: { ...state.messages, [newChannel.id]: [] },
        }))
        
        return newChannel
      },
      
      updateChannel: (channelId, updates) => {
        set((state) => ({
          channels: state.channels.map(c => 
            c.id === channelId ? { ...c, ...updates } : c
          ),
        }))
      },
      
      deleteChannel: (channelId) => {
        set((state) => ({
          channels: state.channels.filter(c => c.id !== channelId),
        }))
      },

      // Message actions
      sendMessage: (channelId, messageData) => {
        const appUser = useStore.getState().currentUser
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          channelId,
          userId: messageData.userId || '',
          username: messageData.username || '',
          displayName: messageData.displayName || messageData.username || '',
          userRole: messageData.userRole || 'user',
          userBadges: messageData.userBadges || [],
          type: messageData.type || 'text',
          content: messageData.content || '',
          reactions: [],
          mentions: messageData.mentions || [],
          createdAt: new Date().toISOString(),
          isDeleted: false,
          isPinned: false,
          isHighlighted: false,
          readBy: [],
          ...messageData,
        } as ChatMessage
        
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), newMessage],
          },
          channels: state.channels.map(c => 
            c.id === channelId 
              ? { ...c, messageCount: c.messageCount + 1, lastActivity: new Date().toISOString() }
              : c
          ),
        }))

        const shouldPersist = Boolean(
          appUser &&
            newMessage.userId === appUser.id &&
            newMessage.type === 'text' &&
            newMessage.content.trim().length > 0
        )
        if (get().isApiEnabled && shouldPersist) {
          void fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId,
              content: newMessage.content,
              type: newMessage.type,
              attachments: newMessage.attachments || [],
              replyToId: newMessage.replyTo?.id || null,
            }),
          }).then(async (res) => {
            if (res.ok) {
              await get().syncMessagesForChannel(channelId)
            }
          }).catch(() => {})
        }
        
        return newMessage
      },
      
      editMessage: (messageId, newContent) => {
        set((state) => {
          const newMessages = { ...state.messages }
          for (const channelId in newMessages) {
            newMessages[channelId] = newMessages[channelId].map(m => 
              m.id === messageId 
                ? { ...m, content: newContent, editedAt: new Date().toISOString() }
                : m
            )
          }
          return { messages: newMessages }
        })
      },
      
      deleteMessage: (messageId) => {
        set((state) => {
          const newMessages = { ...state.messages }
          for (const channelId in newMessages) {
            newMessages[channelId] = newMessages[channelId].map(m => 
              m.id === messageId ? { ...m, isDeleted: true, content: '[Nachricht gelöscht]' } : m
            )
          }
          return { messages: newMessages }
        })
      },
      
      addReaction: (messageId, emoji, userId) => {
        set((state) => {
          const newMessages = { ...state.messages }
          for (const channelId in newMessages) {
            newMessages[channelId] = newMessages[channelId].map(m => {
              if (m.id !== messageId) return m
              const existingReaction = m.reactions.find(r => r.emoji === emoji)
              if (existingReaction) {
                if (existingReaction.users.includes(userId)) return m
                return {
                  ...m,
                  reactions: m.reactions.map(r => 
                    r.emoji === emoji 
                      ? { ...r, users: [...r.users, userId], count: r.count + 1 }
                      : r
                  ),
                }
              }
              return { ...m, reactions: [...m.reactions, { emoji, users: [userId], count: 1 }] }
            })
          }
          return { messages: newMessages }
        })
      },
      
      removeReaction: (messageId, emoji, userId) => {
        set((state) => {
          const newMessages = { ...state.messages }
          for (const channelId in newMessages) {
            newMessages[channelId] = newMessages[channelId].map(m => {
              if (m.id !== messageId) return m
              return {
                ...m,
                reactions: m.reactions
                  .map(r => r.emoji === emoji 
                    ? { ...r, users: r.users.filter(u => u !== userId), count: Math.max(0, r.count - 1) }
                    : r
                  )
                  .filter(r => r.count > 0),
              }
            })
          }
          return { messages: newMessages }
        })
      },
      
      pinMessage: (messageId) => {
        set((state) => {
          const newMessages = { ...state.messages }
          for (const channelId in newMessages) {
            newMessages[channelId] = newMessages[channelId].map(m => 
              m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
            )
          }
          return { messages: newMessages }
        })
      },

      // Social actions
      sendEldruns: (fromUserId, toUserId, amount) => {
        const fromUser = get().onlineUsers.find(u => u.id === fromUserId)
        if (!fromUser || fromUser.eldruns < amount) return false
        
        set((state) => ({
          onlineUsers: state.onlineUsers.map(u => {
            if (u.id === fromUserId) return { ...u, eldruns: u.eldruns - amount, eldrunsSent: u.eldrunsSent + amount }
            if (u.id === toUserId) return { ...u, eldruns: u.eldruns + amount, eldrunsReceived: u.eldrunsReceived + amount }
            return u
          }),
        }))
        return true
      },
      
      sendHeart: (fromUserId, toUserId) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.map(u => {
            if (u.id === fromUserId) return { ...u, heartsGiven: toUserId }
            if (u.id === toUserId) return { ...u, hearts: u.hearts + 1 }
            return u
          }),
        }))
        return true
      },
      
      sendRose: (fromUserId, toUserId, color, message) => {
        const fromUser = get().onlineUsers.find(u => u.id === fromUserId)
        if (!fromUser || fromUser.roses < 1) return false
        
        set((state) => ({
          onlineUsers: state.onlineUsers.map(u => {
            if (u.id === fromUserId) return { ...u, roses: u.roses - 1 }
            if (u.id === toUserId) return { ...u, rosesReceived: u.rosesReceived + 1 }
            return u
          }),
        }))
        return true
      },
      
      sendKiss: (fromUserId, toUserId) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.map(u => {
            if (u.id === toUserId) return { ...u, kisses: u.kisses + 1 }
            return u
          }),
        }))
        return true
      },

      // Admin actions
      updateAdminSettings: (settings) => {
        set((state) => ({
          adminSettings: { ...state.adminSettings, ...settings },
        }))
      },
      
      banUser: (userId, channelId) => {
        if (channelId) {
          set((state) => ({
            channels: state.channels.map(c => 
              c.id === channelId 
                ? { ...c, bannedUsers: [...c.bannedUsers, userId] }
                : c
            ),
          }))
        } else {
          set((state) => ({
            onlineUsers: state.onlineUsers.map(u => 
              u.id === userId ? { ...u, isBanned: true } : u
            ),
          }))
        }
      },
      
      unbanUser: (userId, channelId) => {
        if (channelId) {
          set((state) => ({
            channels: state.channels.map(c => 
              c.id === channelId 
                ? { ...c, bannedUsers: c.bannedUsers.filter(id => id !== userId) }
                : c
            ),
          }))
        } else {
          set((state) => ({
            onlineUsers: state.onlineUsers.map(u => 
              u.id === userId ? { ...u, isBanned: false } : u
            ),
          }))
        }
      },
      
      muteUser: (userId, channelId, duration) => {
        set((state) => ({
          channels: state.channels.map(c => 
            c.id === channelId 
              ? { ...c, mutedUsers: [...c.mutedUsers, userId] }
              : c
          ),
        }))
      },
      
      kickUser: (userId, channelId) => {
        // Implementation
      },

      // User actions
      setUserStatus: (userId, status) => {
        set((state) => ({
          onlineUsers: state.onlineUsers.map(u => 
            u.id === userId ? { ...u, status, lastSeen: new Date().toISOString() } : u
          ),
        }))
      },
      
      setTyping: (channelId, userId, isTyping) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [channelId]: isTyping
              ? [...(state.typingUsers[channelId] || []).filter(id => id !== userId), userId]
              : (state.typingUsers[channelId] || []).filter(id => id !== userId),
          },
        }))
      },

      // Emoji & Reactions
      addRecentEmoji: (emoji) => {
        set((state) => {
          const recent = [emoji, ...state.recentEmojis.filter(e => e !== emoji)].slice(0, 50)
          return { recentEmojis: recent }
        })
      },
      
      addFrequentEmoji: (emoji) => {
        set((state) => {
          const existing = state.frequentEmojis.find(e => typeof e === 'object' && 'emoji' in e && e.emoji === emoji)
          const frequent = existing
            ? state.frequentEmojis.map(e => typeof e === 'object' && 'emoji' in e && e.emoji === emoji ? { ...e, count: e.count + 1 } : e)
            : [...state.frequentEmojis, { emoji, count: 1 }]
          
          return { frequentEmojis: frequent.sort((a, b) => b.count - a.count).slice(0, 100) }
        })
      },
      
      addCustomEmoji: (emoji) => {
        set((state) => ({
          customEmojis: [...state.customEmojis, emoji]
        }))
      },
      
      removeCustomEmoji: (emojiId) => {
        set((state) => ({
          customEmojis: state.customEmojis.filter(e => e.id !== emojiId)
        }))
      },
      
      setFavoriteEmojis: (emojis) => {
        set({ favoriteEmojis: emojis })
      },
      
      setSkinTone: (tone) => {
        set({ skinTone: tone })
      },
      
      addEmojiSearchHistory: (query) => {
        set((state) => ({
          emojiSearchHistory: [query, ...state.emojiSearchHistory.filter(q => q !== query)].slice(0, 20)
        }))
      },
      
      // Advanced Features
      createThread: (messageId, channelId) => {
        const threadId = `thread-${Date.now()}`
        set((state) => ({
          threads: {
            ...state.threads,
            [threadId]: {
              id: threadId,
              messageId,
              messages: [],
              participants: [],
              createdAt: new Date()
            }
          }
        }))
      },
      
      addMessageToThread: (threadId, message) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [threadId]: {
              ...state.threads[threadId],
              messages: [...state.threads[threadId].messages, message],
              participants: Array.from(new Set([...state.threads[threadId].participants, message.userId]))
            }
          }
        }))
      },
      
      scheduleMessage: (channelId, content, scheduledFor, userId) => {
        const message = {
          id: `scheduled-${Date.now()}`,
          channelId,
          content,
          scheduledFor,
          userId
        }
        set((state) => ({
          scheduledMessages: [...state.scheduledMessages, message]
        }))
      },
      
      cancelScheduledMessage: (messageId) => {
        set((state) => ({
          scheduledMessages: state.scheduledMessages.filter(m => m.id !== messageId)
        }))
      },
      
      addVoiceNote: (channelId, voiceNote) => {
        set((state) => ({
          voiceNotes: {
            ...state.voiceNotes,
            [channelId]: { ...voiceNote, id: Date.now().toString(), timestamp: new Date() }
          }
        }))
      },
      
      createPoll: (messageId, question, options, endTime) => {
        const poll = {
          id: `poll-${Date.now()}`,
          question,
          options: options.map(text => ({ text, votes: 0, voters: [] })),
          messageId,
          endTime,
          active: true
        }
        set((state) => ({
          polls: {
            ...state.polls,
            [poll.id]: poll
          }
        }))
      },
      
      voteInPoll: (pollId, optionIndex, userId) => {
        set((state) => {
          const poll = state.polls[pollId]
          if (!poll || !poll.active) return state
          
          const updatedOptions = poll.options.map((option, index) => {
            if (index === optionIndex) {
              return {
                ...option,
                votes: option.votes + 1,
                voters: [...option.voters, userId]
              }
            }
            return {
              ...option,
              voters: option.voters.filter(voter => voter !== userId)
            }
          })
          
          return {
            polls: {
              ...state.polls,
              [pollId]: { ...poll, options: updatedOptions }
            }
          }
        })
      },
      
      endPoll: (pollId) => {
        set((state) => ({
          polls: {
            ...state.polls,
            [pollId]: { ...state.polls[pollId], active: false }
          }
        }))
      },
      
      // Slash Commands
      executeSlashCommand: (command, args, channelId, userId) => {
        // Implementation would go here
        // console.log('Executing command:', command, args, channelId, userId)
      },
      
      addCommandToHistory: (command) => {
        set((state) => ({
          commandHistory: [command, ...state.commandHistory.filter(c => c !== command)].slice(0, 50)
        }))
      },
      
      // VIP Features
      toggleVipNotifications: () => {
        set((state) => ({ vipNotifications: !state.vipNotifications }))
      },
      
      addCustomTheme: (theme) => {
        set((state) => ({
          customThemes: [...state.customThemes, theme]
        }))
      },
      
      setAnimatedEmojiAccess: (hasAccess) => {
        set({ animatedEmojiAccess: hasAccess })
      },
      
      setCustomEmojiSlots: (slots) => {
        set({ customEmojiSlots: slots })
      },
      
      // AI Features
      generateAISummary: (channelId, messageId) => {
        // Implementation would call AI API
        const summary = `AI Summary for channel ${channelId} around message ${messageId}`
        set((state) => ({
          aiSummaries: {
            ...state.aiSummaries,
            [messageId]: { summary, generatedAt: new Date(), messageId }
          }
        }))
      },
      
      addAISuggestion: (suggestion) => {
        set((state) => ({
          aiSuggestions: [...state.aiSuggestions, suggestion]
        }))
      },
      
      toggleSmartSearch: () => {
        set((state) => ({ smartSearchEnabled: !state.smartSearchEnabled }))
      },
      
      // Canvas & Collaboration
      createCanvas: (channelId, title, content) => {
        const canvas = {
          id: `canvas-${Date.now()}`,
          title,
          content,
          collaborators: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          canvases: {
            ...state.canvases,
            [channelId]: [...(state.canvases[channelId] || []), canvas]
          }
        }))
      },
      
      updateCanvas: (canvasId, content) => {
        set((state) => ({
          canvases: Object.fromEntries(
            Object.entries(state.canvases).map(([channelId, canvases]) => [
              channelId,
              canvases.map(canvas => 
                canvas.id === canvasId 
                  ? { ...canvas, content, updatedAt: new Date() }
                  : canvas
              )
            ])
          )
        }))
      },
      
      addCanvasCollaborator: (canvasId, userId) => {
        set((state) => ({
          canvases: Object.fromEntries(
            Object.entries(state.canvases).map(([channelId, canvases]) => [
              channelId,
              canvases.map(canvas => 
                canvas.id === canvasId 
                  ? { ...canvas, collaborators: Array.from(new Set([...canvas.collaborators, userId])) }
                  : canvas
              )
            ])
          )
        }))
      },
      
      addSharedFile: (channelId, file) => {
        set((state) => ({
          sharedFiles: {
            ...state.sharedFiles,
            [channelId]: [...(state.sharedFiles[channelId] || []), { ...file, id: Date.now().toString(), uploadedAt: new Date() }]
          }
        }))
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: notification.type || 'system',
          content: notification.content || '',
          isRead: false,
          createdAt: new Date().toISOString(),
          ...notification,
        } as Notification
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
        }))
      },
      
      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }))
      },
      
      clearNotifications: () => set({ notifications: [] }),

      // Settings actions
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),

      // Getters
      getChannelMessages: (channelId) => get().messages[channelId] || [],
      getOnlineUsersInChannel: () => get().onlineUsers.filter(u => u.status !== 'offline'),
      getUnreadCount: () => get().notifications.filter(n => !n.isRead).length,
    }},
    {
      name: 'eldrun-chat-storage',
      partialize: (state: ChatState) => ({
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        compactMode: state.compactMode,
        showTimestamps: state.showTimestamps,
        fontSize: state.fontSize,
        theme: state.theme,
        adminSettings: state.adminSettings,
      }),
    }
  )
)

export default useChatStore
export type { Channel, ChatMessage, ChatUser }
