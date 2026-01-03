'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, Crosshair, MapPin, Plus, Radio, Shield, Timer, Users } from 'lucide-react'
import { HeatmapCanvas } from '@/components/heatmap/HeatmapCanvas'
import type { Player, GameEvent, HeatPoint, Monument } from '@/hooks/useHeatmapData'

type OpsPinType = 'danger' | 'loot' | 'base' | 'meet' | 'enemy' | 'note'

type OpsPin = {
  id: string
  type: OpsPinType
  label: string
  note?: string | null
  x: number
  y: number
  createdAt: string
}

type ResourceEvent = {
  id: string
  sessionId: string
  resource: string
  delta: number
  note?: string | null
  createdAt: string
}

type OpsRole = 'leader' | 'scout' | 'builder' | 'medic' | 'logistics'

type OpsRoleAssignment = {
  id: string
  role: OpsRole
  nickname?: string | null
  updatedAt: string
}

type OpsAlert = {
  id: string
  type: 'raid' | 'rare_drop' | 'spotted' | 'system'
  severity: 'info' | 'warn' | 'critical'
  message: string
  x?: number | null
  y?: number | null
  createdAt: string
}

type OpsTimer = {
  status: 'stopped' | 'running' | 'paused'
  startAt: string | null
  elapsedMs: number
}

const EMPTY: {
  players: Player[]
  events: GameEvent[]
  heatData: HeatPoint[]
  monuments: Monument[]
} = { players: [], events: [], heatData: [], monuments: [] }

