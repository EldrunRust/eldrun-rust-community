'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Target, Clock, Users } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

type Color = 'red' | 'black' | 'green'

const ROULETTE_NUMBERS: { num: number; color: Color }[] = [
  { num: 0, color: 'green' },
  { num: 1, color: 'red' }, { num: 2, color: 'black' }, { num: 3, color: 'red' },
  { num: 4, color: 'black' }, { num: 5, color: 'red' }, { num: 6, color: 'black' },
  { num: 7, color: 'red' }, { num: 8, color: 'black' }, { num: 9, color: 'red' },
  { num: 10, color: 'black' }, { num: 11, color: 'red' }, { num: 12, color: 'black' },
  { num: 13, color: 'red' }, { num: 14, color: 'black' },
]

const COLOR_CONFIG = {
  red: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-400', multiplier: 2 },
  black: { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-300', multiplier: 2 },
  green: { bg: 'bg-green-600', border: 'border-green-500', text: 'text-green-400', multiplier: 14 },
}

export function RouletteGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting')
  const [countdown, setCountdown] = useState(15)
  const [result, setResult] = useState<{ num: number; color: Color } | null>(null)
  const [bets, setBets] = useState<{ red: number; black: number; green: number }>({ red: 0, black: 0, green: 0 })
  const [betAmount, setBetAmount] = useState(100)
  const [spinPosition, setSpinPosition] = useState(0)
  const [history, setHistory] = useState<Color[]>(['red', 'black', 'red', 'green', 'black', 'red', 'black', 'red', 'black', 'red'])

  const startSpin = useCallback(() => {
    setGameState('spinning')
    
    // Generate result
    const resultIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length)
    const resultNum = ROULETTE_NUMBERS[resultIndex]
    
    // Calculate spin animation
    const fullRotations = 5
    const itemWidth = 80
    const totalItems = ROULETTE_NUMBERS.length
    const spinDistance = (fullRotations * totalItems + resultIndex) * itemWidth + Math.random() * 40
    
    setSpinPosition(-spinDistance)

    // Show result after spin
    setTimeout(() => {
      setResult(resultNum)
      setGameState('result')
      setHistory(prev => [resultNum.color, ...prev.slice(0, 19)])
      
      // Calculate winnings
      const totalBet = bets.red + bets.black + bets.green
      let winnings = 0
      
      if (bets[resultNum.color] > 0) {
        winnings = bets[resultNum.color] * COLOR_CONFIG[resultNum.color].multiplier
        addBalance(winnings)
        
        addHistory({
          game: 'Roulette',
          bet: totalBet,
          result: 'win',
          payout: winnings,
          multiplier: COLOR_CONFIG[resultNum.color].multiplier
        })
      } else if (totalBet > 0) {
        addHistory({
          game: 'Roulette',
          bet: totalBet,
          result: 'lose',
          payout: 0
        })
      }
      
      if (totalBet > 0) {
        updateStats(totalBet, winnings)
      }

      // Reset for next round
      setTimeout(() => {
        setGameState('betting')
        setCountdown(15)
        setBets({ red: 0, black: 0, green: 0 })
        setResult(null)
        setSpinPosition(0)
      }, 4000)
    }, 5000)
  }, [addBalance, addHistory, bets, updateStats])

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'betting') return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          startSpin()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, startSpin])

  const placeBet = (color: Color) => {
    if (gameState !== 'betting' || balance < betAmount) return
    
    subtractBalance(betAmount)
    setBets(prev => ({ ...prev, [color]: prev[color] + betAmount }))
  }

  const totalBets = bets.red + bets.black + bets.green

  return (
    <div className="space-y-6">
      {/* Main Game */}
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        {/* Timer / Status */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Roulette
          </h2>
          <div className={`px-4 py-2 font-mono font-bold flex items-center gap-2 ${
            gameState === 'betting' ? 'bg-green-500/20 text-green-400' :
            gameState === 'spinning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-metal-800 text-white'
          }`}>
            <Clock className="w-4 h-4" />
            {gameState === 'betting' && `${countdown}s`}
            {gameState === 'spinning' && 'Spinning...'}
            {gameState === 'result' && `Result: ${result?.num}`}
          </div>
        </div>

        {/* Roulette Strip */}
        <div className="relative overflow-hidden bg-metal-950 border border-metal-700 mb-6" style={{ height: 100 }}>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-amber-400 z-10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-amber-400 z-10" />
          
          {/* Numbers Strip */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 flex"
            style={{ left: '50%' }}
            animate={{ x: spinPosition }}
            transition={{ duration: gameState === 'spinning' ? 5 : 0, ease: [0.15, 0.85, 0.35, 1] }}
          >
            {/* Repeat numbers for seamless scrolling */}
            {[...Array(20)].map((_, setIndex) => (
              ROULETTE_NUMBERS.map((item, i) => (
                <div
                  key={`${setIndex}-${i}`}
                  className={`w-20 h-20 flex items-center justify-center text-white font-mono font-bold text-2xl border-2 ${COLOR_CONFIG[item.color].bg} ${COLOR_CONFIG[item.color].border} mx-0.5`}
                >
                  {item.num}
                </div>
              ))
            ))}
          </motion.div>
        </div>

        {/* History */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-metal-500 text-sm">History:</span>
          {history.map((color, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full ${COLOR_CONFIG[color].bg} flex-shrink-0`}
            />
          ))}
        </div>

        {/* Betting Area */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['red', 'black', 'green'] as Color[]).map((color) => (
            <button
              key={color}
              onClick={() => placeBet(color)}
              disabled={gameState !== 'betting' || balance < betAmount}
              className={`relative p-6 border-2 transition-all ${COLOR_CONFIG[color].bg} ${COLOR_CONFIG[color].border} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-white uppercase">{color}</p>
                <p className="text-white/70 text-sm">{COLOR_CONFIG[color].multiplier}x</p>
                {bets[color] > 0 && (
                  <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 text-xs font-mono">
                    {bets[color].toLocaleString()}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bet Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none"
              placeholder="Einsatz"
            />
          </div>
          <div className="flex gap-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, balance))}
                className="px-4 py-3 bg-metal-800 border border-metal-700 text-metal-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                {amount >= 1000 ? `${amount/1000}k` : amount}
              </button>
            ))}
            <button
              onClick={() => setBetAmount(balance)}
              className="px-4 py-3 bg-amber-500/20 border border-amber-500 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Your Bets Summary */}
        {totalBets > 0 && (
          <div className="mt-4 p-4 bg-metal-800/50 border border-metal-700">
            <p className="text-metal-400 text-sm">Deine Wetten:</p>
            <div className="flex gap-4 mt-2">
              {bets.red > 0 && <span className="text-red-400">Rot: {bets.red.toLocaleString()}</span>}
              {bets.black > 0 && <span className="text-gray-300">Schwarz: {bets.black.toLocaleString()}</span>}
              {bets.green > 0 && <span className="text-green-400">Grün: {bets.green.toLocaleString()}</span>}
            </div>
            <p className="text-white font-mono mt-2">Total: {totalBets.toLocaleString()}</p>
          </div>
        )}

        {/* Result Display */}
        {gameState === 'result' && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-6 text-center ${COLOR_CONFIG[result.color].bg} border-2 ${COLOR_CONFIG[result.color].border}`}
          >
            <p className="text-4xl font-mono font-black text-white">{result.num}</p>
            <p className="text-white/70 uppercase">{result.color}</p>
            {bets[result.color] > 0 && (
              <p className="text-2xl font-bold text-white mt-2">
                🎉 +{(bets[result.color] * COLOR_CONFIG[result.color].multiplier).toLocaleString()}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
