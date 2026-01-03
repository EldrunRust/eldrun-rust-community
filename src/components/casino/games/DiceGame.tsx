'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dice1, ArrowUp, ArrowDown } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

export function DiceGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [betAmount, setBetAmount] = useState(100)
  const [targetNumber, setTargetNumber] = useState(50)
  const [betType, setBetType] = useState<'over' | 'under'>('over')
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)

  const calculateMultiplier = () => {
    const winChance = betType === 'over' ? (100 - targetNumber) : targetNumber
    return Math.round((98 / winChance) * 100) / 100 // 2% house edge
  }

  const winChance = betType === 'over' ? (100 - targetNumber) : targetNumber
  const multiplier = calculateMultiplier()

  const roll = () => {
    if (balance < betAmount || isRolling) return

    subtractBalance(betAmount)
    setIsRolling(true)
    setResult(null)
    setWon(null)

    // Animate roll
    let rollCount = 0
    const rollInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 100) + 1)
      rollCount++
      if (rollCount >= 20) {
        clearInterval(rollInterval)
        
        // Final result
        const finalResult = Math.floor(Math.random() * 100) + 1
        setResult(finalResult)

        const isWin = betType === 'over' 
          ? finalResult > targetNumber 
          : finalResult < targetNumber

        setWon(isWin)

        if (isWin) {
          const winnings = Math.floor(betAmount * multiplier)
          addBalance(winnings)
          addHistory({
            game: 'Dice',
            bet: betAmount,
            result: 'win',
            payout: winnings,
            multiplier
          })
          updateStats(betAmount, winnings)
        } else {
          addHistory({
            game: 'Dice',
            bet: betAmount,
            result: 'lose',
            payout: 0,
            multiplier: 0
          })
          updateStats(betAmount, 0)
        }

        setIsRolling(false)
      }
    }, 50)
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Dice1 className="w-5 h-5 text-cyan-400" />
          Dice
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Result Display */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Progress Bar */}
              <div className="h-8 bg-metal-800 rounded-full overflow-hidden relative">
                <div 
                  className={`absolute inset-y-0 left-0 ${betType === 'under' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${targetNumber}%` }}
                />
                <div 
                  className={`absolute inset-y-0 right-0 ${betType === 'over' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${100 - targetNumber}%` }}
                />
                
                {/* Target Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white"
                  style={{ left: `${targetNumber}%` }}
                />
                
                {/* Result Marker */}
                {result !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 ${
                      won ? 'bg-green-500 border-green-300' : 'bg-red-500 border-red-300'
                    }`}
                    style={{ left: `calc(${result}% - 12px)` }}
                  />
                )}
              </div>

              {/* Scale */}
              <div className="flex justify-between text-xs text-metal-500 mt-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Result Number */}
            <motion.div
              key={result}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mt-8 text-center"
            >
              <p className={`font-mono font-black text-7xl ${
                won === null ? 'text-metal-500' : won ? 'text-green-400' : 'text-red-400'
              }`}>
                {result !== null ? result.toFixed(2) : '??'}
              </p>
              {won !== null && (
                <p className={`text-2xl font-display font-bold mt-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
                  {won ? '🎉 GEWONNEN!' : '💀 VERLOREN!'}
                </p>
              )}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Bet Amount */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Einsatz</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isRolling}
                className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              />
              <div className="flex gap-1 mt-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(Math.min(amount, balance))}
                    disabled={isRolling}
                    className="flex-1 py-2 bg-metal-800 border border-metal-700 text-metal-300 hover:border-cyan-500 text-sm disabled:opacity-50"
                  >
                    {amount >= 1000 ? `${amount/1000}k` : amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Type */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Wette auf</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBetType('under')}
                  disabled={isRolling}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 border-2 transition-all ${
                    betType === 'under'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-metal-800 border-metal-700 text-metal-400'
                  } disabled:opacity-50`}
                >
                  <ArrowDown className="w-5 h-5" />
                  UNDER
                </button>
                <button
                  onClick={() => setBetType('over')}
                  disabled={isRolling}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 border-2 transition-all ${
                    betType === 'over'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-metal-800 border-metal-700 text-metal-400'
                  } disabled:opacity-50`}
                >
                  <ArrowUp className="w-5 h-5" />
                  OVER
                </button>
              </div>
            </div>

            {/* Target Number */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">
                Zielzahl: <span className="text-white font-mono">{targetNumber}</span>
              </label>
              <input
                type="range"
                min={2}
                max={98}
                value={targetNumber}
                onChange={(e) => setTargetNumber(parseInt(e.target.value))}
                disabled={isRolling}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-metal-800/50 border border-metal-700">
              <div className="text-center">
                <p className="text-metal-500 text-xs">Multiplier</p>
                <p className="font-mono font-bold text-lg text-cyan-400">{multiplier.toFixed(2)}x</p>
              </div>
              <div className="text-center">
                <p className="text-metal-500 text-xs">Win Chance</p>
                <p className="font-mono font-bold text-lg text-white">{winChance}%</p>
              </div>
              <div className="text-center">
                <p className="text-metal-500 text-xs">Gewinn bei Win</p>
                <p className="font-mono font-bold text-lg text-green-400">
                  {Math.floor(betAmount * multiplier).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Roll Button */}
            <button
              onClick={roll}
              disabled={balance < betAmount || isRolling}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRolling ? '🎲 Rolling...' : `Roll ${betType === 'over' ? '>' : '<'} ${targetNumber}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
