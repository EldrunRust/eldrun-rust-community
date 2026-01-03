'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Settings, Users, 
  Signal, Wifi, WifiOff, Headphones, Speaker,
  Play, Pause, SkipForward, SkipBack
} from 'lucide-react';
import { MedievalPageHeader } from '@/components/ui/MedievalPageHeader'
import { AuthGate } from '@/components/AuthGate';

export default function VoiceChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState(75);

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  return (
    <AuthGate>
    <div className="min-h-screen bg-metal-950">
      <MedievalPageHeader
        icon={Headphones}
        badge="AAA FEATURE"
        title="VOICE CHAT"
        subtitle="SPATIAL AUDIO"
        description="Eldruns Sprachsystem mit WebRTC-Architektur. Perfekt skaliert, klar strukturiert, bereit für echte Voice-Räume im Chat."
        gradient="from-rust-300 via-rust-400 to-amber-400"
        glowColor="rgba(237,118,32,0.25)"
      />

      <div className="container-rust py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Voice Panel */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-metal-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-rust-500 to-amber-600 rounded-xl flex items-center justify-center border border-rust-400/30">
                    <Signal className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-black text-white tracking-wide">VOICE STEUERUNG</h2>
                    <p className="text-xs text-metal-400">Status, Controls, Volume, Live-Pegel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-metal-950/40 border border-metal-800 rounded-xl">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-radiation-400 animate-pulse' : 'bg-blood-500'}`} />
                    <span className="text-xs font-mono text-metal-300">{isConnected ? 'VERBUNDEN' : 'GETRENNT'}</span>
                  </div>
                  <button
                    onClick={handleConnect}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                      isConnected
                        ? 'bg-blood-500/15 border-blood-500/40 text-blood-400 hover:bg-blood-500/25'
                        : 'bg-radiation-400/15 border-radiation-400/40 text-radiation-300 hover:bg-radiation-400/25'
                    }`}
                  >
                    {isConnected ? 'Trennen' : 'Verbinden'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Voice Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    disabled={!isConnected}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      !isConnected
                        ? 'bg-metal-950/30 border-metal-800 text-metal-600 cursor-not-allowed'
                        : isMuted
                        ? 'bg-blood-500/10 border-blood-500/30 text-blood-400 hover:bg-blood-500/15'
                        : 'bg-metal-950/30 border-metal-800 text-metal-300 hover:text-white hover:border-metal-700'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    <span className="text-xs font-mono uppercase tracking-wider">{isMuted ? 'Stumm' : 'Mic'}</span>
                  </button>

                  <button
                    onClick={() => setIsDeafened(!isDeafened)}
                    disabled={!isConnected}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      !isConnected
                        ? 'bg-metal-950/30 border-metal-800 text-metal-600 cursor-not-allowed'
                        : isDeafened
                        ? 'bg-blood-500/10 border-blood-500/30 text-blood-400 hover:bg-blood-500/15'
                        : 'bg-metal-950/30 border-metal-800 text-metal-300 hover:text-white hover:border-metal-700'
                    }`}
                  >
                    {isDeafened ? <Headphones className="w-6 h-6" /> : <Speaker className="w-6 h-6" />}
                    <span className="text-xs font-mono uppercase tracking-wider">{isDeafened ? 'Taub' : 'Hören'}</span>
                  </button>

                  <button
                    disabled={!isConnected}
                    className="p-4 rounded-2xl border bg-metal-950/30 border-metal-800 text-metal-300 hover:text-white hover:border-metal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-xs font-mono uppercase tracking-wider">Settings</span>
                  </button>

                  <button
                    disabled={!isConnected}
                    className="p-4 rounded-2xl border bg-metal-950/30 border-metal-800 text-metal-300 hover:text-white hover:border-metal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-mono uppercase tracking-wider">Channel</span>
                  </button>
                </div>

                {/* Volume Control */}
                <div className="bg-metal-950/30 border border-metal-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Master Volume</p>
                      <p className="text-xs text-metal-500">Globaler Ausgangspegel für alle Streams</p>
                    </div>
                    <span className="text-sm font-mono text-metal-200">{volume}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <VolumeX className="w-5 h-5 text-metal-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      disabled={!isConnected}
                      className="flex-1 accent-rust-500 disabled:opacity-50"
                    />
                    <Volume2 className="w-5 h-5 text-metal-500" />
                  </div>
                </div>

                {/* Audio Visualizer */}
                <div className="bg-metal-950/30 border border-metal-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Live Pegel</p>
                      <p className="text-xs text-metal-500">Visuelle Aktivität (Demo)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className={`w-4 h-4 ${isConnected ? 'text-radiation-400' : 'text-metal-600'}`} />
                      <span className="text-xs font-mono text-metal-400">RTC</span>
                    </div>
                  </div>

                  <div className="h-24 rounded-xl bg-metal-900/30 border border-metal-800 flex items-end justify-center gap-1 px-4 py-3 overflow-hidden">
                    {[...Array(26)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-full bg-gradient-to-t from-rust-600 to-amber-400"
                        style={{
                          height: `${10 + Math.random() * 70}%`,
                          opacity: isConnected ? 1 : 0.35,
                          transform: 'translateZ(0)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Panel */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-metal-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rust-400" />
                  <h3 className="text-sm font-display font-black text-white tracking-wide">AKTIVE NUTZER</h3>
                </div>
                <span className="text-xs font-mono text-metal-500">DEMO</span>
              </div>

              <div className="p-4 space-y-2">
                {['Shadow', 'DragonSlayer', 'Phoenix', 'Ninja'].map((username, index) => (
                  <div
                    key={username}
                    className="flex items-center gap-3 p-3 bg-metal-950/30 border border-metal-800 rounded-xl"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-amber-600 rounded-lg flex items-center justify-center text-black font-bold">
                        {username[0]}
                      </div>
                      {index < 2 && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-radiation-400 rounded-full border-2 border-metal-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{username}</p>
                      <p className="text-xs text-metal-500">{index < 2 ? 'Spricht…' : 'Online'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className={`w-4 h-4 ${index < 3 ? 'text-radiation-400' : 'text-metal-600'}`} />
                      <Volume2 className="w-4 h-4 text-metal-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-metal-900/50 border border-metal-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-metal-800 flex items-center justify-between">
                <h3 className="text-sm font-display font-black text-white tracking-wide">SPATIAL AUDIO FEATURES</h3>
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-radiation-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-metal-600" />
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-rust-500 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold">3D Positionierung</p>
                    <p className="text-xs text-metal-500">Höre Spieler aus ihrer Richtung (Spatial Panning)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-rust-500 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold">Proximity Audio</p>
                    <p className="text-xs text-metal-500">Lautstärke skaliert mit Entfernung & Umgebung</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-rust-500 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold">Noise Reduction</p>
                    <p className="text-xs text-metal-500">Echo Cancelling & Noise Suppression (RTC Stack)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-rust-500 rounded-full mt-2" />
                  <div>
                    <p className="text-white font-semibold">Low Latency</p>
                    <p className="text-xs text-metal-500">Optimiert für Realtime Kommunikation im Raid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
