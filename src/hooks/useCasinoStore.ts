'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useStore } from '@/store/useStore'

export interface CasinoItem {
  id: string
  name: string
  image: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  value: number
}

export interface GameHistory {
  id: string
  game: string
  bet: number
  result: 'win' | 'lose'
  payout: number
  multiplier?: number
  timestamp: Date
}

export interface CoinflipGame {
  id: string
  creator: string
  creatorSide: 'gold' | 'silver'
  amount: number
  status: 'waiting' | 'playing' | 'finished'
  winner?: string
  opponent?: string
}

export interface JackpotRound {
  id: string
  players: { name: string; amount: number; color: string; chance: number }[]
  totalPot: number
  status: 'open' | 'spinning' | 'finished'
  winner?: string
  endTime?: number
}

export interface RouletteRound {
  id: string
  bets: { player: string; amount: number; color: 'red' | 'black' | 'green' }[]
  result?: number
  status: 'betting' | 'spinning' | 'finished'
  countdown: number
}

export interface CrashRound {
  id: string
  multiplier: number
  status: 'waiting' | 'running' | 'crashed'
  crashPoint?: number
  players: { name: string; bet: number; cashoutAt?: number; profit?: number }[]
}

export interface CasinoCase {
  id: string
  name: string
  price: number
  image: string
  items: { item: CasinoItem; chance: number }[]
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface CasinoState {
  balance: number
  totalWagered: number
  totalWon: number
  gamesPlayed: number
  history: GameHistory[]
  coinflipGames: CoinflipGame[]
  jackpotRound: JackpotRound | null
  rouletteRound: RouletteRound | null
  crashRound: CrashRound | null
  
  // Actions
  setBalance: (balance: number) => void
  loadState: () => Promise<void>
  addBalance: (amount: number) => void
  subtractBalance: (amount: number) => void
  addHistory: (entry: Omit<GameHistory, 'id' | 'timestamp'>) => void
  updateStats: (bet: number, won: number) => void
  
  // Coinflip
  createCoinflip: (amount: number, side: 'gold' | 'silver') => void
  joinCoinflip: (gameId: string) => void
  
  // Jackpot
  joinJackpot: (amount: number) => void
  
  // Roulette
  placeBet: (amount: number, color: 'red' | 'black' | 'green') => void
  
  // Crash
  placeCrashBet: (amount: number) => void
  cashoutCrash: () => void
}

const INITIAL_BALANCE = 0

async function adjustCasinoCoinsOnServer(
  delta: number
): Promise<{ ok: true; casinoCoins: number } | { ok: false; casinoCoins?: number; error: string }> {
  try {
    const res = await fetch('/api/casino/coins/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    })

    const data = (await res.json()) as { success?: boolean; casinoCoins?: number; error?: string }
    if (!res.ok || !data || data.success !== true || typeof data.casinoCoins !== 'number') {
      return {
        ok: false,
        casinoCoins: typeof data?.casinoCoins === 'number' ? data.casinoCoins : undefined,
        error: data?.error || 'Coins Update fehlgeschlagen',
      }
    }

    return { ok: true, casinoCoins: data.casinoCoins }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Coins Update fehlgeschlagen' }
  }
}

async function claimWelcomeBonus(): Promise<{ ok: true; casinoCoins: number } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/casino/welcome', { method: 'POST' })
    const data = (await res.json()) as { success?: boolean; casinoCoins?: number; error?: string }
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Welcome Bonus fehlgeschlagen' }
    }
    if (!data || data.success !== true || typeof data.casinoCoins !== 'number') {
      return { ok: false, error: data?.error || 'Welcome Bonus fehlgeschlagen' }
    }
    return { ok: true, casinoCoins: data.casinoCoins }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Welcome Bonus fehlgeschlagen' }
  }
}

async function fetchCasinoState(): Promise<
  | {
      ok: true
      casinoCoins: number
      casinoWelcomeClaimed: boolean
      stats: { totalWagered: number; totalWon: number; gamesPlayed: number }
      history: GameHistory[]
    }
  | { ok: false }
