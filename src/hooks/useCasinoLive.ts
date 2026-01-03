// Casino Live Activity System
// Fetches real casino activity from the database

import { useState, useEffect, useCallback, useRef } from 'react'
import { CasinoActivity, GAME_NAMES } from '@/data/casinoPlayers'

// Configuration
const CONFIG = {
  pollInterval: 3000,
  maxActivities: 100
}

// Main hook - fetches real casino activity from API
export function useCasinoLive() {
  const [activities, setActivities] = useState<CasinoActivity[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [specialEvent, setSpecialEvent] = useState<CasinoActivity | null>(null)
  const lastFetchRef = useRef<string | null>(null)
  
  // Fetch activities from API
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/casino/activity')
      if (res.ok) {
        const data = await res.json()
        if (data.activities && data.activities.length > 0) {
          // Convert timestamps and merge with existing
          const newActivities: CasinoActivity[] = data.activities.map((a: CasinoActivity) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
          
          // Check for new special events
          const latestId = newActivities[0]?.id
          if (latestId && latestId !== lastFetchRef.current) {
            lastFetchRef.current = latestId
            
            // Check for special events in new activities
            const specialActivity = newActivities.find((a: CasinoActivity) => a.isSpecial)
            if (specialActivity) {
              setSpecialEvent(specialActivity)
              setTimeout(() => setSpecialEvent(null), 5000)
            }
          }
          
          setActivities(newActivities.slice(0, CONFIG.maxActivities))
        }
      }
    } catch (error) {
      console.error('Failed to fetch casino activity:', error)
    }
  }, [])
  
  // Initial fetch and polling
  useEffect(() => {
    fetchActivities()
    
    if (!isRunning) return
    
    const interval = setInterval(fetchActivities, CONFIG.pollInterval)
    return () => clearInterval(interval)
  }, [isRunning, fetchActivities])
  
  return {
    activities,
    specialEvent,
    isRunning,
    setIsRunning,
    triggerActivity: fetchActivities,
    triggerSpecialEvent: () => {},
    clearSpecialEvent: () => setSpecialEvent(null)
  }
}

// Statistics helpers - calculates from real data
export function getLiveStats(activities: CasinoActivity[]) {
  const last24h = activities.filter(a => 
    Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
  )
  
  const totalWagered = last24h.reduce((sum, a) => 
    sum + (a.type === 'loss' || a.type === 'bust' || a.type === 'disaster' ? a.amount : 0), 0
  )
  
  const totalWon = last24h.reduce((sum, a) => 
    sum + (['win', 'big_win', 'jackpot', 'skin_win', 'rare_drop', 'multiplier', 'comeback'].includes(a.type) ? a.amount : 0), 0
  )
  
  const biggestWin = Math.max(...last24h.filter(a => 
    ['win', 'big_win', 'jackpot', 'skin_win', 'rare_drop'].includes(a.type)
  ).map(a => a.amount), 0)
  
  const activePlayers = new Set(last24h.map(a => a.player?.id)).size
  
  return {
    totalWagered,
    totalWon,
    biggestWin,
    activePlayers,
    gamesPlayed: last24h.length
  }
}
