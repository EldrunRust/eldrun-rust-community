'use client'

import { UserProfile, ActivityItem } from '@/store/useStore'

export const mockServerStats = {
  players: 182,
  maxPlayers: 200,
  status: 'online' as const,
  uptime: 98.7,
  fps: 244,
  entities: 32500,
  sleepers: 43,
  queue: 7,
}

export const mockFactionScores = {
  seraphar: 52,
  vorgaroth: 48,
}

export const mockUser: UserProfile = {
  id: 'demo-sireldrun',
  username: 'SirEldrun',
  displayName: 'SirEldrun',
  email: 'sir@eldrun.lol',
  avatar: '/images/logo.png',
  banner: '/images/hero-bg.svg',
  bio: 'Fraktionskommandant, Artefaktjäger und Gastgeber des Eldrun-Castle Cups.',
  steamId: 'STEAM_0:1:123456',
  discordId: 'sireldrun#0001',
  role: 'admin',
  faction: 'seraphar',
  playerClass: 'krieger',
  level: 87,
  xp: 12450,
  xpToNextLevel: 18000,
  prestige: 2,
  playtime: 2456,
  kills: 14234,
  deaths: 3123,
  kd: 4.56,
  headshots: 5234,
  longestKillStreak: 47,
  totalDamageDealt: 987654,
  coins: 420_000,
  casinoCoins: 125_000,
  totalWagered: 2_450_000,
  totalWon: 2_870_000,
  friends: ['ShadowHunter', 'NightStalker', 'PhoenixRising'],
  blockedUsers: [],
  guildId: 'guild-phoenix',
  guildRole: 'leader',
  achievements: [],
  totalAchievementPoints: 1240,
  lastOnline: new Date(),
  joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
  isOnline: true,
  currentServer: 'play.eldrun.lol',
  settings: {
    theme: 'dark',
    language: 'de',
    emailNotifications: false,
    pushNotifications: false,
    showOnlineStatus: true,
    showPlaytime: true,
    showStats: true,
    allowFriendRequests: true,
    allowMessages: true,
    profileVisibility: 'public',
    casinoPopupsEnabled: true,
  },
  location: 'Eldrun Castle',
  website: 'https://eldrun.lol',
  birthday: '1998-01-01',
  occupation: 'Commander',
  interests: ['Castle Raids', 'Stormwall Events', 'Arena Duelle'],
  favoriteGame: 'Rust',
  motto: 'Ehre den Fraktionen, verteidige das Artefakt.',
  profileTheme: 'seraphar-glow',
  featuredBadge: 'artifact-holder',
  socialLinks: {
    discord: 'https://discord.gg/eldrun',
    twitch: 'https://twitch.tv/sireldrun',
  },
}

export const mockActivities: Array<Omit<ActivityItem, 'id' | 'timestamp'>> = [
  {
    type: 'achievement',
    message: 'hat das Artefakt 12 Minuten lang verteidigt und den Titel „Crown Guard“ erhalten.',
    data: { reward: '+2500 Honor' },
  },
  {
    type: 'kill',
    message: 'hat in der Arena ein 5er-Streak hingelegt.',
    data: { streak: 5, location: 'Arena District' },
  },
  {
    type: 'casino_win',
    message: 'hat im Casino die Lightning-Roulette für 125.000 Coins gewonnen.',
    data: { game: 'roulette', payout: 125000 },
  },
  {
    type: 'purchase',
    message: 'kaufte das „Legendary Castle Skin“ im Shop.',
    data: { item: 'Legendary Castle Skin', price: 48000 },
  },
  {
    type: 'join',
    message: 'hat den Fraktionskrieg-Voice-Channel betreten.',
  },
]

