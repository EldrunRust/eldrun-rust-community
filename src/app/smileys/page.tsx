'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smile, Search, Star, Crown, Sparkles, Heart, ShoppingCart,
  Filter, Grid, List, Lock, Clock, TrendingUp, Gift, Coins,
  Check, X, ChevronDown, Eye, Package, Repeat, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSmileyStore, Smiley, SmileyCategory, SmileyRarity } from '@/store/smileyStore'
import { useToast } from '@/components/ui/Toast'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function RarityBadge({ rarity }: { rarity: SmileyRarity }) {
  const config: Record<SmileyRarity, { label: string; color: string; bg: string }> = {
    free: { label: 'Gratis', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
    common: { label: 'Common', color: 'text-gray-300', bg: 'bg-gray-500/20 border-gray-500/30' },
    rare: { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
    epic: { label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
    legendary: { label: 'Legendary', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
    elite: { label: 'Elite', color: 'text-gold-400', bg: 'bg-gold-500/20 border-gold-500/30' },
    mythic: { label: 'Mythic', color: 'text-pink-400', bg: 'bg-pink-500/20 border-pink-500/30' },
  }
  
  const { label, color, bg } = config[rarity]
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${color} ${bg}`}>
      {label}
    </span>
  )
}

function SmileyCard({ 
  smiley, 
  isOwned,
  isFavorite,
  onBuy,
  onToggleFavorite,
  onPreview
}: { 
  smiley: Smiley
  isOwned: boolean
  isFavorite: boolean
  onBuy: () => void
  onToggleFavorite: () => void
  onPreview: () => void
}) {
  const effectClasses: Record<string, string> = {
    glow: 'drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]',
    sparkle: 'animate-pulse',
    fire: 'drop-shadow-[0_0_15px_rgba(255,100,0,0.6)]',
    ice: 'drop-shadow-[0_0_15px_rgba(100,200,255,0.6)]',
    rainbow: 'animate-pulse drop-shadow-[0_0_15px_rgba(255,0,255,0.4)]',
    shake: 'animate-bounce',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-metal-900 border rounded-xl p-4 transition-all ${
        isOwned 
          ? 'border-green-500/50 bg-green-500/5' 
          : smiley.rarity === 'mythic' 
            ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-purple-500/10'
            : smiley.rarity === 'elite'
              ? 'border-gold-500/50 bg-gradient-to-br from-gold-500/10 to-amber-500/10'
              : smiley.rarity === 'legendary'
                ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-red-500/10'
                : 'border-metal-700 hover:border-metal-600'
      }`}
    >
      {/* Badges */}
      <div className="flex items-center justify-between mb-3">
        <RarityBadge rarity={smiley.rarity} />
        <div className="flex items-center gap-1">
          {smiley.isAnimated && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
              Animiert
            </span>
          )}
          {smiley.limitedEdition && (
            <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
              Limited
            </span>
          )}
        </div>
      </div>
      
      {/* Emoji */}
      <div className="flex justify-center py-4">
        <span 
          className={`text-5xl ${smiley.effect ? effectClasses[smiley.effect] : ''}`}
          role="img"
        >
          {smiley.emoji}
        </span>
      </div>
      
      {/* Info */}
      <div className="text-center mb-3">
        <h3 className="font-medieval font-bold text-white">{smiley.name}</h3>
        <code className="text-xs text-metal-500">{smiley.code}</code>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-center gap-3 text-xs text-metal-500 mb-3">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {smiley.timesUsed.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {smiley.ownersCount.toLocaleString()}
        </span>
      </div>
      
      {/* Price & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {smiley.price === 0 ? (
            <span className="text-green-400 font-bold text-sm">Gratis</span>
          ) : (
            <span className="flex items-center gap-1 text-gold-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              {smiley.price.toLocaleString()}
            </span>
          )}
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite ? 'bg-pink-500/20 text-pink-400' : 'bg-metal-800 text-metal-500 hover:text-pink-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-400' : ''}`} />
          </button>
        </div>
        
        <div className="w-full">
          {isOwned ? (
            <span className="w-full px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg flex items-center justify-center gap-1">
              <Check className="w-4 h-4" />
              Owned
            </span>
          ) : smiley.price === 0 ? (
            <span className="w-full block text-center px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg">
              Verfügbar
            </span>
          ) : (
            <Button size="sm" onClick={onBuy} className="w-full bg-gold-500 hover:bg-gold-400 text-black">
              Kaufen
            </Button>
          )}
        </div>
      </div>
      
      {/* VIP Lock */}
      {smiley.vipOnly && !isOwned && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gold-400 mx-auto mb-2" />
            <p className="text-gold-400 font-medieval">VIP Only</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function MarketplaceListing({ 
  listing,
  smiley,
  onBuy
}: { 
  listing: { smileyId: string; sellerId: string; sellerName: string; price: number; type: 'sale' | 'rent'; rentDays?: number }
  smiley: Smiley
  onBuy: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-metal-900 border border-metal-700 rounded-xl hover:border-metal-600 transition-colors">
      <span className="text-3xl">{smiley.emoji}</span>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medieval font-bold text-white">{smiley.name}</span>
          <RarityBadge rarity={smiley.rarity} />
        </div>
        <p className="text-sm text-metal-500">
          von <span className="text-metal-400">{listing.sellerName}</span>
          {listing.type === 'rent' && ` • ${listing.rentDays} Tage Miete`}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-gold-400 font-bold">
          <Coins className="w-4 h-4" />
          {listing.price.toLocaleString()}
        </span>
        
        <Button size="sm" onClick={onBuy} className={listing.type === 'rent' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gold-500 hover:bg-gold-400 text-black'}>
          {listing.type === 'rent' ? 'Mieten' : 'Kaufen'}
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SmileyStorePage() {
  const {
    smileys,
    ownedSmileys,
    favoriteSmileys,
    marketListings,
    buySmiley,
    toggleFavorite,
    isOwned,
    getSmileyById,
    getFreeSmileys,
    getPremiumSmileys,
    getEliteSmileys,
  } = useSmileyStore()
  
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'premium' | 'elite' | 'owned' | 'market'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SmileyCategory | 'all'>('all')
  const [selectedRarity, setSelectedRarity] = useState<SmileyRarity | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'name'>('popular')
  
  const categories: { id: SmileyCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Alle', icon: '🌟' },
    { id: 'smileys', label: 'Smileys', icon: '😀' },
    { id: 'reactions', label: 'Reaktionen', icon: '👍' },
    { id: 'gaming', label: 'Gaming', icon: '⚔️' },
    { id: 'animals', label: 'Tiere', icon: '🐉' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧙' },
    { id: 'vip', label: 'VIP', icon: '👑' },
  ]
  
  // Filter smileys
  const getFilteredSmileys = () => {
    let filtered: Smiley[] = []
    
    switch (activeTab) {
      case 'free':
        filtered = getFreeSmileys()
        break
      case 'premium':
        filtered = getPremiumSmileys()
        break
      case 'elite':
        filtered = getEliteSmileys()
        break
      case 'owned':
        filtered = smileys.filter(s => isOwned(s.id))
        break
      default:
        filtered = smileys
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }
    
    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(s => s.rarity === selectedRarity)
    }
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.code.toLowerCase().includes(query)
      )
    }
    
    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.timesUsed - a.timesUsed)
        break
      case 'price':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    
    return filtered
  }
  
  const filteredSmileys = getFilteredSmileys()
  const { addToast } = useToast()
  
  const handleBuy = (smileyId: string) => {
    const smiley = getSmileyById(smileyId)
    const success = buySmiley(smileyId)
    if (success && smiley) {
      addToast({
        type: 'premium',
        title: 'Smiley gekauft! 🎉',
        message: `${smiley.emoji} ${smiley.name} ist jetzt deins!`,
      })
    } else if (!success) {
      addToast({
        type: 'error',
        title: 'Kauf fehlgeschlagen',
        message: 'Nicht genug Eldruns oder bereits im Besitz.',
      })
    }
  }

  return (
    <EldrunPageShell
      icon={Smile}
      badge="SMILEY STORE"
      title="SMILEY STORE"
      subtitle="SAMMLE SIE ALLE"
      description={`${smileys.length}+ Smileys verfügbar. ${getFreeSmileys().length} Gratis, ${getEliteSmileys().length} Elite. Du besitzt ${ownedSmileys.length} Smileys.`}
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
      <div>
        {/* Tabs */}
        <div className="border-b border-metal-800 bg-metal-900/50 -mx-4 px-4 mb-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {[
              { id: 'all', label: 'Alle', icon: Grid, count: smileys.length },
              { id: 'free', label: 'Gratis', icon: Gift, count: getFreeSmileys().length },
              { id: 'premium', label: 'Premium', icon: Star, count: getPremiumSmileys().length },
              { id: 'elite', label: 'Elite', icon: Crown, count: getEliteSmileys().length },
              { id: 'owned', label: 'Meine', icon: Package, count: ownedSmileys.length },
              { id: 'market', label: 'Marktplatz', icon: Tag, count: marketListings.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medieval text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-metal-400 hover:text-white hover:bg-metal-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs px-1.5 py-0.5 bg-metal-800 rounded">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab !== 'market' ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Smiley suchen..."
                  className="w-full pl-10 pr-4 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-metal-900 border border-metal-700 rounded-lg p-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gold-500/20 text-gold-400'
                        : 'text-metal-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-metal-900 border border-metal-700 rounded-lg text-white focus:border-gold-500/50 focus:outline-none"
              >
                <option value="popular">Beliebteste</option>
                <option value="price">Preis</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Smiley Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredSmileys.map(smiley => (
                <SmileyCard
                  key={smiley.id}
                  smiley={smiley}
                  isOwned={isOwned(smiley.id)}
                  isFavorite={favoriteSmileys.includes(smiley.id)}
                  onBuy={() => handleBuy(smiley.id)}
                  onToggleFavorite={() => toggleFavorite(smiley.id)}
                  onPreview={() => {}}
                />
              ))}
            </div>

            {filteredSmileys.length === 0 && (
              <div className="text-center py-16">
                <Smile className="w-16 h-16 text-metal-700 mx-auto mb-4" />
                <h3 className="text-xl font-medieval text-metal-500">Keine Smileys gefunden</h3>
                <p className="text-metal-600">Versuche andere Filter</p>
              </div>
            )}
          </>
        ) : (
          /* Marketplace */
          <div>
            <div className="mb-6">
              <h2 className="font-medieval text-xl text-gold-400 mb-2">Smiley Marktplatz</h2>
              <p className="text-metal-500">Kaufe und verkaufe Smileys von anderen Spielern</p>
            </div>
            
            <div className="grid gap-3">
              {marketListings.map((listing, i) => {
                const smiley = getSmileyById(listing.smileyId)
                if (!smiley) return null
                return (
                  <MarketplaceListing
                    key={i}
                    listing={listing}
                    smiley={smiley}
                    onBuy={() => {}}
                  />
                )
              })}
            </div>
            
            {marketListings.length === 0 && (
              <div className="text-center py-16">
                <Tag className="w-16 h-16 text-metal-700 mx-auto mb-4" />
                <h3 className="text-xl font-medieval text-metal-500">Keine Angebote</h3>
                <p className="text-metal-600">Der Marktplatz ist leer</p>
              </div>
            )}
          </div>
        )}
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
