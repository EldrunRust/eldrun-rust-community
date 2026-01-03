'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ZoomIn, ZoomOut, Maximize2, Activity, Radio, Layers, 
  Filter, Settings, Grid3X3, Cpu, Eye, EyeOff,
  Play, Pause, RotateCcw, Download, Share2,
  Thermometer, Users, Target, Zap, AlertTriangle
} from 'lucide-react'
import { HeatmapCanvas } from './HeatmapCanvas'
import { HeatmapControls } from './HeatmapControls'
import { HeatmapStats } from './HeatmapStats'
import { HeatmapEventFeed } from './HeatmapEventFeed'
import { useHeatmapData } from '@/hooks/useHeatmapData'

export function HeatmapClient() {
  const [zoom, setZoom] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [showHeatOverlay, setShowHeatOverlay] = useState(true)
  const [showPlayers, setShowPlayers] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [showMonuments, setShowMonuments] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)
  const [selectedFaction, setSelectedFaction] = useState<'all' | 'seraphar' | 'vorgaroth'>('all')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'live' | '1h' | '24h' | '7d'>('live')
  const [heatmapType, setHeatmapType] = useState<'activity' | 'combat' | 'resources' | 'danger'>('activity')
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)
  const [showStatsPanel, setShowStatsPanel] = useState(true)
  const [showControlsPanel, setShowControlsPanel] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const { 
    players, 
    events, 
    heatData, 
    stats,
    monuments 
  } = useHeatmapData(isPaused)

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5))
  const handleReset = () => {
    setZoom(1)
    setSelectedPlayer(null)
  }

  const filteredPlayers = selectedFaction === 'all' 
    ? players 
    : players.filter(p => p.faction === selectedFaction)

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      {/* Floating Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-20 left-0 right-0 z-40 bg-metal-900/95 backdrop-blur-md border-b border-metal-800"
      >
        <div className="container-rust py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-rust-600 border border-rust-400/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-black text-xl text-white">ULTIMATE HEATMAP</h1>
                  <p className="text-metal-500 text-xs font-mono">Real-time Analytics • AI-Powered</p>
                </div>
              </div>

              {/* Live Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-metal-800 border border-metal-700 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-rust-500' : 'bg-radiation-400 animate-pulse'}`} />
                  <span className="font-mono text-xs text-metal-300">
                    {isPaused ? 'PAUSED' : 'LIVE'}
                  </span>
                </div>
                <div className="font-mono text-xs text-metal-400">
                  {stats.totalPlayers} PLAYERS
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShow3D(!show3D)}
                className={`p-2 rounded-lg border transition-all ${
                  show3D 
                    ? 'bg-rust-500/20 border-rust-500 text-rust-400' 
                    : 'bg-metal-800 border-metal-700 text-metal-400 hover:text-white hover:border-metal-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`p-2 rounded-lg border transition-all ${
                  showPredictions 
                    ? 'bg-rust-500/20 border-rust-500 text-rust-400' 
                    : 'bg-metal-800 border-metal-700 text-metal-400 hover:text-white hover:border-metal-600'
                }`}
              >
                <Cpu className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className={`p-2 rounded-lg border transition-all ${
                  showAdvancedPanel 
                    ? 'bg-rust-500/20 border-rust-500 text-rust-400' 
                    : 'bg-metal-800 border-metal-700 text-metal-400 hover:text-white hover:border-metal-600'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Full Width Map */}
      <div className="relative pt-20">
        {/* Map Container - Full Width */}
        <div className="relative w-full" style={{ height: 'calc(100vh - 160px)' }}>
          <div 
            ref={containerRef}
            className="relative bg-metal-900 border border-metal-800 overflow-hidden mx-4 rounded-xl"
            style={{ 
              height: '100%',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
            }}
          >
            <HeatmapCanvas 
              zoom={zoom}
              players={filteredPlayers}
              events={events}
              heatData={heatData}
              monuments={monuments}
              showHeatOverlay={showHeatOverlay}
              showPlayers={showPlayers}
              showEvents={showEvents}
              showMonuments={showMonuments}
              showGrid={showGrid}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={setSelectedPlayer}
              heatmapType={heatmapType}
              show3D={show3D}
              showPredictions={showPredictions}
            />
            
            {/* Floating Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <button 
                onClick={handleZoomIn}
                className="w-12 h-12 bg-metal-900/95 border border-metal-700 flex items-center justify-center text-metal-400 hover:text-white hover:border-rust-500 transition-all hover:scale-105"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-12 h-12 bg-metal-900/95 border border-metal-700 flex items-center justify-center text-metal-400 hover:text-white hover:border-rust-500 transition-all hover:scale-105"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button 
                onClick={handleReset}
                className="w-12 h-12 bg-metal-900/95 border border-metal-700 flex items-center justify-center text-metal-400 hover:text-white hover:border-rust-500 transition-all hover:scale-105"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Floating Info Panel */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <div className="px-4 py-2 bg-metal-900/95 border border-metal-700 font-mono text-xs text-metal-400 rounded-lg">
                <span>MAP: 4000 x 4000</span>
                <span className="mx-2">•</span>
                <span>ZOOM: {(zoom * 100).toFixed(0)}%</span>
              </div>
              <div className="px-4 py-2 bg-metal-900/95 border border-metal-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Radio className={`w-3 h-3 ${isPaused ? 'text-rust-500' : 'text-radiation-400 animate-pulse'}`} />
                  <span className="font-mono text-xs text-metal-400">
                    {timeRange === 'live' ? 'REAL-TIME' : timeRange.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Heatmap Type Selector */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <div className="bg-metal-900/95 border border-metal-700 rounded-lg p-1">
                <div className="flex flex-col gap-1">
                  {[
                    { type: 'activity', icon: Thermometer, color: 'text-orange-400', label: 'Activity' },
                    { type: 'combat', icon: Zap, color: 'text-red-400', label: 'Combat' },
                    { type: 'resources', icon: Target, color: 'text-green-400', label: 'Resources' },
                    { type: 'danger', icon: AlertTriangle, color: 'text-yellow-400', label: 'Danger Zones' }
                  ].map(({ type, icon: Icon, color, label }) => (
                    <button
                      key={type}
                      onClick={() => setHeatmapType(type as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                        heatmapType === type 
                          ? 'bg-rust-500/20 border border-rust-500/50' 
                          : 'hover:bg-metal-800 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${heatmapType === type ? 'text-rust-400' : color}`} />
                      <span className={`text-xs font-medium ${heatmapType === type ? 'text-rust-400' : 'text-metal-400'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Controls Panel - Left Side */}
        <AnimatePresence>
          {showControlsPanel && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute left-4 top-24 z-40 max-w-[calc(100vw-2rem)]"
            >
              <div className="bg-metal-900/95 backdrop-blur-md border border-metal-700 rounded-xl p-4 w-72 max-w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white text-sm">CONTROLS</h3>
                  <button
                    onClick={() => setShowControlsPanel(false)}
                    className="text-metal-400 hover:text-white transition-colors"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
                <HeatmapControls 
                  zoom={zoom}
                  isPaused={isPaused}
                  showHeatOverlay={showHeatOverlay}
                  showPlayers={showPlayers}
                  showEvents={showEvents}
                  showMonuments={showMonuments}
                  showGrid={showGrid}
                  selectedFaction={selectedFaction}
                  timeRange={timeRange}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onReset={handleReset}
                  onTogglePause={() => setIsPaused(!isPaused)}
                  onToggleHeatOverlay={() => setShowHeatOverlay(!showHeatOverlay)}
                  onTogglePlayers={() => setShowPlayers(!showPlayers)}
                  onToggleEvents={() => setShowEvents(!showEvents)}
                  onToggleMonuments={() => setShowMonuments(!showMonuments)}
                  onToggleGrid={() => setShowGrid(!showGrid)}
                  onSelectFaction={setSelectedFaction}
                  onSelectTimeRange={setTimeRange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Stats Panel - Right Side */}
        <AnimatePresence>
          {showStatsPanel && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-4 top-24 z-40"
            >
              <div className="bg-metal-900/95 backdrop-blur-md border border-metal-700 rounded-xl p-4 w-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white text-sm">LIVE STATS</h3>
                  <button
                    onClick={() => setShowStatsPanel(false)}
                    className="text-metal-400 hover:text-white transition-colors"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
                <HeatmapStats 
                  stats={stats} 
                  players={filteredPlayers}
                  selectedPlayer={selectedPlayer}
                  onSelectPlayer={setSelectedPlayer}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Features Panel */}
        <AnimatePresence>
          {showAdvancedPanel && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40"
            >
              <div className="bg-metal-900/95 backdrop-blur-md border border-metal-700 rounded-xl p-4 w-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white text-sm">ADVANCED FEATURES</h3>
                  <button
                    onClick={() => setShowAdvancedPanel(false)}
                    className="text-metal-400 hover:text-white transition-colors"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-metal-300 uppercase tracking-wider">Visualization</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={show3D} onChange={() => setShow3D(!show3D)} className="rounded" />
                        <span>3D Heatmap</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showPredictions} onChange={() => setShowPredictions(!showPredictions)} className="rounded" />
                        <span>AI Predictions</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="rounded" />
                        <span>Tactical Grid</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-metal-300 uppercase tracking-wider">Data Layers</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showHeatOverlay} onChange={() => setShowHeatOverlay(!showHeatOverlay)} className="rounded" />
                        <span>Heat Overlay</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showPlayers} onChange={() => setShowPlayers(!showPlayers)} className="rounded" />
                        <span>Player Positions</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showEvents} onChange={() => setShowEvents(!showEvents)} className="rounded" />
                        <span>Event Markers</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-metal-400">
                        <input type="checkbox" checked={showMonuments} onChange={() => setShowMonuments(!showMonuments)} className="rounded" />
                        <span>Monument Zones</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-metal-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-metal-800 border border-metal-700 rounded text-metal-400 hover:text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-metal-800 border border-metal-700 rounded text-metal-400 hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isPaused 
                        ? 'bg-radiation-500/20 border border-radiation-500/50 text-radiation-400' 
                        : 'bg-rust-500/20 border border-rust-500/50 text-rust-400'
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span className="text-xs font-medium">
                      {isPaused ? 'RESUME' : 'PAUSE'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Buttons for Hidden Panels */}
        {!showControlsPanel && (
          <button
            onClick={() => setShowControlsPanel(true)}
            className="absolute left-4 top-24 p-2 bg-metal-900/95 border border-metal-700 rounded-lg text-metal-400 hover:text-white transition-all z-30"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        
        {!showStatsPanel && (
          <button
            onClick={() => setShowStatsPanel(true)}
            className="absolute right-4 top-24 p-2 bg-metal-900/95 border border-metal-700 rounded-lg text-metal-400 hover:text-white transition-all z-30"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
