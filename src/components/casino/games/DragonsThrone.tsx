'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Flame, Sword, Shield, Sparkles, 
  Trophy, Coins, Zap, Target, Star, Lock,
  ChevronRight, Volume2, VolumeX
} from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

type Faction = 'seraphar' | 'vorgaroth' | null
type GamePhase = 'select' | 'battle' | 'dragons' | 'throne' | 'result'

interface Dragon {
  id: string
  name: string
  power: number
  element: 'fire' | 'ice' | 'shadow' | 'light'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const DRAGONS: Dragon[] = [
  { id: 'd1', name: 'Flammenherz', power: 15, element: 'fire', rarity: 'common' },
  { id: 'd2', name: 'Frostzahn', power: 20, element: 'ice', rarity: 'common' },
  { id: 'd3', name: 'Schattenklaue', power: 25, element: 'shadow', rarity: 'rare' },
  { id: 'd4', name: 'Lichtbringer', power: 30, element: 'light', rarity: 'rare' },
  { id: 'd5', name: 'Infernus', power: 45, element: 'fire', rarity: 'epic' },
  { id: 'd6', name: 'Frostkaiser', power: 50, element: 'ice', rarity: 'epic' },
  { id: 'd7', name: 'Nachtschatten', power: 65, element: 'shadow', rarity: 'legendary' },
  { id: 'd8', name: 'Sonnendrache', power: 75, element: 'light', rarity: 'legendary' },
]

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-amber-500 to-orange-600',
}

const ELEMENT_ICONS = {
  fire: '🔥',
  ice: '❄️',
  shadow: '🌑',
  light: '✨',
}

