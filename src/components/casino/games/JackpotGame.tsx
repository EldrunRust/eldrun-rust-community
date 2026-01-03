'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, Coins } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

interface JackpotPlayer {
  name: string
  avatar: string
  amount: number
  color: string
  chance: number
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function JackpotGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [gameState, setGameState] = useState<'joining' | 'spinning' | 'result'>('joining')
  const [countdown, setCountdown] = useState(30)
  const [players, setPlayers] = useState<JackpotPlayer[]>([])
  const [totalPot, setTotalPot] = useState(0)
  const [betAmount, setBetAmount] = useState(500)
  const [winner, setWinner] = useState<JackpotPlayer | null>(null)
  const [spinAngle, setSpinAngle] = useState(0)
  const [hasJoined, setHasJoined] = useState(false)

  const startSpin = useCallback(() => {
    setGameState('spinning')

    // Select winner based on chances
    const totalAmount = players.reduce((sum, p) => sum + p.amount, 0)
    let random = Math.random() * totalAmount
    let selectedWinner: JackpotPlayer | null = null

    for (const player of players) {
      random -= player.amount
      if (random <= 0) {
        selectedWinner = player
        break
      }
    }

    if (!selectedWinner) selectedWinner = players[players.length - 1]

    // Calculate spin angle
    const winnerIndex = players.indexOf(selectedWinner)
    let startAngle = 0
    for (let i = 0; i < winnerIndex; i++) {
      startAngle += (players[i].amount / totalAmount) * 360
    }
    const winnerAngle = startAngle + (selectedWinner.amount / totalAmount) * 180
    const finalAngle = 360 * 8 + (360 - winnerAngle)

    setSpinAngle(finalAngle)

    // Show result after spin
    setTimeout(() => {
      setWinner(selectedWinner)
      setGameState('result')

      if (selectedWinner?.name === 'You') {
        addBalance(totalPot)
        addHistory({
          game: 'Jackpot',
          bet: betAmount,
          result: 'win',
          payout: totalPot,
          multiplier: Math.round((totalPot / betAmount) * 100) / 100
        })
        updateStats(betAmount, totalPot)
      } else if (hasJoined) {
        addHistory({
          game: 'Jackpot',
          bet: betAmount,
          result: 'lose',
          payout: 0
        })
        updateStats(betAmount, 0)
      }

      // Reset after delay
      setTimeout(() => {
        setGameState('joining')
        setCountdown(30)
        setPlayers([])
        setTotalPot(0)
        setWinner(null)
        setSpinAngle(0)
        setHasJoined(false)
      }, 5000)
    }, 6000)
  }, [addBalance, addHistory, betAmount, hasJoined, players, totalPot, updateStats])

