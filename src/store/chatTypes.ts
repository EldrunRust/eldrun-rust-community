export type MessageType =
  | 'text'
  | 'image'
  | 'gif'
  | 'file'
  | 'system'
  | 'voice'
  | 'poll'
  | 'gift'
  | 'eldrun'
  | 'kiss'
  | 'heart'
  | 'rose'
  | 'sticker'

export type UserStatus = 'online' | 'away' | 'busy' | 'invisible' | 'offline'
export type ChannelType = 'public' | 'private' | 'group' | 'dm' | 'vip' | 'game' | 'clan' | 'event' | 'voice'
export type UserRole =
  | 'user'
  | 'vip_bronze'
  | 'vip_silver'
  | 'vip_gold'
  | 'moderator'
  | 'admin'
  | 'owner'
export type LoyaltyTier =
  | 'copper'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'obsidian'
  | 'mythril'
  | 'dragongold'
  | 'legendary'

export interface ChatUser {
  id: string
  username: string
  displayName: string
  avatar?: string
  level: number
  xp: number
  status: UserStatus
  statusMessage?: string
  role: UserRole
  loyaltyTier: LoyaltyTier
  loyaltyPoints: number
  badges: string[]
  joinedAt: string
  lastSeen: string
  isTyping?: boolean
  isMuted?: boolean
  isBanned?: boolean
  eldruns: number
  eldrunsReceived: number
  eldrunsSent: number
  hearts: number
  heartsGiven: string | null
  roses: number
  rosesReceived: number
  kisses: number
  profileViews: number
  vipUntil?: string
  vipTier?: 'bronze' | 'silver' | 'gold'
  customColor?: string
  customNickEffect?: string
}

export interface Reaction {
  emoji: string
  users: string[]
  count: number
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'file' | 'voice' | 'video' | 'gif'
  url: string
  name: string
  size?: number
  duration?: number
  thumbnail?: string
}

export interface ChatMessage {
  id: string
  channelId: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  userRole: UserRole
  userBadges: string[]
  userColor?: string
  userNickEffect?: string
  type: MessageType
  content: string
  attachments?: MessageAttachment[]
  giftType?: string
  giftAmount?: number
  giftRecipient?: string
  eldrunAmount?: number
  eldrunRecipient?: string
  heartRecipient?: string
  roseRecipient?: string
  roseColor?: string
  roseMessage?: string
  kissRecipient?: string
  reactions: Reaction[]
  replyTo?: {
    id: string
    username: string
    content: string
  }
  mentions: string[]
  createdAt: string
  editedAt?: string
  isDeleted: boolean
  isPinned: boolean
  isHighlighted: boolean
  readBy: string[]
}

export interface Channel {
  id: string
  name: string
  description: string
  type: ChannelType
  icon: string
  color?: string
  backgroundImage?: string
  isLocked: boolean
  password?: string
  inviteOnly: boolean
  minLevel: number
  minPlaytime: number
  vipOnly: boolean
  clanOnly?: string
  maxUsers: number
  userCount: number
  waitlistEnabled: boolean
  autoKickMinutes: number
  slowMode: number
  allowImages: boolean
  allowGifs: boolean
  allowVoice: boolean
  allowLinks: boolean
  allowSmileys: 'all' | 'free' | 'none'
  allowEldruns: boolean
  allowGifts: boolean
  allowRoses: boolean
  moderators: string[]
  bannedUsers: string[]
  mutedUsers: string[]
  wordFilter: string[]
  autoModEnabled: boolean
  welcomeMessage?: string
  rulesText?: string
  musicStreamUrl?: string
  miniGamesEnabled: boolean
  messageCount: number
  createdBy: string
  createdAt: string
  lastActivity: string
  monetizationEnabled: boolean
  totalEarnings: number
}

export interface PrivateConversation {
  id: string
  participants: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type:
    | 'mention'
    | 'dm'
    | 'gift'
    | 'eldrun'
    | 'heart'
    | 'rose'
    | 'kiss'
    | 'friend_request'
    | 'system'
    | 'achievement'
  from?: string
  fromUsername?: string
  fromAvatar?: string
  content: string
  channelId?: string
  messageId?: string
  amount?: number
  isRead: boolean
  createdAt: string
}

export interface ChatAdminSettings {
  chatEnabled: boolean
  maintenanceMode: boolean
  maxMessageLength: number
  messageRateLimit: number
  minLevelToChat: number
  minPlaytimeToChat: number
  globalWordFilter: string[]
  linkWhitelist: string[]
  autoModEnabled: boolean
  spamProtection: boolean
  floodProtection: boolean
  capsLockLimit: number
  privateMessagesEnabled: boolean
  customChannelsEnabled: boolean
  voiceMessagesEnabled: boolean
  gifSearchEnabled: boolean
  eldrunsEnabled: boolean
  heartsEnabled: boolean
  rosesEnabled: boolean
  kissesEnabled: boolean
  maxChannelsPerUser: number
  maxDMsPerDay: number
  maxGiftsPerDay: number
  vipBonusEldruns: {
    bronze: number
    silver: number
    gold: number
  }
  loyaltyPointsPerMessage: number
  loyaltyPointsPerGift: number
  loyaltyBonusPercentages: Record<LoyaltyTier, number>
}
