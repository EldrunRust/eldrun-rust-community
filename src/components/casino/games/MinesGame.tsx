'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, Bomb, Gem, RotateCcw } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

const GRID_SIZE = 25

export function MinesGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [betAmount, setBetAmount] = useState(100)
  const [mineCount, setMineCount] = useState(5)
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'won' | 'lost'>('betting')
  const [mines, setMines] = useState<number[]>([])
  const [revealed, setRevealed] = useState<number[]>([])
  const [multiplier, setMultiplier] = useState(1)

  const calculateMultiplier = (safeClicks: number, totalMines: number): number => {
    const safeTiles = GRID_SIZE - totalMines
    let mult = 1
    for (let i = 0; i < safeClicks; i++) {
      mult *= (safeTiles - i) / (GRID_SIZE - i)
    }
    return Math.max(1, Math.round((1 / mult) * 97) / 100) // 3% house edge
  }

  const startGame = () => {
    if (balance < betAmount) return

    subtractBalance(betAmount)
    
    // Generate random mine positions
    const minePositions: number[] = []
    while (minePositions.length < mineCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE)
      if (!minePositions.includes(pos)) {
        minePositions.push(pos)
      }
    }

    setMines(minePositions)
    setRevealed([])
    setMultiplier(1)
    setGameState('playing')
  }

  const revealTile = (index: number) => {
    if (gameState !== 'playing' || revealed.includes(index)) return

    if (mines.includes(index)) {
      // Hit a mine - lose
      setRevealed([...revealed, index])
      setGameState('lost')
      
      addHistory({
        game: 'Mines',
        bet: betAmount,
        result: 'lose',
        payout: 0,
        multiplier: 0
      })
      updateStats(betAmount, 0)
    } else {
      // Safe tile
      const newRevealed = [...revealed, index]
      setRevealed(newRevealed)
      const newMultiplier = calculateMultiplier(newRevealed.length, mineCount)
      setMultiplier(newMultiplier)

      // Check if all safe tiles revealed
      if (newRevealed.length === GRID_SIZE - mineCount) {
        cashout()
      }
    }
  }

  const cashout = () => {
    if (gameState !== 'playing' || revealed.length === 0) return

    const winnings = Math.floor(betAmount * multiplier)
    addBalance(winnings)
    setGameState('won')

    addHistory({
      game: 'Mines',
      bet: betAmount,
      result: 'win',
      payout: winnings,
      multiplier
    })
    updateStats(betAmount, winnings)
  }

  const reset = () => {
    setGameState('betting')
    setMines([])
    setRevealed([])
    setMultiplier(1)
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-red-400" />
          Mines
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-5 gap-2 p-4 bg-metal-950 border border-metal-700">
              {Array.from({ length: GRID_SIZE }).map((_, index) => {
                const isRevealed = revealed.includes(index)
                const isMine = mines.includes(index)
                const showMine = (gameState === 'lost' || gameState === 'won') && isMine

                return (
                  <motion.button
                    key={index}
                    onClick={() => revealTile(index)}
                    disabled={gameState !== 'playing' || isRevealed}
                    whileHover={gameState === 'playing' && !isRevealed ? { scale: 1.05 } : {}}
                    whileTap={gameState === 'playing' && !isRevealed ? { scale: 0.95 } : {}}
                    className={`aspect-square flex items-center justify-center text-2xl border-2 transition-all ${
                      isRevealed && isMine
                        ? 'bg-red-600 border-red-500'
                        : isRevealed
                        ? 'bg-green-600 border-green-500'
                        : showMine
                        ? 'bg-red-600/50 border-red-500/50'
                        : 'bg-metal-800 border-metal-700 hover:border-metal-500 cursor-pointer'
                    } disabled:cursor-default`}
                  >
                    {isRevealed && isMine && <Bomb className="w-8 h-8 text-white" />}
                    {isRevealed && !isMine && <Gem className="w-8 h-8 text-white" />}
                    {showMine && !isRevealed && <Bomb className="w-6 h-6 text-red-400 opacity-50" />}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {gameState === 'betting' && (
              <>
                {/* Bet Amount */}
                <div>
                  <label className="block text-sm text-metal-400 mb-2">Einsatz</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                  <div className="flex gap-1 mt-2">
                    {[100, 500, 1000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(Math.min(amount, balance))}
                        className="flex-1 py-2 bg-metal-800 border border-metal-700 text-metal-300 hover:border-red-500 text-sm"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mine Count */}
                <div>
                  <label className="block text-sm text-metal-400 mb-2">Anzahl Minen: {mineCount}</label>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={mineCount}
                    onChange={(e) => setMineCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-metal-500">
                    <span>1 (Sicher)</span>
                    <span>24 (Riskant)</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startGame}
                  disabled={balance < betAmount}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-red-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Spiel starten
                </button>
              </>
            )}

            {gameState === 'playing' && (
              <>
                {/* Current Multiplier */}
                <div className="text-center p-4 bg-metal-800 border border-metal-700">
                  <p className="text-metal-500 text-sm">Multiplier</p>
                  <p className="font-mono font-black text-4xl text-green-400">{multiplier.toFixed(2)}x</p>
                  <p className="text-metal-400 text-sm mt-1">
                    {revealed.length} / {GRID_SIZE - mineCount} Gems
                  </p>
                </div>

                {/* Potential Win */}
                <div className="text-center p-4 bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm">Potentieller Gewinn</p>
                  <p className="font-mono font-bold text-2xl text-green-400">
                    {Math.floor(betAmount * multiplier).toLocaleString()}
                  </p>
                </div>

                {/* Cashout Button */}
                <button
                  onClick={cashout}
                  disabled={revealed.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cashout ({Math.floor(betAmount * multiplier).toLocaleString()})
                </button>
              </>
            )}

            {(gameState === 'won' || gameState === 'lost') && (
              <>
                <div className={`text-center p-6 ${gameState === 'won' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <p className={`text-3xl font-display font-black ${gameState === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                    {gameState === 'won' ? '🎉 GEWONNEN!' : '💥 VERLOREN!'}
                  </p>
                  {gameState === 'won' && (
                    <p className="font-mono text-xl text-green-400 mt-2">
                      +{Math.floor(betAmount * multiplier).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={reset}
                  className="w-full py-4 bg-metal-800 border border-metal-700 text-white font-display font-bold uppercase tracking-wider hover:border-metal-500 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Nochmal spielen
                </button>
              </>
            )}

            {/* Info */}
            <div className="p-4 bg-metal-800/50 border border-metal-700 text-sm">
              <p className="text-metal-400">
                <strong className="text-white">Spielregeln:</strong> Klicke auf Felder um Gems zu finden. 
                Vermeide die Minen! Je mehr Gems du findest, desto höher der Multiplier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