> {
  try {
    const res = await fetch('/api/casino/state', { method: 'GET' })
    if (!res.ok) return { ok: false }

    const data = (await res.json()) as {
      success?: boolean
      casinoCoins?: number
      casinoWelcomeClaimed?: boolean
      stats?: { totalWagered?: number; totalWon?: number; gamesPlayed?: number }
      history?: Array<{
        id: string
        game: string
        bet: number
        result: 'win' | 'lose'
        payout: number
        multiplier?: number
        timestamp: string | Date
      }>
    }

    if (
      !data ||
      data.success !== true ||
      typeof data.casinoCoins !== 'number' ||
      typeof data.casinoWelcomeClaimed !== 'boolean' ||
      !data.stats
    )
      return { ok: false }

    const history: GameHistory[] = (data.history || []).map((h) => ({
      id: h.id,
      game: h.game,
      bet: h.bet,
      result: h.result,
      payout: h.payout,
      multiplier: h.multiplier,
      timestamp: new Date(h.timestamp),
    }))

    return {
      ok: true,
      casinoCoins: data.casinoCoins,
      casinoWelcomeClaimed: data.casinoWelcomeClaimed,
      stats: {
        totalWagered: Number(data.stats.totalWagered || 0),
        totalWon: Number(data.stats.totalWon || 0),
        gamesPlayed: Number(data.stats.gamesPlayed || 0),
      },
      history,
    }
  } catch {
    return { ok: false }
  }
}

async function recordCasinoGame(entry: Omit<GameHistory, 'id' | 'timestamp'>): Promise<
  | {
      ok: true
      stats: { totalWagered: number; totalWon: number; totalLost: number; gamesPlayed: number }
    }
  | { ok: false }
