'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Phone, Lock, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CreateVoiceChannelModalProps {
  onClose: () => void
  onCreate: (data: {
    name: string
    description: string
    isPrivate: boolean
    maxUsers: number
    icon: string
  }) => void
}

export function CreateVoiceChannelModal({
  onClose,
  onCreate
}: CreateVoiceChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxUsers, setMaxUsers] = useState(10)
  const [icon, setIcon] = useState('🎤')

  const icons = ['🎤', '🎧', '📻', '🔊', '🎙️', '📢', '🎵', '🎶']

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({
      name,
      description,
      isPrivate,
      maxUsers,
      icon
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-metal-900 border border-rust-500/30 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-rust-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-rust-400 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Voice Raum erstellen
            </h2>
            <button onClick={onClose} className="text-metal-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 text-2xl rounded-lg transition-all ${
                    icon === ic ? 'bg-rust-500/20 ring-2 ring-rust-500' : 'bg-metal-800 hover:bg-metal-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Raum Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Gaming Squad"
              className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-rust-500/50 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in diesem Voice Raum?"
              rows={2}
              className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-rust-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Datenschutz</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-lg border transition-all ${
                  !isPrivate
                    ? 'bg-rust-500/20 border-rust-500 text-rust-400'
                    : 'bg-metal-800 border-metal-700 text-metal-400'
                }`}
              >
                <Zap className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Öffentlich</span>
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-lg border transition-all ${
                  isPrivate
                    ? 'bg-rust-500/20 border-rust-500 text-rust-400'
                    : 'bg-metal-800 border-metal-700 text-metal-400'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Privat</span>
              </button>
            </div>
          </div>

          {/* Max Users */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Max. Teilnehmer</label>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-metal-400" />
              <input
                type="range"
                min="2"
                max="50"
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                className="flex-1 h-2 bg-metal-800 rounded-lg appearance-none cursor-pointer accent-rust-500"
              />
              <span className="text-sm font-semibold text-white w-12 text-right">{maxUsers}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-metal-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 bg-rust-500 hover:bg-rust-400 text-white"
          >
            Erstellen
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
