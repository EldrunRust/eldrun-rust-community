'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Gavel, Clock, Flame, TrendingUp, Search, Filter,
  ChevronDown, Eye, Heart, Coins, Star, Shield,
  Zap, Package, Crown, Sword, AlertTriangle,
  ArrowUpRight, Users, Timer, X, Plus, Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuctionStore, Auction, AuctionCategory } from '@/store/auctionStore'
import { AuthGate } from '@/components/AuthGate'

const CATEGORIES: { id: AuctionCategory | 'all'; label: string; icon: typeof Gavel }[] = [
  { id: 'all', label: 'Alle', icon: Package },
  { id: 'weapons', label: 'Waffen', icon: Sword },
  { id: 'skins', label: 'Skins', icon: Star },
  { id: 'vip', label: 'VIP', icon: Crown },
  { id: 'resources', label: 'Ressourcen', icon: Package },
  { id: 'coins', label: 'Coins', icon: Coins },
  { id: 'other', label: 'Sonstiges', icon: Package },
]

const SORT_OPTIONS = [
  { id: 'ending_soon', label: 'Endet bald' },
  { id: 'newly_listed', label: 'Neu eingestellt' },
  { id: 'price_low', label: 'Preis: Niedrig → Hoch' },
  { id: 'price_high', label: 'Preis: Hoch → Niedrig' },
  { id: 'most_bids', label: 'Meiste Gebote' },
]

