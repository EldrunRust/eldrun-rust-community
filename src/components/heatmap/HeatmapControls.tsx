'use client'

import { 
  ZoomIn, ZoomOut, Maximize2, Play, Pause, Eye, EyeOff,
  Users, Flame, MapPin, Grid3X3, Clock
} from 'lucide-react'

interface HeatmapControlsProps {
  zoom: number
  isPaused: boolean
  showHeatOverlay: boolean
  showPlayers: boolean
  showEvents: boolean
  showMonuments: boolean
  showGrid: boolean
  selectedFaction: 'all' | 'seraphar' | 'vorgaroth'
  timeRange: 'live' | '1h' | '24h' | '7d'
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onTogglePause: () => void
  onToggleHeatOverlay: () => void
  onTogglePlayers: () => void
  onToggleEvents: () => void
  onToggleMonuments: () => void
  onToggleGrid: () => void
  onSelectFaction: (faction: 'all' | 'seraphar' | 'vorgaroth') => void
  onSelectTimeRange: (range: 'live' | '1h' | '24h' | '7d') => void
}

export function HeatmapControls({
  zoom,
  isPaused,
  showHeatOverlay,
  showPlayers,
  showEvents,
  showMonuments,
  showGrid,
  selectedFaction,
  timeRange,
  onZoomIn,
  onZoomOut,
  onReset,
  onTogglePause,
  onToggleHeatOverlay,
  onTogglePlayers,
  onToggleEvents,
  onToggleMonuments,
  onToggleGrid,
  onSelectFaction,
  onSelectTimeRange
}: HeatmapControlsProps) {
  return (
    <div className="bg-metal-900/50 border border-metal-800 p-4 space-y-4">
      <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
        <Grid3X3 className="w-4 h-4 text-rust-400" />
        Steuerung
      </h3>

      {/* Playback Control */}
      <div>
        <label className="text-xs text-metal-500 uppercase mb-2 block">Wiedergabe</label>
        <button
          onClick={onTogglePause}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 border transition-colors ${
            isPaused 
              ? 'bg-rust-500/20 border-rust-500/50 text-rust-400' 
              : 'bg-radiation-400/20 border-radiation-400/50 text-radiation-400'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="font-mono text-sm">{isPaused ? 'PLAY' : 'PAUSE'}</span>
        </button>
      </div>

      {/* Time Range */}
      <div>
        <label className="text-xs text-metal-500 uppercase mb-2 block">Zeitraum</label>
        <div className="grid grid-cols-2 gap-1">
          {(['live', '1h', '24h', '7d'] as const).map(range => (
            <button
              key={range}
              onClick={() => onSelectTimeRange(range)}
              className={`px-2 py-1 text-xs font-mono border transition-colors ${
                timeRange === range
                  ? 'bg-rust-500/20 border-rust-500 text-rust-400'
                  : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Faction Filter */}
      <div>
        <label className="text-xs text-metal-500 uppercase mb-2 block">Fraktion</label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectFaction('all')}
            className={`w-full px-3 py-2 text-left text-sm border transition-colors flex items-center gap-2 ${
              selectedFaction === 'all'
                ? 'bg-metal-700 border-metal-600 text-white'
                : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Alle Spieler
          </button>
          <button
            onClick={() => onSelectFaction('seraphar')}
            className={`w-full px-3 py-2 text-left text-sm border transition-colors flex items-center gap-2 ${
              selectedFaction === 'seraphar'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            Haus Seraphar
          </button>
          <button
            onClick={() => onSelectFaction('vorgaroth')}
            className={`w-full px-3 py-2 text-left text-sm border transition-colors flex items-center gap-2 ${
              selectedFaction === 'vorgaroth'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-red-500" />
            Haus Vorgaroth
          </button>
        </div>
      </div>

      {/* Layer Toggles */}
      <div>
        <label className="text-xs text-metal-500 uppercase mb-2 block">Layer</label>
        <div className="space-y-1">
          <LayerToggle 
            label="Heatmap" 
            icon={<Flame className="w-4 h-4" />}
            active={showHeatOverlay} 
            onClick={onToggleHeatOverlay} 
          />
          <LayerToggle 
            label="Spieler" 
            icon={<Users className="w-4 h-4" />}
            active={showPlayers} 
            onClick={onTogglePlayers} 
          />
          <LayerToggle 
            label="Events" 
            icon={<Clock className="w-4 h-4" />}
            active={showEvents} 
            onClick={onToggleEvents} 
          />
          <LayerToggle 
            label="Monuments" 
            icon={<MapPin className="w-4 h-4" />}
            active={showMonuments} 
            onClick={onToggleMonuments} 
          />
          <LayerToggle 
            label="Grid" 
            icon={<Grid3X3 className="w-4 h-4" />}
            active={showGrid} 
            onClick={onToggleGrid} 
          />
        </div>
      </div>

      {/* Zoom Info */}
      <div className="pt-2 border-t border-metal-800">
        <div className="flex justify-between text-xs">
          <span className="text-metal-500">Zoom</span>
          <span className="font-mono text-white">{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

function LayerToggle({ 
  label, 
  icon, 
  active, 
  onClick 
}: { 
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 text-left text-sm border transition-colors flex items-center justify-between ${
        active
          ? 'bg-metal-800 border-metal-600 text-white'
          : 'bg-metal-900 border-metal-800 text-metal-500'
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
