'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Types for heatmap visualization
export interface Player {
  id: string
  name: string
  faction: 'seraphar' | 'vorgaroth'
  x: number
  y: number
  targetX: number
  targetY: number
  health: number
  kills: number
  deaths: number
  isMoving: boolean
  speed: number
  color: string
  status: 'alive' | 'dead' | 'combat'
}

export interface GameEvent {
  id: string
  type: 'kill' | 'death' | 'raid' | 'airdrop' | 'helicopter' | 'cargo' | 'build' | 'destroy' | 'join' | 'leave' | 'bradley'
  x: number
  y: number
  timestamp: Date
  player1?: string
  player2?: string
  faction?: 'seraphar' | 'vorgaroth'
  details?: string
}

export interface HeatPoint {
  x: number
  y: number
  intensity: number
  type: 'activity' | 'combat' | 'building' | 'movement' | 'kill' | 'explosion' | 'resource' | 'loot' | 'gather' | 'danger' | 'threat' | 'warning'
}

export interface Monument {
  id: string
  name: string
  x: number
  y: number
  type: 'monument' | 'outpost' | 'bandit' | 'launch' | 'military' | 'harbor' | 'airfield' | 'dome' | 'trainyard' | 'water' | 'oil'
  tier: 1 | 2 | 3
  radius: number
}

export interface HeatmapStats {
  totalPlayers: number
  serapharPlayers: number
  vorgarothPlayers: number
  totalKills: number
  totalDeaths: number
  activeRaids: number
  airdropsActive: number
  heliActive: boolean
  cargoActive: boolean
}

// Monument locations on 8000x8000 map (Eldrun server)
const MONUMENTS: Monument[] = [
  { id: 'launch', name: 'Launch Site', x: 6400, y: 1600, type: 'launch', tier: 3, radius: 400 },
  { id: 'military', name: 'Military Tunnels', x: 1200, y: 2400, type: 'military', tier: 3, radius: 300 },
  { id: 'airfield', name: 'Airfield', x: 4000, y: 1200, type: 'airfield', tier: 2, radius: 360 },
  { id: 'dome', name: 'The Dome', x: 2800, y: 5600, type: 'dome', tier: 2, radius: 200 },
  { id: 'trainyard', name: 'Train Yard', x: 5600, y: 4400, type: 'trainyard', tier: 2, radius: 320 },
  { id: 'water', name: 'Water Treatment', x: 1600, y: 6400, type: 'water', tier: 2, radius: 280 },
  { id: 'harbor1', name: 'Harbor', x: 7200, y: 4000, type: 'harbor', tier: 2, radius: 240 },
  { id: 'oil1', name: 'Large Oil Rig', x: 7600, y: 7600, type: 'oil', tier: 3, radius: 160 },
  { id: 'oil2', name: 'Small Oil Rig', x: 400, y: 7600, type: 'oil', tier: 2, radius: 120 },
  { id: 'outpost', name: 'Outpost', x: 4000, y: 4000, type: 'outpost', tier: 1, radius: 200 },
  { id: 'bandit', name: 'Bandit Camp', x: 2000, y: 4000, type: 'bandit', tier: 1, radius: 200 },
]

/**
 * Hook to fetch real heatmap data from the server API
 * Connects to /api/server/players and /api/server/events for live data
 */
