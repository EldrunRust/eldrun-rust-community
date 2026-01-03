'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

const SYMBOLS = [
  { id: 'seven', emoji: '7️⃣', value: 100, name: 'Seven' },
  { id: 'diamond', emoji: '💎', value: 50, name: 'Diamond' },
  { id: 'bell', emoji: '🔔', value: 25, name: 'Bell' },
  { id: 'cherry', emoji: '🍒', value: 15, name: 'Cherry' },
  { id: 'lemon', emoji: '🍋', value: 10, name: 'Lemon' },
  { id: 'orange', emoji: '🍊', value: 8, name: 'Orange' },
  { id: 'grape', emoji: '🍇', value: 5, name: 'Grape' },
  { id: 'watermelon', emoji: '🍉', value: 3, name: 'Watermelon' },
]

const REEL_SIZE = 20

function generateReel(): typeof SYMBOLS[number][] {
  const reel: typeof SYMBOLS[number][] = []
  for (let i = 0; i < REEL_SIZE; i++) {
    // Weighted random - higher value symbols are rarer
    const weights = [2, 5, 10, 15, 20, 20, 15, 13]
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let symbolIndex = 0
    
    for (let j = 0; j < weights.length; j++) {
      random -= weights[j]
      if (random <= 0) {
        symbolIndex = j
        break
      }
    }
    reel.push(SYMBOLS[symbolIndex])
  }
  return reel
}

interface ReelProps {
  symbols: typeof SYMBOLS[number][]
  spinning: boolean
  finalIndex: number
  reelIndex: number
  onStop: () => void
}

