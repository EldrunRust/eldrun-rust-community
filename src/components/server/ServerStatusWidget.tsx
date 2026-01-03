'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, Users, Clock, Cpu, HardDrive, Wifi,
  RefreshCw, Play, Copy, Check, ExternalLink, 
  Activity, MapPin, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ServerStatus {
  name: string
  map: string
  players: number
  maxPlayers: number
  queuedPlayers: number
  fps: number
  uptime: string
  status: 'online' | 'offline' | 'restarting'
  lastUpdate?: string
}

interface ServerStatusWidgetProps {
  variant?: 'full' | 'compact' | 'mini'
  showConnect?: boolean
  refreshInterval?: number
}

export function ServerStatusWidget({ 
  variant = 'full',
  showConnect = true,
  refreshInterval = 30000
}: ServerStatusWidgetProps) {
  const [server, setServer] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || 'play.eldrun.de:28015'

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/server/status')
      const data = await res.json()
      if (data.server) {
        setServer(data.server)
      }
    } catch (error) {
      console.error('Failed to fetch server status:', error)
    }
    setLoading(false)
  }

  const copyIp = () => {
    navigator.clipboard.writeText(serverIp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const connectToServer = () => {
    window.open(`steam://connect/${serverIp}`, '_blank')
  }

  if (loading) {
    return (
      <div className={`bg-metal-900 border border-metal-800 rounded-xl p-4 flex items-center justify-center ${
        variant === 'mini' ? 'h-16' : variant === 'compact' ? 'h-24' : 'h-48'
      }`}>
        <RefreshCw className="w-6 h-6 text-rust-500 animate-spin" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="bg-metal-900 border border-red-500/30 rounded-xl p-4 text-center">
        <Server className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">Server nicht erreichbar</p>
      </div>
    )
  }

  // Mini variant - just status indicator
  if (variant === 'mini') {
    return (
      <div className="bg-metal-900 border border-metal-800 rounded-lg px-4 py-2 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          server.status === 'online' ? 'bg-green-500 animate-pulse' : 
          server.status === 'restarting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-white font-medium">{server.players}/{server.maxPlayers}</span>
        <span className="text-metal-500">Online</span>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="bg-metal-900 border border-metal-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              server.status === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <Server className={`w-6 h-6 ${
                server.status === 'online' ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-white">{server.name}</h3>
              <p className="text-sm text-metal-400">{server.map}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {server.players}<span className="text-metal-500">/{server.maxPlayers}</span>
            </p>
            <p className="text-sm text-metal-500">Spieler online</p>
          </div>
        </div>
        {showConnect && (
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={copyIp} className="flex-1">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1">{copied ? 'Kopiert!' : serverIp}</span>
            </Button>
            <Button variant="rust" size="sm" onClick={connectToServer}>
              <Play className="w-4 h-4 mr-1" />
              Verbinden
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className="bg-metal-900 border border-metal-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-green-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              server.status === 'online' ? 'bg-green-500 animate-pulse' : 
              server.status === 'restarting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`} />
            <h3 className="font-display font-bold text-xl text-white">{server.name}</h3>
          </div>
          <button 
            onClick={fetchStatus}
            className="p-2 hover:bg-metal-800 rounded-lg transition-colors text-metal-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div className="bg-metal-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-metal-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Spieler</span>
          </div>
          <p className="text-xl font-bold text-white">
            {server.players}<span className="text-metal-500 text-sm">/{server.maxPlayers}</span>
          </p>
          {server.queuedPlayers > 0 && (
            <p className="text-xs text-amber-400">+{server.queuedPlayers} in Warteschlange</p>
          )}
        </div>

        <div className="bg-metal-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-metal-400 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Map</span>
          </div>
          <p className="text-sm font-medium text-white truncate">{server.map}</p>
        </div>

        <div className="bg-metal-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-metal-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs">FPS</span>
          </div>
          <p className="text-xl font-bold text-white">{server.fps}</p>
        </div>

        <div className="bg-metal-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-metal-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Uptime</span>
          </div>
          <p className="text-sm font-medium text-white">{server.uptime}</p>
        </div>
      </div>

      {/* Connect Section */}
      {showConnect && (
        <div className="p-4 border-t border-metal-800 bg-metal-800/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-metal-900 rounded-lg px-4 py-2 border border-metal-700">
              <Wifi className="w-4 h-4 text-metal-500" />
              <code className="text-white flex-1">{serverIp}</code>
              <button
                onClick={copyIp}
                className="p-1 hover:bg-metal-700 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-metal-400" />
                )}
              </button>
            </div>
            <Button variant="rust" onClick={connectToServer} className="gap-2">
              <Play className="w-4 h-4" />
              Jetzt spielen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Player count badge for header
export function PlayerCountBadge() {
  const [players, setPlayers] = useState<number | null>(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/server/status')
        const data = await res.json()
        setPlayers(data.server?.players || 0)
      } catch {
        setPlayers(null)
      }
    }

    fetchPlayers()
    const interval = setInterval(fetchPlayers, 60000)
    return () => clearInterval(interval)
  }, [])

  if (players === null) return null

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs font-medium text-green-400">{players} Online</span>
    </div>
  )
}
