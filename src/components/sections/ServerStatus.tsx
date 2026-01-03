'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Users, 
  Clock, 
  Activity, 
  Cpu, 
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SERVER_INFO } from '@/data/serverData'
import { cn, formatTime } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  color?: 'rust' | 'green' | 'blue' | 'yellow'
}

function StatCard({ icon, label, value, subValue, color = 'rust' }: StatCardProps) {
  const colors = {
    rust: 'from-rust-500/20 to-rust-600/10 border-rust-500/30',
    green: 'from-radiation-400/20 to-radiation-500/10 border-radiation-400/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  }

  const iconColors = {
    rust: 'text-rust-400',
    green: 'text-radiation-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative p-6 bg-gradient-to-br border backdrop-blur-sm",
        colors[color]
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 bg-metal-900/50 rounded", iconColors[color])}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase text-metal-500 tracking-wider">{label}</p>
        <p className="font-display font-bold text-3xl text-white">{value}</p>
        {subValue && <p className="font-mono text-xs text-metal-400">{subValue}</p>}
      </div>
    </motion.div>
  )
}

export function ServerStatus() {
  const { serverStats, setServerStats } = useStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real server data from API
  const fetchServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/server/status')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.server) {
          setServerStats({
            players: data.server.players || 0,
            maxPlayers: data.server.maxPlayers || 200,
            status: data.server.status === 'online' ? 'online' : 'offline',
            uptime: typeof data.server.uptime === 'number' ? data.server.uptime : 0,
            fps: data.server.fps || 0,
            entities: data.server.entities || 0,
            sleepers: data.server.sleepers || 0,
            queue: data.server.queuedPlayers || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch server status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setServerStats])

  useEffect(() => {
    fetchServerStatus()
    // Poll every 30 seconds
    const interval = setInterval(fetchServerStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchServerStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchServerStatus()
    setIsRefreshing(false)
  }

  const playerPercentage = serverStats.maxPlayers > 0 
    ? (serverStats.players / serverStats.maxPlayers) * 100 
    : 0

  return (
    <section id="server" className="relative py-24 bg-metal-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rust-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rust-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container-rust relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-rust-500/10 border border-rust-500/30 rounded-full"
          >
            <Server className="w-4 h-4 text-rust-400" />
            <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Live Server Status</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl text-white mb-4"
          >
            Server <span className="text-rust-400">Statistics</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-metal-400 max-w-2xl mx-auto"
          >
            Echtzeit-Statistiken unseres Servers. Alle Daten werden automatisch aktualisiert.
          </motion.p>
        </div>

        {/* Server Connection Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-12 p-6 bg-gradient-to-r from-metal-900/80 to-metal-900/50 border border-metal-700 backdrop-blur-sm"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "relative w-4 h-4 rounded-full",
                serverStats.status === 'online' ? 'bg-radiation-400' : 'bg-blood-500'
              )}>
                <span className={cn(
                  "absolute inset-0 rounded-full animate-ping",
                  serverStats.status === 'online' ? 'bg-radiation-400' : 'bg-blood-500'
                )} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">{SERVER_INFO.name}</h3>
                <p className="font-mono text-sm text-metal-400">{SERVER_INFO.ip}:{SERVER_INFO.port}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-metal-400 hover:text-rust-400 transition-colors"
              >
                <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
              </button>
              
              <a
                href={SERVER_INFO.steam}
                className="px-6 py-3 bg-gradient-to-r from-rust-600 to-rust-700 font-display font-bold uppercase tracking-wider text-white hover:from-rust-500 hover:to-rust-600 transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <span className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Connect
                </span>
              </a>
            </div>
          </div>

          {/* Player Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-mono text-metal-400">Players Online</span>
              <span className="font-mono text-rust-400">{serverStats.players} / {serverStats.maxPlayers}</span>
            </div>
            <div className="h-3 bg-metal-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${playerPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-rust-500 to-rust-600 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Online Players"
              value={serverStats.players}
              subValue={`${serverStats.queue} in queue`}
              color="green"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Uptime"
              value={formatTime(serverStats.uptime)}
              subValue="Since last restart"
              color="blue"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Server FPS"
              value={serverStats.fps}
              subValue="Tick rate"
              color="rust"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <StatCard
              icon={<Database className="w-5 h-5" />}
              label="Entities"
              value={serverStats.entities.toLocaleString()}
              subValue={`${serverStats.sleepers} sleepers`}
              color="yellow"
            />
          </motion.div>
        </div>

        {/* Server Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-metal-900/50 border border-metal-800"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <div className="text-center">
            <p className="font-mono text-xs text-metal-500 uppercase mb-1">Map Size</p>
            <p className="font-display font-bold text-lg text-white">{SERVER_INFO.mapSize}</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-metal-500 uppercase mb-1">Team Limit</p>
            <p className="font-display font-bold text-lg text-white">{SERVER_INFO.teamLimit}</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-metal-500 uppercase mb-1">Wipe Schedule</p>
            <p className="font-display font-bold text-lg text-white">Weekly</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-metal-500 uppercase mb-1">Gather Rate</p>
            <p className="font-display font-bold text-lg text-white">Vanilla</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