function Reel({ symbols, spinning, finalIndex, reelIndex, onStop }: ReelProps) {
  const [position, setPosition] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  
  useEffect(() => {
    if (!spinning) return
    
    startTimeRef.current = Date.now()
    const spinDuration = 2000 + reelIndex * 500 // Staggered stopping
    const symbolHeight = 80
    const totalHeight = symbols.length * symbolHeight
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      
      if (elapsed < spinDuration - 500) {
        // Fast spinning
        setPosition(prev => (prev + 30) % totalHeight)
        animationRef.current = requestAnimationFrame(animate)
      } else if (elapsed < spinDuration) {
        // Slowing down
        const remaining = spinDuration - elapsed
        const speed = (remaining / 500) * 30
        setPosition(prev => (prev + speed) % totalHeight)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Stop at final position
        const finalPos = finalIndex * symbolHeight
        setPosition(finalPos)
        onStop()
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [spinning, finalIndex, reelIndex, symbols.length, onStop])

  return (
    <div className="relative w-24 h-60 overflow-hidden bg-metal-900 border-2 border-metal-600 rounded-lg">
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-metal-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-metal-900 to-transparent z-10 pointer-events-none" />
      
      {/* Highlight line */}
      <div className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2 border-y-2 border-amber-500/50 bg-amber-500/10 z-5" />
      
      {/* Symbols */}
      <div 
        className="absolute w-full transition-none"
        style={{ transform: `translateY(-${position}px)` }}
      >
        {[...symbols, ...symbols, ...symbols].map((symbol, i) => (
          <div
            key={i}
            className="w-full h-20 flex items-center justify-center text-5xl"
          >
            {symbol.emoji}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SlotsGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [betAmount, setBetAmount] = useState(100)
  const [reels, setReels] = useState([generateReel(), generateReel(), generateReel()])
  const [spinning, setSpinning] = useState(false)
  const [results, setResults] = useState<number[]>([0, 0, 0])
  const [stoppedReels, setStoppedReels] = useState(0)
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number } | null>(null)
  const [autoSpin, setAutoSpin] = useState(false)
  const [spinsLeft, setSpinsLeft] = useState(0)

  const spin = () => {
    if (balance < betAmount || spinning) return

    subtractBalance(betAmount)
    setSpinning(true)
    setStoppedReels(0)
    setLastWin(null)

    // Generate new reels and results
    const newReels = [generateReel(), generateReel(), generateReel()]
    const newResults = [
      Math.floor(Math.random() * REEL_SIZE),
      Math.floor(Math.random() * REEL_SIZE),
      Math.floor(Math.random() * REEL_SIZE)
    ]
    
    setReels(newReels)
    setResults(newResults)
  }

  const handleReelStop = () => {
    setStoppedReels(prev => {
      const newCount = prev + 1
      if (newCount === 3) {
        // All reels stopped, calculate winnings
        setTimeout(calculateWinnings, 300)
      }
      return newCount
    })
  }

  const calculateWinnings = () => {
    const symbols = results.map((r, i) => reels[i][r % reels[i].length])
    
    let winnings = 0
    let multiplier = 0

    // Check for 3 of a kind
    if (symbols[0].id === symbols[1].id && symbols[1].id === symbols[2].id) {
      multiplier = symbols[0].value
      winnings = betAmount * multiplier
    }
    // Check for 2 of a kind
    else if (symbols[0].id === symbols[1].id || symbols[1].id === symbols[2].id || symbols[0].id === symbols[2].id) {
      const matchingSymbol = symbols[0].id === symbols[1].id ? symbols[0] :
                            symbols[1].id === symbols[2].id ? symbols[1] : symbols[0]
      multiplier = Math.floor(matchingSymbol.value / 5)
      winnings = betAmount * multiplier
    }
    // Check for special combinations
    else if (symbols.some(s => s.id === 'seven')) {
      multiplier = 1
      winnings = betAmount
    }

    if (winnings > 0) {
      addBalance(winnings)
      setLastWin({ amount: winnings, multiplier })
      
      addHistory({
        game: 'Slots',
        bet: betAmount,
        result: 'win',
        payout: winnings,
        multiplier
      })
    } else {
      addHistory({
        game: 'Slots',
        bet: betAmount,
        result: 'lose',
        payout: 0,
        multiplier: 0
      })
    }

    updateStats(betAmount, winnings)
    setSpinning(false)

    // Auto spin
    if (autoSpin && spinsLeft > 1 && balance >= betAmount) {
      setSpinsLeft(prev => prev - 1)
      setTimeout(spin, 1000)
    } else {
      setAutoSpin(false)
      setSpinsLeft(0)
    }
  }

  const startAutoSpin = (count: number) => {
    setAutoSpin(true)
    setSpinsLeft(count)
    spin()
  }

  const stopAutoSpin = () => {
    setAutoSpin(false)
    setSpinsLeft(0)
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Eldrun Slots
        </h2>

        {/* Slot Machine */}
        <div className="bg-gradient-to-b from-metal-800 to-metal-900 rounded-2xl p-6 border-4 border-amber-500/30 relative overflow-hidden">
          {/* Decorative lights */}
          <div className="absolute top-2 left-0 right-0 flex justify-center gap-2">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: spinning ? [0.3, 1, 0.3] : 0.5 }}
                transition={{ duration: 0.5, repeat: spinning ? Infinity : 0, delay: i * 0.1 }}
                className="w-3 h-3 rounded-full bg-amber-400"
              />
            ))}
          </div>

          {/* Reels Container */}
          <div className="flex justify-center gap-4 my-8">
            {reels.map((reel, i) => (
              <Reel
                key={i}
                symbols={reel}
                spinning={spinning}
                finalIndex={results[i]}
                reelIndex={i}
                onStop={handleReelStop}
              />
            ))}
          </div>

          {/* Win Display */}
          <AnimatePresence>
            {lastWin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🎰
                  </motion.div>
                  <p className="text-4xl font-display font-black text-amber-400">
                    +{lastWin.amount.toLocaleString()}
                  </p>
                  <p className="text-xl text-white/70">{lastWin.multiplier}x Multiplier</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paytable */}
        <div className="mt-6 grid grid-cols-4 md:grid-cols-8 gap-2">
          {SYMBOLS.map((symbol) => (
            <div key={symbol.id} className="bg-metal-800/50 border border-metal-700 p-2 text-center">
              <span className="text-2xl">{symbol.emoji}</span>
              <p className="text-xs text-amber-400 font-mono">{symbol.value}x</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                placeholder="Einsatz"
              />
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(Math.min(amount, balance))}
                  disabled={spinning}
                  className="px-4 py-3 bg-metal-800 border border-metal-700 text-metal-300 hover:border-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50"
                >
                  {amount >= 1000 ? `${amount/1000}k` : amount}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={spin}
              disabled={balance < betAmount || spinning}
              className="py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Spinning...' : `Spin (${betAmount})`}
            </button>

            {!autoSpin ? (
              <div className="flex gap-2">
                {[10, 25, 50].map((count) => (
                  <button
                    key={count}
                    onClick={() => startAutoSpin(count)}
                    disabled={balance < betAmount || spinning}
                    className="flex-1 py-4 bg-metal-800 border border-metal-700 text-metal-300 hover:border-purple-500 hover:text-purple-400 transition-colors font-display font-bold disabled:opacity-50"
                  >
                    {count}x
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={stopAutoSpin}
                className="py-4 bg-red-600 hover:bg-red-500 text-white font-display font-bold uppercase transition-colors"
              >
                Stop Auto ({spinsLeft} left)
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-metal-800/50 border border-metal-700 text-sm text-metal-400">
          <p className="font-bold text-metal-300 mb-2">Gewinnlinien:</p>
          <ul className="space-y-1">
            <li>🎰 3 gleiche Symbole = Symbol-Wert × Einsatz</li>
            <li>🎰 2 gleiche Symbole = Symbol-Wert/5 × Einsatz</li>
            <li>7️⃣ Mindestens eine 7 = 1× Einsatz zurück</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
