'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Player, GameEvent, HeatPoint, Monument } from '@/hooks/useHeatmapData'

interface HeatmapCanvasProps {
  zoom: number
  players: Player[]
  events: GameEvent[]
  heatData: HeatPoint[]
  monuments: Monument[]
  opsPins?: {
    id: string
    type: string
    label: string
    note?: string | null
    x: number
    y: number
  }[]
  showHeatOverlay: boolean
  showPlayers: boolean
  showEvents: boolean
  showMonuments: boolean
  showGrid: boolean
  selectedPlayer: string | null
  onSelectPlayer: (id: string | null) => void
  onMapClick?: (pos: { x: number; y: number }, ev?: { shiftKey?: boolean }) => void
  heatmapType?: 'activity' | 'combat' | 'resources' | 'danger'
  show3D?: boolean
  showPredictions?: boolean
}

const MAP_SIZE = 8000
const CANVAS_SIZE = 800
const ELDRUN_MAP_URL = '/images/5212.png'

export function HeatmapCanvas({
  zoom,
  players,
  events,
  heatData,
  monuments,
  opsPins,
  showHeatOverlay,
  showPlayers,
  showEvents,
  showMonuments,
  showGrid,
  selectedPlayer,
  onSelectPlayer,
  onMapClick,
  heatmapType = 'activity',
  show3D = false,
  showPredictions = false
}: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heatCanvasRef = useRef<HTMLCanvasElement>(null)
  const mapImageRef = useRef<HTMLImageElement | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Load map image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      mapImageRef.current = img
      setMapLoaded(true)
    }
    img.onerror = () => {
      console.warn('Failed to load Eldrun map image')
    }
    img.src = ELDRUN_MAP_URL
  }, [])

  // Convert map coords to canvas coords
  const mapToCanvas = useCallback((x: number, y: number) => {
    const scale = (CANVAS_SIZE / MAP_SIZE) * zoom
    return {
      x: (x * scale) + pan.x + (CANVAS_SIZE * (1 - zoom) / 2),
      y: (y * scale) + pan.y + (CANVAS_SIZE * (1 - zoom) / 2)
    }
  }, [zoom, pan])

  const canvasToMap = useCallback((x: number, y: number) => {
    const scale = (CANVAS_SIZE / MAP_SIZE) * zoom
    const mx = (x - pan.x - (CANVAS_SIZE * (1 - zoom) / 2)) / scale
    const my = (y - pan.y - (CANVAS_SIZE * (1 - zoom) / 2)) / scale
    return {
      x: Math.max(0, Math.min(MAP_SIZE, mx)),
      y: Math.max(0, Math.min(MAP_SIZE, my)),
    }
  }, [zoom, pan])

  const drawOpsPins = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!opsPins || opsPins.length === 0) return

    for (const pin of opsPins) {
      const pos = mapToCanvas(pin.x, pin.y)

      let color = '#9ca3af'
      if (pin.type === 'danger' || pin.type === 'enemy') color = '#ef4444'
      if (pin.type === 'loot') color = '#22c55e'
      if (pin.type === 'base') color = '#60a5fa'
      if (pin.type === 'meet') color = '#f59e0b'

      // glow
      ctx.fillStyle = `${color}22`
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2)
      ctx.fill()

      // pin head
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
      ctx.fill()

      // stem
      ctx.strokeStyle = `${color}AA`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + 6)
      ctx.lineTo(pos.x, pos.y + 16)
      ctx.stroke()

      // label
      if (zoom > 0.8) {
        ctx.font = `${11 * zoom}px monospace`
        ctx.textAlign = 'left'
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fillText(pin.label, pos.x + 10, pos.y - 10)
      }
    }
  }, [opsPins, mapToCanvas, zoom])

  // Draw heat overlay with advanced filtering
  const drawHeatOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showHeatOverlay) return

    // Filter heat data based on heatmap type
    const filteredHeatData = heatData.filter(point => {
      switch (heatmapType) {
        case 'activity':
          return point.type === 'activity' || point.type === 'movement'
        case 'combat':
          return point.type === 'combat' || point.type === 'kill' || point.type === 'explosion'
        case 'resources':
          return point.type === 'resource' || point.type === 'loot' || point.type === 'gather'
        case 'danger':
          return point.type === 'danger' || point.type === 'threat' || point.type === 'warning'
        default:
          return true
      }
    })

    // Enhanced heat rendering with GPU-like effects
    filteredHeatData.forEach(point => {
      const pos = mapToCanvas(point.x, point.y)
      const baseRadius = 60 * zoom * point.intensity
      
      // Multi-layer gradient for depth
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, baseRadius * 2)
      
      // Dynamic color based on heatmap type and intensity
      if (heatmapType === 'combat') {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)')
        gradient.addColorStop(0.3, 'rgba(239, 68, 68, 0.5)')
        gradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.2)')
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
      } else if (heatmapType === 'danger') {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)')
        gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.6)')
        gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)')
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
      } else if (heatmapType === 'resources') {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)')
        gradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.5)')
        gradient.addColorStop(0.6, 'rgba(34, 197, 94, 0.2)')
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
      } else {
        // Default activity
        gradient.addColorStop(0, 'rgba(237, 118, 32, 0.7)')
        gradient.addColorStop(0.3, 'rgba(237, 118, 32, 0.4)')
        gradient.addColorStop(0.6, 'rgba(237, 118, 32, 0.2)')
        gradient.addColorStop(1, 'rgba(237, 118, 32, 0)')
      }
      
      // Apply gradient with pulsing effect for high-intensity points
      ctx.save()
      if (point.intensity > 0.7) {
        const pulseScale = 1 + Math.sin(Date.now() / 300) * 0.1
        ctx.translate(pos.x, pos.y)
        ctx.scale(pulseScale, pulseScale)
        ctx.translate(-pos.x, -pos.y)
      }
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Add glow effect for high-intensity areas
      if (point.intensity > 0.8) {
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, baseRadius * 1.2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      
      ctx.restore()
    })

    // AI Prediction overlay
    if (showPredictions && filteredHeatData.length > 0) {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      
      // Predict next hotspots based on current data
      const hotspots = filteredHeatData
        .filter(p => p.intensity > 0.6)
        .slice(0, 3)
      
      hotspots.forEach((point, index) => {
        const pos = mapToCanvas(point.x, point.y)
        ctx.fillText('AI PREDICTION', pos.x, pos.y - 30)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      })
      
      ctx.restore()
    }
  }, [heatData, showHeatOverlay, mapToCanvas, zoom, heatmapType, showPredictions])

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1

    const gridSize = 500
    for (let i = 0; i <= MAP_SIZE; i += gridSize) {
      const startH = mapToCanvas(i, 0)
      const endH = mapToCanvas(i, MAP_SIZE)
      ctx.beginPath()
      ctx.moveTo(startH.x, startH.y)
      ctx.lineTo(endH.x, endH.y)
      ctx.stroke()

      const startV = mapToCanvas(0, i)
      const endV = mapToCanvas(MAP_SIZE, i)
      ctx.beginPath()
      ctx.moveTo(startV.x, startV.y)
      ctx.lineTo(endV.x, endV.y)
      ctx.stroke()
    }
  }, [showGrid, mapToCanvas])

  // Draw monuments
  const drawMonuments = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showMonuments) return

    monuments.forEach(monument => {
      const pos = mapToCanvas(monument.x, monument.y)
      const radius = monument.radius * (CANVAS_SIZE / MAP_SIZE) * zoom

      // Monument zone
      ctx.fillStyle = monument.tier === 3 ? 'rgba(239, 68, 68, 0.1)' :
                      monument.tier === 2 ? 'rgba(237, 118, 32, 0.1)' :
                      'rgba(74, 222, 128, 0.1)'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Monument border
      ctx.strokeStyle = monument.tier === 3 ? 'rgba(239, 68, 68, 0.5)' :
                        monument.tier === 2 ? 'rgba(237, 118, 32, 0.5)' :
                        'rgba(74, 222, 128, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])

      // Monument icon
      ctx.fillStyle = monument.tier === 3 ? '#ef4444' :
                      monument.tier === 2 ? '#ed7620' :
                      '#4ade80'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Monument name
      if (zoom > 0.8) {
        ctx.fillStyle = '#fff'
        ctx.font = `${10 * zoom}px monospace`
        ctx.textAlign = 'center'
        ctx.fillText(monument.name, pos.x, pos.y - 15)
      }
    })
  }, [monuments, showMonuments, mapToCanvas, zoom])

  // Draw players
  const drawPlayers = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showPlayers) return

    players.forEach(player => {
      if (player.status === 'dead') return

      const pos = mapToCanvas(player.x, player.y)
      const isSelected = selectedPlayer === player.id
      const isHovered = hoveredPlayer?.id === player.id
      const size = isSelected ? 12 : isHovered ? 10 : 8

      // Player glow
      if (player.status === 'combat') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size + 10, 0, Math.PI * 2)
        ctx.fill()
      }

      // Direction indicator (movement trail)
      if (player.isMoving) {
        const targetPos = mapToCanvas(player.targetX, player.targetY)
        ctx.strokeStyle = `${player.color}40`
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Player dot
      ctx.fillStyle = player.color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
      ctx.fill()

      // Selection ring
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, size + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Faction indicator
      ctx.fillStyle = player.faction === 'seraphar' ? '#f59e0b' : '#dc2626'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2)
      ctx.fill()

      // Player name on hover/select
      if ((isSelected || isHovered) && zoom > 0.6) {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(player.name, pos.x, pos.y - size - 8)
        
        // Health bar
        const barWidth = 40
        const barHeight = 4
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(pos.x - barWidth/2, pos.y + size + 4, barWidth, barHeight)
        ctx.fillStyle = player.health > 50 ? '#4ade80' : player.health > 25 ? '#eab308' : '#ef4444'
        ctx.fillRect(pos.x - barWidth/2, pos.y + size + 4, barWidth * (player.health / 100), barHeight)
      }
    })
  }, [players, showPlayers, mapToCanvas, selectedPlayer, hoveredPlayer, zoom])

  // Draw events
  const drawEvents = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showEvents) return

    const recentEvents = events.slice(0, 10)
    recentEvents.forEach((event, index) => {
      const pos = mapToCanvas(event.x, event.y)
      const age = (Date.now() - event.timestamp.getTime()) / 1000
      const opacity = Math.max(0, 1 - age / 30)

      if (opacity <= 0) return

      ctx.globalAlpha = opacity

      // Event icon based on type
      let color = '#fff'
      let symbol = '?'
      let size = 15

      switch (event.type) {
        case 'kill':
          color = '#ef4444'
          symbol = '💀'
          size = 20
          break
        case 'airdrop':
          color = '#4ade80'
          symbol = '📦'
          size = 25
          break
        case 'helicopter':
          color = '#ef4444'
          symbol = '🚁'
          size = 25
          break
        case 'cargo':
          color = '#3b82f6'
          symbol = '🚢'
          size = 25
          break
        case 'raid':
          color = '#f97316'
          symbol = '💥'
          size = 22
          break
      }

      // Pulsing ring for events
      const pulseSize = size + Math.sin(Date.now() / 200) * 5
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, pulseSize, 0, Math.PI * 2)
      ctx.stroke()

      // Event emoji
      ctx.font = `${size}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(symbol, pos.x, pos.y)

      ctx.globalAlpha = 1
    })
  }, [events, showEvents, mapToCanvas])

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw map background
    const mapBounds = {
      topLeft: mapToCanvas(0, 0),
      bottomRight: mapToCanvas(MAP_SIZE, MAP_SIZE)
    }
    
    // Draw Eldrun map image if loaded
    if (mapLoaded && mapImageRef.current) {
      ctx.drawImage(
        mapImageRef.current,
        mapBounds.topLeft.x,
        mapBounds.topLeft.y,
        mapBounds.bottomRight.x - mapBounds.topLeft.x,
        mapBounds.bottomRight.y - mapBounds.topLeft.y
      )
    } else {
      // Fallback: Water background
      ctx.fillStyle = '#0c2d48'
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      
      // Land mass placeholder
      ctx.fillStyle = '#1a2f1a'
      const landPadding = 100 * (CANVAS_SIZE / MAP_SIZE) * zoom
      ctx.fillRect(
        mapBounds.topLeft.x + landPadding,
        mapBounds.topLeft.y + landPadding,
        (mapBounds.bottomRight.x - mapBounds.topLeft.x) - landPadding * 2,
        (mapBounds.bottomRight.y - mapBounds.topLeft.y) - landPadding * 2
      )
    }

    // Draw layers
    drawGrid(ctx)
    drawHeatOverlay(ctx)
    drawMonuments(ctx)
    drawPlayers(ctx)
    drawOpsPins(ctx)
    drawEvents(ctx)

    // Map border
    ctx.strokeStyle = '#ed7620'
    ctx.lineWidth = 3
    ctx.strokeRect(
      mapBounds.topLeft.x,
      mapBounds.topLeft.y,
      mapBounds.bottomRight.x - mapBounds.topLeft.x,
      mapBounds.bottomRight.y - mapBounds.topLeft.y
    )

  }, [players, events, heatData, monuments, zoom, pan, showHeatOverlay, showPlayers, showEvents, showMonuments, showGrid, selectedPlayer, hoveredPlayer, mapToCanvas, drawGrid, drawHeatOverlay, drawMonuments, drawPlayers, drawOpsPins, drawEvents, mapLoaded])

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      // Check for player hover
      const hovered = players.find(player => {
        if (player.status === 'dead') return false
        const pos = mapToCanvas(player.x, player.y)
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        return dist < 15
      })
      setHoveredPlayer(hovered || null)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredPlayer) {
      onSelectPlayer(hoveredPlayer.id === selectedPlayer ? null : hoveredPlayer.id)
      return
    }

    onSelectPlayer(null)

    if (!onMapClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const pos = canvasToMap(cx, cy)
    onMapClick(pos, { shiftKey: e.shiftKey })
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-metal-950">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="cursor-crosshair"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          imageRendering: 'pixelated'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      
      {/* Hover tooltip */}
      {hoveredPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none bg-metal-900/95 border border-metal-700 p-3 z-10"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 10,
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredPlayer.color }}
            />
            <span className="font-display font-bold text-white">{hoveredPlayer.name}</span>
            <span className={`text-xs px-1 ${hoveredPlayer.faction === 'seraphar' ? 'text-amber-400' : 'text-red-400'}`}>
              [{hoveredPlayer.faction.toUpperCase()}]
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <span className="text-metal-500">Kills:</span>
            <span className="text-white">{hoveredPlayer.kills}</span>
            <span className="text-metal-500">Deaths:</span>
            <span className="text-white">{hoveredPlayer.deaths}</span>
            <span className="text-metal-500">K/D:</span>
            <span className="text-white">
              {(hoveredPlayer.kills / Math.max(1, hoveredPlayer.deaths)).toFixed(2)}
            </span>
            <span className="text-metal-500">Health:</span>
            <span className={hoveredPlayer.health > 50 ? 'text-radiation-400' : 'text-blood-500'}>
              {hoveredPlayer.health}%
            </span>
            <span className="text-metal-500">Status:</span>
            <span className={hoveredPlayer.status === 'combat' ? 'text-blood-500' : 'text-radiation-400'}>
              {hoveredPlayer.status.toUpperCase()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
