'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Package, ArrowLeft, Search, Filter, MapPin, Percent,
  ChevronDown, Box, Gem, Skull
} from 'lucide-react'

const LOOT_CATEGORIES = ['Alle', 'Kisten', 'Fässer', 'Wissenschaftler', 'Monumente', 'Events']

const RARITY_COLORS = {
  common: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  uncommon: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  legendary: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
}

const LOOT_SOURCES = [
  {
    id: 'basic_crate',
    name: 'Basic Crate',
    category: 'Kisten',
    location: 'Überall',
    icon: '📦',
    description: 'Grundlegende Holzkiste mit Basis-Items',
    loot: [
      { item: 'Cloth', chance: 35, amount: '5-20', rarity: 'common' },
      { item: 'Metal Fragments', chance: 30, amount: '10-50', rarity: 'common' },
      { item: 'Wood', chance: 25, amount: '50-150', rarity: 'common' },
      { item: 'Rope', chance: 15, amount: '1-2', rarity: 'uncommon' },
      { item: 'Sewing Kit', chance: 10, amount: '1', rarity: 'uncommon' },
    ]
  },
  {
    id: 'military_crate',
    name: 'Military Crate',
    category: 'Kisten',
    location: 'Monumente',
    icon: '🎖️',
    description: 'Militärkiste mit hochwertigen Items',
    loot: [
      { item: 'Rifle Body', chance: 5, amount: '1', rarity: 'legendary' },
      { item: 'SMG Body', chance: 8, amount: '1', rarity: 'epic' },
      { item: 'Semi Body', chance: 12, amount: '1', rarity: 'rare' },
      { item: 'Metal Spring', chance: 20, amount: '1-2', rarity: 'rare' },
      { item: 'Metal Pipe', chance: 25, amount: '1-3', rarity: 'uncommon' },
      { item: '5.56 Ammo', chance: 30, amount: '10-30', rarity: 'uncommon' },
      { item: 'Medical Syringe', chance: 15, amount: '1-2', rarity: 'rare' },
    ]
  },
  {
    id: 'elite_crate',
    name: 'Elite Crate',
    category: 'Kisten',
    location: 'Launch Site, Oil Rig',
    icon: '👑',
    description: 'Seltene Kiste mit Top-Tier Loot',
    loot: [
      { item: 'Assault Rifle', chance: 3, amount: '1', rarity: 'legendary' },
      { item: 'Bolt Action Rifle', chance: 4, amount: '1', rarity: 'legendary' },
      { item: 'LR-300', chance: 2, amount: '1', rarity: 'legendary' },
      { item: 'MP5A4', chance: 5, amount: '1', rarity: 'epic' },
      { item: 'Metal Facemask', chance: 8, amount: '1', rarity: 'epic' },
      { item: 'Metal Chestplate', chance: 8, amount: '1', rarity: 'epic' },
      { item: 'Rifle Body', chance: 15, amount: '1', rarity: 'rare' },
      { item: 'C4', chance: 2, amount: '1', rarity: 'legendary' },
    ]
  },
  {
    id: 'oil_barrel',
    name: 'Öl Fass',
    category: 'Fässer',
    location: 'Straßen',
    icon: '🛢️',
    description: 'Fass mit Öl und Komponenten',
    loot: [
      { item: 'Crude Oil', chance: 60, amount: '5-15', rarity: 'common' },
      { item: 'Low Grade Fuel', chance: 40, amount: '3-10', rarity: 'common' },
      { item: 'Metal Pipe', chance: 10, amount: '1', rarity: 'uncommon' },
      { item: 'Gears', chance: 8, amount: '1', rarity: 'uncommon' },
    ]
  },
  {
    id: 'regular_barrel',
    name: 'Normales Fass',
    category: 'Fässer',
    location: 'Überall',
    icon: '🪣',
    description: 'Standard Fass mit Ressourcen',
    loot: [
      { item: 'Scrap', chance: 50, amount: '1-3', rarity: 'common' },
      { item: 'Metal Fragments', chance: 40, amount: '10-30', rarity: 'common' },
      { item: 'Tarp', chance: 15, amount: '1', rarity: 'uncommon' },
      { item: 'Road Signs', chance: 12, amount: '1', rarity: 'uncommon' },
      { item: 'Sheet Metal', chance: 10, amount: '1', rarity: 'uncommon' },
    ]
  },
  {
    id: 'scientist_blue',
    name: 'Blauer Wissenschaftler',
    category: 'Wissenschaftler',
    location: 'Oil Rig, Cargo',
    icon: '🔬',
    description: 'Schwerer Wissenschaftler mit guter Ausrüstung',
    loot: [
      { item: 'MP5A4', chance: 15, amount: '1', rarity: 'epic' },
      { item: 'Hazmat Suit', chance: 25, amount: '1', rarity: 'rare' },
      { item: 'Medical Syringe', chance: 40, amount: '1-3', rarity: 'uncommon' },
      { item: '5.56 Ammo', chance: 60, amount: '20-60', rarity: 'common' },
      { item: 'Pistol Ammo', chance: 50, amount: '20-40', rarity: 'common' },
      { item: 'Scrap', chance: 80, amount: '10-30', rarity: 'common' },
    ]
  },
  {
    id: 'bradley',
    name: 'Bradley APC',
    category: 'Events',
    location: 'Launch Site',
    icon: '🚁',
    description: 'Gepanzerter Fahrzeug mit Elite Loot',
    loot: [
      { item: 'Assault Rifle', chance: 20, amount: '1', rarity: 'legendary' },
      { item: 'LR-300', chance: 15, amount: '1', rarity: 'legendary' },
      { item: 'C4', chance: 10, amount: '1-2', rarity: 'legendary' },
      { item: 'Rocket', chance: 15, amount: '1-3', rarity: 'epic' },
      { item: 'Metal Facemask', chance: 25, amount: '1', rarity: 'epic' },
      { item: 'Metal Chestplate', chance: 25, amount: '1', rarity: 'epic' },
      { item: 'HQM', chance: 80, amount: '50-100', rarity: 'common' },
    ]
  },
  {
    id: 'helicopter',
    name: 'Attack Helicopter',
    category: 'Events',
    location: 'Überall',
    icon: '🚁',
    description: 'Helikopter Event mit bestem Loot',
    loot: [
      { item: 'M249', chance: 5, amount: '1', rarity: 'legendary' },
      { item: 'Assault Rifle', chance: 25, amount: '1', rarity: 'legendary' },
      { item: 'Bolt Action Rifle', chance: 20, amount: '1', rarity: 'legendary' },
      { item: 'C4', chance: 15, amount: '2-4', rarity: 'legendary' },
      { item: 'Rocket', chance: 20, amount: '2-4', rarity: 'epic' },
      { item: 'HQM', chance: 100, amount: '100-200', rarity: 'common' },
      { item: 'Scrap', chance: 100, amount: '100-200', rarity: 'common' },
    ]
  },
  {
    id: 'airfield',
    name: 'Airfield',
    category: 'Monumente',
    location: 'Airfield',
    icon: '✈️',
    description: 'Mittleres Monument mit gutem Loot',
    loot: [
      { item: 'Military Crate', chance: 4, amount: '3-4', rarity: 'rare' },
      { item: 'Elite Crate', chance: 1, amount: '1', rarity: 'legendary' },
      { item: 'Brown Crate', chance: 6, amount: '2-4', rarity: 'uncommon' },
      { item: 'Green Card', chance: 30, amount: '1', rarity: 'uncommon' },
      { item: 'Blue Card', chance: 10, amount: '1', rarity: 'rare' },
    ]
  },
  {
    id: 'launch_site',
    name: 'Launch Site',
    category: 'Monumente',
    location: 'Launch Site',
    icon: '🚀',
    description: 'Top-Tier Monument mit bestem Loot',
    loot: [
      { item: 'Elite Crate', chance: 3, amount: '1-2', rarity: 'legendary' },
      { item: 'Military Crate', chance: 8, amount: '5-8', rarity: 'epic' },
      { item: 'Bradley APC', chance: 1, amount: '1', rarity: 'legendary' },
      { item: 'Red Card', chance: 20, amount: '1', rarity: 'epic' },
      { item: 'MLRS Rockets', chance: 5, amount: '1-3', rarity: 'legendary' },
    ]
  },
]

