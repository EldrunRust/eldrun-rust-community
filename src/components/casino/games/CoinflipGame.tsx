'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Plus, Users, Trophy, Package, Sparkles, RefreshCw } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'
import { RUST_SKINS, RustSkin, RARITY_CONFIG, getRandomSkin } from '@/data/rustSkins'
import { CASINO_PLAYERS, getRandomPlayer } from '@/data/casinoPlayers'

// Bet types - coins or skins
type BetType = 'coins' | 'skin'

interface CoinflipBet {
  type: BetType
  amount?: number
  skin?: RustSkin
  value: number
}

interface CoinflipMatch {
  id: string
  creator: string
  avatar: string
  bet: CoinflipBet
  side: 'eldrun' | 'rust'
  status: 'waiting' | 'playing' | 'finished'
  isBot?: boolean
}

// ELDRUN coin side - Golden dragon emblem
const EldrunCoinSide = () => (
  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center relative overflow-hidden shadow-lg shadow-amber-500/50">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
    <div className="absolute inset-2 rounded-full border-2 border-amber-300/50" />
    <span className="text-4xl relative z-10">🐉</span>
    <div className="absolute bottom-2 text-[8px] font-bold text-amber-900/70 tracking-wider">ELDRUN</div>
  </div>
)

// RUST coin side - Skull emblem
const RustCoinSide = () => (
  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-700 flex items-center justify-center relative overflow-hidden shadow-lg shadow-gray-500/50">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
    <div className="absolute inset-2 rounded-full border-2 border-gray-300/30" />
    <span className="text-4xl relative z-10">💀</span>
    <div className="absolute bottom-2 text-[8px] font-bold text-gray-900/70 tracking-wider">RUST</div>
  </div>
)

// Generate bot games with skins
const generateBotGames = (): CoinflipMatch[] => {
  const games: CoinflipMatch[] = []
  const numGames = 4 + Math.floor(Math.random() * 4)
  
  for (let i = 0; i < numGames; i++) {
    const player = getRandomPlayer()
    const useSkin = Math.random() < 0.35
    
    let bet: CoinflipBet
    if (useSkin) {
      const skin = getRandomSkin(500, 50000)
      bet = { type: 'skin', skin, value: skin.price }
    } else {
      const amounts = [500, 1000, 2500, 5000, 10000, 25000, 50000]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]
      bet = { type: 'coins', amount, value: amount }
    }
    
    games.push({
      id: `bot-${Date.now()}-${i}`,
      creator: player.name,
      avatar: player.avatar,
      bet,
      side: Math.random() > 0.5 ? 'eldrun' : 'rust',
      status: 'waiting',
      isBot: true
    })
  }
  
  return games
}

