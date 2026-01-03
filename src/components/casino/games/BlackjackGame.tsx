'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Spade, Heart, Diamond, Club, RotateCcw } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

interface Card {
  suit: Suit
  value: CardValue
  hidden?: boolean
}

type GameState = 'betting' | 'playing' | 'dealerTurn' | 'finished'

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const VALUES: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const SUIT_ICONS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
}

const SUIT_COLORS = {
  spades: 'text-gray-800',
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-800'
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value })
    }
  }
  return shuffleDeck(deck)
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getCardValue(card: Card): number {
  if (card.value === 'A') return 11
  if (['K', 'Q', 'J'].includes(card.value)) return 10
  return parseInt(card.value)
}

function calculateHandValue(hand: Card[]): number {
  let value = 0
  let aces = 0
  
  for (const card of hand) {
    if (card.hidden) continue
    value += getCardValue(card)
    if (card.value === 'A') aces++
  }
  
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  
  return value
}

function PlayingCard({ card, index, hidden = false }: { card: Card; index: number; hidden?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: index * 0.2, duration: 0.3 }}
      className={`relative w-16 h-24 md:w-20 md:h-28 rounded-lg shadow-lg ${
        hidden ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-white'
      } flex items-center justify-center border-2 border-gray-300`}
      style={{ marginLeft: index > 0 ? -30 : 0 }}
    >
      {!hidden && (
        <>
          <div className={`absolute top-1 left-1 text-xs md:text-sm font-bold ${SUIT_COLORS[card.suit]}`}>
            {card.value}
            <div className="text-lg">{SUIT_ICONS[card.suit]}</div>
          </div>
          <div className={`text-2xl md:text-4xl ${SUIT_COLORS[card.suit]}`}>
            {SUIT_ICONS[card.suit]}
          </div>
          <div className={`absolute bottom-1 right-1 text-xs md:text-sm font-bold rotate-180 ${SUIT_COLORS[card.suit]}`}>
            {card.value}
            <div className="text-lg">{SUIT_ICONS[card.suit]}</div>
          </div>
        </>
      )}
      {hidden && (
        <div className="text-4xl text-blue-300">?</div>
      )}
    </motion.div>
  )
}

