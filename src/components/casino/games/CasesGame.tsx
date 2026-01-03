'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Sparkles, X } from 'lucide-react'
import { useCasinoStore, CASINO_CASES, CasinoItem } from '@/hooks/useCasinoStore'
import { RUST_SKINS, RustSkin, RARITY_CONFIG as SKIN_RARITY, getRandomSkinByRarity, SkinRarity } from '@/data/rustSkins'

const RARITY_CONFIG = {
  common: { bg: 'bg-gray-600', border: 'border-gray-500', glow: 'shadow-gray-500/50', color: '#9CA3AF' },
  uncommon: { bg: 'bg-green-600', border: 'border-green-500', glow: 'shadow-green-500/50', color: '#22C55E' },
  rare: { bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-blue-500/50', color: '#3B82F6' },
  epic: { bg: 'bg-purple-600', border: 'border-purple-500', glow: 'shadow-purple-500/50', color: '#A855F7' },
  legendary: { bg: 'bg-amber-600', border: 'border-amber-500', glow: 'shadow-amber-500/50', color: '#F59E0B' },
  mythic: { bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-red-500/50', color: '#EF4444' },
  contraband: { bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-red-500/50', color: '#EF4444' },
}

// Enhanced cases with Rust skins
interface SkinCase {
  id: string
  name: string
  image: string
  price: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  drops: { rarity: SkinRarity; chance: number }[]
}

const SKIN_CASES: SkinCase[] = [
  {
    id: 'starter',
    name: 'Starter Case',
    image: '📦',
    price: 500,
    rarity: 'common',
    drops: [
      { rarity: 'common', chance: 60 },
      { rarity: 'uncommon', chance: 30 },
      { rarity: 'rare', chance: 9 },
      { rarity: 'epic', chance: 1 },
    ]
  },
  {
    id: 'weapon',
    name: 'Weapon Case',
    image: '🔫',
    price: 2500,
    rarity: 'uncommon',
    drops: [
      { rarity: 'common', chance: 40 },
      { rarity: 'uncommon', chance: 35 },
      { rarity: 'rare', chance: 20 },
      { rarity: 'epic', chance: 4.5 },
      { rarity: 'legendary', chance: 0.5 },
    ]
  },
  {
    id: 'elite',
    name: 'Elite Case',
    image: '💎',
    price: 10000,
    rarity: 'rare',
    drops: [
      { rarity: 'uncommon', chance: 30 },
      { rarity: 'rare', chance: 45 },
      { rarity: 'epic', chance: 20 },
      { rarity: 'legendary', chance: 4.8 },
      { rarity: 'contraband', chance: 0.2 },
    ]
  },
  {
    id: 'legendary',
    name: 'Legendary Case',
    image: '👑',
    price: 50000,
    rarity: 'legendary',
    drops: [
      { rarity: 'rare', chance: 25 },
      { rarity: 'epic', chance: 50 },
      { rarity: 'legendary', chance: 23 },
      { rarity: 'contraband', chance: 2 },
    ]
  },
]

export function CasesGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [selectedCase, setSelectedCase] = useState(CASINO_CASES[0])
  const [isOpening, setIsOpening] = useState(false)
  const [wonItem, setWonItem] = useState<CasinoItem | null>(null)
  const [spinItems, setSpinItems] = useState<CasinoItem[]>([])
  const [spinPosition, setSpinPosition] = useState(0)

  const closeWonModal = () => setWonItem(null)

  useEffect(() => {
    if (!wonItem) return
    const timer = setTimeout(() => {
      setWonItem(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [wonItem])

  const openCase = () => {
    if (balance < selectedCase.price || isOpening) return

    subtractBalance(selectedCase.price)
    setIsOpening(true)
    setWonItem(null)

    // Generate spin items
    const items: CasinoItem[] = []
    for (let i = 0; i < 50; i++) {
      const rand = Math.random() * 100
      let cumulative = 0
      for (const { item, chance } of selectedCase.items) {
        cumulative += chance
        if (rand <= cumulative) {
          items.push(item)
          break
        }
      }
    }

    // Determine winning item (position 42 is where pointer lands)
    const winIndex = 42
    const rand = Math.random() * 100
    let cumulative = 0
    for (const { item, chance } of selectedCase.items) {
      cumulative += chance
      if (rand <= cumulative) {
        items[winIndex] = item
        break
      }
    }

    setSpinItems(items)

    // Calculate spin position
    const itemWidth = 120
    const targetPosition = -(winIndex * itemWidth) + Math.random() * 50 - 25

    setTimeout(() => setSpinPosition(targetPosition), 100)

    // Show result
    setTimeout(() => {
      const won = items[winIndex]
      setWonItem(won)
      addBalance(won.value)
      
      addHistory({
        game: 'Cases',
        bet: selectedCase.price,
        result: won.value >= selectedCase.price ? 'win' : 'lose',
        payout: won.value,
        multiplier: Math.round((won.value / selectedCase.price) * 100) / 100
      })
      updateStats(selectedCase.price, won.value)

      setTimeout(() => {
        setIsOpening(false)
        setSpinPosition(0)
        setSpinItems([])
      }, 3000)
    }, 5000)
  }

  return (
    <div className="space-y-6">
      {/* Case Selection */}
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          Wähle eine Case
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CASINO_CASES.map((caseItem) => (
            <button
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              disabled={isOpening}
              className={`p-4 border-2 transition-all ${
                selectedCase.id === caseItem.id
                  ? `${RARITY_CONFIG[caseItem.rarity].border} ${RARITY_CONFIG[caseItem.rarity].bg}/20`
                  : 'border-metal-700 bg-metal-800/50 hover:border-metal-600'
              } disabled:opacity-50`}
            >
              <div className="text-5xl mb-3">{caseItem.image}</div>
              <p className="font-display font-bold text-white">{caseItem.name}</p>
              <p className={`font-mono ${RARITY_CONFIG[caseItem.rarity].border.replace('border-', 'text-')}`}>
                {caseItem.price.toLocaleString()} Coins
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Case Opening Area */}
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <div className="relative overflow-hidden bg-metal-950 border border-metal-700 mb-6" style={{ height: 150 }}>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-amber-400 z-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-amber-400 z-10" />

          {isOpening ? (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 flex"
              style={{ left: '50%' }}
              animate={{ x: spinPosition }}
              transition={{ duration: 5, ease: [0.1, 0.7, 0.2, 1] }}
            >
              {spinItems.map((item, i) => (
                <div
                  key={i}
                  className={`w-28 h-28 flex flex-col items-center justify-center mx-1 border-2 ${
                    RARITY_CONFIG[item.rarity].border
                  } ${RARITY_CONFIG[item.rarity].bg}/30`}
                >
                  <span className="text-3xl">{item.image}</span>
                  <span className="text-xs text-white truncate px-1">{item.name}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-metal-500">
              <Package className="w-12 h-12 opacity-30" />
            </div>
          )}
        </div>

        {/* Selected Case Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 flex items-center justify-center text-4xl border-2 ${
              RARITY_CONFIG[selectedCase.rarity].border
            } ${RARITY_CONFIG[selectedCase.rarity].bg}/30`}>
              {selectedCase.image}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-white">{selectedCase.name}</p>
              <p className="text-metal-500">{selectedCase.items.length} mögliche Items</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-metal-500 text-sm">Preis</p>
            <p className="font-mono font-bold text-2xl text-amber-400">
              {selectedCase.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Open Button */}
        <button
          onClick={openCase}
          disabled={balance < selectedCase.price || isOpening}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isOpening ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              Opening...
            </span>
          ) : (
            `Case öffnen (${selectedCase.price.toLocaleString()} Coins)`
          )}
        </button>

        {/* Possible Items */}
        <div className="mt-6">
          <p className="text-metal-500 text-sm mb-3">Mögliche Items:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCase.items.map(({ item, chance }) => (
              <div
                key={item.id}
                className={`px-3 py-2 border ${RARITY_CONFIG[item.rarity].border} ${RARITY_CONFIG[item.rarity].bg}/20 flex items-center gap-2`}
              >
                <span>{item.image}</span>
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-metal-500 text-xs">({chance}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Won Item Modal */}
      <AnimatePresence>
        {wonItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={closeWonModal}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`p-8 border-4 ${RARITY_CONFIG[wonItem.rarity].border} ${RARITY_CONFIG[wonItem.rarity].bg}/30 shadow-2xl ${RARITY_CONFIG[wonItem.rarity].glow}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end -mt-4 -mr-4 mb-2">
                <button
                  type="button"
                  onClick={closeWonModal}
                  className="p-2 bg-metal-900/70 border border-metal-700 text-metal-200 hover:text-white hover:border-metal-500 transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-metal-400 text-sm mb-2">Du hast gewonnen!</p>
                <div className="text-8xl mb-4">{wonItem.image}</div>
                <p className="font-display font-black text-2xl text-white">{wonItem.name}</p>
                <p className={`font-mono text-xl ${RARITY_CONFIG[wonItem.rarity].border.replace('border-', 'text-')}`}>
                  {wonItem.rarity.toUpperCase()}
                </p>
                <p className="font-mono font-bold text-3xl text-amber-400 mt-4">
                  +{wonItem.value.toLocaleString()} Coins
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
