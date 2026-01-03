// Casino Player Types and Game Configuration
// Real player data is fetched from the database via API

import { RUST_SKINS, RustSkin, getRandomSkin, SkinRarity } from './rustSkins'

export interface CasinoPlayer {
  id: string
  name: string
  avatar: string
  level: number
  faction: 'seraphar' | 'vorgaroth' | null
  vip: boolean
  totalWagered: number
  biggestWin: number
  playStyle: 'aggressive' | 'conservative' | 'whale' | 'casual' | 'lucky' | 'unlucky'
}

// 50+ realistische Spielernamen
export const CASINO_PLAYERS: CasinoPlayer[] = [
  // Whales - Big Spenders
  { id: 'whale1', name: 'xX_DragonSlayer_Xx', avatar: '🐉', level: 87, faction: 'vorgaroth', vip: true, totalWagered: 2500000, biggestWin: 450000, playStyle: 'whale' },
  { id: 'whale2', name: 'RichKidRust', avatar: '💎', level: 95, faction: 'seraphar', vip: true, totalWagered: 3200000, biggestWin: 680000, playStyle: 'whale' },
  { id: 'whale3', name: 'MoneyPrinter420', avatar: '💰', level: 78, faction: null, vip: true, totalWagered: 1800000, biggestWin: 320000, playStyle: 'whale' },
  
  // Aggressive Players
  { id: 'agg1', name: 'AllInAndy', avatar: '🎰', level: 45, faction: 'vorgaroth', vip: false, totalWagered: 450000, biggestWin: 125000, playStyle: 'aggressive' },
  { id: 'agg2', name: 'BetMax_or_Die', avatar: '💀', level: 52, faction: 'seraphar', vip: false, totalWagered: 380000, biggestWin: 95000, playStyle: 'aggressive' },
  { id: 'agg3', name: 'YoloBets', avatar: '🔥', level: 38, faction: null, vip: false, totalWagered: 290000, biggestWin: 78000, playStyle: 'aggressive' },
  { id: 'agg4', name: 'NoRiskNoFun', avatar: '⚡', level: 61, faction: 'seraphar', vip: true, totalWagered: 560000, biggestWin: 145000, playStyle: 'aggressive' },
  
  // Conservative Players
  { id: 'con1', name: 'SafeBetSam', avatar: '🛡️', level: 42, faction: 'vorgaroth', vip: false, totalWagered: 120000, biggestWin: 35000, playStyle: 'conservative' },
  { id: 'con2', name: 'SlowAndSteady', avatar: '🐢', level: 56, faction: 'seraphar', vip: false, totalWagered: 180000, biggestWin: 42000, playStyle: 'conservative' },
  { id: 'con3', name: 'CalculatedRisk', avatar: '🧮', level: 67, faction: 'seraphar', vip: true, totalWagered: 250000, biggestWin: 68000, playStyle: 'conservative' },
  
  // Lucky Players
  { id: 'luck1', name: 'LuckyLuke777', avatar: '🍀', level: 34, faction: null, vip: false, totalWagered: 95000, biggestWin: 180000, playStyle: 'lucky' },
  { id: 'luck2', name: 'FortuneFinder', avatar: '⭐', level: 29, faction: 'seraphar', vip: false, totalWagered: 78000, biggestWin: 156000, playStyle: 'lucky' },
  { id: 'luck3', name: 'BornWinner', avatar: '🎯', level: 41, faction: 'vorgaroth', vip: false, totalWagered: 145000, biggestWin: 234000, playStyle: 'lucky' },
  { id: 'luck4', name: 'JackpotJenny', avatar: '👸', level: 53, faction: 'vorgaroth', vip: true, totalWagered: 210000, biggestWin: 380000, playStyle: 'lucky' },
  
  // Unlucky Players
  { id: 'unluck1', name: 'AlwaysLosing', avatar: '😢', level: 28, faction: null, vip: false, totalWagered: 340000, biggestWin: 15000, playStyle: 'unlucky' },
  { id: 'unluck2', name: 'BadLuckBrian', avatar: '🤦', level: 35, faction: 'seraphar', vip: false, totalWagered: 420000, biggestWin: 22000, playStyle: 'unlucky' },
  { id: 'unluck3', name: 'CursedGambler', avatar: '💔', level: 44, faction: 'vorgaroth', vip: false, totalWagered: 280000, biggestWin: 18000, playStyle: 'unlucky' },
  
  // Casual Players
  { id: 'cas1', name: 'JustForFun', avatar: '😎', level: 23, faction: 'seraphar', vip: false, totalWagered: 45000, biggestWin: 12000, playStyle: 'casual' },
  { id: 'cas2', name: 'ChillGamer99', avatar: '🎮', level: 31, faction: null, vip: false, totalWagered: 62000, biggestWin: 18000, playStyle: 'casual' },
  { id: 'cas3', name: 'WeekendWarrior', avatar: '🍺', level: 27, faction: 'vorgaroth', vip: false, totalWagered: 38000, biggestWin: 9500, playStyle: 'casual' },
  { id: 'cas4', name: 'NightOwl_', avatar: '🦉', level: 36, faction: 'seraphar', vip: false, totalWagered: 55000, biggestWin: 14000, playStyle: 'casual' },
  { id: 'cas5', name: 'CoffeeBets', avatar: '☕', level: 19, faction: null, vip: false, totalWagered: 28000, biggestWin: 7500, playStyle: 'casual' },
  
  // German Names
  { id: 'de1', name: 'DerZocker', avatar: '🇩🇪', level: 48, faction: 'seraphar', vip: false, totalWagered: 175000, biggestWin: 45000, playStyle: 'aggressive' },
  { id: 'de2', name: 'SchnitzelKing', avatar: '🥨', level: 39, faction: 'vorgaroth', vip: false, totalWagered: 92000, biggestWin: 28000, playStyle: 'casual' },
  { id: 'de3', name: 'BierUndSpiel', avatar: '🍻', level: 55, faction: 'vorgaroth', vip: true, totalWagered: 320000, biggestWin: 95000, playStyle: 'conservative' },
  { id: 'de4', name: 'NachtSpieler', avatar: '🌙', level: 42, faction: null, vip: false, totalWagered: 145000, biggestWin: 38000, playStyle: 'aggressive' },
  
  // More varied names
  { id: 'var1', name: 'CryptoRust', avatar: '₿', level: 72, faction: 'seraphar', vip: true, totalWagered: 890000, biggestWin: 245000, playStyle: 'whale' },
  { id: 'var2', name: 'SkinCollector', avatar: '🎨', level: 58, faction: 'seraphar', vip: true, totalWagered: 450000, biggestWin: 120000, playStyle: 'conservative' },
  { id: 'var3', name: 'BaseBuilder42', avatar: '🏰', level: 65, faction: 'vorgaroth', vip: false, totalWagered: 230000, biggestWin: 67000, playStyle: 'casual' },
  { id: 'var4', name: 'HeadshotKing', avatar: '🎯', level: 81, faction: 'seraphar', vip: true, totalWagered: 680000, biggestWin: 195000, playStyle: 'aggressive' },
  { id: 'var5', name: 'RustVeteran', avatar: '⚔️', level: 92, faction: 'seraphar', vip: true, totalWagered: 1200000, biggestWin: 340000, playStyle: 'whale' },
  { id: 'var6', name: 'NakedRunner', avatar: '🏃', level: 15, faction: null, vip: false, totalWagered: 18000, biggestWin: 4500, playStyle: 'casual' },
  { id: 'var7', name: 'RaidMaster', avatar: '💣', level: 74, faction: 'vorgaroth', vip: true, totalWagered: 520000, biggestWin: 148000, playStyle: 'aggressive' },
  { id: 'var8', name: 'FarmingSimulator', avatar: '🌾', level: 33, faction: 'vorgaroth', vip: false, totalWagered: 67000, biggestWin: 19000, playStyle: 'conservative' },
  { id: 'var9', name: 'OilRigRunner', avatar: '🛢️', level: 68, faction: 'seraphar', vip: false, totalWagered: 345000, biggestWin: 98000, playStyle: 'aggressive' },
  { id: 'var10', name: 'ScrapDealer', avatar: '♻️', level: 46, faction: null, vip: false, totalWagered: 156000, biggestWin: 42000, playStyle: 'conservative' },
  
  // More players for variety
  { id: 'extra1', name: 'MidnightGambler', avatar: '🌃', level: 51, faction: 'seraphar', vip: false, totalWagered: 198000, biggestWin: 56000, playStyle: 'aggressive' },
  { id: 'extra2', name: 'SunriseSpins', avatar: '🌅', level: 37, faction: 'vorgaroth', vip: false, totalWagered: 87000, biggestWin: 24000, playStyle: 'casual' },
  { id: 'extra3', name: 'ThunderBolt99', avatar: '⚡', level: 63, faction: 'vorgaroth', vip: true, totalWagered: 410000, biggestWin: 112000, playStyle: 'aggressive' },
  { id: 'extra4', name: 'SilentSniper', avatar: '🔇', level: 77, faction: 'seraphar', vip: true, totalWagered: 590000, biggestWin: 167000, playStyle: 'conservative' },
  { id: 'extra5', name: 'ChaosTheory', avatar: '🌀', level: 44, faction: null, vip: false, totalWagered: 134000, biggestWin: 78000, playStyle: 'lucky' },
  { id: 'extra6', name: 'OrderOfRust', avatar: '📜', level: 59, faction: 'seraphar', vip: false, totalWagered: 267000, biggestWin: 73000, playStyle: 'conservative' },
  { id: 'extra7', name: 'WildCard_X', avatar: '🃏', level: 49, faction: 'vorgaroth', vip: false, totalWagered: 178000, biggestWin: 89000, playStyle: 'lucky' },
  { id: 'extra8', name: 'IronWill', avatar: '🦾', level: 71, faction: 'vorgaroth', vip: true, totalWagered: 480000, biggestWin: 134000, playStyle: 'aggressive' },
]

