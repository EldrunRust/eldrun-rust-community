'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useCasinoStore } from '@/hooks/useCasinoStore'

/**
 * Hook to sync casino state with user profile
 * Call this in layout or main components to keep data in sync
 */
export function useProfileSync() {
  const currentUser = useStore((state) => state.currentUser)
  const updateUserProfile = useStore((state) => state.updateUserProfile)
  const unlockAchievement = useStore((state) => state.unlockAchievement)
  const addUserActivity = useStore((state) => state.addUserActivity)
  const { balance, totalWagered, totalWon, gamesPlayed } = useCasinoStore()

  // Sync casino balance to profile when it changes
  useEffect(() => {
    if (currentUser && (
      currentUser.casinoCoins !== balance ||
      currentUser.totalWagered !== totalWagered ||
      currentUser.totalWon !== totalWon
    )) {
      updateUserProfile({
        casinoCoins: balance,
        totalWagered: totalWagered,
        totalWon: totalWon
      })
    }
  }, [balance, totalWagered, totalWon, currentUser, updateUserProfile])

  // Check for casino achievements
  useEffect(() => {
    if (!currentUser) return

    // First Win Achievement
    if (totalWon > 0 && !currentUser.achievements.some(a => a.id === 'first_win')) {
      unlockAchievement({
        id: 'first_win',
        name: 'Erster Gewinn',
        icon: '🎰',
        points: 50
      })
      addUserActivity({
        type: 'achievement',
        message: 'Achievement freigeschaltet: Erster Gewinn!'
      })
    }

    // High Roller Achievement (wagered 100k+)
    if (totalWagered >= 100000 && !currentUser.achievements.some(a => a.id === 'high_roller')) {
      unlockAchievement({
        id: 'high_roller',
        name: 'High Roller',
        icon: '💎',
        points: 200
      })
      addUserActivity({
        type: 'achievement',
        message: 'Achievement freigeschaltet: High Roller!'
      })
    }

    // Lucky Winner (won 50k+ total)
    if (totalWon >= 50000 && !currentUser.achievements.some(a => a.id === 'lucky_winner')) {
      unlockAchievement({
        id: 'lucky_winner',
        name: 'Glückspilz',
        icon: '🍀',
        points: 150
      })
    }

    // Casino Veteran (100+ games played)
    if (gamesPlayed >= 100 && !currentUser.achievements.some(a => a.id === 'casino_veteran')) {
      unlockAchievement({
        id: 'casino_veteran',
        name: 'Casino Veteran',
        icon: '🎲',
        points: 100
      })
    }

  }, [totalWagered, totalWon, gamesPlayed, currentUser, addUserActivity, unlockAchievement])

  return { synced: !!currentUser }
}

/**
 * Hook for casino game results - call after each game
 */
export function useCasinoRewards() {
  const { currentUser, addXP, addCoins, unlockAchievement, addUserActivity } = useStore()
  
  const rewardWin = (game: string, bet: number, payout: number, multiplier?: number) => {
    if (!currentUser) return

    // XP reward based on bet size
    const xpReward = Math.floor(bet / 100) + 10
    addXP(xpReward)

    // Activity log
    addUserActivity({
      type: 'casino_win',
      message: `${payout.toLocaleString()} 🪙 bei ${game} gewonnen!`,
      data: { game, bet, payout, multiplier }
    })

    // Big Win Achievement
    if (payout >= 10000 && !currentUser.achievements.some(a => a.id === 'big_winner')) {
      unlockAchievement({
        id: 'big_winner',
        name: 'Großer Gewinner',
        icon: '🏆',
        points: 300
      })
    }

    // Jackpot Achievement (10x+ multiplier)
    if (multiplier && multiplier >= 10 && !currentUser.achievements.some(a => a.id === 'jackpot_hit')) {
      unlockAchievement({
        id: 'jackpot_hit',
        name: 'Jackpot!',
        icon: '💰',
        points: 500
      })
    }
  }

  const rewardLoss = (game: string, bet: number) => {
    if (!currentUser) return

    // Small XP even for losing (participation)
    const xpReward = Math.floor(bet / 500) + 2
    addXP(xpReward)
  }

  return { rewardWin, rewardLoss }
}

/**
 * Hook to check if user can afford something
 */
export function useCanAfford() {
  const { currentUser } = useStore()
  const { balance } = useCasinoStore()

  const canAffordCasino = (amount: number) => {
    return balance >= amount
  }

  const canAffordShop = (amount: number) => {
    return currentUser ? currentUser.coins >= amount : false
  }

  return { canAffordCasino, canAffordShop, casinoCoins: balance, shopCoins: currentUser?.coins || 0 }
}

/**
 * Hook for shop purchases
 */
export function useShopPurchase() {
  const { currentUser, updateUserProfile, addXP, unlockAchievement, addUserActivity } = useStore()

  const purchaseItem = (itemName: string, price: number, category: string) => {
    if (!currentUser || currentUser.coins < price) return false

    // Deduct coins
    updateUserProfile({ coins: currentUser.coins - price })

    // XP reward for purchase
    addXP(Math.floor(price / 50) + 5)

    // Activity log
    addUserActivity({
      type: 'purchase',
      message: `${itemName} für ${price.toLocaleString()} 🪙 gekauft`,
      data: { item: itemName, price, category }
    })

    // First Purchase Achievement
    if (!currentUser.achievements.some(a => a.id === 'first_purchase')) {
      unlockAchievement({
        id: 'first_purchase',
        name: 'Erster Einkauf',
        icon: '🛒',
        points: 50
      })
    }

    // Big Spender (spent 10k+ total)
    // This would need tracking - simplified for now

    return true
  }

  return { purchaseItem, coins: currentUser?.coins || 0 }
}
