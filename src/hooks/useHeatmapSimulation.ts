'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
  type: 'kill' | 'death' | 'raid' | 'airdrop' | 'helicopter' | 'cargo' | 'build' | 'destroy'
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
  type: 'activity' | 'combat' | 'building'
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

// Monument locations on a 4000x4000 map
const MONUMENTS: Monument[] = [
  { id: 'launch', name: 'Launch Site', x: 3200, y: 800, type: 'launch', tier: 3, radius: 200 },
  { id: 'military', name: 'Military Tunnels', x: 600, y: 1200, type: 'military', tier: 3, radius: 150 },
  { id: 'airfield', name: 'Airfield', x: 2000, y: 600, type: 'airfield', tier: 2, radius: 180 },
  { id: 'dome', name: 'The Dome', x: 1400, y: 2800, type: 'dome', tier: 2, radius: 100 },
  { id: 'trainyard', name: 'Train Yard', x: 2800, y: 2200, type: 'trainyard', tier: 2, radius: 160 },
  { id: 'water', name: 'Water Treatment', x: 800, y: 3200, type: 'water', tier: 2, radius: 140 },
  { id: 'harbor1', name: 'Harbor', x: 3600, y: 2000, type: 'harbor', tier: 2, radius: 120 },
  { id: 'oil1', name: 'Large Oil Rig', x: 3800, y: 3800, type: 'oil', tier: 3, radius: 80 },
  { id: 'oil2', name: 'Small Oil Rig', x: 200, y: 3800, type: 'oil', tier: 2, radius: 60 },
  { id: 'outpost', name: 'Outpost', x: 2000, y: 2000, type: 'outpost', tier: 1, radius: 100 },
  { id: 'bandit', name: 'Bandit Camp', x: 1000, y: 2000, type: 'bandit', tier: 1, radius: 100 },
]

// Haus Seraphar - Gold/Amber faction
const SERAPHAR_PLAYERS = [
  'DeathBringer', 'ShadowHunter', 'BloodRaven', 'IronFist', 'StormBlade',
  'NightHawk', 'FireStorm', 'WarMachine', 'DarkKnight', 'ThunderBolt'
]

// Haus Vorgaroth - Red/Purple faction  
const VORGAROTH_PLAYERS = [
  'RustLord', 'VoidWalker', 'DarkMatter', 'SilentDeath', 'GhostRider',
  'NeonShadow', 'CyberPunk', 'QuantumLeap', 'AbyssHunter', 'NightShade'
]

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function generateInitialPlayers(): Player[] {
  const players: Player[] = []
  
  // Apex faction - spawn in upper right quadrant
  SERAPHAR_PLAYERS.forEach((name: string, i: number) => {
    const baseX = randomInRange(2500, 3800)
    const baseY = randomInRange(200, 1500)
    players.push({
      id: `seraphar-${i}`,
      name,
      faction: 'seraphar',
      x: baseX,
      y: baseY,
      targetX: baseX,
      targetY: baseY,
      health: 100,
      kills: Math.floor(randomInRange(10, 200)),
      deaths: Math.floor(randomInRange(5, 50)),
      isMoving: false,
      speed: randomInRange(1.5, 3),
      color: '#f59e0b',
      status: 'alive'
    })
  })
  
  // Vorgaroth faction - spawn in lower left quadrant
  VORGAROTH_PLAYERS.forEach((name: string, i: number) => {
    const baseX = randomInRange(200, 1500)
    const baseY = randomInRange(2500, 3800)
    players.push({
      id: `vorgaroth-${i}`,
      name,
      faction: 'vorgaroth',
      x: baseX,
      y: baseY,
      targetX: baseX,
      targetY: baseY,
      health: 100,
      kills: Math.floor(randomInRange(10, 200)),
      deaths: Math.floor(randomInRange(5, 50)),
      isMoving: false,
      speed: randomInRange(1.5, 3),
      color: '#dc2626',
      status: 'alive'
    })
  })
  
  return players
}