// Game types for activity generation
export type CasinoGame = 'coinflip' | 'jackpot' | 'roulette' | 'crash' | 'cases' | 'mines' | 'dice' | 'wheel' | 'blackjack' | 'slots'

export const GAME_NAMES: Record<CasinoGame, string> = {
  coinflip: 'Coinflip',
  jackpot: 'Jackpot',
  roulette: 'Roulette',
  crash: 'Crash',
  cases: 'Cases',
  mines: 'Mines',
  dice: 'Dice',
  wheel: 'Wheel',
  blackjack: 'Blackjack',
  slots: 'Slots'
}

// Activity types
export type ActivityType = 
  | 'win' | 'loss' | 'big_win' | 'jackpot' | 'skin_win' 
  | 'multiplier' | 'streak' | 'case_open' | 'rare_drop'
  | 'bust' | 'close_call' | 'comeback' | 'disaster'

export interface CasinoActivity {
  id: string
  player: CasinoPlayer
  game: CasinoGame
  type: ActivityType
  amount: number
  multiplier?: number
  skin?: RustSkin
  timestamp: Date
  message: string
  isSpecial: boolean
}

// Helper to get random player
export function getRandomPlayer(): CasinoPlayer {
  return CASINO_PLAYERS[Math.floor(Math.random() * CASINO_PLAYERS.length)]
}

