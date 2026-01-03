import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TradeStatus = 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ItemCategory = 'weapons' | 'armor' | 'resources' | 'components' | 'skins' | 'other'

export interface TradeItem {
  id: string
  name: string
  category: ItemCategory
  rarity: ItemRarity
  quantity: number
  image?: string
  description?: string
}

export interface TradeOffer {
  id: string
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  sellerRating: number
  
  // What the seller is offering
  offering: TradeItem[]
  
  // What the seller wants in return
  wanting: TradeItem[] | { type: 'coins'; amount: number }
  
  status: TradeStatus
  
  // Buyer info (when trade is accepted)
  buyerId?: string
  buyerName?: string
  
  // Escrow
  escrowActive: boolean
  escrowReleaseDate?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt?: string
  
  // Tags/Notes
  tags?: string[]
  notes?: string
}

export interface TradeHistory {
  id: string
  tradeId: string
  sellerId: string
  buyerId: string
  items: TradeItem[]
  price: number
  completedAt: string
}

interface TradingState {
  trades: TradeOffer[]
  history: TradeHistory[]
  
  // Actions
  createTrade: (trade: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'escrowActive'>) => TradeOffer
  updateTrade: (id: string, updates: Partial<TradeOffer>) => void
  deleteTrade: (id: string) => void
  acceptTrade: (id: string, buyerId: string, buyerName: string) => void
  completeTrade: (id: string) => void
  cancelTrade: (id: string) => void
  disputeTrade: (id: string) => void
  
  // Getters
  getTradeById: (id: string) => TradeOffer | undefined
  getTradesBySeller: (sellerId: string) => TradeOffer[]
  getActiveTradesByCategory: (category: ItemCategory) => TradeOffer[]
  getTradeHistory: (userId: string) => TradeHistory[]
  getActiveTradesCount: () => number
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      trades: [],
      history: [],

      createTrade: (tradeData) => {
        const newTrade: TradeOffer = {
          ...tradeData,
          id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          escrowActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          trades: [newTrade, ...state.trades]
        }))
        
        return newTrade
      },

      updateTrade: (id, updates) => {
        set((state) => ({
          trades: state.trades.map(t => 
            t.id === id 
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          )
        }))
      },

      deleteTrade: (id) => {
        set((state) => ({
          trades: state.trades.filter(t => t.id !== id)
        }))
      },

      acceptTrade: (id, buyerId, buyerName) => {
        set((state) => ({
          trades: state.trades.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status: 'pending' as TradeStatus,
                  buyerId,
                  buyerName,
                  escrowActive: true,
                  escrowReleaseDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h escrow
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      completeTrade: (id) => {
        const trade = get().trades.find(t => t.id === id)
        if (!trade || !trade.buyerId) return
        
        // Add to history
        const historyEntry: TradeHistory = {
          id: `history_${Date.now()}`,
          tradeId: id,
          sellerId: trade.sellerId,
          buyerId: trade.buyerId,
          items: trade.offering,
          price: typeof trade.wanting === 'object' && 'amount' in trade.wanting 
            ? trade.wanting.amount 
            : 0,
          completedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          trades: state.trades.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status: 'completed' as TradeStatus,
                  escrowActive: false,
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              : t
          ),
          history: [historyEntry, ...state.history]
        }))
      },

      cancelTrade: (id) => {
        set((state) => ({
          trades: state.trades.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status: 'cancelled' as TradeStatus,
                  escrowActive: false,
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      disputeTrade: (id) => {
        set((state) => ({
          trades: state.trades.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status: 'disputed' as TradeStatus,
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      getTradeById: (id) => get().trades.find(t => t.id === id),
      
      getTradesBySeller: (sellerId) => get().trades.filter(t => t.sellerId === sellerId),
      
      getActiveTradesByCategory: (category) => get().trades.filter(t => 
        t.status === 'active' && t.offering.some(item => item.category === category)
      ),
      
      getTradeHistory: (userId) => get().history.filter(h => 
        h.sellerId === userId || h.buyerId === userId
      ),
      
      getActiveTradesCount: () => get().trades.filter(t => t.status === 'active').length,
    }),
    {
      name: 'eldrun-trading-storage',
    }
  )
)

export default useTradingStore