export function useHeatmapSimulation(isPaused: boolean) {
  const [players, setPlayers] = useState<Player[]>(() => generateInitialPlayers())
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
  
  const frameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())

  // Add event helper
  const addEvent = useCallback((event: Omit<GameEvent, 'id' | 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }
    setEvents(prev => [newEvent, ...prev].slice(0, 50))
  }, [])

  // Generate heat data from player positions
  const updateHeatData = useCallback((currentPlayers: Player[]) => {
    const newHeatData: HeatPoint[] = []
    
    currentPlayers.forEach(player => {
      // Add activity heat around player
      newHeatData.push({
        x: player.x,
        y: player.y,
        intensity: player.status === 'combat' ? 1 : 0.5,
        type: player.status === 'combat' ? 'combat' : 'activity'
      })
    })
    
    // Add historical heat at monuments
    MONUMENTS.forEach(m => {
      newHeatData.push({
        x: m.x,
        y: m.y,
        intensity: 0.3 + Math.random() * 0.3,
        type: 'activity'
      })
    })
    
    setHeatData(newHeatData)
  }, [])

  // Main game loop
  useEffect(() => {
    if (isPaused) return

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateRef.current) / 1000
      lastUpdateRef.current = now

      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.map(player => {
          // Skip dead players temporarily
          if (player.status === 'dead') {
            // Respawn after 5 seconds
            if (Math.random() < 0.01) {
              const spawnX = player.faction === 'seraphar' 
                ? randomInRange(2500, 3800) 
                : randomInRange(200, 1500)
              const spawnY = player.faction === 'seraphar'
                ? randomInRange(200, 1500)
                : randomInRange(2500, 3800)
              return {
                ...player,
                x: spawnX,
                y: spawnY,
                targetX: spawnX,
                targetY: spawnY,
                health: 100,
                status: 'alive' as const,
                isMoving: false
              }
            }
            return player
          }

          let newX = player.x
          let newY = player.y
          let newTargetX = player.targetX
          let newTargetY = player.targetY
          let isMoving = player.isMoving
          let status = player.status

          // Set new random target occasionally (reduced chance for more realistic movement)
          if (!isMoving && Math.random() < 0.005) {
            // Sometimes move toward monuments
            if (Math.random() < 0.3) {
              const monument = MONUMENTS[Math.floor(Math.random() * MONUMENTS.length)]
              newTargetX = monument.x + randomInRange(-100, 100)
              newTargetY = monument.y + randomInRange(-100, 100)
            } else {
              // Random movement within bounds
              newTargetX = Math.max(100, Math.min(3900, player.x + randomInRange(-500, 500)))
              newTargetY = Math.max(100, Math.min(3900, player.y + randomInRange(-500, 500)))
            }
            isMoving = true
          }

          // Move toward target
          if (isMoving) {
            const dist = distance(newX, newY, newTargetX, newTargetY)
            if (dist < 10) {
              isMoving = false
              newX = newTargetX
              newY = newTargetY
            } else {
              const moveX = ((newTargetX - newX) / dist) * player.speed * deltaTime * 10
              const moveY = ((newTargetY - newY) / dist) * player.speed * deltaTime * 10
              newX += moveX
              newY += moveY
            }
          }

          // Check for combat with enemy faction
          const enemies = prevPlayers.filter(p => 
            p.faction !== player.faction && 
            p.status === 'alive' &&
            distance(newX, newY, p.x, p.y) < 100
          )
          
          if (enemies.length > 0) {
            status = 'combat'
            // Chance of kill
            if (Math.random() < 0.005) {
              const victim = enemies[Math.floor(Math.random() * enemies.length)]
              addEvent({
                type: 'kill',
                x: newX,
                y: newY,
                player1: player.name,
                player2: victim.name,
                faction: player.faction,
                details: `${player.name} eliminated ${victim.name}`
              })
            }
          } else {
            status = 'alive'
          }

          return {
            ...player,
            x: newX,
            y: newY,
            targetX: newTargetX,
            targetY: newTargetY,
            isMoving,
            status
          }
        })

        // Process kills - mark victims as dead
        events.slice(0, 5).forEach(event => {
          if (event.type === 'kill' && event.player2) {
            const victimIndex = updatedPlayers.findIndex(p => p.name === event.player2)
            if (victimIndex !== -1 && updatedPlayers[victimIndex].status !== 'dead') {
              updatedPlayers[victimIndex] = {
                ...updatedPlayers[victimIndex],
                status: 'dead',
                deaths: updatedPlayers[victimIndex].deaths + 1
              }
              // Increment killer's kills
              const killerIndex = updatedPlayers.findIndex(p => p.name === event.player1)
              if (killerIndex !== -1) {
                updatedPlayers[killerIndex] = {
                  ...updatedPlayers[killerIndex],
                  kills: updatedPlayers[killerIndex].kills + 1
                }
              }
            }
          }
        })

        updateHeatData(updatedPlayers)
        return updatedPlayers
      })

      // Random world events
      if (Math.random() < 0.002) {
        const eventTypes: GameEvent['type'][] = ['airdrop', 'helicopter', 'cargo', 'raid']
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        addEvent({
          type,
          x: randomInRange(500, 3500),
          y: randomInRange(500, 3500),
          details: type === 'airdrop' ? 'Airdrop incoming!' : 
                   type === 'helicopter' ? 'Attack Helicopter spawned!' :
                   type === 'cargo' ? 'Cargo Ship approaching!' : 'Raid started!'
        })
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        totalPlayers: players.filter(p => p.status !== 'dead').length,
        serapharPlayers: players.filter(p => p.faction === 'seraphar' && p.status !== 'dead').length,
        vorgarothPlayers: players.filter(p => p.faction === 'vorgaroth' && p.status !== 'dead').length,
        totalKills: players.reduce((sum, p) => sum + p.kills, 0),
        totalDeaths: players.reduce((sum, p) => sum + p.deaths, 0)
      }))

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isPaused, addEvent, updateHeatData, events, players])

  return {
    players,
    events,
    heatData,
    stats,
    monuments: MONUMENTS
  }
}
