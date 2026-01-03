'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Loader2, Zap, Users } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

interface Player {
  name: string
  bet: number
  cashoutAt?: number
  profit?: number
}

export function CrashGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting')
  const [multiplier, setMultiplier] = useState(1.00)
  const [betAmount, setBetAmount] = useState(100)
  const [autoCashout, setAutoCashout] = useState(2.00)
  const [hasBet, setHasBet] = useState(false)
  const [hasCashedOut, setHasCashedOut] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [crashPoint, setCrashPoint] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [history, setHistory] = useState<number[]>([2.34, 1.12, 5.67, 1.89, 12.45, 1.05, 3.21, 1.56])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Generate crash point
  const generateCrashPoint = () => {
    const e = Math.random()
    return Math.max(1.00, Math.floor((1 / (1 - e)) * 100) / 100)
  }

  // Fetch active players from API
  const fetchActivePlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/casino/crash/players')
      if (res.ok) {
        const data = await res.json()
        if (data.players) {
          setPlayers(data.players)
        }
      }
    } catch (error) {
      console.error('Failed to fetch crash players:', error)
    }
  }, [])

  // Start new round
  const startRound = useCallback(() => {
    setGameState('waiting')
    setMultiplier(1.00)
    setHasCashedOut(false)
    setCrashPoint(generateCrashPoint())
    setCountdown(5)
    setPlayers([])
    fetchActivePlayers()
  }, [fetchActivePlayers])

  const cashout = useCallback(() => {
    if (!hasBet || hasCashedOut || gameState !== 'running') return

    const winnings = Math.floor(betAmount * multiplier)
    addBalance(winnings)
    setHasCashedOut(true)

    addHistory({
      game: 'Crash',
      bet: betAmount,
      result: 'win',
      payout: winnings,
      multiplier
    })
    updateStats(betAmount, winnings)

    setPlayers(prev => prev.map(p =>
      p.name === 'You' ? { ...p, cashoutAt: multiplier, profit: winnings } : p
    ))
  }, [addBalance, addHistory, betAmount, gameState, hasBet, hasCashedOut, multiplier, updateStats])

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'waiting') return
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState('running')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Game running effect
  useEffect(() => {
    if (gameState !== 'running') return

    const startTime = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const newMultiplier = Math.pow(Math.E, 0.1 * elapsed)
      
      if (newMultiplier >= crashPoint) {
        setMultiplier(crashPoint)
        setGameState('crashed')
        
        // Handle loss if player didn't cash out
        if (hasBet && !hasCashedOut) {
          addHistory({
            game: 'Crash',
            bet: betAmount,
            result: 'lose',
            payout: 0,
            multiplier: crashPoint
          })
          updateStats(betAmount, 0)
        }
        
        setHistory(prev => [crashPoint, ...prev.slice(0, 19)])
        setHasBet(false)
        
        // Auto restart after 3 seconds
        setTimeout(startRound, 3000)
        return
      }

      setMultiplier(Math.floor(newMultiplier * 100) / 100)

      // Auto cashout for player
      if (hasBet && !hasCashedOut && newMultiplier >= autoCashout) {
        cashout()
      }

      // Player cashouts - tracked via API
      if (newMultiplier > 1.2) {
        fetchActivePlayers()
      }

      animationRef.current = requestAnimationFrame(tick)
    }

    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState, crashPoint, hasBet, hasCashedOut, autoCashout, cashout, fetchActivePlayers, betAmount, addHistory, updateStats, startRound])

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (height / 10) * i)
      ctx.lineTo(width, (height / 10) * i)
      ctx.stroke()
    }

    // Curve
    if (gameState !== 'waiting') {
      const gradient = ctx.createLinearGradient(0, height, width, 0)
      if (gameState === 'crashed') {
        gradient.addColorStop(0, '#ef4444')
        gradient.addColorStop(1, '#dc2626')
      } else {
        gradient.addColorStop(0, '#22c55e')
        gradient.addColorStop(1, '#4ade80')
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, height)
      
      const maxX = Math.min(multiplier - 1, 10)
      for (let x = 0; x <= maxX; x += 0.1) {
        const px = (x / 10) * width
        const py = height - ((Math.pow(Math.E, x * 0.5) - 1) / 10) * height
        ctx.lineTo(px, Math.max(0, py))
      }
      ctx.stroke()
    }
  }, [multiplier, gameState])

  const placeBet = () => {
    if (balance < betAmount || gameState !== 'waiting' || hasBet) return
    
    subtractBalance(betAmount)
    setHasBet(true)
    setPlayers(prev => [{ name: 'You', bet: betAmount }, ...prev])
  }

  // Initialize
  useEffect(() => {
    startRound()
  }, [startRound])

  return (
    <div className="space-y-6">
      {/* Main Game Area */}
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            <div className="relative bg-metal-950 border border-metal-800 rounded-lg overflow-hidden" style={{ height: 400 }}>
              <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
              
              {/* Multiplier Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={multiplier}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  {gameState === 'waiting' ? (
                    <div>
                      <p className="text-6xl font-mono font-black text-amber-400">{countdown}s</p>
                      <p className="text-metal-500 mt-2">Nächste Runde startet...</p>
                    </div>
                  ) : (
                    <p className={`text-7xl font-mono font-black ${
                      gameState === 'crashed' ? 'text-red-500' : 'text-green-400'
                    }`}>
                      {multiplier.toFixed(2)}x
                    </p>
                  )}
                  {gameState === 'crashed' && (
                    <p className="text-red-400 text-xl mt-2 font-display">CRASHED!</p>
                  )}
                </motion.div>
              </div>

              {/* History Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-metal-950/90 p-2 flex gap-2 overflow-x-auto">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      h < 2 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {h.toFixed(2)}x
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Bet Input */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Einsatz</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={hasBet}
                className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-green-500 focus:outline-none disabled:opacity-50"
              />
              <div className="flex gap-1 mt-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(Math.min(amount, balance))}
                    disabled={hasBet}
                    className="flex-1 py-2 bg-metal-800 border border-metal-700 text-metal-300 hover:border-green-500 text-sm disabled:opacity-50"
                  >
                    {amount >= 1000 ? `${amount/1000}k` : amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Cashout */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">Auto Cashout bei</label>
              <input
                type="number"
                step="0.1"
                value={autoCashout}
                onChange={(e) => setAutoCashout(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                disabled={hasBet}
                className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-green-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Bet/Cashout Button */}
            {gameState === 'waiting' && !hasBet && (
              <button
                onClick={placeBet}
                disabled={balance < betAmount}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Wette platzieren
              </button>
            )}

            {gameState === 'running' && hasBet && !hasCashedOut && (
              <button
                onClick={cashout}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-amber-400 hover:to-orange-500 transition-all animate-pulse"
              >
                CASHOUT @ {multiplier.toFixed(2)}x
                <br />
                <span className="text-sm">+{Math.floor(betAmount * multiplier).toLocaleString()}</span>
              </button>
            )}

            {(hasCashedOut || (gameState === 'crashed' && hasBet)) && (
              <div className={`w-full py-4 text-center font-display font-bold text-lg ${
                hasCashedOut ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {hasCashedOut ? `✓ Gewonnen: +${Math.floor(betAmount * (players.find(p => p.name === 'You')?.cashoutAt || 1)).toLocaleString()}` : '✗ Verloren'}
              </div>
            )}

            {gameState === 'waiting' && hasBet && (
              <div className="w-full py-4 bg-amber-500/20 text-amber-400 text-center font-display font-bold">
                Wette platziert: {betAmount.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Spieler ({players.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {players.map((player, i) => (
            <div
              key={i}
              className={`p-3 border ${
                player.cashoutAt
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-metal-800/50 border-metal-700'
              }`}
            >
              <p className={`font-bold text-sm ${player.name === 'You' ? 'text-amber-400' : 'text-white'}`}>
                {player.name}
              </p>
              <p className="text-xs text-metal-500">{player.bet.toLocaleString()} Coins</p>
              {player.cashoutAt && (
                <p className="text-xs text-green-400 font-mono mt-1">
                  +{player.profit?.toLocaleString()} @ {player.cashoutAt.toFixed(2)}x
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
