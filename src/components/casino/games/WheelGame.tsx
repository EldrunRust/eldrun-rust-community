'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDollarSign } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

const WHEEL_SEGMENTS = [
  { value: 0, color: '#22c55e', label: '0x', multiplier: 0 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 2, color: '#8b5cf6', label: '2x', multiplier: 2 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 3, color: '#f59e0b', label: '3x', multiplier: 3 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 2, color: '#8b5cf6', label: '2x', multiplier: 2 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 5, color: '#ef4444', label: '5x', multiplier: 5 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 2, color: '#8b5cf6', label: '2x', multiplier: 2 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 10, color: '#ec4899', label: '10x', multiplier: 10 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
  { value: 2, color: '#8b5cf6', label: '2x', multiplier: 2 },
  { value: 1, color: '#3b82f6', label: '1x', multiplier: 1 },
]

export function WheelGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [betAmount, setBetAmount] = useState(100)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null)

  const spin = () => {
    if (balance < betAmount || isSpinning) return

    subtractBalance(betAmount)
    setIsSpinning(true)
    setResult(null)

    // Determine winning segment (weighted random)
    const weights = [15, 25, 15, 25, 5, 25, 15, 25, 2, 25, 15, 25, 1, 25, 15, 25] // Lower = rarer
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let winningIndex = 0
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        winningIndex = i
        break
      }
    }

    // Calculate rotation
    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const fullRotations = 5 + Math.floor(Math.random() * 3)
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2 + Math.random() * 10 - 5)
    const totalRotation = fullRotations * 360 + targetAngle

    setRotation(prev => prev + totalRotation)

    // Show result
    setTimeout(() => {
      const segment = WHEEL_SEGMENTS[winningIndex]
      setResult(segment)

      const winnings = betAmount * segment.multiplier
      if (winnings > 0) {
        addBalance(winnings)
      }

      addHistory({
        game: 'Wheel',
        bet: betAmount,
        result: winnings > betAmount ? 'win' : 'lose',
        payout: winnings,
        multiplier: segment.multiplier
      })
      updateStats(betAmount, winnings)

      setIsSpinning(false)
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-amber-400" />
          Wheel of Fortune
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wheel */}
          <div className="flex items-center justify-center">
            <div className="relative" style={{ width: 320, height: 320 }}>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-amber-400" />
              </div>

              {/* Wheel SVG */}
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                animate={{ rotate: rotation }}
                transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {WHEEL_SEGMENTS.map((segment, i) => {
                  const segmentAngle = 360 / WHEEL_SEGMENTS.length
                  const startAngle = i * segmentAngle
                  const endAngle = (i + 1) * segmentAngle
                  
                  const startRad = (startAngle - 90) * Math.PI / 180
                  const endRad = (endAngle - 90) * Math.PI / 180
                  
                  const x1 = 50 + 45 * Math.cos(startRad)
                  const y1 = 50 + 45 * Math.sin(startRad)
                  const x2 = 50 + 45 * Math.cos(endRad)
                  const y2 = 50 + 45 * Math.sin(endRad)
                  
                  const largeArc = segmentAngle > 180 ? 1 : 0
                  
                  const midAngle = (startAngle + segmentAngle / 2 - 90) * Math.PI / 180
                  const textX = 50 + 32 * Math.cos(midAngle)
                  const textY = 50 + 32 * Math.sin(midAngle)

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        stroke="#1a1a1a"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="6"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${startAngle + segmentAngle / 2}, ${textX}, ${textY})`}
                      >
                        {segment.label}
                      </text>
                    </g>
                  )
                })}
                <circle cx="50" cy="50" r="8" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                <circle cx="50" cy="50" r="5" fill="#D4AF37" />
              </motion.svg>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Result */}
            {result && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 text-center ${result.multiplier > 1 ? 'bg-green-500/20' : result.multiplier === 0 ? 'bg-red-500/20' : 'bg-metal-800'}`}
              >
                <p className="text-4xl font-mono font-black" style={{ color: result.color }}>
                  {result.label}
                </p>
                <p className={`text-xl font-display font-bold mt-2 ${
                  result.multiplier > 1 ? 'text-green-400' : result.multiplier === 0 ? 'text-red-400' : 'text-white'
                }`}>
                  {result.multiplier === 0 ? '💀 VERLOREN!' : 
                   result.multiplier === 1 ? '↩️ Einsatz zurück' :
                   `🎉 +${((result.multiplier - 1) * betAmount).toLocaleString()}`}
                </p>
              </motion.div>
            )}

            {/* Bet Amount */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Einsatz</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isSpinning}
                className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
              <div className="flex gap-1 mt-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(Math.min(amount, balance))}
                    disabled={isSpinning}
                    className="flex-1 py-2 bg-metal-800 border border-metal-700 text-metal-300 hover:border-amber-500 text-sm disabled:opacity-50"
                  >
                    {amount >= 1000 ? `${amount/1000}k` : amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Info */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-metal-800/50 border border-metal-700">
              {[
                { label: '1x', color: '#3b82f6', chance: '50%' },
                { label: '2x', color: '#8b5cf6', chance: '25%' },
                { label: '3x', color: '#f59e0b', chance: '10%' },
                { label: '5x', color: '#ef4444', chance: '5%' },
                { label: '10x', color: '#ec4899', chance: '2%' },
                { label: '0x', color: '#22c55e', chance: '8%' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <span className="font-mono font-bold" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-metal-500 text-xs block">{item.chance}</span>
                </div>
              ))}
            </div>

            {/* Spin Button */}
            <button
              onClick={spin}
              disabled={balance < betAmount || isSpinning}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSpinning ? '🎡 Spinning...' : `Spin (${betAmount.toLocaleString()} Coins)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