export function CoinflipGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [games, setGames] = useState<CoinflipMatch[]>([])
  const [betAmount, setBetAmount] = useState(100)
  const [betType, setBetType] = useState<BetType>('coins')
  const [selectedSkin, setSelectedSkin] = useState<RustSkin | null>(null)
  const [selectedSide, setSelectedSide] = useState<'eldrun' | 'rust'>('eldrun')
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipResult, setFlipResult] = useState<{ winner: string; side: 'eldrun' | 'rust'; amount: number } | null>(null)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [showSkinSelector, setShowSkinSelector] = useState(false)
  const initialized = useRef(false)

  // Initialize games once on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      setGames(generateBotGames())
    }
  }, [])

  // Add new bot games periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3 && games.length < 10) {
        const player = getRandomPlayer()
        const useSkin = Math.random() < 0.35
        
        let bet: CoinflipBet
        if (useSkin) {
          const skin = getRandomSkin(500, 30000)
          bet = { type: 'skin', skin, value: skin.price }
        } else {
          const amounts = [500, 1000, 2500, 5000, 10000]
          const amount = amounts[Math.floor(Math.random() * amounts.length)]
          bet = { type: 'coins', amount, value: amount }
        }
        
        const newGame: CoinflipMatch = {
          id: `bot-${Date.now()}`,
          creator: player.name,
          avatar: player.avatar,
          bet,
          side: Math.random() > 0.5 ? 'eldrun' : 'rust',
          status: 'waiting',
          isBot: true
        }
        setGames(prev => [newGame, ...prev].slice(0, 12))
      }
      
      // Randomly remove old bot games
      if (Math.random() < 0.2 && games.length > 3) {
        setGames(prev => {
          const botGames = prev.filter(g => g.isBot && g.status === 'waiting')
          if (botGames.length > 0) {
            const toRemove = botGames[Math.floor(Math.random() * botGames.length)]
            return prev.filter(g => g.id !== toRemove.id)
          }
          return prev
        })
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [games.length])

  const createGame = () => {
    const betValue = betType === 'coins' ? betAmount : (selectedSkin?.price || 0)
    if (balance < betValue || betValue <= 0) return
    
    subtractBalance(betValue)
    
    const bet: CoinflipBet = betType === 'coins' 
      ? { type: 'coins', amount: betAmount, value: betAmount }
      : { type: 'skin', skin: selectedSkin!, value: selectedSkin!.price }
    
    const newGame: CoinflipMatch = {
      id: `game-${Date.now()}`,
      creator: 'Du',
      avatar: '👤',
      bet,
      side: selectedSide,
      status: 'waiting'
    }
    setGames(prev => [newGame, ...prev])
  }

  const joinGame = (game: CoinflipMatch) => {
    if (balance < game.bet.value || isFlipping) return
    
    subtractBalance(game.bet.value)
    setActiveGame(game.id)
    setIsFlipping(true)

    // Flip animation
    setTimeout(() => {
      const winnerSide = Math.random() > 0.5 ? 'eldrun' : 'rust'
      const playerSide = game.side === 'eldrun' ? 'rust' : 'eldrun'
      const playerWon = playerSide === winnerSide
      const totalPot = game.bet.value * 2
      
      setFlipResult({
        winner: playerWon ? 'Du' : game.creator,
        side: winnerSide,
        amount: totalPot
      })

      if (playerWon) {
        addBalance(totalPot)
        addHistory({
          game: 'Coinflip',
          bet: game.bet.value,
          result: 'win',
          payout: totalPot,
          multiplier: 2
        })
      } else {
        addHistory({
          game: 'Coinflip',
          bet: game.bet.value,
          result: 'lose',
          payout: 0,
          multiplier: 0
        })
      }
      updateStats(game.bet.value, playerWon ? totalPot : 0)

      setTimeout(() => {
        setGames(prev => prev.filter(g => g.id !== game.id))
        setIsFlipping(false)
        setActiveGame(null)
        setFlipResult(null)
      }, 3000)
    }, 2500)
  }

  const quickBet = (amount: number) => {
    setBetAmount(Math.min(amount, balance))
    setBetType('coins')
    setSelectedSkin(null)
  }

  // Available skins for betting (affordable ones)
  const availableSkins = RUST_SKINS.filter(s => s.price <= balance).slice(0, 12)

  return (
    <div className="space-y-6">
      {/* Create Game Section */}
      <div className="bg-metal-900/50 border border-metal-800 p-6 rounded-lg">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-400" />
          Neues Spiel erstellen
        </h2>

        {/* Bet Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setBetType('coins'); setSelectedSkin(null); }}
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-lg transition-all ${
              betType === 'coins' 
                ? 'bg-amber-500/20 border border-amber-500 text-amber-400' 
                : 'bg-metal-800 border border-metal-700 text-metal-400'
            }`}
          >
            <Coins className="w-4 h-4" />
            Coins
          </button>
          <button
            onClick={() => { setBetType('skin'); setShowSkinSelector(true); }}
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-lg transition-all ${
              betType === 'skin' 
                ? 'bg-purple-500/20 border border-purple-500 text-purple-400' 
                : 'bg-metal-800 border border-metal-700 text-metal-400'
            }`}
          >
            <Package className="w-4 h-4" />
            Skin
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bet Amount / Skin */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">
              {betType === 'coins' ? 'Einsatz (Coins)' : 'Gewählter Skin'}
            </label>
            
            {betType === 'coins' ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-metal-800 border border-metal-700 px-4 py-3 text-white font-mono rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {[100, 500, 1000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => quickBet(amount)}
                      className="flex-1 px-2 py-1.5 bg-metal-800 border border-metal-700 text-metal-300 hover:border-amber-500 hover:text-amber-400 transition-colors text-xs rounded"
                    >
                      {amount >= 1000 ? `${amount/1000}k` : amount}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div 
                onClick={() => setShowSkinSelector(true)}
                className="bg-metal-800 border border-metal-700 p-3 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
              >
                {selectedSkin ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedSkin.image}</span>
                    <div>
                      <p className="text-white font-medium">{selectedSkin.name}</p>
                      <p className="text-sm" style={{ color: RARITY_CONFIG[selectedSkin.rarity].color }}>
                        {selectedSkin.price.toLocaleString()} Coins
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-metal-500 text-center">Klicke um Skin zu wählen</p>
                )}
              </div>
            )}
          </div>

          {/* Side Selection */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Wähle deine Seite</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSide('eldrun')}
                className={`flex-1 py-4 flex flex-col items-center gap-2 border-2 rounded-lg transition-all ${
                  selectedSide === 'eldrun'
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'bg-metal-800 border-metal-700 hover:border-amber-500/50'
                }`}
              >
                <div className="w-14 h-14">
                  <EldrunCoinSide />
                </div>
                <span className={`font-display font-bold ${selectedSide === 'eldrun' ? 'text-amber-400' : 'text-metal-400'}`}>
                  ELDRUN
                </span>
              </button>
              <button
                onClick={() => setSelectedSide('rust')}
                className={`flex-1 py-4 flex flex-col items-center gap-2 border-2 rounded-lg transition-all ${
                  selectedSide === 'rust'
                    ? 'bg-gray-500/20 border-gray-400'
                    : 'bg-metal-800 border-metal-700 hover:border-gray-500/50'
                }`}
              >
                <div className="w-14 h-14">
                  <RustCoinSide />
                </div>
                <span className={`font-display font-bold ${selectedSide === 'rust' ? 'text-gray-300' : 'text-metal-400'}`}>
                  RUST
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={createGame}
          disabled={balance < (betType === 'coins' ? betAmount : (selectedSkin?.price || Infinity)) || (betType === 'skin' && !selectedSkin)}
          className="mt-6 w-full py-4 bg-gradient-to-r from-amber-500 to-rust-500 text-white font-display font-bold text-lg uppercase tracking-wider rounded-lg hover:from-amber-400 hover:to-rust-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Spiel erstellen ({(betType === 'coins' ? betAmount : selectedSkin?.price || 0).toLocaleString()} Coins)
        </button>
      </div>

      {/* Skin Selector Modal */}
      <AnimatePresence>
        {showSkinSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowSkinSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-metal-900 border border-metal-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-xl text-white mb-4">Wähle einen Skin</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSkins.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => {
                      setSelectedSkin(skin)
                      setBetType('skin')
                      setShowSkinSelector(false)
                    }}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedSkin?.id === skin.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-metal-700 bg-metal-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{skin.image}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                        backgroundColor: `${RARITY_CONFIG[skin.rarity].color}20`,
                        color: RARITY_CONFIG[skin.rarity].color 
                      }}>
                        {RARITY_CONFIG[skin.rarity].name}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{skin.name}</p>
                    <p className="text-amber-400 text-xs font-mono">{skin.price.toLocaleString()} Coins</p>
                  </button>
                ))}
              </div>
              {availableSkins.length === 0 && (
                <p className="text-metal-500 text-center py-8">Nicht genug Coins für Skins</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Games */}
      <div className="bg-metal-900/50 border border-metal-800 p-6 rounded-lg">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-rust-400" />
          Aktive Spiele
          <span className="ml-auto text-sm font-mono text-metal-500">{games.length} Spiele</span>
        </h2>

        {/* Flip Animation Overlay */}
        <AnimatePresence>
          {isFlipping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            >
              <div className="text-center">
                {/* 3D Coin Flip Animation */}
                <div className="perspective-1000">
                  <motion.div
                    animate={{ 
                      rotateY: flipResult ? 0 : [0, 180, 360, 540, 720, 900, 1080, 1260, 1440],
                      scale: flipResult ? [1, 1.3, 1.2] : 1
                    }}
                    transition={{ 
                      duration: flipResult ? 0.5 : 2.5,
                      ease: flipResult ? "easeOut" : "easeInOut"
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="w-36 h-36 mx-auto"
                  >
                    {flipResult ? (
                      flipResult.side === 'eldrun' ? <EldrunCoinSide /> : <RustCoinSide />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-gray-500 animate-pulse" />
                    )}
                  </motion.div>
                </div>
                
                {flipResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <p className={`text-4xl font-display font-black ${
                      flipResult.winner === 'Du' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {flipResult.winner === 'Du' ? '🎉 DU GEWINNST!' : '💀 VERLOREN!'}
                    </p>
                    <p className="text-metal-400 mt-2 text-lg">
                      {flipResult.side === 'eldrun' ? '🐉 ELDRUN' : '💀 RUST'} gewinnt!
                    </p>
                    {flipResult.winner === 'Du' && (
                      <p className="text-green-400 font-mono text-2xl mt-2">
                        +{flipResult.amount.toLocaleString()} Coins
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Games List */}
        <div className="space-y-3">
          {games.length === 0 ? (
            <div className="text-center py-12 text-metal-500">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keine aktiven Spiele. Erstelle eines!</p>
            </div>
          ) : (
            games.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-metal-800/50 border border-metal-700 p-4 rounded-lg flex items-center gap-4 hover:border-metal-600 transition-colors"
              >
                {/* Creator */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12">
                    {game.side === 'eldrun' ? <EldrunCoinSide /> : <RustCoinSide />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{game.creator}</p>
                    <p className="text-sm text-metal-500">
                      {game.side === 'eldrun' ? '🐉 Eldrun' : '💀 Rust'}
                    </p>
                  </div>
                </div>

                {/* Bet Info */}
                <div className="text-center px-4">
                  {game.bet.type === 'skin' && game.bet.skin ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{game.bet.skin.image}</span>
                      <div className="text-left">
                        <p className="text-xs text-white truncate max-w-[100px]">{game.bet.skin.name}</p>
                        <p className="text-xs" style={{ color: RARITY_CONFIG[game.bet.skin.rarity].color }}>
                          {game.bet.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-mono font-bold text-xl text-amber-400">
                        {game.bet.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-metal-500">Coins</p>
                    </div>
                  )}
                </div>

                {/* VS */}
                <div className="text-2xl font-display font-black text-metal-600">VS</div>

                {/* Empty Slot */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <p className="font-bold text-metal-500">Warte auf...</p>
                    <p className="text-sm text-metal-600">
                      {game.side === 'eldrun' ? '💀 Rust' : '🐉 Eldrun'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-metal-700 border-2 border-dashed border-metal-600 flex items-center justify-center">
                    <span className="text-xl">❓</span>
                  </div>
                </div>

                {/* Join Button */}
                {game.creator !== 'Du' && (
                  <button
                    onClick={() => joinGame(game)}
                    disabled={balance < game.bet.value || isFlipping}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-display font-bold uppercase rounded-lg hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Join
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Recent Winners */}
      <div className="bg-metal-900/50 border border-metal-800 p-6 rounded-lg">
        <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Letzte Gewinner
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { player: '🐉 DragonSlayer', amount: 25000, side: 'eldrun' },
            { player: '🐺 NightWolf', amount: 12000, side: 'rust' },
            { player: '💎 RichKid', amount: 50000, side: 'eldrun' },
            { player: '⚔️ Warrior', amount: 8000, side: 'rust' },
          ].map((winner, i) => (
            <div key={i} className={`flex-shrink-0 px-4 py-2 rounded-lg border ${
              winner.side === 'eldrun' 
                ? 'bg-amber-500/10 border-amber-500/30' 
                : 'bg-gray-500/10 border-gray-500/30'
            }`}>
              <span className="text-white">{winner.player}</span>
              <span className="text-green-400 ml-2 font-mono">+{winner.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