> {
  try {
    const res = await fetch('/api/casino/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game: entry.game,
        betAmount: entry.bet,
        result: entry.result,
        payout: entry.payout,
        multiplier: entry.multiplier || 0,
      }),
    })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as { success?: boolean; stats?: any }
    if (!data || data.success !== true || !data.stats) return { ok: false }
    return {
      ok: true,
      stats: {
        totalWagered: Number(data.stats.totalWagered || 0),
        totalWon: Number(data.stats.totalWon || 0),
        totalLost: Number(data.stats.totalLost || 0),
        gamesPlayed: Number(data.stats.gamesPlayed || 0),
      },
    }
  } catch {
    return { ok: false }
  }
}

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => {
      return {
        balance: INITIAL_BALANCE,
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
        history: [],
        coinflipGames: [],
        jackpotRound: null,
        rouletteRound: null,
        crashRound: null,
        
        setBalance: (balance) => set({ balance }),

        loadState: async () => {
          const user = useStore.getState().currentUser
          if (!user) return

          // Ensure one-time welcome bonus is claimed server-side.
          await claimWelcomeBonus().catch(() => undefined)
          const state = await fetchCasinoState()
          if (!state.ok) return

          useStore.getState().updateUserProfile({ casinoCoins: state.casinoCoins })
          set({
            balance: state.casinoCoins,
            totalWagered: state.stats.totalWagered,
            totalWon: state.stats.totalWon,
            gamesPlayed: state.stats.gamesPlayed,
            history: state.history,
          })
        },
        
        addBalance: (amount) => {
          const user = useStore.getState().currentUser
          if (!user || amount <= 0) return

          const prev = get().balance
          set({ balance: prev + amount })

          void adjustCasinoCoinsOnServer(amount).then((result) => {
            if (result.ok) {
              useStore.getState().updateUserProfile({ casinoCoins: result.casinoCoins })
              set({ balance: result.casinoCoins })
              return
            }
            if (typeof result.casinoCoins === 'number') {
              useStore.getState().updateUserProfile({ casinoCoins: result.casinoCoins })
              set({ balance: result.casinoCoins })
              return
            }
            set({ balance: prev })
          })
        },
        
        subtractBalance: (amount) => {
          const user = useStore.getState().currentUser
          if (!user || amount <= 0) return

          const state = get()
          if (state.balance < amount) return

          const prev = state.balance
          set({ balance: Math.max(0, prev - amount) })

          void adjustCasinoCoinsOnServer(-amount).then((result) => {
            if (result.ok) {
              useStore.getState().updateUserProfile({ casinoCoins: result.casinoCoins })
              set({ balance: result.casinoCoins })
              return
            }
            if (typeof result.casinoCoins === 'number') {
              useStore.getState().updateUserProfile({ casinoCoins: result.casinoCoins })
              set({ balance: result.casinoCoins })
              return
            }
            set({ balance: prev })
          })
        },
        
        addHistory: (entry) => {
          const user = useStore.getState().currentUser
          if (!user) return

          set((state) => ({
            history: [
              {
                ...entry,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
              },
              ...state.history,
            ].slice(0, 100),
          }))

          void recordCasinoGame(entry).then((res) => {
            if (!res.ok) return
            set({
              totalWagered: res.stats.totalWagered,
              totalWon: res.stats.totalWon,
              gamesPlayed: res.stats.gamesPlayed,
            })
          })
        },
        
        updateStats: () => {
          // Stats are server-backed via /api/casino/record
        },
        
        createCoinflip: (amount, side) => {
          const state = get()
          if (state.balance < amount) return
          
          const game: CoinflipGame = {
            id: `cf-${Date.now()}`,
            creator: 'You',
            creatorSide: side,
            amount,
            status: 'waiting'
          }

          get().subtractBalance(amount)
          set((state) => ({
            coinflipGames: [...state.coinflipGames, game]
          }))
        },
        
        joinCoinflip: (gameId) => {
          const state = get()
          const game = state.coinflipGames.find(g => g.id === gameId)
          if (!game || state.balance < game.amount) return
          
          const winner = Math.random() > 0.5 ? 'creator' : 'opponent'
          const won = winner === 'opponent' ? game.amount * 2 : 0

          get().subtractBalance(game.amount)
          if (won > 0) get().addBalance(won)

          set((state) => ({
            coinflipGames: state.coinflipGames.filter(g => g.id !== gameId)
          }))
          
          get().addHistory({
            game: 'Coinflip',
            bet: game.amount,
            result: won > 0 ? 'win' : 'lose',
            payout: won,
            multiplier: 2
          })
          
          get().updateStats(game.amount, won)
        },
        
        joinJackpot: (amount) => {
          const state = get()
          if (state.balance < amount) return
          get().subtractBalance(amount)
        },
        
        placeBet: (amount, color) => {
          const state = get()
          if (state.balance < amount) return
          get().subtractBalance(amount)
        },
        
        placeCrashBet: (amount) => {
          const state = get()
          if (state.balance < amount) return
          get().subtractBalance(amount)
        },
        
        cashoutCrash: () => {
          // Implemented in game component
        }
      }
    },
    {
      name: 'eldrun-casino-storage',
      partialize: (state) => ({
        totalWagered: state.totalWagered,
        totalWon: state.totalWon,
        gamesPlayed: state.gamesPlayed,
        history: state.history,
        coinflipGames: state.coinflipGames,
        jackpotRound: state.jackpotRound,
        rouletteRound: state.rouletteRound,
        crashRound: state.crashRound,
      })
    }
  )
)

