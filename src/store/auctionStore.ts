import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Eldrun Auction demo seeds
const DEMO_SELLERS = [
  { id: 'seller_trade', name: 'TradeBaron', avatar: '/images/avatars/trade-baron.jpg', rating: 4.9 },
  { id: 'seller_rynn', name: 'AuctioneerRynn', avatar: '/images/avatars/auctioneer-rynn.jpg', rating: 4.7 },
  { id: 'seller_guild', name: 'GuildBanker', avatar: '/images/avatars/guild-banker.jpg', rating: 4.8 },
  { id: 'seller_shadow', name: 'ShadowOps', avatar: '/images/avatars/shadow-ops.jpg', rating: 4.6 },
]

const DEMO_BIDDERS = [
  { id: 'bid_seraph', name: 'SerapharCaptain', avatar: '/images/avatars/seraphar-captain.jpg' },
  { id: 'bid_vorg', name: 'VorgarothShade', avatar: '/images/avatars/vorgaroth-shade.jpg' },
  { id: 'bid_kyra', name: 'EngineerKyra', avatar: '/images/avatars/engineer-kyra.jpg' },
  { id: 'bid_runner', name: 'WheelRunner', avatar: '/images/avatars/wheel-runner.jpg' },
  { id: 'bid_lumen', name: 'MagistraLumen', avatar: '/images/avatars/magistra-lumen.jpg' },
]