export function DragonsThrone() {
  const { balance, subtractBalance, addBalance, updateStats, addHistory } = useCasinoStore()
  const [betAmount, setBetAmount] = useState(500)
  const [faction, setFaction] = useState<Faction>(null)
  const [phase, setPhase] = useState<GamePhase>('select')
  const [collectedDragons, setCollectedDragons] = useState<Dragon[]>([])
  const [currentDragon, setCurrentDragon] = useState<Dragon | null>(null)
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null)
  const [multiplier, setMultiplier] = useState(1)
  const [totalPower, setTotalPower] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [throneProgress, setThroneProgress] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const minBet = 500
  const maxBet = 250000

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num)
  }

  const startGame = () => {
    if (betAmount < minBet || betAmount > maxBet || balance < betAmount || !faction) return
    
    subtractBalance(betAmount)
    
    setCollectedDragons([])
    setTotalPower(0)
    setMultiplier(1)
    setThroneProgress(0)
    setPhase('battle')
    spawnDragon()
  }

  const spawnDragon = () => {
    setIsAnimating(true)
    setBattleResult(null)
    
    // Weighted random dragon selection
    const roll = Math.random() * 100
    let dragon: Dragon
    
    if (roll < 40) {
      // Common (40%)
      dragon = DRAGONS.filter(d => d.rarity === 'common')[Math.floor(Math.random() * 2)]
    } else if (roll < 70) {
      // Rare (30%)
      dragon = DRAGONS.filter(d => d.rarity === 'rare')[Math.floor(Math.random() * 2)]
    } else if (roll < 90) {
      // Epic (20%)
      dragon = DRAGONS.filter(d => d.rarity === 'epic')[Math.floor(Math.random() * 2)]
    } else {
      // Legendary (10%)
      dragon = DRAGONS.filter(d => d.rarity === 'legendary')[Math.floor(Math.random() * 2)]
    }
    
    setTimeout(() => {
      setCurrentDragon(dragon)
      setIsAnimating(false)
    }, 1500)
  }

  const fightDragon = () => {
    if (!currentDragon || isAnimating) return
    
    setIsAnimating(true)
    setPhase('dragons')
    
    // Win chance based on faction bonus and current power
    const factionBonus = faction === 'seraphar' ? 5 : 3
    const powerBonus = Math.min(totalPower / 10, 15)
    const baseWinChance = 55 + factionBonus + powerBonus
    
    // Harder to win against legendary dragons
    const rarityPenalty = {
      common: 0,
      rare: 5,
      epic: 12,
      legendary: 20,
    }
    
    const finalWinChance = baseWinChance - rarityPenalty[currentDragon.rarity]
    const won = Math.random() * 100 < finalWinChance
    
    setTimeout(() => {
      if (won) {
        setBattleResult('win')
        const newDragons = [...collectedDragons, currentDragon]
        setCollectedDragons(newDragons)
        
        const newPower = totalPower + currentDragon.power
        setTotalPower(newPower)
        
        // Update multiplier based on dragons collected
        const rarityMultipliers = {
          common: 0.2,
          rare: 0.4,
          epic: 0.8,
          legendary: 1.5,
        }
        const newMultiplier = multiplier + rarityMultipliers[currentDragon.rarity]
        setMultiplier(newMultiplier)
        
        // Update throne progress
        const newProgress = Math.min(100, throneProgress + (currentDragon.power / 2))
        setThroneProgress(newProgress)
        
        setTimeout(() => {
          setIsAnimating(false)
          if (newProgress >= 100) {
            // Throne conquered!
            setPhase('throne')
          } else {
            setPhase('battle')
          }
        }, 1500)
      } else {
        setBattleResult('lose')
        setTimeout(() => {
          setPhase('result')
          setIsAnimating(false)
        }, 2000)
      }
    }, 2000)
  }

  const continueHunting = () => {
    spawnDragon()
    setPhase('battle')
  }

  const claimThrone = () => {
    // Bonus multiplier for conquering the throne
    const throneBonus = 2.0
    const finalMultiplier = multiplier * throneBonus
    const winnings = Math.floor(betAmount * finalMultiplier)
    addBalance(winnings)
    updateStats(betAmount, winnings)
    addHistory({ game: "Dragon's Throne", bet: betAmount, result: 'win', payout: winnings, multiplier: finalMultiplier })
    setPhase('result')
  }

  const cashOut = () => {
    if (collectedDragons.length === 0) {
      updateStats(betAmount, 0)
      addHistory({ game: "Dragon's Throne", bet: betAmount, result: 'lose', payout: 0 })
      setPhase('result')
      return
    }
    
    const winnings = Math.floor(betAmount * multiplier)
    addBalance(winnings)
    updateStats(betAmount, winnings)
    addHistory({ game: "Dragon's Throne", bet: betAmount, result: 'win', payout: winnings, multiplier })
    setPhase('result')
  }

  const resetGame = () => {
    setFaction(null)
    setPhase('select')
    setCollectedDragons([])
    setCurrentDragon(null)
    setBattleResult(null)
    setMultiplier(1)
    setTotalPower(0)
    setThroneProgress(0)
  }

  return (
    <div className="bg-gradient-to-b from-metal-900 via-metal-900 to-metal-950 border border-amber-900/50 overflow-hidden">
      {/* Epic Header */}
      <div className="relative p-6 border-b border-amber-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-red-900/20 to-purple-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-red-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-purple-400">
                DRAGON&apos;S THRONE
              </h2>
              <p className="text-metal-400 text-sm">Erobere das Reich der Drachen und beanspruche den Eisernen Thron!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-metal-400" /> : <VolumeX className="w-5 h-5 text-metal-500" />}
            </button>
            
            <div className="text-right">
              <p className="text-metal-500 text-xs">JACKPOT POOL</p>
              <p className="font-mono text-xl font-bold text-amber-400">
                {formatNumber(500000 + Math.floor(Math.random() * 100000))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* PHASE: Select Faction */}
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Bet Input */}
              <div className="max-w-md mx-auto">
                <label className="block text-metal-400 text-sm mb-2">Einsatz wählen</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={minBet}
                    max={Math.min(maxBet, balance)}
                    step={100}
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <div className="w-32 bg-metal-800 border border-metal-700 px-4 py-2 text-center">
                    <span className="font-mono text-amber-400 font-bold">{formatNumber(betAmount)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-metal-500">
                  <span>Min: {formatNumber(minBet)}</span>
                  <span>Max: {formatNumber(Math.min(maxBet, balance))}</span>
                </div>
              </div>

              {/* Faction Selection */}
              <div>
                <h3 className="text-center text-white font-display text-lg mb-4">Wähle deine Fraktion</h3>
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {/* Seraphar */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFaction('seraphar')}
                    className={`relative p-6 border-2 rounded-xl transition-all ${
                      faction === 'seraphar' 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-metal-700 bg-metal-800/50 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      {faction === 'seraphar' && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-5xl mb-3">⚔️</div>
                    <h4 className="font-display font-bold text-xl text-amber-400">SERAPHAR</h4>
                    <p className="text-metal-400 text-sm mt-1">Die Lichtkrieger</p>
                    <div className="mt-3 text-xs text-green-400">+5% Gewinnchance</div>
                  </motion.button>

                  {/* Vorgaroth */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFaction('vorgaroth')}
                    className={`relative p-6 border-2 rounded-xl transition-all ${
                      faction === 'vorgaroth' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-metal-700 bg-metal-800/50 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      {faction === 'vorgaroth' && <Star className="w-6 h-6 text-purple-400 fill-purple-400" />}
                    </div>
                    <div className="text-5xl mb-3">🔥</div>
                    <h4 className="font-display font-bold text-xl text-purple-400">VORGAROTH</h4>
                    <p className="text-metal-400 text-sm mt-1">Die dunkle Legion</p>
                    <div className="mt-3 text-xs text-purple-400">+3% Gewinn, +20% Multiplier</div>
                  </motion.button>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  disabled={!faction || balance < betAmount}
                  className={`px-12 py-4 font-display font-bold text-lg rounded-xl transition-all ${
                    faction && balance >= betAmount
                      ? 'bg-gradient-to-r from-amber-500 via-red-500 to-purple-600 text-white shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50'
                      : 'bg-metal-700 text-metal-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    BEGINNE DIE EROBERUNG
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </motion.button>
              </div>

              {/* Game Rules */}
              <div className="max-w-2xl mx-auto bg-metal-800/50 border border-metal-700 rounded-xl p-4">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Spielregeln
                </h4>
                <ul className="text-sm text-metal-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    Wähle deine Fraktion und kämpfe gegen Drachen um den Thron zu erobern
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    Jeder besiegte Drache erhöht deinen Multiplier und deine Macht
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    Erreiche 100% Thron-Fortschritt für den 2x Thron-Bonus!
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    Cash Out jederzeit oder riskiere alles für größere Gewinne!
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* PHASE: Battle */}
          {phase === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Status Bar */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-metal-800/50 border border-metal-700 p-4 rounded-lg text-center">
                  <p className="text-metal-500 text-xs">EINSATZ</p>
                  <p className="font-mono font-bold text-white">{formatNumber(betAmount)}</p>
                </div>
                <div className="bg-metal-800/50 border border-metal-700 p-4 rounded-lg text-center">
                  <p className="text-metal-500 text-xs">MULTIPLIER</p>
                  <p className="font-mono font-bold text-green-400">{multiplier.toFixed(2)}x</p>
                </div>
                <div className="bg-metal-800/50 border border-metal-700 p-4 rounded-lg text-center">
                  <p className="text-metal-500 text-xs">MACHT</p>
                  <p className="font-mono font-bold text-purple-400">{totalPower}</p>
                </div>
                <div className="bg-metal-800/50 border border-metal-700 p-4 rounded-lg text-center">
                  <p className="text-metal-500 text-xs">POTENTIELL</p>
                  <p className="font-mono font-bold text-amber-400">{formatNumber(Math.floor(betAmount * multiplier))}</p>
                </div>
              </div>

              {/* Throne Progress */}
              <div className="bg-metal-800/30 border border-amber-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-metal-400 text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Thron-Fortschritt
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{throneProgress.toFixed(0)}%</span>
                </div>
                <div className="h-4 bg-metal-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-red-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${throneProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Dragon Arena */}
              <div className="relative min-h-[300px] bg-gradient-to-b from-metal-800/50 to-metal-900/50 border border-metal-700 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                
                {isAnimating && !currentDragon && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl"
                  >
                    🐉
                  </motion.div>
                )}
                
                {currentDragon && !isAnimating && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-center"
                  >
                    <div className={`inline-block p-8 rounded-2xl bg-gradient-to-br ${RARITY_COLORS[currentDragon.rarity]} shadow-2xl`}>
                      <div className="text-8xl mb-2">{ELEMENT_ICONS[currentDragon.element]}</div>
                      <div className="text-7xl">🐉</div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mt-4">{currentDragon.name}</h3>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        currentDragon.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                        currentDragon.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                        currentDragon.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {currentDragon.rarity}
                      </span>
                      <span className="text-metal-400">
                        Macht: <span className="text-white font-bold">{currentDragon.power}</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              {currentDragon && !isAnimating && (
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fightDragon}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-display font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2"
                  >
                    <Sword className="w-5 h-5" />
                    KÄMPFEN
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cashOut}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-display font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2"
                  >
                    <Coins className="w-5 h-5" />
                    CASH OUT ({formatNumber(Math.floor(betAmount * multiplier))})
                  </motion.button>
                </div>
              )}

              {/* Collected Dragons */}
              {collectedDragons.length > 0 && (
                <div className="bg-metal-800/30 border border-metal-700 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Eroberte Drachen ({collectedDragons.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {collectedDragons.map((dragon, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg bg-gradient-to-r ${RARITY_COLORS[dragon.rarity]} text-white text-sm font-medium flex items-center gap-2`}
                      >
                        {ELEMENT_ICONS[dragon.element]} {dragon.name} (+{dragon.power})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE: Dragons (Battle Animation) */}
          {phase === 'dragons' && (
            <motion.div
              key="dragons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-8xl mb-6"
                >
                  ⚔️
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-white">KAMPF!</h3>
                
                {battleResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-6"
                  >
                    {battleResult === 'win' ? (
                      <div className="text-green-400 font-display text-3xl font-bold">
                        ✓ SIEG! Drache erobert!
                      </div>
                    ) : (
                      <div className="text-red-400 font-display text-3xl font-bold">
                        ✗ NIEDERLAGE!
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE: Throne (Victory!) */}
          {phase === 'throne' && (
            <motion.div
              key="throne"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-6"
              >
                👑
              </motion.div>
              <h2 className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 mb-4">
                DER THRON IST DEIN!
              </h2>
              <p className="text-metal-400 text-lg mb-8">
                Du hast das Reich der Drachen erobert!
              </p>
              
              <div className="inline-block bg-metal-800 border border-amber-500/50 rounded-xl p-6 mb-8">
                <p className="text-metal-400 mb-2">THRON BONUS: 2x</p>
                <p className="text-4xl font-mono font-bold text-amber-400">
                  {formatNumber(Math.floor(betAmount * multiplier * 2))}
                </p>
                <p className="text-green-400 text-sm mt-2">
                  ({multiplier.toFixed(2)}x × 2.0 Thron Bonus)
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={claimThrone}
                className="px-12 py-4 bg-gradient-to-r from-amber-500 via-red-500 to-purple-600 text-white font-display font-bold text-xl rounded-xl shadow-2xl shadow-amber-500/30"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  THRON BEANSPRUCHEN
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* PHASE: Result */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              {collectedDragons.length > 0 ? (
                <>
                  <div className="text-7xl mb-6">🏆</div>
                  <h2 className="font-display text-3xl font-bold text-green-400 mb-4">
                    GEWONNEN!
                  </h2>
                  <p className="text-metal-400 mb-6">
                    Du hast {collectedDragons.length} Drachen besiegt!
                  </p>
                  <div className="inline-block bg-metal-800 border border-green-500/50 rounded-xl p-6 mb-8">
                    <p className="text-metal-400 mb-2">GEWINN</p>
                    <p className="text-4xl font-mono font-bold text-green-400">
                      +{formatNumber(Math.floor(betAmount * multiplier * (throneProgress >= 100 ? 2 : 1)))}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-6">💀</div>
                  <h2 className="font-display text-3xl font-bold text-red-400 mb-4">
                    VERLOREN!
                  </h2>
                  <p className="text-metal-400 mb-6">
                    Der Drache war zu mächtig...
                  </p>
                  <div className="inline-block bg-metal-800 border border-red-500/50 rounded-xl p-6 mb-8">
                    <p className="text-metal-400 mb-2">VERLUST</p>
                    <p className="text-4xl font-mono font-bold text-red-400">
                      -{formatNumber(betAmount)}
                    </p>
                  </div>
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-bold rounded-xl"
              >
                NOCHMAL SPIELEN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