// Helper to get player by play style
export function getPlayerByStyle(style: CasinoPlayer['playStyle']): CasinoPlayer {
  const players = CASINO_PLAYERS.filter(p => p.playStyle === style)
  return players[Math.floor(Math.random() * players.length)]
}

// Generate bet amount based on player style
export function generateBetAmount(player: CasinoPlayer): number {
  const baseBets = {
    whale: [50000, 100000, 250000, 500000, 1000000],
    aggressive: [5000, 10000, 25000, 50000, 100000],
    conservative: [1000, 2500, 5000, 7500, 10000],
    casual: [500, 1000, 2500, 5000, 10000],
    lucky: [2500, 5000, 10000, 25000, 50000],
    unlucky: [5000, 10000, 25000, 50000, 75000]
  }
  const bets = baseBets[player.playStyle]
  return bets[Math.floor(Math.random() * bets.length)]
}

// Generate win/loss based on player style
export function generateOutcome(player: CasinoPlayer): { won: boolean; multiplier: number } {
  const winChances = {
    whale: 0.48,
    aggressive: 0.45,
    conservative: 0.52,
    casual: 0.48,
    lucky: 0.65,
    unlucky: 0.30
  }
  
  const won = Math.random() < winChances[player.playStyle]
  
  // Generate multiplier
  let multiplier = 1
  if (won) {
    const rand = Math.random()
    if (rand < 0.6) multiplier = 1.5 + Math.random() * 0.5 // 1.5x - 2x
    else if (rand < 0.85) multiplier = 2 + Math.random() * 3 // 2x - 5x
    else if (rand < 0.95) multiplier = 5 + Math.random() * 10 // 5x - 15x
    else if (rand < 0.99) multiplier = 15 + Math.random() * 35 // 15x - 50x
    else multiplier = 50 + Math.random() * 450 // 50x - 500x (MEGA WIN)
  }
  
  return { won, multiplier }
}

