'use client'

import { Info } from 'lucide-react'

export function HeatmapLegend() {
  return (
    <div className="bg-metal-900/50 border border-metal-800 p-4 space-y-3">
      <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
        <Info className="w-4 h-4 text-rust-400" />
        Legende
      </h3>

      {/* Factions */}
      <div>
        <p className="text-xs text-metal-500 uppercase mb-2">Fraktionen</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-metal-300">Haus Seraphar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-metal-300">Haus Vorgaroth</span>
          </div>
        </div>
      </div>

      {/* Heat Levels */}
      <div>
        <p className="text-xs text-metal-500 uppercase mb-2">Aktivität</p>
        <div className="h-3 rounded bg-gradient-to-r from-transparent via-rust-500/50 to-blood-500" />
        <div className="flex justify-between text-xs text-metal-500 mt-1">
          <span>Niedrig</span>
          <span>Hoch</span>
        </div>
      </div>

      {/* Monuments */}
      <div>
        <p className="text-xs text-metal-500 uppercase mb-2">Monuments</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blood-500" />
            <span className="text-xs text-metal-300">Tier 3 (Gefährlich)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rust-500" />
            <span className="text-xs text-metal-300">Tier 2 (Mittel)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-radiation-400" />
            <span className="text-xs text-metal-300">Tier 1 (Sicher)</span>
          </div>
        </div>
      </div>

      {/* Events */}
      <div>
        <p className="text-xs text-metal-500 uppercase mb-2">Events</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <span>💀</span>
            <span className="text-metal-300">Kill</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span className="text-metal-300">Airdrop</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚁</span>
            <span className="text-metal-300">Heli</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚢</span>
            <span className="text-metal-300">Cargo</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💥</span>
            <span className="text-metal-300">Raid</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs text-metal-500 uppercase mb-2">Spieler Status</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-radiation-400" />
            <span className="text-xs text-metal-300">Alive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
            <span className="text-xs text-metal-300">In Combat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