function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function OpsSessionPage() {
  const params = useParams<{ code: string }>()
  const code = params?.code

  const [zoom, setZoom] = useState(1)
  const [showPlayers, setShowPlayers] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [showMonuments, setShowMonuments] = useState(true)
  const [showHeatOverlay, setShowHeatOverlay] = useState(false)
  const [showGrid, setShowGrid] = useState(false)

  const [sessionTitle, setSessionTitle] = useState<string>('')
  const [timer, setTimer] = useState<OpsTimer>({ status: 'stopped', startAt: null, elapsedMs: 0 })
  const [pins, setPins] = useState<OpsPin[]>([])
  const [roles, setRoles] = useState<OpsRoleAssignment[]>([])
  const [alerts, setAlerts] = useState<OpsAlert[]>([])
  const [resources, setResources] = useState<ResourceEvent[]>([])
  const [resourceTotals, setResourceTotals] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const [newPinType, setNewPinType] = useState<OpsPinType>('meet')
  const [newPinLabel, setNewPinLabel] = useState('')
  const [newPinNote, setNewPinNote] = useState('')
  const [newPinX, setNewPinX] = useState(4000)
  const [newPinY, setNewPinY] = useState(4000)

  const heatmapData = useMemo(() => EMPTY, [])

  const refresh = useCallback(async () => {
    if (!code) return
    try {
      const res = await fetch(`/api/ops/sessions/${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Ops Session nicht gefunden')

      setSessionTitle(data.session.title)
      setTimer({
        status: data.session.timerStatus,
        startAt: data.session.timerStartAt,
        elapsedMs: data.session.timerElapsedMs,
      })
      setPins(data.pins)
      setRoles(data.roles)
      setAlerts(data.alerts)
      setResources(data.resources || [])
      setResourceTotals(data.resourceTotals || {})
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    }
  }, [code])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Live updates via SSE (fallback to polling if SSE fails)
  useEffect(() => {
    if (!code) return

    let cancelled = false
    let interval: NodeJS.Timeout | null = null
    let es: EventSource | null = null

    const startPolling = () => {
      if (interval) return
      interval = setInterval(() => {
        if (cancelled) return
        void refresh()
      }, 3500)
    }

    try {
      es = new EventSource(`/api/ops/stream?code=${encodeURIComponent(code)}`)
      es.onmessage = (ev) => {
        if (cancelled) return
        try {
          const payload = JSON.parse(ev.data)
          if (payload?.type === 'snapshot') {
            setPins(payload.pins)
            setRoles(payload.roles)
            setAlerts(payload.alerts)
            if (payload.resources) setResources(payload.resources)
            if (payload.resourceTotals) setResourceTotals(payload.resourceTotals)
          }
        } catch {
          // ignore
        }
      }
      es.onerror = () => {
        es?.close()
        startPolling()
      }
    } catch {
      startPolling()
    }

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
      es?.close()
    }
  }, [code, refresh])

  const displayElapsedMs = (() => {
    if (timer.status !== 'running' || !timer.startAt) return timer.elapsedMs
    const startedAt = new Date(timer.startAt).getTime()
    return timer.elapsedMs + Math.max(0, Date.now() - startedAt)
  })()

  const formattedTimer = formatMs(displayElapsedMs)

  useEffect(() => {
    if (timer.status !== 'running') return
    const id = setInterval(() => {
      // force re-render while running
      setTimer((t) => ({ ...t }))
    }, 250)
    return () => clearInterval(id)
  }, [timer.status])

  const timerAction = useCallback(
    async (action: 'start' | 'pause' | 'resume' | 'reset') => {
      if (!code) return
      const res = await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Timer update failed')
      setTimer(data.timer)
    },
    [code]
  )

  const onAssignRole = useCallback(
    async (role: OpsRole, nickname: string) => {
      if (!code) return
      await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, nickname }),
      })
    },
    [code]
  )

  const onCreatePin = useCallback(async () => {
    if (!code) return
    await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/pins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newPinType, label: newPinLabel || newPinType.toUpperCase(), note: newPinNote || null, x: newPinX, y: newPinY }),
    })
    setNewPinLabel('')
    setNewPinNote('')
  }, [code, newPinType, newPinLabel, newPinNote, newPinX, newPinY])

  const onMapPick = useCallback(
    async (pos: { x: number; y: number }, ev?: { shiftKey?: boolean }) => {
      setNewPinX(Math.round(pos.x))
      setNewPinY(Math.round(pos.y))

      if (ev?.shiftKey) {
        await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/pins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: newPinType,
            label: newPinLabel || newPinType.toUpperCase(),
            note: newPinNote || null,
            x: pos.x,
            y: pos.y,
          }),
        })
        setNewPinLabel('')
        setNewPinNote('')
      }
    },
    [code, newPinType, newPinLabel, newPinNote]
  )

  const onTriggerAlert = useCallback(async () => {
    if (!code) return
    await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'system', severity: 'info', message: 'Manual ping from War Room' }),
    })
  }, [code])

  const addResource = useCallback(
    async (resource: string, delta: number, note?: string) => {
      if (!code) return
      await fetch(`/api/ops/sessions/${encodeURIComponent(code)}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource, delta, note: note || null }),
      })
    },
    [code]
  )

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800 bg-metal-900/50 backdrop-blur-sm">
        <div className="container-rust py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center">
                <Radio className="w-6 h-6 text-rust-400" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl text-white">{sessionTitle || 'OPS SESSION'}</h1>
                <p className="text-metal-500 text-sm font-mono">Code: {code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-metal-300 font-mono text-xs">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg">
                <Timer className="w-4 h-4" />
                TIMER v1
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg">
                <Users className="w-4 h-4" />
                ROLES v1
              </div>
            </div>
          </div>
          {error ? (
            <div className="mt-3 text-red-300 text-sm inline-flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="container-rust py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-metal-900 border border-metal-800 overflow-hidden rounded-xl" style={{ height: '70vh' }}>
              <HeatmapCanvas
                zoom={zoom}
                players={heatmapData.players}
                events={heatmapData.events}
                heatData={heatmapData.heatData}
                monuments={heatmapData.monuments}
                opsPins={pins}
                showHeatOverlay={showHeatOverlay}
                showPlayers={showPlayers}
                showEvents={showEvents}
                showMonuments={showMonuments}
                showGrid={showGrid}
                selectedPlayer={null}
                onSelectPlayer={() => {}}
                onMapClick={(pos, ev) => onMapPick(pos, ev)}
              />
              <div className="absolute bottom-4 left-4 bg-metal-950/80 border border-metal-800 rounded-lg px-3 py-2 text-xs font-mono text-metal-200">
                Pins: {pins.length} • Alerts: {alerts.length}
              </div>
              <div className="absolute bottom-4 right-4 bg-metal-950/80 border border-metal-800 rounded-lg px-3 py-2 text-xs font-mono text-metal-200">
                Click: set coords • Shift+Click: drop pin
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-rust-400" />
                  <h2 className="font-medieval font-bold text-white">Mission Timer</h2>
                </div>
                <div className="text-xs font-mono text-metal-500">{timer.status.toUpperCase()}</div>
              </div>

              <div className="bg-metal-950/60 border border-metal-800 rounded-lg px-4 py-3">
                <div className="font-mono text-3xl text-white tracking-wider">{formattedTimer}</div>
                <div className="text-xs text-metal-500 mt-1">Shift+Click setzt Pins • Timer bleibt serverseitig synchron</div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3">
                <button
                  onClick={() => void timerAction('start')}
                  className="px-3 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg border border-rust-400/30 transition-colors text-xs font-mono"
                >
                  Start
                </button>
                <button
                  onClick={() => void timerAction(timer.status === 'running' ? 'pause' : 'resume')}
                  className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono"
                >
                  {timer.status === 'running' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => void timerAction('reset')}
                  className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono"
                >
                  Reset
                </button>
                <button
                  onClick={() => void refresh()}
                  className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono"
                >
                  Sync
                </button>
              </div>
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-radiation-400" />
                  <h2 className="font-medieval font-bold text-white">Resource Tracker</h2>
                </div>
                <div className="text-xs font-mono text-metal-500">Totals</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                  <div className="text-xs font-mono text-metal-500">Sulfur</div>
                  <div className="text-white font-mono">{resourceTotals.sulfur ?? 0}</div>
                </div>
                <div className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                  <div className="text-xs font-mono text-metal-500">Metal</div>
                  <div className="text-white font-mono">{resourceTotals.metal ?? 0}</div>
                </div>
                <div className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                  <div className="text-xs font-mono text-metal-500">GP</div>
                  <div className="text-white font-mono">{resourceTotals.gp ?? 0}</div>
                </div>
                <div className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                  <div className="text-xs font-mono text-metal-500">Meds</div>
                  <div className="text-white font-mono">{resourceTotals.meds ?? 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => void addResource('sulfur', 100)} className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">+100 sulfur</button>
                <button onClick={() => void addResource('metal', 500)} className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">+500 metal</button>
                <button onClick={() => void addResource('gp', 50)} className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">+50 gp</button>
                <button onClick={() => void addResource('meds', 10)} className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">+10 meds</button>
                <button onClick={() => void addResource('sulfur', -100, 'spent') } className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">-100 sulfur</button>
                <button onClick={() => void addResource('metal', -500, 'spent') } className="px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">-500 metal</button>
              </div>

              <div className="mt-4">
                <div className="text-xs font-mono text-metal-500 mb-2">Recent</div>
                <div className="space-y-2 max-h-40 overflow-auto pr-1">
                  {resources.slice(0, 10).map((ev) => (
                    <div key={ev.id} className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="text-white text-sm font-body">{ev.resource}</div>
                        <div className="text-xs font-mono text-metal-300">{ev.delta > 0 ? `+${ev.delta}` : ev.delta}</div>
                      </div>
                      <div className="text-xs font-mono text-metal-500">{new Date(ev.createdAt).toLocaleTimeString()}</div>
                      {ev.note ? <div className="text-xs text-metal-400 mt-1">{ev.note}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gold-400" />
                  <h2 className="font-medieval font-bold text-white">Rollen</h2>
                </div>
                <button onClick={onTriggerAlert} className="inline-flex items-center gap-2 px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono">
                  <Radio className="w-4 h-4" />
                  Ping
                </button>
              </div>
              <RoleRow label="Leader" role="leader" roles={roles} onAssign={onAssignRole} />
              <RoleRow label="Scout" role="scout" roles={roles} onAssign={onAssignRole} />
              <RoleRow label="Builder" role="builder" roles={roles} onAssign={onAssignRole} />
              <RoleRow label="Medic" role="medic" roles={roles} onAssign={onAssignRole} />
              <RoleRow label="Logistics" role="logistics" roles={roles} onAssign={onAssignRole} />
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-rust-400" />
                <h2 className="font-medieval font-bold text-white">Pin setzen</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={newPinType} onChange={(e) => setNewPinType(e.target.value as OpsPinType)} className="bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm">
                  <option value="danger">danger</option>
                  <option value="loot">loot</option>
                  <option value="base">base</option>
                  <option value="meet">meet</option>
                  <option value="enemy">enemy</option>
                  <option value="note">note</option>
                </select>
                <input value={newPinLabel} onChange={(e) => setNewPinLabel(e.target.value)} placeholder="Label" className="bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm" />
                <input value={newPinX} onChange={(e) => setNewPinX(Number(e.target.value))} type="number" min={0} max={8000} placeholder="X" className="bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm" />
                <input value={newPinY} onChange={(e) => setNewPinY(Number(e.target.value))} type="number" min={0} max={8000} placeholder="Y" className="bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm" />
              </div>
              <input value={newPinNote} onChange={(e) => setNewPinNote(e.target.value)} placeholder="Note (optional)" className="mt-2 w-full bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm" />
              <button onClick={onCreatePin} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white rounded-lg border border-rust-400/30 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                Pin erstellen
              </button>
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair className="w-4 h-4 text-metal-200" />
                <h2 className="font-medieval font-bold text-white">Pins</h2>
              </div>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {pins.map((p) => (
                  <div key={p.id} className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm font-body">{p.label}</div>
                      <div className="text-xs font-mono text-metal-500">{p.type}</div>
                    </div>
                    <div className="text-xs font-mono text-metal-400">({Math.round(p.x)}, {Math.round(p.y)})</div>
                    {p.note ? <div className="text-xs text-metal-400 mt-1">{p.note}</div> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-300" />
                <h2 className="font-medieval font-bold text-white">Alerts</h2>
              </div>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {alerts.map((a) => (
                  <div key={a.id} className="bg-metal-950/60 border border-metal-800 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm font-body">{a.message}</div>
                      <div className="text-xs font-mono text-metal-500">{a.severity}</div>
                    </div>
                    <div className="text-xs font-mono text-metal-400">{a.type} • {new Date(a.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleRow({
  label,
  role,
  roles,
  onAssign,
}: {
  label: string
  role: OpsRole
  roles: OpsRoleAssignment[]
  onAssign: (role: OpsRole, nickname: string) => Promise<void>
}) {
  const assigned = roles.find((r) => r.role === role)
  const [nick, setNick] = useState(assigned?.nickname || '')

  useEffect(() => {
    setNick(assigned?.nickname || '')
  }, [assigned?.nickname])

  return (
    <div className="flex items-center gap-2 py-2 border-t border-metal-800 first:border-t-0">
      <div className="w-24 text-xs font-mono text-metal-400">{label}</div>
      <input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Name" className="flex-1 bg-metal-950 border border-metal-800 rounded-lg px-3 py-2 text-metal-100 text-sm" />
      <button
        onClick={() => onAssign(role, nick)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-metal-800 hover:bg-metal-700 text-white rounded-lg border border-metal-700 transition-colors text-xs font-mono"
      >
        Assign
      </button>
    </div>
  )
}
