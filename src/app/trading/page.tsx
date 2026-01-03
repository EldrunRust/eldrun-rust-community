'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Plus, Search, Filter, ArrowLeftRight, Shield,
  Star, Clock, User, Tag, ChevronRight, X, Check, AlertTriangle
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const ITEM_CATEGORIES = ['Alle', 'Waffen', 'Rüstung', 'Ressourcen', 'Komponenten', 'Blaupausen', 'Skins']

const ITEM_RARITY = {
  common: { name: 'Gewöhnlich', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
  uncommon: { name: 'Ungewöhnlich', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  rare: { name: 'Selten', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  epic: { name: 'Episch', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  legendary: { name: 'Legendär', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
}

// Trade type definition
interface Trade {
  id: string
  seller: { name: string; rating: number; trades: number; verified: boolean }
  offering: { name: string; quantity: number; category: string; rarity: string; icon: string }
  wanting: { name: string; quantity: number; category: string; rarity: string; icon: string }
  createdAt: Date
  featured: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULIERTE TRADES - Der Marktplatz von Eldrun
// ═══════════════════════════════════════════════════════════════════════════

const SIMULATED_TRADES: Trade[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED TRADES - Hervorgehobene Angebote
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't1', seller: { name: 'IronTrader', rating: 4.9, trades: 156, verified: true }, offering: { name: 'AK-47', quantity: 2, category: 'Waffen', rarity: 'epic', icon: '🔫' }, wanting: { name: 'C4', quantity: 4, category: 'Komponenten', rarity: 'rare', icon: '💣' }, createdAt: new Date(Date.now() - 1800000), featured: true },
  { id: 't2', seller: { name: 'SkinCollector', rating: 5.0, trades: 234, verified: true }, offering: { name: 'Tempered AK', quantity: 1, category: 'Skins', rarity: 'legendary', icon: '✨' }, wanting: { name: 'Eldrun Coins', quantity: 50000, category: 'Währung', rarity: 'common', icon: '🪙' }, createdAt: new Date(Date.now() - 7200000), featured: true },
  { id: 't3', seller: { name: 'LegendaryDealer', rating: 5.0, trades: 489, verified: true }, offering: { name: 'Dragon Fire AK Skin', quantity: 1, category: 'Skins', rarity: 'legendary', icon: '🐉' }, wanting: { name: 'VIP Dragon 30 Tage', quantity: 1, category: 'Services', rarity: 'legendary', icon: '👑' }, createdAt: new Date(Date.now() - 900000), featured: true },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WAFFEN TRADES
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't4', seller: { name: 'GunRunner', rating: 4.6, trades: 78, verified: true }, offering: { name: 'Bolt Action Rifle', quantity: 5, category: 'Waffen', rarity: 'rare', icon: '🎯' }, wanting: { name: 'Explosives', quantity: 20, category: 'Komponenten', rarity: 'epic', icon: '💥' }, createdAt: new Date(Date.now() - 21600000), featured: false },
  { id: 't5', seller: { name: 'WeaponMaster', rating: 4.8, trades: 203, verified: true }, offering: { name: 'LR-300', quantity: 3, category: 'Waffen', rarity: 'epic', icon: '🔫' }, wanting: { name: 'Rockets', quantity: 10, category: 'Komponenten', rarity: 'epic', icon: '🚀' }, createdAt: new Date(Date.now() - 5400000), featured: false },
  { id: 't6', seller: { name: 'MilitarySupply', rating: 4.7, trades: 145, verified: true }, offering: { name: 'M249', quantity: 1, category: 'Waffen', rarity: 'legendary', icon: '💀' }, wanting: { name: 'Sulfur', quantity: 25000, category: 'Ressourcen', rarity: 'common', icon: '🟡' }, createdAt: new Date(Date.now() - 10800000), featured: false },
  { id: 't7', seller: { name: 'SniperElite', rating: 4.9, trades: 89, verified: false }, offering: { name: 'L96 Sniper', quantity: 2, category: 'Waffen', rarity: 'legendary', icon: '🎯' }, wanting: { name: 'C4', quantity: 8, category: 'Komponenten', rarity: 'rare', icon: '💣' }, createdAt: new Date(Date.now() - 14400000), featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RÜSTUNG TRADES
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't8', seller: { name: 'ArmorSmith', rating: 4.8, trades: 112, verified: true }, offering: { name: 'Metal Facemask', quantity: 3, category: 'Rüstung', rarity: 'rare', icon: '🎭' }, wanting: { name: 'Scrap', quantity: 1500, category: 'Ressourcen', rarity: 'common', icon: '♻️' }, createdAt: new Date(Date.now() - 14400000), featured: false },
  { id: 't9', seller: { name: 'TankBuilder', rating: 4.6, trades: 67, verified: true }, offering: { name: 'Heavy Plate Set', quantity: 1, category: 'Rüstung', rarity: 'epic', icon: '🛡️' }, wanting: { name: 'HQM', quantity: 500, category: 'Ressourcen', rarity: 'uncommon', icon: '⚙️' }, createdAt: new Date(Date.now() - 18000000), featured: false },
  { id: 't10', seller: { name: 'ProtectionPro', rating: 4.9, trades: 178, verified: true }, offering: { name: 'Roadsign Armor Set', quantity: 5, category: 'Rüstung', rarity: 'rare', icon: '🔰' }, wanting: { name: 'Gears', quantity: 50, category: 'Komponenten', rarity: 'uncommon', icon: '⚙️' }, createdAt: new Date(Date.now() - 28800000), featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESSOURCEN TRADES
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't11', seller: { name: 'ResourceKing', rating: 4.7, trades: 89, verified: true }, offering: { name: 'High Quality Metal', quantity: 5000, category: 'Ressourcen', rarity: 'uncommon', icon: '⚙️' }, wanting: { name: 'Sulfur', quantity: 10000, category: 'Ressourcen', rarity: 'common', icon: '🟡' }, createdAt: new Date(Date.now() - 3600000), featured: false },
  { id: 't12', seller: { name: 'FarmingPro', rating: 4.5, trades: 234, verified: true }, offering: { name: 'Sulfur', quantity: 50000, category: 'Ressourcen', rarity: 'common', icon: '🟡' }, wanting: { name: 'Scrap', quantity: 5000, category: 'Ressourcen', rarity: 'common', icon: '♻️' }, createdAt: new Date(Date.now() - 7200000), featured: false },
  { id: 't13', seller: { name: 'MetalMiner', rating: 4.8, trades: 312, verified: true }, offering: { name: 'Metal Fragments', quantity: 100000, category: 'Ressourcen', rarity: 'common', icon: '🔩' }, wanting: { name: 'Cloth', quantity: 5000, category: 'Ressourcen', rarity: 'common', icon: '🧵' }, createdAt: new Date(Date.now() - 10800000), featured: false },
  { id: 't14', seller: { name: 'WoodCutter', rating: 4.4, trades: 156, verified: false }, offering: { name: 'Wood', quantity: 200000, category: 'Ressourcen', rarity: 'common', icon: '🪵' }, wanting: { name: 'Stone', quantity: 100000, category: 'Ressourcen', rarity: 'common', icon: '🪨' }, createdAt: new Date(Date.now() - 14400000), featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BLAUPAUSEN & KOMPONENTEN TRADES
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't15', seller: { name: 'BlueprintDealer', rating: 4.5, trades: 67, verified: false }, offering: { name: 'Rocket Launcher BP', quantity: 1, category: 'Blaupausen', rarity: 'epic', icon: '📜' }, wanting: { name: 'Tech Trash', quantity: 500, category: 'Komponenten', rarity: 'rare', icon: '🔧' }, createdAt: new Date(Date.now() - 10800000), featured: false },
  { id: 't16', seller: { name: 'ResearchMaster', rating: 4.9, trades: 278, verified: true }, offering: { name: 'AK-47 BP', quantity: 1, category: 'Blaupausen', rarity: 'epic', icon: '📜' }, wanting: { name: 'Scrap', quantity: 3000, category: 'Ressourcen', rarity: 'common', icon: '♻️' }, createdAt: new Date(Date.now() - 21600000), featured: false },
  { id: 't17', seller: { name: 'ComponentKing', rating: 4.7, trades: 189, verified: true }, offering: { name: 'Tech Trash', quantity: 1000, category: 'Komponenten', rarity: 'rare', icon: '🔧' }, wanting: { name: 'Eldrun Coins', quantity: 25000, category: 'Währung', rarity: 'common', icon: '🪙' }, createdAt: new Date(Date.now() - 28800000), featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SKINS & RARE ITEMS TRADES
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 't18', seller: { name: 'SkinMaster', rating: 5.0, trades: 456, verified: true }, offering: { name: 'Neon AK Skin', quantity: 1, category: 'Skins', rarity: 'epic', icon: '💜' }, wanting: { name: 'Eldrun Coins', quantity: 35000, category: 'Währung', rarity: 'common', icon: '🪙' }, createdAt: new Date(Date.now() - 3600000), featured: false },
  { id: 't19', seller: { name: 'RareCollector', rating: 4.9, trades: 123, verified: true }, offering: { name: 'Void Armor Set Skin', quantity: 1, category: 'Skins', rarity: 'legendary', icon: '🌀' }, wanting: { name: 'Dragon Fire AK Skin', quantity: 1, category: 'Skins', rarity: 'legendary', icon: '🐉' }, createdAt: new Date(Date.now() - 7200000), featured: false },
  { id: 't20', seller: { name: 'ExclusiveItems', rating: 5.0, trades: 89, verified: true }, offering: { name: 'Winter Event Skin Set', quantity: 1, category: 'Skins', rarity: 'legendary', icon: '❄️' }, wanting: { name: 'Eldrun Coins', quantity: 100000, category: 'Währung', rarity: 'common', icon: '🪙' }, createdAt: new Date(Date.now() - 1800000), featured: false },
]

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>(SIMULATED_TRADES)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  const filteredTrades = trades
    .filter(trade => {
      const matchesSearch = trade.offering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trade.wanting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trade.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Alle' || 
                             trade.offering.category === selectedCategory ||
                             trade.wanting.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.seller.rating - a.seller.rating
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `vor ${minutes}m`
    return `vor ${hours}h`
  }

  return (
    <EldrunPageShell
      icon={ArrowLeftRight}
      badge="TRADING"
      title="TRADING"
      subtitle="SICHERER HANDELSPLATZ"
      description={`${trades.length} aktive Trades. Sichere Transaktionen mit Escrow-System. 98% Zufriedenheit.`}
      gradient="from-emerald-300 via-emerald-400 to-emerald-600"
      glowColor="rgba(52,211,153,0.22)"
    >
      <div>
        <AuthGate>
        {/* Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Items oder Händler suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-3 rounded-xl text-sm ${
                sortBy === 'recent' ? 'bg-metal-700 text-white' : 'bg-metal-800 text-metal-400'
              }`}
            >
              Neueste
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-3 rounded-xl text-sm ${
                sortBy === 'rating' ? 'bg-metal-700 text-white' : 'bg-metal-800 text-metal-400'
              }`}
            >
              Beste Bewertung
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Trade erstellen
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ITEM_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Trades */}
        {filteredTrades.some(t => t.featured) && (
          <div className="mb-8">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Hervorgehobene Trades
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTrades.filter(t => t.featured).map(trade => (
                <TradeCard key={trade.id} trade={trade} formatTimeAgo={formatTimeAgo} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Trades */}
        <div className="space-y-4">
          <h2 className="font-bold text-white">Alle Trades ({filteredTrades.filter(t => !t.featured).length})</h2>
          {filteredTrades.filter(t => !t.featured).map(trade => (
            <TradeCard key={trade.id} trade={trade} formatTimeAgo={formatTimeAgo} />
          ))}

          {filteredTrades.length === 0 && (
            <div className="text-center py-12 text-metal-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Trades gefunden</p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTradeModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}

function TradeCard({ trade, formatTimeAgo, featured = false }: { trade: Trade, formatTimeAgo: (date: Date) => string, featured?: boolean }) {
  const offeringRarity = ITEM_RARITY[trade.offering.rarity as keyof typeof ITEM_RARITY]
  const wantingRarity = ITEM_RARITY[trade.wanting.rarity as keyof typeof ITEM_RARITY]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-metal-900/50 border rounded-xl p-4 lg:p-5 hover:border-emerald-500/50 transition-all ${
        featured ? 'border-amber-500/50' : 'border-metal-800'
      }`}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Offering */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-metal-500 mb-1.5">BIETET</div>
          <div className={`p-3 rounded-xl border ${offeringRarity.bg} ${offeringRarity.border}`}>
            <div className="flex items-center gap-2">
              <div className="text-2xl flex-shrink-0">{trade.offering.icon}</div>
              <div className="min-w-0">
                <div className={`font-bold text-sm truncate ${offeringRarity.color}`}>{trade.offering.name}</div>
                <div className="text-xs text-metal-400">x{trade.offering.quantity.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-metal-800 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Wanting */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-metal-500 mb-1.5">SUCHT</div>
          <div className={`p-3 rounded-xl border ${wantingRarity.bg} ${wantingRarity.border}`}>
            <div className="flex items-center gap-2">
              <div className="text-2xl flex-shrink-0">{trade.wanting.icon}</div>
              <div className="min-w-0">
                <div className={`font-bold text-sm truncate ${wantingRarity.color}`}>{trade.wanting.name}</div>
                <div className="text-xs text-metal-400">x{trade.wanting.quantity.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex-shrink-0 w-40">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-metal-800 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-metal-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-white text-sm truncate">{trade.seller.name}</span>
                {trade.seller.verified && (
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-amber-400">{trade.seller.rating}</span>
                <span className="text-metal-500">({trade.seller.trades})</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-metal-500 flex items-center gap-1 pl-10">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(trade.createdAt)}
          </div>
        </div>

        {/* Action */}
        <button className="flex-shrink-0 px-5 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium text-sm">
          Trade
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-metal-800 flex items-center justify-center">
            <User className="w-4 h-4 text-metal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-medium text-white text-sm truncate">{trade.seller.name}</span>
              {trade.seller.verified && <Check className="w-3 h-3 text-emerald-400" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-metal-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {trade.seller.rating}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(trade.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className={`flex-1 p-2.5 rounded-lg border ${offeringRarity.bg} ${offeringRarity.border}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{trade.offering.icon}</span>
              <div className="min-w-0">
                <div className={`font-bold text-xs truncate ${offeringRarity.color}`}>{trade.offering.name}</div>
                <div className="text-xs text-metal-400">x{trade.offering.quantity.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <ArrowLeftRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className={`flex-1 p-2.5 rounded-lg border ${wantingRarity.bg} ${wantingRarity.border}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{trade.wanting.icon}</span>
              <div className="min-w-0">
                <div className={`font-bold text-xs truncate ${wantingRarity.color}`}>{trade.wanting.name}</div>
                <div className="text-xs text-metal-400">x{trade.wanting.quantity.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium text-sm">
          Trade
        </button>
      </div>
    </motion.div>
  )
}

function CreateTradeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-metal-900 border border-metal-700 rounded-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-metal-800 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Trade erstellen</h2>
          <button onClick={onClose} className="p-2 text-metal-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Offering */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Ich biete</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500"
                />
                <input
                  type="number"
                  placeholder="Menge"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500"
                />
                <select className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white">
                  <option>Kategorie wählen</option>
                  {ITEM_CATEGORIES.slice(1).map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wanting */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Ich suche</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500"
                />
                <input
                  type="number"
                  placeholder="Menge"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500"
                />
                <select className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white">
                  <option>Kategorie wählen</option>
                  {ITEM_CATEGORIES.slice(1).map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-400/80">
                Alle Trades werden über unser Escrow-System abgewickelt. Du erhältst die Items erst, wenn beide Parteien bestätigt haben.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-metal-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Trade veröffentlichen
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