function formatTimeLeft(endTime: string): string {
  const end = new Date(endTime).getTime()
  const now = Date.now()
  const diff = end - now
  
  if (diff <= 0) return 'Beendet'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

function AuctionCard({ auction, onBid }: { auction: Auction; onBid: (auction: Auction) => void }) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(auction.endTime))
  const isEndingSoon = new Date(auction.endTime).getTime() - Date.now() < 6 * 60 * 60 * 1000
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.endTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [auction.endTime])

  const getCategoryIcon = (category: AuctionCategory) => {
    const cat = CATEGORIES.find(c => c.id === category)
    return cat?.icon || Package
  }
  
  const CategoryIcon = getCategoryIcon(auction.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-metal-900 border border-metal-800 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-metal-800 to-metal-900 flex items-center justify-center">
        {auction.featured && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gold-500 text-black text-xs font-bold rounded flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Featured
          </div>
        )}
        {isEndingSoon && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1 animate-pulse">
            <Timer className="w-3 h-3" />
            Endet bald!
          </div>
        )}
        <CategoryIcon className="w-16 h-16 text-metal-600 group-hover:text-gold-500/50 transition-colors" />
        
        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-metal-800/80 rounded-lg hover:bg-metal-700 transition-colors">
            <Heart className="w-4 h-4 text-metal-400 hover:text-red-400" />
          </button>
          <button className="p-2 bg-metal-800/80 rounded-lg hover:bg-metal-700 transition-colors">
            <Eye className="w-4 h-4 text-metal-400" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medieval font-bold text-white mb-1 line-clamp-1 group-hover:text-gold-400 transition-colors">
          {auction.title}
        </h3>
        
        {/* Seller */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-metal-700 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 text-metal-400" />
          </div>
          <span className="text-xs text-metal-400">{auction.sellerName}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
            <span className="text-xs text-metal-400">{auction.sellerRating}</span>
          </div>
        </div>
        
        {/* Price Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-metal-500">Aktuelles Gebot</span>
            <span className="font-bold text-gold-400 flex items-center gap-1">
              <Coins className="w-4 h-4" />
              {auction.currentPrice.toLocaleString()}
            </span>
          </div>
          {auction.buyNowPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-metal-500">Sofortkauf</span>
              <span className="text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {auction.buyNowPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-metal-500 mb-4">
          <div className="flex items-center gap-1">
            <Gavel className="w-3 h-3" />
            {auction.bidCount} Gebote
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {auction.watcherCount}
          </div>
          <div className={`flex items-center gap-1 ${isEndingSoon ? 'text-red-400' : ''}`}>
            <Clock className="w-3 h-3" />
            {timeLeft}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="rust" 
            size="sm" 
            className="flex-1 gap-1"
            onClick={() => onBid(auction)}
          >
            <Gavel className="w-4 h-4" />
            Bieten
          </Button>
          {auction.buyNowPrice && (
            <Button variant="ghost" size="sm" className="gap-1 text-green-400 border-green-500/30 hover:bg-green-500/10">
              <Zap className="w-4 h-4" />
              Kaufen
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function BidModal({ auction, onClose, onSubmit }: { 
  auction: Auction; 
  onClose: () => void;
  onSubmit: (amount: number) => void;
}) {
  const minBid = auction.currentPrice + auction.minBidIncrement
  const [bidAmount, setBidAmount] = useState(minBid)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-metal-900 border border-metal-800 rounded-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medieval text-xl text-white">Gebot abgeben</h2>
          <button onClick={onClose} className="text-metal-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-gold-400 mb-2">{auction.title}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-metal-400">Aktuelles Gebot:</span>
            <span className="text-white font-bold">{auction.currentPrice.toLocaleString()} Coins</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-metal-400">Mindesterhöhung:</span>
            <span className="text-metal-300">+{auction.minBidIncrement} Coins</span>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm text-metal-400 mb-2">Dein Gebot</label>
          <div className="relative">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Math.max(minBid, parseInt(e.target.value) || 0))}
              min={minBid}
              step={auction.minBidIncrement}
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white text-lg font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-metal-400">Coins</span>
          </div>
          <p className="text-xs text-metal-500 mt-2">Mindestgebot: {minBid.toLocaleString()} Coins</p>
        </div>
        
        {/* Quick bid buttons */}
        <div className="flex gap-2 mb-6">
          {[0, 500, 1000, 2500].map(increment => (
            <button
              key={increment}
              onClick={() => setBidAmount(minBid + increment)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                bidAmount === minBid + increment
                  ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                  : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
              }`}
            >
              {increment === 0 ? 'Min' : `+${increment}`}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button 
            variant="rust" 
            onClick={() => onSubmit(bidAmount)} 
            className="flex-1 gap-2"
            disabled={bidAmount < minBid}
          >
            <Gavel className="w-4 h-4" />
            {bidAmount.toLocaleString()} Coins bieten
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AuctionHousePage() {
  const { 
    getFilteredAuctions, 
    getFeaturedAuctions, 
    getEndingSoon,
    setFilters,
    filters,
    placeBid 
  } = useAuctionStore()
  
  const [selectedCategory, setSelectedCategory] = useState<AuctionCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('ending_soon')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  const featuredAuctions = getFeaturedAuctions()
  const endingSoon = getEndingSoon(6)
  
  useEffect(() => {
    setFilters({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      searchQuery: searchQuery || undefined,
      sortBy: sortBy as any,
    })
  }, [selectedCategory, searchQuery, sortBy, setFilters])
  
  const auctions = getFilteredAuctions()
  
  const handleBid = (amount: number) => {
    if (!selectedAuction) return
    
    const result = placeBid(selectedAuction.id, {
      bidderId: 'current_user',
      bidderName: 'Du',
      amount,
      isAutoBid: false,
    })
    
    setNotification({
      type: result.success ? 'success' : 'error',
      message: result.message
    })
    
    if (result.success) {
      setSelectedAuction(null)
    }
    
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <AuthGate>
    <div className="min-h-screen bg-metal-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gold-900/30">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url('/images/backgrounds/fortress-night.svg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-metal-900 via-metal-950 to-metal-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        
        <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-metal-900/50 border border-gold-700/30 rounded-full mb-6">
              <img src="/images/icons/icon_auction.svg" alt="Auktionshaus" className="w-6 h-6 object-contain" />
              <span className="font-medieval text-sm text-gold-500 uppercase tracking-[0.2em]">
                Auktionshaus
              </span>
            </div>
            
            <h1 className="font-medieval-decorative font-black text-5xl md:text-7xl mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 drop-shadow-[0_0_30px_rgba(212,168,83,0.3)]">
                AUKTIONSHAUS
              </span>
            </h1>
            
            <p className="font-medieval text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 mb-2 tracking-[0.2em] uppercase">
              Biete, Handle, Gewinne!
            </p>
            
            <p className="text-metal-400 max-w-2xl mx-auto">
              Entdecke seltene Items, biete auf exklusive Auktionen und sichere dir die besten Deals auf dem Server.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gold-400">{auctions.length}</p>
                <p className="text-xs text-metal-500 uppercase">Aktive Auktionen</p>
              </div>
              <div className="w-px h-12 bg-metal-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{endingSoon.length}</p>
                <p className="text-xs text-metal-500 uppercase">Enden bald</p>
              </div>
              <div className="w-px h-12 bg-metal-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{featuredAuctions.length}</p>
                <p className="text-xs text-metal-500 uppercase">Featured</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Items..."
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-800 rounded-xl text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
            />
          </div>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-metal-900 border border-metal-800 rounded-xl text-white focus:border-gold-500/50 focus:outline-none"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          
          {/* Create Auction */}
          <Button variant="rust" className="gap-2">
            <Plus className="w-4 h-4" />
            Auktion erstellen
          </Button>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                  : 'bg-metal-900 border-metal-800 text-metal-400 hover:border-metal-700'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Featured Auctions */}
        {featuredAuctions.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-6 h-6 text-gold-500" />
              <h2 className="font-medieval text-2xl text-white">Featured Auktionen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.slice(0, 3).map(auction => (
                <AuctionCard 
                  key={auction.id} 
                  auction={auction} 
                  onBid={setSelectedAuction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ending Soon */}
        {endingSoon.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Timer className="w-6 h-6 text-red-500" />
              <h2 className="font-medieval text-2xl text-white">Endet bald</h2>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                {endingSoon.length} Auktionen
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {endingSoon.slice(0, 4).map(auction => (
                <AuctionCard 
                  key={auction.id} 
                  auction={auction} 
                  onBid={setSelectedAuction}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Auctions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medieval text-2xl text-white">
              {selectedCategory === 'all' ? 'Alle Auktionen' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </h2>
            <span className="text-metal-500">{auctions.length} Ergebnisse</span>
          </div>
          
          {auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions.map(auction => (
                <AuctionCard 
                  key={auction.id} 
                  auction={auction} 
                  onBid={setSelectedAuction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Gavel className="w-16 h-16 text-metal-700 mx-auto mb-4" />
              <h3 className="text-xl text-metal-400 mb-2">Keine Auktionen gefunden</h3>
              <p className="text-metal-500">Versuche andere Filter oder erstelle eine eigene Auktion!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {selectedAuction && (
          <BidModal 
            auction={selectedAuction}
            onClose={() => setSelectedAuction(null)}
            onSubmit={handleBid}
          />
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthGate>
  )
}