export const activityPool: Array<Omit<ActivityItem, 'id' | 'timestamp'>> = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 🗺️ MAP RELEASE CELEBRATION ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════════
  { type: 'achievement', message: '🗺️ erkundet die neue ELDRUN MAP! 4 Inseln entdeckt!', data: { reward: '+5000 Coins' } },
  { type: 'join', message: '🎉 feiert den MAP RELEASE im Chat! MEILENSTEIN!', data: { event: 'map_release' } },
  { type: 'achievement', message: '🏛️ entdeckte das West Coast Casino auf der neuen Map!', data: { reward: '+2000 Honor' } },
  { type: 'kill', message: '⚔️ besiegte Bradley in der neuen Bradley Arena!', data: { boss: 'Bradley Tank' } },
  { type: 'achievement', message: '🚂 fuhr alle 6 Skytrain Stationen ab! Achievement freigeschaltet!', data: { reward: '+3000 Coins' } },
  { type: 'join', message: '🌴 erkundet das Jungle-Biom (33% der Map)!', data: { biome: 'jungle' } },
  { type: 'achievement', message: '❄️ überlebte die Arctic Zone! 20% der Map erforscht!', data: { reward: '+1500 Honor' } },
  { type: 'purchase', message: '🗺️ kaufte den „Map Explorer Kit" zur Feier des Releases!', data: { item: 'Map Explorer Kit', price: 25000 } },
  { type: 'achievement', message: '🏝️ entdeckte alle 4 Inseln der ELDRUN Map!', data: { reward: '+10000 Coins' } },
  { type: 'join', message: '🎨 besuchte die Art Gallery - eines von 19 Custom Monuments!' },
  { type: 'achievement', message: '🍔 fand alle 4 Diner auf der Map! Hungry Explorer!', data: { reward: '+800 Honor' } },
  { type: 'kill', message: '🦇 erkundete beide Höhlen und besiegte die Cave Dwellers!', data: { caves: 2 } },
  // ═══════════════════════════════════════════════════════════════════════════
  // STANDARD ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════════
  { type: 'kill', message: 'legte einen 3er-Streak in der Arena hin.', data: { streak: 3 } },
  { type: 'kill', message: 'landete einen Headshot bei „DarkReaper“ auf 220m.', data: { distance: 220 } },
  { type: 'achievement', message: 'schaltete das Achievement „Stormwall Survivor“ frei.', data: { reward: '+500 Honor' } },
  { type: 'purchase', message: 'kaufte das „Vorgaroth Shadow Kit“ im Shop.', data: { item: 'Shadow Kit', price: 32000 } },
  { type: 'casino_win', message: 'gewann 45.000 Coins in der Crash-Runde x3.2.', data: { game: 'crash', payout: 45000 } },
  { type: 'level_up', message: 'stieg auf Level 88 auf.', data: { level: 88 } },
  { type: 'join', message: 'trat der Gilde „Phoenix Rising“ bei.' },
  { type: 'leave', message: 'verließ die Arena nach einem Bosskill.' },
  { type: 'achievement', message: 'schaltete „Castle Defender“ frei (10 erfolgreiche Verteidigungen).', data: { reward: '+1200 Coins' } },
  { type: 'purchase', message: 'kaufte „Lightning Portal Skin“ für das Portal-Event.', data: { item: 'Lightning Portal Skin', price: 15000 } },
  { type: 'kill', message: 'beendete den Boss „Storm Sentinel“ mit der letzten Rakete.', data: { boss: 'Storm Sentinel' } },
  { type: 'kill', message: 'legte einen 7er-Streak beim Fraktionskrieg hin.', data: { streak: 7, location: 'Artifact Island' } },
  { type: 'achievement', message: 'erhielt den Titel „Portal Runner“ (5 Portale in Folge).', data: { reward: '+800 Honor' } },
  { type: 'casino_win', message: 'traf die Lightning-Roulette 21 – x14 für 70.000 Coins.', data: { game: 'roulette', payout: 70000 } },
  { type: 'purchase', message: 'kaufte das „Seraphar Banner“ für die Basisdekoration.', data: { item: 'Seraphar Banner', price: 9000 } },
  { type: 'join', message: 'startete ein LFG für „Eternal Trial“ (Arena Event).' },
  { type: 'leave', message: 'verließ den Voice-Channel nach dem Castle-Defense-Sieg.' },
  { type: 'level_up', message: 'stieg auf Prestige 3 – Bonus: +5% Honor Gain.', data: { prestige: 3 } },
  { type: 'purchase', message: 'kaufte „Frost Wyrm Bait“ für den Frozen Valley Boss.', data: { item: 'Frost Wyrm Bait', price: 18000 } },
  { type: 'achievement', message: 'verdiente das Badge „No-Respawn Raid“ (keine Tode).', data: { reward: '+1500 Coins' } },
]
