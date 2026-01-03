// Voice Chat Panel Component
// Real-time voice chat UI with spatial audio indicators

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Settings, Users, 
  Signal, Wifi, WifiOff, Headphones, Speaker
} from 'lucide-react';
import { useVoiceChat, VoiceUser } from './index';

export function VoicePanel() {
  return null;

  const {
    users,
    config,
    isInitialized,
    initialize,
    updateConfig,
    disconnect
  } = useVoiceChat();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    if (config.enabled && !isInitialized) {
      initialize();
    }
  }, [config.enabled, isInitialized, initialize]);

  const handleToggleVoice = async () => {
    if (!config.enabled) {
      const success = await initialize();
      if (success) {
        updateConfig({ enabled: true });
      }
    } else {
      disconnect();
      updateConfig({ enabled: false });
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Mute local microphone
    const localStream = (window as any).localAudioStream;
    if (localStream) {
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !isMuted;
      });
    }
  };

  const handleToggleDeafen = () => {
    setIsDeafened(!isDeafened);
    // Mute all incoming audio
    const audioElements = document.querySelectorAll('audio[data-voice-chat]');
    audioElements.forEach(audio => {
      (audio as HTMLAudioElement).muted = !isDeafened;
    });
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-metal-900/95 backdrop-blur-xl border border-metal-700 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-metal-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Voice Chat</h3>
                    <p className="text-xs text-metal-400">
                      {config.enabled ? 'Verbunden' : 'Getrennt'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-metal-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Voice Users */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-metal-500 text-sm py-8">
                  Niemand im Voice Chat
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <VoiceUserItem key={user.id} user={user} />
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-metal-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMute}
                    className={`p-3 rounded-xl transition-all ${
                      isMuted 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-metal-800 text-metal-300 hover:text-white hover:bg-metal-700'
                    }`}
                    title={isMuted ? 'Stumm aufheben' : 'Stumm schalten'}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleToggleDeafen}
                    className={`p-3 rounded-xl transition-all ${
                      isDeafened 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-metal-800 text-metal-300 hover:text-white hover:bg-metal-700'
                    }`}
                    title={isDeafened ? 'Nicht mehr taub' : 'Taub schalten'}
                  >
                    {isDeafened ? <Headphones className="w-5 h-5" /> : <Speaker className="w-5 h-5" />}
                  </button>
                </div>
                <button className="p-3 bg-metal-800 text-metal-300 hover:text-white hover:bg-metal-700 rounded-xl transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => config.enabled ? setIsExpanded(!isExpanded) : handleToggleVoice()}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
          config.enabled 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
            : 'bg-metal-800 text-metal-400 hover:text-white'
        }`}
      >
        {config.enabled ? (
          <div className="relative">
            <Mic className="w-6 h-6" />
            {users.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}

function VoiceUserItem({ user }: { user: VoiceUser }) {
  const getVolumeIcon = () => {
    if (user.volume === 0) return <VolumeX className="w-4 h-4" />;
    if (user.volume < 0.3) return <Volume2 className="w-4 h-4 opacity-50" />;
    return <Volume2 className="w-4 h-4" />;
  };

  const getConnectionQuality = () => {
    // Simulate connection quality based on volume and speaking status
    if (user.isSpeaking && user.volume > 0.5) return 'high';
    if (user.volume > 0) return 'medium';
    return 'low';
  };

  const quality = getConnectionQuality();
  const qualityColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-metal-800/50 transition-colors"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        {user.isSpeaking && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-metal-900"
          />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">
            {user.username}
          </p>
          <Signal className={`w-3 h-3 ${qualityColors[quality]}`} />
        </div>
        <div className="flex items-center gap-2 text-xs text-metal-400">
          {getVolumeIcon()}
          <span>{Math.round(user.volume * 100)}%</span>
          <span>•</span>
          <span>{Math.round(user.position.x)}m</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-metal-500 hover:text-white hover:bg-metal-700 rounded transition-all">
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
