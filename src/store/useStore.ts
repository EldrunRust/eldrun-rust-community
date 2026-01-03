import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'

interface ServerStats {
  players: number
  maxPlayers: number
  status: 'online' | 'offline' | 'restarting'
  uptime: number
  fps: number
  entities: number
  sleepers: number
  queue: number
}

// Extended User Profile
export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  avatar: string
  banner: string
  bio: string
  steamId: string
  discordId: string
  role: 'player' | 'vip' | 'moderator' | 'admin'
  faction: 'seraphar' | 'vorgaroth' | null
  playerClass: 'krieger' | 'assassine' | 'magier' | 'heiler' | 'tank' | null
  level: number
  xp: number
  xpToNextLevel: number
  prestige: number
  
  // Stats
  playtime: number
  kills: number
  deaths: number
  kd: number
  headshots: number
  longestKillStreak: number
  totalDamageDealt: number
  
  // Economy
  coins: number
  casinoCoins: number
  totalWagered: number
  totalWon: number
  
  // Social
  friends: string[]
  blockedUsers: string[]
  guildId: string | null
  guildRole: 'leader' | 'officer' | 'member' | null
  
  // Achievements
  achievements: UserAchievement[]
  totalAchievementPoints: number
  
  // Activity
  lastOnline: Date
  joinedAt: Date
  isOnline: boolean
  currentServer: string | null
  
  // Settings
  settings: UserSettings
  
  // Extended Profile Fields
  location?: string
  website?: string
  birthday?: string
  pronouns?: string
  occupation?: string
  interests?: string[]
  favoriteGame?: string
  motto?: string
  profileTheme?: string
  featuredBadge?: string
  socialLinks?: Record<string, string>
}

export interface UserAchievement {
  id: string
  name: string
  icon: string
  unlockedAt: Date
  points: number
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system'
  language: 'de' | 'en'
  emailNotifications: boolean
  pushNotifications: boolean
  showOnlineStatus: boolean
  showPlaytime: boolean
  showStats: boolean
  allowFriendRequests: boolean
  allowMessages: boolean
  profileVisibility: 'public' | 'friends' | 'private'
  casinoPopupsEnabled: boolean
}

// Activity Item for Feed
export interface ActivityItem {
  id: string
  type: 'achievement' | 'level_up' | 'kill' | 'death' | 'join' | 'leave' | 'casino_win' | 'purchase'
  message: string
  timestamp: Date
  data?: Record<string, any>
}

type TelemetryStatus = 'online' | 'syncing' | 'degraded'
type TelemetryTrend = 'up' | 'down' | 'steady'

export interface TelemetryModule {
  id: string
  label: string
  description: string
  status: TelemetryStatus
  value: number
  unit: string
  trend: TelemetryTrend
  action?: string
}

export interface TelemetryPulse {
  heartbeat: number
  latency: number
  packetLoss: number
  lastUpdated: string
  status: 'nominal' | 'warning'
  modules: TelemetryModule[]
}

interface AppState {
  serverStats: ServerStats
  currentUser: UserProfile | null
  userActivity: ActivityItem[]
  factionScore: { seraphar: number; vorgaroth: number }
  isAuthModalOpen: boolean
  authMode: 'login' | 'register'
  isSoundEnabled: boolean
  isMenuOpen: boolean
  isUserMenuOpen: boolean
  telemetryPulse: TelemetryPulse
  
  setServerStats: (stats: ServerStats) => void
  setCurrentUser: (user: UserProfile | null) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  updateUserSettings: (settings: Partial<UserSettings>) => void
  addUserActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void
  addCoins: (amount: number) => void
  addXP: (amount: number) => void
  unlockAchievement: (achievement: Omit<UserAchievement, 'unlockedAt'>) => void
  setFactionScore: (scores: { seraphar: number; vorgaroth: number }) => void
  supportFaction: (faction: 'seraphar' | 'vorgaroth', amount?: number) => void
  logout: () => void
  openAuthModal: (mode: 'login' | 'register') => void
  closeAuthModal: () => void
  toggleSound: () => void
  toggleMenu: () => void
  toggleUserMenu: () => void
  setTelemetryPulse: (pulse: TelemetryPulse | ((prev: TelemetryPulse) => TelemetryPulse)) => void
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'de',
  emailNotifications: true,
  pushNotifications: true,
  showOnlineStatus: true,
  showPlaytime: true,
  showStats: true,
  allowFriendRequests: true,
  allowMessages: true,
  profileVisibility: 'public',
  casinoPopupsEnabled: true
}


