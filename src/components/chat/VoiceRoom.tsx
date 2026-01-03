'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Settings,
  Users, Clock, Signal, Wifi, WifiOff, Maximize2, Minimize2,
  Copy, Share2, Lock, Unlock, Crown, Shield, Zap, Heart,
  X, ChevronDown, ChevronUp, MessageSquare, Eye, EyeOff
} from 'lucide-react'
import { ChatUser } from '@/store/chatTypes'

interface VoiceRoomProps {
  roomId: string
  roomName: string
  roomIcon: string
  maxUsers: number
  isPrivate: boolean
  currentUser: ChatUser
  participants: ChatUser[]
  onLeave: () => void
  onParticipantJoin?: (user: ChatUser) => void
  onParticipantLeave?: (userId: string) => void
}

interface ParticipantAudio {
  userId: string
  stream: MediaStream
  isMuted: boolean
  volume: number
}

export function VoiceRoom({
  roomId,
  roomName,
  roomIcon,
  maxUsers,
  isPrivate,
  currentUser,
  participants,
  onLeave,
  onParticipantJoin,
  onParticipantLeave
}: VoiceRoomProps) {
  // Audio state
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true)
  const [micVolume, setMicVolume] = useState(100)
  const [speakerVolume, setSpeakerVolume] = useState(100)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent')
  const [isConnecting, setIsConnecting] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  const [participantAudios, setParticipantAudios] = useState<ParticipantAudio[]>([])

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())

  // Initialize audio
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        })

        localStreamRef.current = stream
        setIsConnecting(false)

        // Setup audio context for advanced audio processing
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
      } catch (error) {
        console.error('Error accessing microphone:', error)
        setIsConnecting(false)
      }
    }

    initializeAudio()

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Handle mic toggle
  const handleMicToggle = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMicEnabled
      })
      setIsMicEnabled(!isMicEnabled)
    }
  }, [isMicEnabled])

  // Handle speaker toggle
  const handleSpeakerToggle = useCallback(() => {
    setIsSpeakerEnabled(!isSpeakerEnabled)
  }, [isSpeakerEnabled])

  // Handle leave room
  const handleLeaveRoom = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    peerConnectionsRef.current.forEach(pc => {
      pc.close()
    })
    peerConnectionsRef.current.clear()

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    onLeave()
  }, [onLeave])

  // Connection quality indicator
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-lime-400'
      case 'fair': return 'text-yellow-400'
      case 'poor': return 'text-red-400'
    }
  }

  const getQualityBg = () => {
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500/20'
      case 'good': return 'bg-lime-500/20'
      case 'fair': return 'bg-yellow-500/20'
      case 'poor': return 'bg-red-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-gradient-to-br from-metal-950 via-metal-900 to-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-metal-800 bg-metal-900/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center text-xl border border-rust-400/30">
                {roomIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-white text-lg">{roomName}</h2>
                  {isPrivate && <Lock className="w-4 h-4 text-rust-400" />}
                </div>
                <div className="flex items-center gap-3 text-sm text-metal-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{participants.length + 1}/{maxUsers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getQualityBg()} border border-metal-700`}>
              {connectionQuality === 'excellent' || connectionQuality === 'good' ? (
                <Wifi className={`w-4 h-4 ${getQualityColor()}`} />
              ) : (
                <WifiOff className={`w-4 h-4 ${getQualityColor()}`} />
              )}
              <span className={`text-xs font-medium ${getQualityColor()}`}>
                {connectionQuality.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-metal-800 rounded-lg transition-colors text-metal-400 hover:text-white"
              title="Toggle Participants"
            >
              {showParticipants ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-metal-800 rounded-lg transition-colors text-metal-400 hover:text-white"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLeaveRoom}
              className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Leave Room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Grid */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {isConnecting ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center mx-auto mb-4 border-2 border-rust-400/30">
                <Zap className="w-10 h-10 text-white animate-pulse" />
              </div>
              <p className="text-white font-semibold mb-2">Verbindung wird hergestellt...</p>
              <p className="text-metal-400 text-sm">Bitte warten Sie</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {/* Current User */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-rust-500/20 to-rust-600/20 border-2 border-rust-500/50 flex flex-col items-center justify-center overflow-hidden relative">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-rust-400/30 mb-4">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      currentUser.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <p className="font-semibold text-white">{currentUser.displayName}</p>
                    <p className="text-sm text-metal-400">Du (Host)</p>
                  </div>

                  {/* Mic Status */}
                  <div className="absolute top-4 right-4">
                    {isMicEnabled ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                        <MicOff className="w-4 h-4 text-red-400" />
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {currentUser.role === 'admin' || currentUser.role === 'owner' ? (
                    <div className="absolute top-4 left-4">
                      <Crown className="w-5 h-5 text-gold-400" />
                    </div>
                  ) : currentUser.role === 'moderator' ? (
                    <div className="absolute top-4 left-4">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                  ) : null}
                </div>
              </motion.div>

              {/* Participants */}
              <AnimatePresence>
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-metal-800 to-metal-900 border-2 border-metal-700 flex flex-col items-center justify-center overflow-hidden relative hover:border-metal-600 transition-colors">
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-metal-700 to-metal-800 flex items-center justify-center text-4xl font-bold text-white border-4 border-metal-600 mb-4">
                        {participant.avatar ? (
                          <img
                            src={participant.avatar}
                            alt={participant.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          participant.username.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* User Info */}
                      <div className="text-center">
                        <p className="font-semibold text-white">{participant.displayName}</p>
                        <p className="text-sm text-metal-400">Level {participant.level}</p>
                      </div>

                      {/* Mic Status */}
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-green-400" />
                        </div>
                      </div>

                      {/* Badge */}
                      {participant.role === 'admin' || participant.role === 'owner' ? (
                        <div className="absolute top-4 left-4">
                          <Crown className="w-5 h-5 text-gold-400" />
                        </div>
                      ) : participant.role === 'moderator' ? (
                        <div className="absolute top-4 left-4">
                          <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                      ) : null}

                      {/* VIP Badge */}
                      {participant.vipTier && (
                        <div className="absolute bottom-4 right-4">
                          <Heart className="w-5 h-5 text-pink-400" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Participants Sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-metal-800 bg-metal-900/50 backdrop-blur-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-metal-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Teilnehmer ({participants.length + 1})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Current User */}
                <div className="p-3 bg-rust-500/10 border border-rust-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center text-white font-semibold text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{currentUser.displayName}</p>
                      <p className="text-xs text-metal-400">Du (Host)</p>
                    </div>
                    {isMicEnabled ? (
                      <Mic className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Participants */}
                {participants.map(participant => (
                  <div key={participant.id} className="p-3 bg-metal-800/50 rounded-lg hover:bg-metal-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-metal-700 to-metal-800 flex items-center justify-center text-white font-semibold text-sm">
                        {participant.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{participant.displayName}</p>
                        <p className="text-xs text-metal-400">Level {participant.level}</p>
                      </div>
                      <Mic className="w-4 h-4 text-green-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="border-t border-metal-800 bg-metal-900/80 backdrop-blur-md p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone Control */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMicToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
              isMicEnabled
                ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
            }`}
            title={isMicEnabled ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
          >
            {isMicEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </motion.button>

          {/* Speaker Control */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeakerToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
              isSpeakerEnabled
                ? 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30'
                : 'bg-metal-700 border-metal-600 text-metal-400 hover:bg-metal-600'
            }`}
            title={isSpeakerEnabled ? 'Lautsprecher ausschalten' : 'Lautsprecher einschalten'}
          >
            {isSpeakerEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </motion.button>

          {/* Leave Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveRoom}
            className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-600 text-red-400 hover:bg-red-600/30 flex items-center justify-center transition-all"
            title="Raum verlassen"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="w-16 h-16 rounded-full bg-metal-800 border-2 border-metal-700 text-metal-400 hover:text-white hover:border-metal-600 flex items-center justify-center transition-all"
            title="Einstellungen"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Volume Sliders */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 pt-6 border-t border-metal-800 space-y-4"
          >
            {/* Mic Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">Mikrofon-Lautstärke</label>
                <span className="text-xs text-metal-400">{micVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={micVolume}
                onChange={(e) => setMicVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-metal-800 rounded-lg appearance-none cursor-pointer accent-rust-500"
              />
            </div>

            {/* Speaker Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">Lautsprecher-Lautstärke</label>
                <span className="text-xs text-metal-400">{speakerVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={speakerVolume}
                onChange={(e) => setSpeakerVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-metal-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
