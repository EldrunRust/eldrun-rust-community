'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Skull, Package, Plane, Ship, Flame } from 'lucide-react'
import { GameEvent } from '@/hooks/useHeatmapData'

interface HeatmapEventFeedProps {
  events: GameEvent[]
  showEvents: boolean
}

export function HeatmapEventFeed({ events, showEvents }: HeatmapEventFeedProps) {
  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'kill': return '💀'
      case 'death': return '☠️'
      case 'raid': return '💥'
      case 'airdrop': return '📦'
      case 'helicopter': return '🚁'
      case 'cargo': return '🚢'
      case 'build': return '🏠'
      case 'destroy': return '💣'
      default: return '❓'
    }
  }

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'kill':
      case 'death':
        return 'border-blood-500/50 bg-blood-500/10'
      case 'raid':
      case 'destroy':
        return 'border-rust-500/50 bg-rust-500/10'
      case 'airdrop':
      case 'build':
        return 'border-radiation-400/50 bg-radiation-400/10'
      case 'helicopter':
        return 'border-red-500/50 bg-red-500/10'
      case 'cargo':
        return 'border-blue-500/50 bg-blue-500/10'
      default:
        return 'border-metal-600 bg-metal-800'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    return `${Math.floor(diff / 3600)}h`
  }

  return (
    <div className="bg-metal-900/50 border border-metal-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-rust-400" />
          Live Events
        </h3>
        <div className={`w-2 h-2 rounded-full ${showEvents ? 'bg-radiation-400 animate-pulse' : 'bg-metal-600'}`} />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-metal-900 scrollbar-thumb-metal-700">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 20).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-2 border ${getEventColor(event.type)} text-xs`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  {event.type === 'kill' && event.player1 && event.player2 ? (
                    <p className="text-metal-300">
                      <span className={event.faction === 'seraphar' ? 'text-amber-400' : 'text-red-400'}>
                        {event.player1}
                      </span>
                      <span className="text-blood-500 mx-1">eliminated</span>
                      <span className="text-metal-400">{event.player2}</span>
                    </p>
                  ) : (
                    <p className="text-metal-300">{event.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-metal-500">
                    <span className="font-mono">
                      [{Math.floor(event.x)}, {Math.floor(event.y)}]
                    </span>
                    <span>•</span>
                    <span>{formatTime(event.timestamp)} ago</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-8 text-metal-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Warte auf Events...</p>
          </div>
        )}
      </div>

      {/* Event Summary */}
      <div className="mt-4 pt-3 border-t border-metal-800">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-lg">💀</span>
            <p className="text-xs text-metal-500 font-mono">
              {events.filter(e => e.type === 'kill').length}
            </p>
          </div>
          <div>
            <span className="text-lg">💥</span>
            <p className="text-xs text-metal-500 font-mono">
              {events.filter(e => e.type === 'raid').length}
            </p>
          </div>
          <div>
            <span className="text-lg">📦</span>
            <p className="text-xs text-metal-500 font-mono">
              {events.filter(e => e.type === 'airdrop').length}
            </p>
          </div>
          <div>
            <span className="text-lg">🚁</span>
            <p className="text-xs text-metal-500 font-mono">
              {events.filter(e => e.type === 'helicopter').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