export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      serverStats: {
        players: 0,
        maxPlayers: 200,
        status: 'offline',
        uptime: 0,
        fps: 0,
        entities: 0,
        sleepers: 0,
        queue: 0,
      },
      currentUser: null,
      userActivity: [],
      factionScore: { seraphar: 50, vorgaroth: 50 },
      isAuthModalOpen: false,
      authMode: 'login',
      isSoundEnabled: true,
      isMenuOpen: false,
      isUserMenuOpen: false,
      telemetryPulse: {
        heartbeat: 62,
        latency: 24,
        packetLoss: 0,
        lastUpdated: new Date().toISOString(),
        status: 'nominal',
        modules: [
          {
            id: 'weather',
            label: 'WeatherSynth',
            description: 'Aurora cloud seeding',
            status: 'online',
            value: 98,
            unit: '% sync',
            trend: 'steady'
          },
          {
            id: 'botnet',
            label: 'Bot Chatter',
            description: 'Neural NPC relay',
            status: 'syncing',
            value: 72,
            unit: 'msgs/min',
            trend: 'up'
          },
          {
            id: 'telemetry',
            label: 'Plugin Telemetry',
            description: 'Packet mirror',
            status: 'online',
            value: 1.4,
            unit: 'ms jitter',
            trend: 'down'
          }
        ]
      },

      setServerStats: (stats) => set({ serverStats: stats }),
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      updateUserProfile: (updates) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...updates }
          : null
      })),
      
      updateUserSettings: (settings) => set((state) => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, settings: { ...state.currentUser.settings, ...settings } }
          : null
      })),
      
      addUserActivity: (activity) => set((state) => ({
        userActivity: [
          { ...activity, id: Math.random().toString(36).substring(2), timestamp: new Date() },
          ...state.userActivity.slice(0, 49)
        ]
      })),
      
      addCoins: (amount) => set((state) => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, coins: state.currentUser.coins + amount }
          : null
      })),
      
      addXP: (amount) => set((state) => {
        if (!state.currentUser) return {}
        let newXP = state.currentUser.xp + amount
        let newLevel = state.currentUser.level
        let xpToNext = state.currentUser.xpToNextLevel
        
        while (newXP >= xpToNext) {
          newXP -= xpToNext
          newLevel++
          xpToNext = Math.floor(xpToNext * 1.15)
        }
        
        return {
          currentUser: {
            ...state.currentUser,
            xp: newXP,
            level: newLevel,
            xpToNextLevel: xpToNext
          }
        }
      }),
      
      unlockAchievement: (achievement) => set((state) => {
        if (!state.currentUser) return {}
        if (state.currentUser.achievements.some(a => a.id === achievement.id)) return {}
        
        return {
          currentUser: {
            ...state.currentUser,
            achievements: [...state.currentUser.achievements, { ...achievement, unlockedAt: new Date() }],
            totalAchievementPoints: state.currentUser.totalAchievementPoints + achievement.points
          }
        }
      }),

      setFactionScore: (scores) => set({ factionScore: scores }),

      supportFaction: (faction, amount = 1) => set((state) => {
        const delta = Math.max(1, Math.min(5, amount))
        const total = state.factionScore.seraphar + state.factionScore.vorgaroth + delta
        const clamp = (value: number) => Math.min(100, Math.max(0, value))
        if (faction === 'seraphar') {
          const ser = clamp(state.factionScore.seraphar + delta)
          const vor = clamp(100 - ser)
          return { factionScore: { seraphar: ser, vorgaroth: vor } }
        }
        const vor = clamp(state.factionScore.vorgaroth + delta)
        const ser = clamp(100 - vor)
        return { factionScore: { seraphar: ser, vorgaroth: vor } }
      }),
      
      logout: () => {
        void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
        set({ currentUser: null, userActivity: [], isUserMenuOpen: false })
      },
      
      openAuthModal: (mode) => set({ isAuthModalOpen: true, authMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      toggleUserMenu: () => set((state) => ({ isUserMenuOpen: !state.isUserMenuOpen })),
      setTelemetryPulse: (pulse) =>
        set((state) => ({
          telemetryPulse:
            typeof pulse === 'function' ? (pulse as (prev: TelemetryPulse) => TelemetryPulse)(state.telemetryPulse) : pulse
        }))
    }),
    {
      name: 'eldrun-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isSoundEnabled: state.isSoundEnabled,
        factionScore: state.factionScore,
      }),
      skipHydration: true
    }
  )
)

// Hydration hook - call this once in layout or app
export const useHydrateStore = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    useStore.persist.rehydrate()
    setHydrated(true)
  }, [])
  
  return hydrated
}

// Helper to fetch current user from API
export const fetchCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me')
    if (response.ok) {
      const data = await response.json()
      if (data.user) {
        useStore.getState().setCurrentUser(data.user)
        return data.user
      }
    }
    return null
  } catch (error) {
    import('@/lib/logger').then(({ log }) => {
      log.error('Failed to fetch user', { error: error instanceof Error ? error.message : 'Unknown error' }, 'AUTH')
    }).catch(() => {
      // Fallback if logger not available
      console.error('Failed to fetch user:', error)
    })
    return null
  }
}
