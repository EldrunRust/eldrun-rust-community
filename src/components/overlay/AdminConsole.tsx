'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Activity, AlertTriangle, Zap, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'

type ConsoleLog = {
  id: string
  level: 'info' | 'warn' | 'event'
  message: string
  timestamp: string
}

const fallbackLogs: ConsoleLog[] = [
  { id: 'log-1', level: 'event', message: 'Stormwall Event armed for 20:00 – Stormgate Alpha warming up.', timestamp: '19:42' },
  { id: 'log-2', level: 'info', message: 'EAC heartbeat stable • 0 flagged packets in last 5 min.', timestamp: '19:41' },
  { id: 'log-3', level: 'warn', message: 'RaidBase Nightmare spawning extra sentries (auto-balance).', timestamp: '19:39' },
  { id: 'log-4', level: 'event', message: 'Artifact Crown ping detected near Artifact Island Beta.', timestamp: '19:38' },
  { id: 'log-5', level: 'info', message: 'Vote reward queue flushed • 12 pending claims processed.', timestamp: '19:35' },
  { id: 'log-6', level: 'event', message: 'Seraphar war banner planted at Castle Ridge – +10% Honor for 15m.', timestamp: '19:33' },
  { id: 'log-7', level: 'warn', message: 'Vorgaroth scouting party spotted near Safe Haven border.', timestamp: '19:32' },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function AdminConsole() {
  return null

  const { userActivity } = useStore()
  const [expanded, setExpanded] = useState(true)

  const merged = useMemo<ConsoleLog[]>(() => {
    const actLogs: ConsoleLog[] = userActivity.slice(0, 8).map((a) => ({
      id: `act-${a.id}`,
      level: a.type === 'achievement' ? 'event' : a.type === 'kill' ? 'warn' : 'info',
      message: a.message,
      timestamp: formatTime(a.timestamp),
    }))
    return [...actLogs, ...fallbackLogs].slice(0, 10)
  }, [userActivity])

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] text-metal-200">
      <div className="bg-metal-950/85 border border-metal-800 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur rounded-xl overflow-hidden scanline">
        <div className="flex items-center justify-between px-3 py-2 border-b border-metal-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-rust-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Admin Console</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-metal-400 hover:text-white text-xs font-mono"
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="console-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-64 overflow-auto"
            >
              <div className="space-y-1 p-3 font-mono text-xs leading-relaxed">
                {merged.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 px-2 py-1 rounded hover:bg-metal-900/60 transition-colors"
                  >
                    <span className="text-metal-500">{log.timestamp}</span>
                    <LevelIcon level={log.level} />
                    <span className="text-metal-100">{log.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LevelIcon({ level }: { level: ConsoleLog['level'] }) {
  if (level === 'warn') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-[1px]" />
  if (level === 'event') return <Zap className="w-3.5 h-3.5 text-rust-400 mt-[1px]" />
  return <Shield className="w-3.5 h-3.5 text-metal-500 mt-[1px]" />
}