const BOT_TITLES: Array<Omit<Parameters<typeof buildDemoAuction>[0], 'category' | 'startingPrice' | 'minBidIncrement' | 'duration'>> = [
  { title: 'Frostnacht Reliktkiste', description: 'Limitierte Winter-Event Dropkiste', buyNowPrice: 1800, featured: false },
  { title: 'Seraphar Banner (Mythic)', description: 'Fraktionsbanner mit Glow', buyNowPrice: 5200, featured: true },
  { title: 'Vorgaroth Ritualdolch', description: 'Dunkelmagie-Buff +5%', buyNowPrice: 3400, featured: false },
  { title: 'Battlefield MVP Skin', description: 'Sieger-Skin aus Battlegrounds', buyNowPrice: 4300, featured: true },
  { title: 'Legendary Sigil Set x3', description: '3x Sigils aus WheelOfFate', buyNowPrice: 7600, featured: true },
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function seedBidsForAuction(auction: Auction): Auction {
  // pre-seed 1-3 bids for activity
  const bidCount = Math.max(1, Math.min(3, Math.floor(Math.random() * 4)))
  let currentPrice = auction.currentPrice
  const bids: AuctionBid[] = []
  for (let i = 0; i < bidCount; i++) {
    const bidder = randomFrom(DEMO_BIDDERS)
    const amount = currentPrice + auction.minBidIncrement * (1 + Math.floor(Math.random() * 3))
    currentPrice = amount
    bids.push({
      id: `bid_seed_${auction.id}_${i}`,
      auctionId: auction.id,
      bidderId: bidder.id,
      bidderName: bidder.name,
      bidderAvatar: bidder.avatar,
      amount,
      timestamp: new Date(Date.now() - (bidCount - i) * 60_000).toISOString(),
      isAutoBid: false,
    })
  }
  return {
    ...auction,
    bids,
    bidCount: bids.length,
    currentPrice,
    highestBidderId: bids[bids.length - 1]?.bidderId,
    highestBidderName: bids[bids.length - 1]?.bidderName,
    reserveMet: !auction.reservePrice || currentPrice >= auction.reservePrice,
  }
}

function buildDemoAuction(seed: Partial<Auction> & { title: string; category: AuctionCategory; startingPrice: number; minBidIncrement: number; duration: number; quantity?: number; buyNowPrice?: number; featured?: boolean }) {
  const seller = randomFrom(DEMO_SELLERS)
  const now = new Date()
  const endTime = new Date(now.getTime() + seed.duration * 60 * 60 * 1000)
  const base: Auction = {
    id: `auction_${Math.random().toString(36).slice(2)}`,
    sellerId: seller.id,
    sellerName: seller.name,
    sellerAvatar: seller.avatar,
    sellerRating: seller.rating,
    title: seed.title,
    description: seed.description || 'Legendärer Drop aus Eldrun Events.',
    category: seed.category,
    image: seed.image,
    quantity: seed.quantity ?? 1,
    startingPrice: seed.startingPrice,
    currentPrice: seed.startingPrice,
    buyNowPrice: seed.buyNowPrice,
    minBidIncrement: seed.minBidIncrement,
    reservePrice: seed.reservePrice,
    reserveMet: !seed.reservePrice || seed.startingPrice >= (seed.reservePrice ?? 0),
    bids: [],
    bidCount: 0,
    highestBidderId: undefined,
    highestBidderName: undefined,
    startTime: now.toISOString(),
    endTime: endTime.toISOString(),
    duration: seed.duration,
    status: 'active',
    featured: seed.featured ?? false,
    watchers: [],
    watcherCount: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  return base
}

function buildInitialAuctions(): Auction[] {
  const seeds: Array<Parameters<typeof buildDemoAuction>[0]> = [
    {
      title: 'Legendary Warbird Skin – Seraphar Gold',
      category: 'skins',
      startingPrice: 4200,
      minBidIncrement: 150,
      duration: 6,
      buyNowPrice: 6800,
      featured: true,
      image: '/images/auction/warbird-gold.jpg',
    },
    {
      title: 'Runenstahl Stack x500',
      category: 'resources',
      startingPrice: 1800,
      minBidIncrement: 80,
      duration: 4,
      buyNowPrice: 2600,
      image: '/images/auction/runenstahl.jpg',
    },
    {
      title: 'Arcane Glyph Set (Vorgaroth)',
      category: 'weapons',
      startingPrice: 3200,
      minBidIncrement: 120,
      duration: 5,
      buyNowPrice: 5200,
      featured: true,
      image: '/images/auction/glyph-set.jpg',
    },
    {
      title: 'VIP Gold Pass (7 Tage)',
      category: 'vip',
      startingPrice: 1500,
      minBidIncrement: 50,
      duration: 3,
      buyNowPrice: 2400,
      quantity: 1,
      image: '/images/auction/vip-gold.jpg',
    },
    {
      title: 'Mech Modul: Cascade Array',
      category: 'armor',
      startingPrice: 2700,
      minBidIncrement: 110,
      duration: 4,
      buyNowPrice: 4100,
      quantity: 1,
      image: '/images/auction/cascade-array.jpg',
    },
  ]
  return seeds.map(buildDemoAuction).map(seedBidsForAuction)
}

let auctionBotInterval: ReturnType<typeof setInterval> | null = null
let bidBotInterval: ReturnType<typeof setInterval> | null = null

export type AuctionStatus = 'active' | 'ended' | 'sold' | 'cancelled' | 'expired'
export type AuctionCategory = 'weapons' | 'armor' | 'resources' | 'skins' | 'vip' | 'coins' | 'other'

export interface AuctionBid {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string
  bidderAvatar?: string
  amount: number
  timestamp: string
  isAutoBid: boolean
}

export interface Auction {
  id: string
  
  // Seller info
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  sellerRating: number
  
  // Item info
  title: string
  description: string
  category: AuctionCategory
  image?: string
  quantity: number
  
  // Pricing
  startingPrice: number
  currentPrice: number
  buyNowPrice?: number
  minBidIncrement: number
  reservePrice?: number
  reserveMet: boolean
  
  // Bids
  bids: AuctionBid[]
  bidCount: number
  highestBidderId?: string
  highestBidderName?: string
  
  // Timing
  startTime: string
  endTime: string
  duration: number // in hours
  
  // Status
  status: AuctionStatus
  featured: boolean
  watchers: string[]
  watcherCount: number
  
  // Metadata
  createdAt: string
  updatedAt: string
}

interface AuctionFilters {
  category?: AuctionCategory
  minPrice?: number
  maxPrice?: number
  status?: AuctionStatus
  searchQuery?: string
  sortBy?: 'ending_soon' | 'newly_listed' | 'price_low' | 'price_high' | 'most_bids'
}

interface AuctionState {
  auctions: Auction[]
  userBids: AuctionBid[]
  watchlist: string[]
  filters: AuctionFilters
  
  // Actions
  createAuction: (auction: Omit<Auction, 'id' | 'bids' | 'bidCount' | 'status' | 'reserveMet' | 'currentPrice' | 'watcherCount' | 'watchers' | 'createdAt' | 'updatedAt'>) => Auction
  placeBid: (auctionId: string, bid: Omit<AuctionBid, 'id' | 'auctionId' | 'timestamp'>) => { success: boolean; message: string }
  buyNow: (auctionId: string, buyerId: string, buyerName: string) => { success: boolean; message: string }
  cancelAuction: (auctionId: string, sellerId: string) => boolean
  watchAuction: (auctionId: string, userId: string) => void
  unwatchAuction: (auctionId: string, userId: string) => void
  setFilters: (filters: AuctionFilters) => void
  
  // Getters
  getAuctionById: (id: string) => Auction | undefined
  getActiveAuctions: () => Auction[]
  getAuctionsBySeller: (sellerId: string) => Auction[]
  getAuctionsByBidder: (bidderId: string) => Auction[]
  getWatchedAuctions: (userId: string) => Auction[]
  getFilteredAuctions: () => Auction[]
  getEndingSoon: (hours?: number) => Auction[]
  getFeaturedAuctions: () => Auction[]
}

export const useAuctionStore = create<AuctionState>()(
  persist(
    (set, get) => {
      const initialAuctions = buildInitialAuctions()

      // launch bot loops after initial seed
      setTimeout(() => {
        if (!auctionBotInterval) {
          auctionBotInterval = setInterval(() => {
            const seller = randomFrom(DEMO_SELLERS)
            const titleSeed = randomFrom(BOT_TITLES)
            const categories: AuctionCategory[] = ['weapons', 'armor', 'resources', 'skins', 'vip', 'coins', 'other']
            const cat = randomFrom(categories)
            const basePrice = 800 + Math.floor(Math.random() * 5200)
            const duration = 2 + Math.floor(Math.random() * 6)
            const auction = seedBidsForAuction(
              buildDemoAuction({
                ...titleSeed,
                category: cat,
                startingPrice: basePrice,
                minBidIncrement: Math.max(50, Math.floor(basePrice * 0.05)),
                duration,
                sellerId: seller.id,
                sellerName: seller.name,
                sellerAvatar: seller.avatar,
                featured: titleSeed.featured ?? false,
              })
            )
            set((state) => ({
              auctions: [auction, ...state.auctions].slice(0, 40),
            }))
          }, 16_000)
        }

        if (!bidBotInterval) {
          bidBotInterval = setInterval(() => {
            const active = get().getActiveAuctions()
            if (active.length === 0) return
            const auction = randomFrom(active)
            const bidder = randomFrom(DEMO_BIDDERS)
            const amount = auction.currentPrice + auction.minBidIncrement * (1 + Math.floor(Math.random() * 2))
            get().placeBid(auction.id, {
              bidderId: bidder.id,
              bidderName: bidder.name,
              bidderAvatar: bidder.avatar,
              amount,
              isAutoBid: false,
            })
          }, 12_000)
        }
      }, 0)

      return {
        auctions: initialAuctions,
        userBids: [],
        watchlist: [],
        filters: {},

        createAuction: (
          auctionData: Omit<
            Auction,
            'id' | 'bids' | 'bidCount' | 'status' | 'reserveMet' | 'currentPrice' | 'watcherCount' | 'watchers' | 'createdAt' | 'updatedAt'
          >
        ) => {
          const now = new Date()
          const endTime = new Date(now.getTime() + auctionData.duration * 60 * 60 * 1000)

          const newAuction: Auction = {
            ...auctionData,
            id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            currentPrice: auctionData.startingPrice,
            bids: [],
            bidCount: 0,
            status: 'active',
            reserveMet: !auctionData.reservePrice || auctionData.startingPrice >= auctionData.reservePrice,
            watchers: [],
            watcherCount: 0,
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          }

          set((state) => ({
            auctions: [newAuction, ...state.auctions],
          }))

          return newAuction
        },

        placeBid: (auctionId: string, bidData: Omit<AuctionBid, 'id' | 'auctionId' | 'timestamp'>) => {
          const auction = get().auctions.find((a) => a.id === auctionId)

          if (!auction) {
            return { success: false, message: 'Auktion nicht gefunden' }
          }

          if (auction.status !== 'active') {
            return { success: false, message: 'Auktion ist nicht aktiv' }
          }

          if (new Date(auction.endTime) < new Date()) {
            return { success: false, message: 'Auktion ist beendet' }
          }

          if (bidData.amount < auction.currentPrice + auction.minBidIncrement) {
            return { success: false, message: `Mindestgebot: ${auction.currentPrice + auction.minBidIncrement} Coins` }
          }

          if (bidData.bidderId === auction.sellerId) {
            return { success: false, message: 'Du kannst nicht auf deine eigene Auktion bieten' }
          }

          const newBid: AuctionBid = {
            ...bidData,
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            auctionId,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            auctions: state.auctions.map((a) =>
              a.id === auctionId
                ? {
                    ...a,
                    currentPrice: bidData.amount,
                    bids: [...a.bids, newBid],
                    bidCount: a.bidCount + 1,
                    highestBidderId: bidData.bidderId,
                    highestBidderName: bidData.bidderName,
                    reserveMet: !a.reservePrice || bidData.amount >= a.reservePrice,
                    updatedAt: new Date().toISOString(),
                  }
                : a
            ),
            userBids: [...state.userBids, newBid],
          }))

          return { success: true, message: 'Gebot erfolgreich platziert!' }
        },

        buyNow: (auctionId: string, buyerId: string, buyerName: string) => {
          const auction = get().auctions.find((a) => a.id === auctionId)

          if (!auction) {
            return { success: false, message: 'Auktion nicht gefunden' }
          }

          if (!auction.buyNowPrice) {
            return { success: false, message: 'Sofortkauf nicht verfügbar' }
          }

          if (auction.status !== 'active') {
            return { success: false, message: 'Auktion ist nicht aktiv' }
          }

          if (buyerId === auction.sellerId) {
            return { success: false, message: 'Du kannst deine eigene Auktion nicht kaufen' }
          }

          set((state) => ({
            auctions: state.auctions.map((a) =>
              a.id === auctionId
                ? {
                    ...a,
                    status: 'sold' as AuctionStatus,
                    currentPrice: a.buyNowPrice!,
                    highestBidderId: buyerId,
                    highestBidderName: buyerName,
                    endTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                : a
            ),
          }))

          return { success: true, message: 'Artikel erfolgreich gekauft!' }
        },

        cancelAuction: (auctionId: string, sellerId: string) => {
          const auction = get().auctions.find((a) => a.id === auctionId)

          if (!auction || auction.sellerId !== sellerId) {
            return false
          }

          if (auction.bidCount > 0) {
            return false // Can't cancel if there are bids
          }

          set((state) => ({
            auctions: state.auctions.map((a) =>
              a.id === auctionId ? { ...a, status: 'cancelled' as AuctionStatus, updatedAt: new Date().toISOString() } : a
            ),
          }))

          return true
        },

        watchAuction: (auctionId: string, userId: string) => {
          set((state) => ({
            auctions: state.auctions.map((a) =>
              a.id === auctionId && !a.watchers.includes(userId)
                ? { ...a, watchers: [...a.watchers, userId], watcherCount: a.watcherCount + 1 }
                : a
            ),
            watchlist: state.watchlist.includes(auctionId) ? state.watchlist : [...state.watchlist, auctionId],
          }))
        },

        unwatchAuction: (auctionId: string, userId: string) => {
          set((state) => ({
            auctions: state.auctions.map((a) =>
              a.id === auctionId
                ? { ...a, watchers: a.watchers.filter((w) => w !== userId), watcherCount: Math.max(0, a.watcherCount - 1) }
                : a
            ),
            watchlist: state.watchlist.filter((id) => id !== auctionId),
          }))
        },

        setFilters: (filters: AuctionFilters) => {
          set({ filters })
        },

        getAuctionById: (id: string) => get().auctions.find((a) => a.id === id),

        getActiveAuctions: () => get().auctions.filter((a) => a.status === 'active' && new Date(a.endTime) > new Date()),

        getAuctionsBySeller: (sellerId: string) => get().auctions.filter((a) => a.sellerId === sellerId),

        getAuctionsByBidder: (bidderId: string) => get().auctions.filter((a) => a.bids.some((b) => b.bidderId === bidderId)),

        getWatchedAuctions: (userId: string) => get().auctions.filter((a) => a.watchers.includes(userId)),

        getFilteredAuctions: () => {
          const { auctions, filters } = get()
          let filtered = auctions.filter((a) => a.status === 'active')

          if (filters.category) {
            filtered = filtered.filter((a) => a.category === filters.category)
          }
          if (filters.minPrice !== undefined) {
            filtered = filtered.filter((a) => a.currentPrice >= filters.minPrice!)
          }
          if (filters.maxPrice !== undefined) {
            filtered = filtered.filter((a) => a.currentPrice <= filters.maxPrice!)
          }
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            filtered = filtered.filter(
              (a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
            )
          }

          // Sorting
          switch (filters.sortBy) {
            case 'ending_soon':
              filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
              break
            case 'newly_listed':
              filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              break
            case 'price_low':
              filtered.sort((a, b) => a.currentPrice - b.currentPrice)
              break
            case 'price_high':
              filtered.sort((a, b) => b.currentPrice - a.currentPrice)
              break
            case 'most_bids':
              filtered.sort((a, b) => b.bidCount - a.bidCount)
              break
            default:
              filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
          }

          return filtered
        },

        getEndingSoon: (hours = 6) => {
          const threshold = new Date(Date.now() + hours * 60 * 60 * 1000)
          return get().auctions
            .filter((a) => a.status === 'active' && new Date(a.endTime) <= threshold && new Date(a.endTime) > new Date())
            .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
        },

        getFeaturedAuctions: () => get().auctions.filter((a) => a.featured && a.status === 'active'),
      }
    },
    {
      name: 'eldrun-auction-storage',
    }
  )
)

export default useAuctionStore