  // Fetch active jackpot players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/casino/jackpot/players')
        if (res.ok) {
          const data = await res.json()
          if (data.players && data.players.length > 0) {
            const playersWithColors = data.players.map((p: { name: string; avatar: string; amount: number }, i: number) => ({
              ...p,
              color: COLORS[i % COLORS.length],
              chance: 0
            }))
            const total = playersWithColors.reduce((sum: number, p: JackpotPlayer) => sum + p.amount, 0)
            const playersWithChance = playersWithColors.map((p: JackpotPlayer) => ({
              ...p,
              chance: total > 0 ? Math.round((p.amount / total) * 100) : 0
            }))
            setPlayers(playersWithChance)
            setTotalPot(total)
          }
        }
      } catch (error) {
        console.error('Failed to fetch jackpot players:', error)
      }
    }
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 5000)
    return () => clearInterval(interval)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'joining') return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          if (players.length >= 2) {
            startSpin()
          } else {
            // Not enough players, reset
            setCountdown(30)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, players.length, startSpin])

  // Recalculate chances when players change
  const recalculateChances = (playerList: JackpotPlayer[]) => {
    const total = playerList.reduce((sum, p) => sum + p.amount, 0)
    return playerList.map(p => ({ ...p, chance: total > 0 ? Math.round((p.amount / total) * 100) : 0 }))
  }

  const joinGame = () => {
    if (balance < betAmount || hasJoined || gameState !== 'joining') return

    subtractBalance(betAmount)
    setHasJoined(true)

    const newPlayer: JackpotPlayer = {
      name: 'You',
      avatar: '👤',
      amount: betAmount,
      color: COLORS[players.length % COLORS.length],
      chance: 0
    }

    setPlayers(prev => {
      const updated = [...prev, newPlayer]
      const total = updated.reduce((sum, p) => sum + p.amount, 0)
      return updated.map(p => ({ ...p, chance: Math.round((p.amount / total) * 100) }))
    })
    setTotalPot(prev => prev + betAmount)
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Jackpot
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-metal-400">
              <Users className="w-4 h-4" />
              <span>{players.length} Spieler</span>
            </div>
            {gameState === 'joining' && (
              <div className="px-4 py-2 bg-green-500/20 text-green-400 font-mono flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {countdown}s
              </div>
            )}
          </div>
        </div>

        {/* Total Pot */}
        <div className="text-center mb-8">
          <p className="text-metal-500 text-sm">Total Pot</p>
          <p className="font-mono font-black text-5xl text-amber-400">
            {totalPot.toLocaleString()}
          </p>
          <p className="text-metal-500 text-sm">Coins</p>
        </div>

        {/* Wheel */}
        <div className="relative mx-auto mb-8" style={{ width: 300, height: 300 }}>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-amber-400 z-10" />
          
          {/* Wheel */}
          <motion.div
            className="w-full h-full rounded-full overflow-hidden border-4 border-metal-700"
            style={{
              background: players.length > 0 ? `conic-gradient(${
                players.map((p, i) => {
                  const start = players.slice(0, i).reduce((sum, pl) => sum + pl.chance, 0)
                  const end = start + p.chance
                  return `${p.color} ${start}% ${end}%`
                }).join(', ')
              })` : '#1a1a1a'
            }}
            animate={{ rotate: spinAngle }}
            transition={{ duration: 6, ease: [0.2, 0.8, 0.3, 1] }}
          >
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-metal-900 border-4 border-metal-700 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {players.map((player, i) => (
            <div
              key={i}
              className={`p-3 border-2 ${player.name === 'You' ? 'border-amber-500 bg-amber-500/10' : 'border-metal-700 bg-metal-800/50'}`}
              style={{ borderLeftColor: player.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${player.name === 'You' ? 'text-amber-400' : 'text-white'}`}>
                    {player.name}
                  </p>
                  <p className="text-xs text-metal-500">{player.amount.toLocaleString()} Coins</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold" style={{ color: player.color }}>{player.chance}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Controls */}
        {gameState === 'joining' && !hasJoined && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                placeholder="Einsatz"
              />
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(Math.min(amount, balance))}
                    className="px-3 py-2 bg-metal-800 border border-metal-700 text-metal-300 hover:border-amber-500 text-sm"
                  >
                    {amount >= 1000 ? `${amount/1000}k` : amount}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={joinGame}
              disabled={balance < betAmount}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-rust-500 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-amber-400 hover:to-rust-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Coins className="w-5 h-5 inline mr-2" />
              Join Jackpot ({betAmount.toLocaleString()} Coins)
            </button>
          </div>
        )}

        {hasJoined && gameState === 'joining' && (
          <div className="text-center py-4 bg-amber-500/20 text-amber-400 font-display font-bold">
            ✓ Du bist im Pot! Warte auf den Spin...
          </div>
        )}

        {/* Winner Display */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-6 ${winner.name === 'You' ? 'bg-green-500/20' : 'bg-metal-800'}`}
          >
            <p className="text-4xl mb-2">{winner.avatar}</p>
            <p className={`text-2xl font-display font-black ${winner.name === 'You' ? 'text-green-400' : 'text-white'}`}>
              {winner.name === 'You' ? '🎉 DU GEWINNST!' : `${winner.name} GEWINNT!`}
            </p>
            <p className="text-amber-400 font-mono text-xl mt-2">+{totalPot.toLocaleString()} Coins</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
