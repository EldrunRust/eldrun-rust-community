'use client'

import { motion } from 'framer-motion'
import { Activity, Radio, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

const STATUS_COLORS = {
  nominal: 'text-emerald-400',
  warning: 'text-amber-400'
} as const

export function TelemetryPulsePanel() {
  const { telemetryPulse, setTelemetryPulse } = useStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryPulse(prev => {
        const drift = () => (Math.random() - 0.5) * 2
        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

        return {
          ...prev,
          heartbeat: clamp(prev.heartbeat + drift() * 4, 58, 72),
          latency: clamp(prev.latency + drift(), 18, 34),
          packetLoss: clamp(prev.packetLoss + drift() * 0.1, 0, 0.7),
          lastUpdated: new Date().toISOString(),
          status: Math.random() > 0.9 ? 'warning' : 'nominal',
          modules: prev.modules.map(module => {
            const trendRoll = Math.random()
            const trend: typeof module.trend =
              trendRoll > 0.66 ? 'up' : trendRoll > 0.33 ? 'down' : 'steady'
            const baseChange = drift()

            return {
              ...module,
              value: clamp(
                module.value + baseChange * (module.unit.includes('%') ? 1 : 0.2),
                module.unit.includes('%') ? 60 : 0.5,
                module.unit.includes('%') ? 105 : 5
              ),
              trend,
              status:
                Math.random() > 0.85
                  ? 'degraded'
                  : Math.random() > 0.6
                  ? 'syncing'
                  : 'online'
            }
          })
        }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [setTelemetryPulse])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-black/30">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-purple-500/10 blur-3xl" />
      <div className="relative p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono tracking-[0.3em] text-purple-400 uppercase">Telemetry</p>
            <h3 className="font-display text-xl text-white">Simulation Pulse</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30">
              <span className={`text-sm font-semibold ${STATUS_COLORS[telemetryPulse.status]}`}>
                {telemetryPulse.status === 'nominal' ? 'Nominal' : 'Warnung'}
              </span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
              </span>
            </div>
            <span className="text-xs text-metal-400">
              {new Date(telemetryPulse.lastUpdated).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Activity, label: 'Heartbeat', value: `${telemetryPulse.heartbeat.toFixed(0)} Hz` },
            { icon: Radio, label: 'Latency', value: `${telemetryPulse.latency.toFixed(1)} ms` },
            { icon: Zap, label: 'Packet Loss', value: `${telemetryPulse.packetLoss.toFixed(2)}%` }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-metal-400 mb-1">
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                {label}
              </div>
              <p className="text-lg font-display text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          {telemetryPulse.modules.map(module => (
            <motion.div
              key={module.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-sm font-semibold text-white">{module.label}</p>
                  <p className="text-xs text-metal-400">{module.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold uppercase ${
                      module.status === 'online'
                        ? 'text-emerald-400'
                        : module.status === 'syncing'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {module.status}
                  </span>
                  <span
                    className={`text-xs ${
                      module.trend === 'up'
                        ? 'text-emerald-400'
                        : module.trend === 'down'
                        ? 'text-red-400'
                        : 'text-metal-400'
                    }`}
                  >
                    {module.trend === 'steady' ? '≈' : module.trend === 'up' ? '↑' : '↓'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-display text-white">
                  {module.value.toFixed(module.unit.includes('%') ? 0 : 2)}
                  <span className="text-sm text-metal-400 ml-1">{module.unit}</span>
                </div>
                {module.action ? (
                  <button className="text-xs uppercase tracking-wide font-semibold text-purple-300 hover:text-white transition">
                    {module.action}
                  </button>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