// Special event messages
export const SPECIAL_MESSAGES = {
  big_win: [
    '🎉 MEGA WIN!',
    '💰 RIESIGER GEWINN!',
    '🔥 UNFASSBAR!',
    '⭐ LEGENDÄR!',
    '👑 KÖNIGLICHER GEWINN!'
  ],
  jackpot: [
    '🏆 JACKPOT GEWONNEN!',
    '💎 DER GROSSE POT!',
    '🎰 JACKPOT ALERT!',
    '⚡ HAUPTGEWINN!'
  ],
  rare_drop: [
    '💎 SELTENER DROP!',
    '🌟 EPISCHER FUND!',
    '✨ LEGENDÄRER SKIN!',
    '🔮 CONTRABAND!'
  ],
  disaster: [
    '💀 ALLES VERLOREN!',
    '😱 TOTALVERLUST!',
    '🔥 VERBRANNT!',
    '💔 VERNICHTET!'
  ],
  streak: [
    '🔥 WINSTREAK x',
    '⚡ HEISSE SERIE!',
    '🎯 NICHT ZU STOPPEN!'
  ],
  close_call: [
    '😅 KNAPP ENTKOMMEN!',
    '💦 DAS WAR KNAPP!',
    '🎭 GERADE NOCH!'
  ],
  comeback: [
    '📈 COMEBACK!',
    '🔄 ZURÜCK IM SPIEL!',
    '💪 NIEMALS AUFGEBEN!'
  ]
}

// Generate activity message
export function generateActivityMessage(
  player: CasinoPlayer, 
  game: CasinoGame, 
  type: ActivityType, 
  amount: number,
  multiplier?: number,
  skin?: RustSkin
): string {
  const gameName = GAME_NAMES[game]
  
  switch (type) {
    case 'big_win':
      return `${player.name} gewinnt ${amount.toLocaleString()} Coins bei ${gameName}! ${multiplier ? `(${multiplier.toFixed(2)}x)` : ''}`
    case 'jackpot':
      return `🏆 ${player.name} holt den ${gameName} JACKPOT: ${amount.toLocaleString()} Coins!`
    case 'skin_win':
      return `${player.name} gewinnt ${skin?.name} (${skin?.price.toLocaleString()} Coins) bei ${gameName}!`
    case 'rare_drop':
      return `💎 ${player.name} droppt ${skin?.name} aus einer Case!`
    case 'win':
      return `${player.name} gewinnt ${amount.toLocaleString()} bei ${gameName}`
    case 'loss':
      return `${player.name} verliert ${amount.toLocaleString()} bei ${gameName}`
    case 'bust':
      return `💥 ${player.name} bustet bei ${gameName} - ${amount.toLocaleString()} weg!`
    case 'disaster':
      return `😱 ${player.name} verliert ALLES: ${amount.toLocaleString()} Coins!`
    case 'streak':
      return `🔥 ${player.name} hat eine ${multiplier}-Win-Streak bei ${gameName}!`
    case 'multiplier':
      return `${player.name} casht bei ${multiplier?.toFixed(2)}x aus - ${amount.toLocaleString()} Gewinn!`
    case 'close_call':
      return `😅 ${player.name} entkommt knapp mit ${amount.toLocaleString()} bei ${gameName}!`
    case 'comeback':
      return `📈 ${player.name} macht ein Comeback: +${amount.toLocaleString()} Coins!`
    default:
      return `${player.name} spielt ${gameName}`
  }
}
