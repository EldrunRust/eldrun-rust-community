'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Clock, ArrowLeft, Plus, Minus, AlertTriangle, Timer,
  Home, Layers, Info
} from 'lucide-react'

const DECAY_TIMES = {
  twig: { name: 'Twig', hours: 1, color: 'from-yellow-700 to-yellow-900', icon: '🌿' },
  wood: { name: 'Holz', hours: 3, color: 'from-amber-600 to-amber-800', icon: '🪵' },
  stone: { name: 'Stein', hours: 5, color: 'from-gray-500 to-gray-700', icon: '🪨' },
  metal: { name: 'Metall', hours: 8, color: 'from-zinc-400 to-zinc-600', icon: '⚙️' },
  hqm: { name: 'HQM', hours: 12, color: 'from-blue-500 to-blue-700', icon: '💎' },
}

const TC_MULTIPLIERS = [
  { range: '1-15', multiplier: 0.1, label: '1-15 Bauteile' },
  { range: '16-50', multiplier: 0.15, label: '16-50 Bauteile' },
  { range: '51-100', multiplier: 0.2, label: '51-100 Bauteile' },
  { range: '101-175', multiplier: 0.25, label: '101-175 Bauteile' },
  { range: '176+', multiplier: 0.33, label: '176+ Bauteile' },
]

interface DecayTimer {
  id: string
  material: keyof typeof DECAY_TIMES
  buildingParts: number
  startTime: Date
  tcFilled: boolean
}

export default function DecayTimerPage() {
  const [timers, setTimers] = useState<DecayTimer[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<keyof typeof DECAY_TIMES>('stone')
  const [buildingParts, setBuildingParts] = useState(50)
  const [tcFilled, setTcFilled] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addTimer = () => {
    const newTimer: DecayTimer = {
      id: Date.now().toString(),
      material: selectedMaterial,
      buildingParts,
      startTime: new Date(),
      tcFilled,
    }
    setTimers([...timers, newTimer])
  }

  const removeTimer = (id: string) => {
    setTimers(timers.filter(t => t.id !== id))
  }

  const getDecayTime = (timer: DecayTimer) => {
    const baseHours = DECAY_TIMES[timer.material].hours
    
    if (!timer.tcFilled) {
      return baseHours * 60 * 60 * 1000
    }

    let multiplier = 0.33
    if (timer.buildingParts <= 15) multiplier = 0.1
    else if (timer.buildingParts <= 50) multiplier = 0.15
    else if (timer.buildingParts <= 100) multiplier = 0.2
    else if (timer.buildingParts <= 175) multiplier = 0.25

    const totalHours = baseHours / multiplier
    return totalHours * 60 * 60 * 1000
  }

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'VERFALLEN!'
    
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours}h ${minutes}m`
    }
    
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const getProgress = (timer: DecayTimer) => {
    const totalTime = getDecayTime(timer)
    const elapsed = now.getTime() - timer.startTime.getTime()
    const remaining = totalTime - elapsed
    return Math.max(0, Math.min(100, (remaining / totalTime) * 100))
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800">
        <div className="container-rust py-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-metal-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Tools
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Decay Timer</h1>
              <p className="text-metal-400">Berechne, wann deine Base verfällt</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Create Timer */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Neuen Timer erstellen</h3>
              
              {/* Material Selection */}
              <div className="mb-4">
                <label className="block text-sm text-metal-400 mb-2">Material</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.entries(DECAY_TIMES) as [keyof typeof DECAY_TIMES, typeof DECAY_TIMES[keyof typeof DECAY_TIMES]][]).map(([key, mat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMaterial(key)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedMaterial === key
                          ? 'bg-gradient-to-br ' + mat.color + ' border-white/30 text-white'
                          : 'bg-metal-800/50 border-metal-700 text-metal-300 hover:border-metal-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-1">{mat.icon}</div>
                        <div className="text-xs">{mat.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Building Parts */}
              <div className="mb-4">
                <label className="block text-sm text-metal-400 mb-2">Anzahl Bauteile</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setBuildingParts(Math.max(1, buildingParts - 10))}
                    className="w-10 h-10 rounded-lg bg-metal-800 text-metal-400 hover:text-white"
                  >
                    <Minus className="w-4 h-4 mx-auto" />
                  </button>
                  <input
                    type="number"
                    value={buildingParts}
                    onChange={(e) => setBuildingParts(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center bg-metal-800 border border-metal-700 rounded-lg text-white py-2"
                  />
                  <button
                    onClick={() => setBuildingParts(buildingParts + 10)}
                    className="w-10 h-10 rounded-lg bg-metal-800 text-metal-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* TC Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setTcFilled(!tcFilled)}
                    className={`w-12 h-6 rounded-full transition-colors ${tcFilled ? 'bg-green-500' : 'bg-metal-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform mt-0.5 ${tcFilled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-metal-300">Tool Cupboard gefüllt</span>
                </label>
              </div>

              <button
                onClick={addTimer}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Timer starten
              </button>
            </div>

            {/* Active Timers */}
            {timers.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-bold text-white">Aktive Timer ({timers.length})</h3>
                
                {timers.map(timer => {
                  const mat = DECAY_TIMES[timer.material]
                  const totalTime = getDecayTime(timer)
                  const elapsed = now.getTime() - timer.startTime.getTime()
                  const remaining = totalTime - elapsed
                  const progress = getProgress(timer)
                  const isExpired = remaining <= 0
                  const isWarning = remaining > 0 && remaining < 3600000

                  return (
                    <motion.div
                      key={timer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-metal-900/50 border rounded-xl p-4 ${
                        isExpired ? 'border-red-500' : isWarning ? 'border-amber-500' : 'border-metal-800'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${mat.color} flex items-center justify-center text-2xl`}>
                          {mat.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{mat.name} Base</div>
                          <div className="text-sm text-metal-500">
                            {timer.buildingParts} Bauteile • TC {timer.tcFilled ? 'gefüllt' : 'leer'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono text-2xl font-bold ${isExpired ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
                            {formatTimeRemaining(remaining)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeTimer(timer.id)}
                          className="p-2 text-metal-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${isExpired ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                          initial={{ width: '100%' }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-metal-500">
                <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine aktiven Timer. Erstelle einen neuen Timer oben.</p>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 sticky top-28">
              <h3 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                Decay Info
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white mb-2">Basis Decay-Zeiten</h4>
                  <div className="space-y-2">
                    {(Object.entries(DECAY_TIMES) as [keyof typeof DECAY_TIMES, typeof DECAY_TIMES[keyof typeof DECAY_TIMES]][]).map(([key, mat]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-metal-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{mat.icon}</span>
                          <span className="text-metal-300">{mat.name}</span>
                        </div>
                        <span className="font-bold text-amber-400">{mat.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-2">TC Multiplier</h4>
                  <div className="space-y-2 text-sm">
                    {TC_MULTIPLIERS.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-metal-800/50 rounded-lg">
                        <span className="text-metal-300">{m.label}</span>
                        <span className="font-bold text-amber-400">{(m.multiplier * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-400/80">
                      Der Timer zeigt die ungefähre Zeit bis zum Decay. Tatsächliche Zeiten können variieren.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