// Casino Items Database
export const CASINO_ITEMS: CasinoItem[] = [
  { id: 'ak47', name: 'AK-47', image: '🔫', rarity: 'rare', value: 500 },
  { id: 'bolt', name: 'Bolt Action', image: '🎯', rarity: 'epic', value: 800 },
  { id: 'rocket', name: 'Rocket Launcher', image: '🚀', rarity: 'legendary', value: 2000 },
  { id: 'c4', name: 'C4 Explosiv', image: '💣', rarity: 'epic', value: 600 },
  { id: 'metal_armor', name: 'Metall-Rüstung', image: '🛡️', rarity: 'rare', value: 400 },
  { id: 'hazmat', name: 'Hazmat Suit', image: '☢️', rarity: 'uncommon', value: 150 },
  { id: 'thompson', name: 'Thompson', image: '🔫', rarity: 'rare', value: 350 },
  { id: 'lr300', name: 'LR-300', image: '🔫', rarity: 'epic', value: 700 },
  { id: 'mp5', name: 'MP5A4', image: '🔫', rarity: 'rare', value: 400 },
  { id: 'sulfur', name: 'Sulfur (1000)', image: '⚗️', rarity: 'common', value: 100 },
  { id: 'scrap', name: 'Scrap (500)', image: '⚙️', rarity: 'common', value: 50 },
  { id: 'hqm', name: 'HQM (100)', image: '🔩', rarity: 'uncommon', value: 200 },
  { id: 'dragon_mask', name: 'Dragon Mask', image: '🐉', rarity: 'mythic', value: 5000 },
  { id: 'glory_ak', name: 'Glory AK', image: '✨', rarity: 'mythic', value: 8000 },
  { id: 'tempered_ak', name: 'Tempered AK', image: '🔥', rarity: 'legendary', value: 3000 },
]

// Casino Cases
export const CASINO_CASES: CasinoCase[] = [
  {
    id: 'starter',
    name: 'Starter Case',
    price: 100,
    image: '📦',
    rarity: 'common',
    items: [
      { item: CASINO_ITEMS.find(i => i.id === 'scrap')!, chance: 40 },
      { item: CASINO_ITEMS.find(i => i.id === 'sulfur')!, chance: 30 },
      { item: CASINO_ITEMS.find(i => i.id === 'hazmat')!, chance: 20 },
      { item: CASINO_ITEMS.find(i => i.id === 'thompson')!, chance: 10 },
    ]
  },
  {
    id: 'weapon',
    name: 'Weapon Case',
    price: 500,
    image: '🎁',
    rarity: 'rare',
    items: [
      { item: CASINO_ITEMS.find(i => i.id === 'thompson')!, chance: 35 },
      { item: CASINO_ITEMS.find(i => i.id === 'mp5')!, chance: 30 },
      { item: CASINO_ITEMS.find(i => i.id === 'ak47')!, chance: 20 },
      { item: CASINO_ITEMS.find(i => i.id === 'bolt')!, chance: 10 },
      { item: CASINO_ITEMS.find(i => i.id === 'lr300')!, chance: 5 },
    ]
  },
  {
    id: 'military',
    name: 'Military Case',
    price: 1000,
    image: '🪖',
    rarity: 'epic',
    items: [
      { item: CASINO_ITEMS.find(i => i.id === 'ak47')!, chance: 30 },
      { item: CASINO_ITEMS.find(i => i.id === 'lr300')!, chance: 25 },
      { item: CASINO_ITEMS.find(i => i.id === 'bolt')!, chance: 20 },
      { item: CASINO_ITEMS.find(i => i.id === 'c4')!, chance: 15 },
      { item: CASINO_ITEMS.find(i => i.id === 'rocket')!, chance: 10 },
    ]
  },
  {
    id: 'legendary',
    name: 'Legendary Case',
    price: 2500,
    image: '👑',
    rarity: 'legendary',
    items: [
      { item: CASINO_ITEMS.find(i => i.id === 'bolt')!, chance: 25 },
      { item: CASINO_ITEMS.find(i => i.id === 'rocket')!, chance: 25 },
      { item: CASINO_ITEMS.find(i => i.id === 'tempered_ak')!, chance: 25 },
      { item: CASINO_ITEMS.find(i => i.id === 'dragon_mask')!, chance: 15 },
      { item: CASINO_ITEMS.find(i => i.id === 'glory_ak')!, chance: 10 },
    ]
  },
]