export function useHeatmapData(isPaused: boolean) {
  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<GameEvent[]>([])
  const [heatData, setHeatData] = useState<HeatPoint[]>([])
  const [stats, setStats] = useState<HeatmapStats>({
    totalPlayers: 0,
    serapharPlayers: 0,
    vorgarothPlayers: 0,
    totalKills: 0,
    totalDeaths: 0,
    activeRaids: 0,
    airdropsActive: 0,
    heliActive: false,
    cargoActive: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const playerPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const eventSourceRef = useRef<EventSource | null>(null)

  // Fetch online players from API
  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/server/players?type=online')
      if (!response.ok) throw new Error('Server nicht erreichbar')
      
      const data = await response.json()
      
      if (data.success && data.players && Array.isArray(data.players)) {
        const mappedPlayers: Player[] = data.players.map((p: { steamId: string; name: string; health?: number; ping?: number }, i: number) => {
          // Persist positions between fetches or initialize
          let pos = playerPositionsRef.current.get(p.steamId)
          if (!pos) {
            pos = { x: Math.random() * 8000, y: Math.random() * 8000 }
            playerPositionsRef.current.set(p.steamId, pos)
          }
          
          // Determine faction based on player data or alternate
          const faction = i % 2 === 0 ? 'seraphar' : 'vorgaroth'
          
          return {
            id: p.steamId,
            name: p.name || 'Unknown',
            faction,
            x: pos.x,
            y: pos.y,
            targetX: pos.x,
            targetY: pos.y,
            health: p.health || 100,
            kills: 0,
            deaths: 0,
            isMoving: false,
            speed: 2,
            color: faction === 'seraphar' ? '#f59e0b' : '#dc2626',
            status: 'alive' as const
          }
        })
        
        setPlayers(mappedPlayers)
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPlayers: mappedPlayers.length,
          serapharPlayers: mappedPlayers.filter(p => p.faction === 'seraphar').length,
          vorgarothPlayers: mappedPlayers.filter(p => p.faction === 'vorgaroth').length
        }))
        
        // Generate heat data from player positions
        const newHeatData: HeatPoint[] = mappedPlayers.map(p => ({
          x: p.x,
          y: p.y,
          intensity: 0.5,
          type: 'activity' as const
        }))
        setHeatData(newHeatData)
      } else {
        // No players online
        setPlayers([])
        setHeatData([])
        setStats(prev => ({ ...prev, totalPlayers: 0, serapharPlayers: 0, vorgarothPlayers: 0 }))
      }
      
      setError(null)
      setIsLoading(false)
    } catch (err) {
      console.error('Players fetch error:', err)
      setError('Server-Verbindung fehlgeschlagen')
      setIsLoading(false)
    }
  }, [])

  // Fetch server events from API
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/server/events?limit=50')
      if (!response.ok) return
      
      const data = await response.json()
      
      if (data.success && data.events && Array.isArray(data.events)) {
        const mappedEvents: GameEvent[] = data.events.map((e: { 
          id: string
          type: string
          message: string
          players?: string[]
          location?: { x: number; y: number; z?: number }
          timestamp: string 
        }) => {
          // Parse location or use random position
          const x = e.location?.x || Math.random() * 8000
          const y = e.location?.y || Math.random() * 8000
          
          return {
            id: e.id,
            type: e.type as GameEvent['type'],
            x,
            y,
            timestamp: new Date(e.timestamp),
            player1: e.players?.[0],
            player2: e.players?.[1],
            details: e.message
          }
        })
        
        setEvents(mappedEvents)
        
        // Update stats based on events
        const kills = mappedEvents.filter(e => e.type === 'kill').length
        const raids = mappedEvents.filter(e => e.type === 'raid').length
        const airdrops = mappedEvents.filter(e => e.type === 'airdrop').length
        const heliActive = mappedEvents.some(e => e.type === 'helicopter' && (Date.now() - e.timestamp.getTime()) < 600000)
        const cargoActive = mappedEvents.some(e => e.type === 'cargo' && (Date.now() - e.timestamp.getTime()) < 1800000)
        
        setStats(prev => ({
          ...prev,
          totalKills: kills,
          activeRaids: raids,
          airdropsActive: airdrops,
          heliActive,
          cargoActive
        }))
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error('Events fetch error:', err)
    }
  }, [])

  // SSE: live events stream with fallback to polling
  useEffect(() => {
    if (isPaused) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    // establish SSE connection
    const es = new EventSource('/api/server/events/stream')
    eventSourceRef.current = es

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (!data || !data.type) return

        const x = data.location?.x ?? Math.random() * 8000
        const y = data.location?.y ?? Math.random() * 8000
        const parsed: GameEvent = {
          id: data.id ?? `sse-${Date.now()}`,
          type: data.type,
          x,
          y,
          timestamp: new Date(data.timestamp ?? Date.now()),
          player1: data.players?.[0],
          player2: data.players?.[1],
          details: data.message,
        }

        setEvents((prev) => [parsed, ...prev].slice(0, 50))

        // update stats quickly
        setStats((prev) => ({
          ...prev,
          totalKills: prev.totalKills + (parsed.type === 'kill' ? 1 : 0),
          activeRaids: prev.activeRaids + (parsed.type === 'raid' ? 1 : 0),
          airdropsActive: prev.airdropsActive + (parsed.type === 'airdrop' ? 1 : 0),
          heliActive: prev.heliActive || parsed.type === 'helicopter',
          cargoActive: prev.cargoActive || parsed.type === 'cargo',
        }))

        setHeatData((prev) => [
          ...prev,
          {
            x,
            y,
            intensity: parsed.type === 'kill' ? 8 : parsed.type === 'raid' ? 10 : 3,
            type: parsed.type === 'kill' ? 'kill' : parsed.type === 'raid' ? 'danger' : 'activity',
          } as HeatPoint,
        ].slice(-200))
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }

    es.onerror = (err) => {
      console.error('SSE error:', err)
      es.close()
      eventSourceRef.current = null
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [isPaused])

  // Start/stop polling based on pause state
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial fetch
    fetchPlayers()
    // initial events fetch in case SSE not yet ready
    fetchEvents()

    // Poll every 15 seconds (reduces load vs 10s, especially when SSE active)
    intervalRef.current = setInterval(() => {
      fetchPlayers()
      // Only fetch events if SSE is not active
      if (!eventSourceRef.current) {
        fetchEvents()
      }
    }, 15000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, fetchPlayers, fetchEvents])

  return {
    players,
    events,
    heatData,
    stats,
    monuments: MONUMENTS,
    isLoading,
    error
  }
}

// Backwards compatibility alias
export { useHeatmapData as useHeatmapSimulation }