export default function LootTablesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [selectedSource, setSelectedSource] = useState<typeof LOOT_SOURCES[0] | null>(null)

  const filteredSources = useMemo(() => {
    return LOOT_SOURCES.filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           source.loot.some(l => l.item.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'Alle' || source.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800">
        <div className="container-rust py-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-metal-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Tools
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Loot Tables</h1>
              <p className="text-metal-400">Alle Loot-Quellen und Drop-Chancen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
              <input
                type="text"
                placeholder="Suche nach Kisten oder Items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {LOOT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Loot Sources Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredSources.map(source => (
                <motion.button
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  className={`p-4 bg-metal-900/50 border rounded-xl text-left hover:border-amber-500/50 transition-all ${
                    selectedSource?.id === source.id ? 'border-amber-500' : 'border-metal-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{source.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{source.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-metal-500">
                        <MapPin className="w-3 h-3" />
                        {source.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-metal-400">{source.description}</p>
                  <div className="mt-2 text-xs text-metal-500">
                    {source.loot.length} Items
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredSources.length === 0 && (
              <div className="text-center py-12 text-metal-500">
                <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Loot-Quellen gefunden</p>
              </div>
            )}
          </div>

          {/* Right Column - Loot Details */}
          <div className="space-y-6">
            {selectedSource ? (
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 sticky top-28">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{selectedSource.icon}</div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{selectedSource.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-metal-400">
                      <MapPin className="w-4 h-4" />
                      {selectedSource.location}
                    </div>
                  </div>
                </div>

                <p className="text-metal-400 text-sm mb-6">{selectedSource.description}</p>

                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-amber-400" />
                  Möglicher Loot
                </h4>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSource.loot
                    .sort((a, b) => b.chance - a.chance)
                    .map((loot, i) => {
                      const rarity = RARITY_COLORS[loot.rarity as keyof typeof RARITY_COLORS]
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${rarity.bg} ${rarity.border}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium ${rarity.text}`}>{loot.item}</span>
                            <span className="text-sm text-metal-400">x{loot.amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-metal-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${rarity.text.replace('text-', 'bg-')}`}
                                style={{ width: `${loot.chance}%` }}
                              />
                            </div>
                            <span className="text-xs text-metal-400 w-12 text-right">{loot.chance}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 text-center text-metal-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Wähle eine Loot-Quelle, um die Details zu sehen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