export function BlackjackGame() {
  const { balance, addBalance, subtractBalance, addHistory, updateStats } = useCasinoStore()
  const [gameState, setGameState] = useState<GameState>('betting')
  const [deck, setDeck] = useState<Card[]>(createDeck())
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [betAmount, setBetAmount] = useState(100)
  const [message, setMessage] = useState('')
  const [winAmount, setWinAmount] = useState(0)

  const playerValue = calculateHandValue(playerHand)
  const dealerValue = calculateHandValue(dealerHand.map((c, i) => i === 1 && gameState === 'playing' ? { ...c, hidden: true } : c))
  const dealerFullValue = calculateHandValue(dealerHand)

  const dealCard = (currentDeck: Card[]): [Card, Card[]] => {
    const newDeck = [...currentDeck]
    const card = newDeck.pop()!
    return [card, newDeck]
  }

  const startGame = () => {
    if (balance < betAmount || betAmount <= 0) return

    subtractBalance(betAmount)
    setMessage('')
    setWinAmount(0)

    let newDeck = createDeck()
    const newPlayerHand: Card[] = []
    const newDealerHand: Card[] = []

    // Deal initial cards
    let card: Card
    ;[card, newDeck] = dealCard(newDeck)
    newPlayerHand.push(card)
    ;[card, newDeck] = dealCard(newDeck)
    newDealerHand.push(card)
    ;[card, newDeck] = dealCard(newDeck)
    newPlayerHand.push(card)
    ;[card, newDeck] = dealCard(newDeck)
    newDealerHand.push(card)

    setDeck(newDeck)
    setPlayerHand(newPlayerHand)
    setDealerHand(newDealerHand)
    setGameState('playing')

    // Check for blackjack
    const pValue = calculateHandValue(newPlayerHand)
    const dValue = calculateHandValue(newDealerHand)

    if (pValue === 21 && dValue === 21) {
      setTimeout(() => endGame('push', newPlayerHand, newDealerHand), 500)
    } else if (pValue === 21) {
      setTimeout(() => endGame('blackjack', newPlayerHand, newDealerHand), 500)
    } else if (dValue === 21) {
      setTimeout(() => endGame('dealerBlackjack', newPlayerHand, newDealerHand), 500)
    }
  }

  const hit = () => {
    if (gameState !== 'playing') return

    const [card, newDeck] = dealCard(deck)
    const newHand = [...playerHand, card]
    setDeck(newDeck)
    setPlayerHand(newHand)

    const value = calculateHandValue(newHand)
    if (value > 21) {
      endGame('bust', newHand, dealerHand)
    } else if (value === 21) {
      stand(newHand)
    }
  }

  const stand = (currentPlayerHand?: Card[]) => {
    if (gameState !== 'playing') return
    
    const pHand = currentPlayerHand || playerHand
    setGameState('dealerTurn')
    
    // Dealer plays
    let currentDeck = [...deck]
    let currentDealerHand = [...dealerHand]
    
    const playDealer = () => {
      const dealerVal = calculateHandValue(currentDealerHand)
      
      if (dealerVal < 17) {
        const [card, newDeck] = dealCard(currentDeck)
        currentDeck = newDeck
        currentDealerHand = [...currentDealerHand, card]
        setDeck(currentDeck)
        setDealerHand(currentDealerHand)
        
        setTimeout(playDealer, 600)
      } else {
        // Determine winner
        const playerVal = calculateHandValue(pHand)
        const finalDealerVal = calculateHandValue(currentDealerHand)
        
        if (finalDealerVal > 21) {
          endGame('dealerBust', pHand, currentDealerHand)
        } else if (playerVal > finalDealerVal) {
          endGame('win', pHand, currentDealerHand)
        } else if (playerVal < finalDealerVal) {
          endGame('lose', pHand, currentDealerHand)
        } else {
          endGame('push', pHand, currentDealerHand)
        }
      }
    }
    
    setTimeout(playDealer, 600)
  }

  const doubleDown = () => {
    if (gameState !== 'playing' || playerHand.length !== 2 || balance < betAmount) return

    subtractBalance(betAmount)
    const [card, newDeck] = dealCard(deck)
    const newHand = [...playerHand, card]
    setDeck(newDeck)
    setPlayerHand(newHand)

    const value = calculateHandValue(newHand)
    if (value > 21) {
      endGame('bust', newHand, dealerHand, true)
    } else {
      setTimeout(() => stand(newHand), 500)
    }
  }

  const endGame = (result: string, pHand: Card[], dHand: Card[], doubled = false) => {
    setGameState('finished')
    const bet = doubled ? betAmount * 2 : betAmount
    let winnings = 0
    let msg = ''

    switch (result) {
      case 'blackjack':
        winnings = Math.floor(bet * 2.5)
        msg = '🎰 BLACKJACK! Du gewinnst!'
        break
      case 'win':
      case 'dealerBust':
        winnings = bet * 2
        msg = result === 'dealerBust' ? '💥 Dealer Bust! Du gewinnst!' : '🎉 Du gewinnst!'
        break
      case 'push':
        winnings = bet
        msg = '🤝 Unentschieden! Einsatz zurück.'
        break
      case 'bust':
        msg = '💀 Bust! Du verlierst.'
        break
      case 'lose':
      case 'dealerBlackjack':
        msg = result === 'dealerBlackjack' ? '🃏 Dealer Blackjack!' : '😔 Dealer gewinnt.'
        break
    }

    setMessage(msg)
    setWinAmount(winnings)

    if (winnings > 0) {
      addBalance(winnings)
    }

    addHistory({
      game: 'Blackjack',
      bet,
      result: winnings > bet ? 'win' : winnings === bet ? 'win' : 'lose',
      payout: winnings,
      multiplier: winnings / bet
    })
    updateStats(bet, winnings)
  }

  const newGame = () => {
    setGameState('betting')
    setPlayerHand([])
    setDealerHand([])
    setMessage('')
    setWinAmount(0)
    setDeck(createDeck())
  }

  return (
    <div className="space-y-6">
      <div className="bg-metal-900/50 border border-metal-800 p-6">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Spade className="w-5 h-5 text-gray-400" />
          Blackjack
        </h2>

        {/* Game Table */}
        <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-6 min-h-[400px] relative">
          {/* Dealer Area */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/70 text-sm font-display">DEALER</span>
              {dealerHand.length > 0 && (
                <span className="px-2 py-0.5 bg-black/30 text-white text-sm font-mono rounded">
                  {gameState === 'playing' ? '?' : dealerFullValue}
                </span>
              )}
            </div>
            <div className="flex">
              {dealerHand.map((card, i) => (
                <PlayingCard 
                  key={`${card.suit}-${card.value}-${i}`} 
                  card={card} 
                  index={i}
                  hidden={i === 1 && gameState === 'playing'}
                />
              ))}
            </div>
          </div>

          {/* Center Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <div className="bg-black/80 px-8 py-4 rounded-lg">
                  <p className="text-2xl font-display font-bold text-white">{message}</p>
                  {winAmount > 0 && (
                    <p className="text-xl text-green-400 font-mono mt-2">+{winAmount.toLocaleString()}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Area */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/70 text-sm font-display">DU</span>
              {playerHand.length > 0 && (
                <span className={`px-2 py-0.5 text-white text-sm font-mono rounded ${
                  playerValue > 21 ? 'bg-red-500' : playerValue === 21 ? 'bg-green-500' : 'bg-black/30'
                }`}>
                  {playerValue}
                </span>
              )}
            </div>
            <div className="flex">
              {playerHand.map((card, i) => (
                <PlayingCard key={`${card.suit}-${card.value}-${i}`} card={card} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {gameState === 'betting' && (
            <>
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
                </div>
              </div>
              <button
                onClick={startGame}
                disabled={balance < betAmount || betAmount <= 0}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Deal ({betAmount.toLocaleString()} Coins)
              </button>
            </>
          )}

          {gameState === 'playing' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={hit}
                className="py-4 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold uppercase transition-colors"
              >
                Hit
              </button>
              <button
                onClick={() => stand()}
                className="py-4 bg-amber-600 hover:bg-amber-500 text-white font-display font-bold uppercase transition-colors"
              >
                Stand
              </button>
              <button
                onClick={doubleDown}
                disabled={playerHand.length !== 2 || balance < betAmount}
                className="py-4 bg-purple-600 hover:bg-purple-500 text-white font-display font-bold uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Double
              </button>
              <button
                onClick={newGame}
                className="py-4 bg-red-600 hover:bg-red-500 text-white font-display font-bold uppercase transition-colors"
              >
                Surrender
              </button>
            </div>
          )}

          {(gameState === 'dealerTurn' || gameState === 'finished') && (
            <div className="flex gap-4">
              {gameState === 'finished' && (
                <button
                  onClick={newGame}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rust-500 text-white font-display font-bold text-lg uppercase tracking-wider hover:from-amber-400 hover:to-rust-400 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Neues Spiel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="mt-6 p-4 bg-metal-800/50 border border-metal-700 text-sm text-metal-400">
          <p className="font-bold text-metal-300 mb-2">Regeln:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Blackjack zahlt 3:2</li>
            <li>Dealer steht auf 17</li>
            <li>Double Down nur mit den ersten 2 Karten</li>
            <li>Ass zählt 1 oder 11</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
