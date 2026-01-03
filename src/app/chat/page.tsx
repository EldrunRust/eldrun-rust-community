'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  MessageSquare, Users, Settings, Search, Send, Smile, Image, 
  Paperclip, Mic, Gift, Heart, Crown, Star, Shield, X, Plus,
  Hash, Lock, ChevronDown, ChevronRight, Bell, BellOff, Pin,
  MoreHorizontal, Reply, Edit2, Trash2, Copy, Flag, Volume2,
  VolumeX, Maximize2, Minimize2, UserPlus, LogOut, Sparkles,
  Flame, Zap, Coffee, Moon, Eye, EyeOff, Check, Clock,
  TrendingUp, Award, Coins, MessageCircle, ImagePlus, FileUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChatStore, Channel, ChatMessage, ChatUser } from '@/store/chatStore'
import { useSmileyStore } from '@/store/smileyStore'
import { useToast } from '@/components/ui/Toast'
import { useStore } from '@/store/useStore'
import { AIModerator } from '@/features/ai-moderation/moderator'
import { AuthGate } from '@/components/AuthGate'
import { VoiceRoom } from '@/components/chat/VoiceRoom'
import { VoiceChannelList } from '@/components/chat/VoiceChannelList'
import { CreateVoiceChannelModal } from '@/components/chat/CreateVoiceChannelModal'

// ═══════════════════════════════════════════════════════════════════════════
// EMOJI DATA
// ═══════════════════════════════════════════════════════════════════════════

const EMOJI_CATEGORIES = {
  recent: { label: '🕐 Zuletzt', emojis: ['👍', '❤️', '😂', '🔥', '⚔️', '👑', '🐉', '💀'] },
  smileys: { label: '😀 Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'] },
  gaming: { label: '🎮 Gaming', emojis: ['⚔️', '🗡️', '🛡️', '🏹', '🔫', '💣', '🎮', '🕹️', '🎯', '🎲', '♟️', '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '💎', '💰', '🪙', '⚡', '🔥', '💀', '☠️', '👻', '🐉', '🦅', '🐺', '🦁', '🐻', '🦊'] },
  hearts: { label: '❤️ Herzen', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '😍', '🥰', '😘', '💋', '🌹'] },
  symbols: { label: '⭐ Symbole', emojis: ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🔥', '💧', '❄️', '⚡', '🌈', '☁️', '💨', '🌪️', '🎵', '🎶', '💯', '✅', '❌', '⚠️', '🚫', '💢', '💥', '💦', '💤', '🎉', '🎊', '🎁', '🏴', '🚩'] },
  food: { label: '🍕 Essen', emojis: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥖', '🥨', '🧀', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷'] },
  animals: { label: '🐉 Tiere', emojis: ['🐉', '🦅', '🐺', '🦁', '🐻', '🦊', '🐯', '🦌', '🐗', '🐎', '🦄', '🐲', '🦎', '🐍', '🦂', '🕷️', '🦇', '🐦', '🦉', '🐧', '🐔', '🐣', '🦆', '🦢', '🦚', '🐛', '🦋', '🐌', '🐝', '🐞'] },
}

// ═══════════════════════════════════════════════════════════════════════════
// MODALS & PICKERS
// ═══════════════════════════════════════════════════════════════════════════

function EmojiPicker({ 
  onSelect, 
  onClose 
}: { 
  onSelect: (emoji: string) => void
  onClose: () => void 
}) {
  const [activeCategory, setActiveCategory] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const { smileys, getOwnedSmileys, getFreeSmileys, addToRecent } = useSmileyStore()
  
  const ownedSmileys = getOwnedSmileys()
  const freeSmileys = getFreeSmileys()

  const getFilteredEmojis = () => {
    if (activeCategory === 'owned') {
      return ownedSmileys.map(s => s.emoji)
    }
    if (activeCategory === 'store') {
      return freeSmileys.slice(0, 40).map(s => s.emoji)
    }
    if (searchQuery) {
      const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(c => c.emojis)
      const storeEmojis = freeSmileys.map(s => s.emoji)
      return Array.from(new Set([...allEmojis, ...storeEmojis])).filter(e => e.includes(searchQuery))
    }
    return EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]?.emojis || []
  }
  
  const filteredEmojis = getFilteredEmojis()

  const handleSelect = (emoji: string) => {
    const smiley = smileys.find(s => s.emoji === emoji)
    if (smiley) addToRecent(smiley.id)
    onSelect(emoji)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full right-0 mb-2 w-96 bg-metal-900 border border-metal-700 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {/* Search */}
      <div className="p-2 border-b border-metal-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Emoji suchen..."
            className="w-full pl-9 pr-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-sm text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-metal-800 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('owned')}
          className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
            activeCategory === 'owned' 
              ? 'bg-gold-500/20 text-gold-400' 
              : 'text-metal-400 hover:bg-metal-800'
          }`}
        >
          ⭐ Meine ({ownedSmileys.length})
        </button>
        <button
          onClick={() => setActiveCategory('store')}
          className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
            activeCategory === 'store' 
              ? 'bg-green-500/20 text-green-400' 
              : 'text-metal-400 hover:bg-metal-800'
          }`}
        >
          🆓 Gratis
        </button>
        {Object.entries(EMOJI_CATEGORIES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              activeCategory === key 
                ? 'bg-gold-500/20 text-gold-400' 
                : 'text-metal-400 hover:bg-metal-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="h-48 overflow-y-auto p-2">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleSelect(emoji)}
                className="p-2 text-xl hover:bg-metal-800 rounded transition-colors hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-3xl mb-2">😢</span>
            <p className="text-sm text-metal-500">
              {activeCategory === 'owned' ? (
                <>
                  Noch keine Smileys!<br/>
                  <Link href="/smileys" className="text-gold-400 hover:underline">
                    Zum Smiley Store →
                  </Link>
                </>
              ) : 'Keine Ergebnisse'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CreateChannelModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (data: Partial<Channel>) => void 
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'public' | 'private'>('public')
  const [icon, setIcon] = useState('💬')
  const [password, setPassword] = useState('')
  const [maxUsers, setMaxUsers] = useState(100)
  const [slowMode, setSlowMode] = useState(0)
  const [minLevel, setMinLevel] = useState(0)

  const icons = ['💬', '🏰', '⚔️', '💰', '🎮', '💕', '🎰', '❓', '🔒', '👑', '🐉', '🎉']

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({
      name,
      description,
      type,
      icon,
      password: type === 'private' ? password : undefined,
      maxUsers,
      slowMode,
      minLevel,
      isLocked: type === 'private',
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
        className="w-full max-w-md bg-metal-900 border border-gold-500/30 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-gold-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="font-medieval text-xl text-gold-400">Channel erstellen</h2>
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
                  className={`p-2 text-xl rounded-lg transition-all ${
                    icon === ic ? 'bg-gold-500/20 ring-2 ring-gold-500' : 'bg-metal-800 hover:bg-metal-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Channel Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Mein Channel"
              className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in diesem Channel?"
              rows={2}
              className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Typ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType('public')}
                className={`p-3 rounded-lg border transition-all ${
                  type === 'public' 
                    ? 'bg-gold-500/20 border-gold-500 text-gold-400' 
                    : 'bg-metal-800 border-metal-700 text-metal-400'
                }`}
              >
                <Hash className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Öffentlich</span>
              </button>
              <button
                onClick={() => setType('private')}
                className={`p-3 rounded-lg border transition-all ${
                  type === 'private' 
                    ? 'bg-gold-500/20 border-gold-500 text-gold-400' 
                    : 'bg-metal-800 border-metal-700 text-metal-400'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Privat</span>
              </button>
            </div>
          </div>

          {/* Password (if private) */}
          {type === 'private' && (
            <div>
              <label className="block text-sm text-metal-400 mb-2">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Channel-Passwort"
                className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
              />
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-metal-400 mb-1">Max. User</label>
              <input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value) || 100)}
                min={5}
                max={500}
                className="w-full px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:border-gold-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-metal-400 mb-1">Slow Mode (Sek)</label>
              <input
                type="number"
                value={slowMode}
                onChange={(e) => setSlowMode(parseInt(e.target.value) || 0)}
                min={0}
                max={60}
                className="w-full px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:border-gold-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-metal-400 mb-1">Min. Level</label>
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(parseInt(e.target.value) || 0)}
                min={0}
                max={99}
                className="w-full px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:border-gold-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-metal-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="flex-1 bg-gold-500 hover:bg-gold-400 text-black">
            Erstellen
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function GiftModal({ 
  onClose, 
  onSend,
  users 
}: { 
  onClose: () => void
  onSend: (userId: string, type: string, amount: number) => void
  users: ChatUser[]
}) {
  const [selectedUser, setSelectedUser] = useState('')
  const [giftType, setGiftType] = useState<'eldrun' | 'heart' | 'rose' | 'kiss'>('eldrun')
  const [amount, setAmount] = useState(100)
  const [roseMessage, setRoseMessage] = useState('')

  const gifts = [
    { type: 'eldrun', icon: '💰', label: 'Eldruns', color: 'gold' },
    { type: 'heart', icon: '❤️', label: 'Herz', color: 'pink' },
    { type: 'rose', icon: '🌹', label: 'Rose', color: 'red' },
    { type: 'kiss', icon: '💋', label: 'Kuss', color: 'pink' },
  ]

  const handleSend = () => {
    if (!selectedUser) return
    onSend(selectedUser, giftType, amount)
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
        className="w-full max-w-md bg-metal-900 border border-pink-500/30 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-pink-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="font-medieval text-xl text-pink-400 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Geschenk senden
            </h2>
            <button onClick={onClose} className="text-metal-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Gift Type */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">Was möchtest du senden?</label>
            <div className="grid grid-cols-4 gap-2">
              {gifts.map(gift => (
                <button
                  key={gift.type}
                  onClick={() => setGiftType(gift.type as typeof giftType)}
                  className={`p-3 rounded-lg border transition-all ${
                    giftType === gift.type 
                      ? `bg-${gift.color}-500/20 border-${gift.color}-500 text-${gift.color}-400` 
                      : 'bg-metal-800 border-metal-700 text-metal-400 hover:bg-metal-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">{gift.icon}</span>
                  <span className="text-xs">{gift.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">An wen?</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white focus:border-gold-500/50 focus:outline-none"
            >
              <option value="">User auswählen...</option>
              {users.filter(u => u.status === 'online').map(user => (
                <option key={user.id} value={user.id}>{user.displayName}</option>
              ))}
            </select>
          </div>

          {/* Amount (for Eldruns) */}
          {giftType === 'eldrun' && (
            <div>
              <label className="block text-sm text-metal-400 mb-2">Anzahl Eldruns</label>
              <div className="flex gap-2">
                {[50, 100, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      amount === amt 
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500' 
                        : 'bg-metal-800 text-metal-400 border border-metal-700'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full mt-2 px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white focus:border-gold-500/50 focus:outline-none"
              />
            </div>
          )}

          {/* Message (for Rose) */}
          {giftType === 'rose' && (
            <div>
              <label className="block text-sm text-metal-400 mb-2">Nachricht (optional)</label>
              <textarea
                value={roseMessage}
                onChange={(e) => setRoseMessage(e.target.value)}
                placeholder="Eine liebe Nachricht..."
                rows={2}
                className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-metal-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!selectedUser} 
            className="flex-1 bg-pink-500 hover:bg-pink-400 text-white"
          >
            Senden
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function UserProfilePopover({ 
  user, 
  onClose,
  onSendGift,
  onSendDM
}: { 
  user: ChatUser
  onClose: () => void
  onSendGift: () => void
  onSendDM: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute left-full top-0 ml-2 w-72 bg-metal-900 border border-metal-700 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {/* Banner */}
      <div className="h-16 bg-gradient-to-r from-gold-600 to-amber-800 relative">
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-amber-700 flex items-center justify-center text-2xl font-bold text-white border-4 border-metal-900">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/default.svg'
                }}
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-10 px-4 pb-4">
        <div className="flex items-center gap-2">
          <span 
            className="font-medieval font-bold text-lg"
            style={{ color: user.customColor || '#fff' }}
          >
            {user.displayName}
          </span>
          {user.vipTier && <Crown className="w-4 h-4 text-gold-400" />}
        </div>
        <p className="text-sm text-metal-500">@{user.username}</p>
        
        {user.statusMessage && (
          <p className="text-sm text-metal-400 mt-2 italic">&quot;{user.statusMessage}&quot;</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2 bg-metal-800 rounded-lg">
            <p className="font-bold text-gold-400">{user.level}</p>
            <p className="text-xs text-metal-500">Level</p>
          </div>
          <div className="p-2 bg-metal-800 rounded-lg">
            <p className="font-bold text-pink-400">{user.hearts}</p>
            <p className="text-xs text-metal-500">Herzen</p>
          </div>
          <div className="p-2 bg-metal-800 rounded-lg">
            <p className="font-bold text-red-400">{user.rosesReceived}</p>
            <p className="text-xs text-metal-500">Rosen</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {user.badges.slice(0, 5).map((badge, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-metal-800 rounded text-metal-400">
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="ghost" onClick={onSendDM} className="flex-1 text-metal-400">
            <MessageCircle className="w-4 h-4 mr-1" />
            Nachricht
          </Button>
          <Button size="sm" onClick={onSendGift} className="flex-1 bg-pink-500 hover:bg-pink-400 text-white">
            <Gift className="w-4 h-4 mr-1" />
            Geschenk
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ChannelIcon({ type, icon }: { type: string; icon: string }) {
  return (
    <span className="text-lg">{icon}</span>
  )
}

function UserStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    invisible: 'bg-gray-500',
    offline: 'bg-gray-600',
  }
  return <span className={`w-3 h-3 rounded-full ${colors[status] || colors.offline} border-2 border-metal-900`} />
}

function RoleBadge({ role }: { role: string }) {
  const badges: Record<string, { icon: typeof Crown; color: string; label: string }> = {
    owner: { icon: Crown, color: 'text-gold-400', label: 'Owner' },
    admin: { icon: Shield, color: 'text-red-400', label: 'Admin' },
    moderator: { icon: Shield, color: 'text-green-400', label: 'Mod' },
    vip_gold: { icon: Crown, color: 'text-gold-400', label: 'VIP' },
    vip_silver: { icon: Crown, color: 'text-gray-300', label: 'VIP' },
    vip_bronze: { icon: Crown, color: 'text-amber-600', label: 'VIP' },
  }
  
  const badge = badges[role]
  if (!badge) return null
  
  const Icon = badge.icon
  return (
    <span className={`${badge.color}`} title={badge.label}>
      <Icon className="w-4 h-4" />
    </span>
  )
}

function MessageComponent({ 
  message, 
  onReply,
  onReact,
  compact = false 
}: { 
  message: ChatMessage
  onReply: (msg: ChatMessage) => void
  onReact: (msgId: string, emoji: string) => void
  compact?: boolean
}) {
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  
  const quickReactions = ['❤️', '👍', '😂', '😮', '🔥', '⚔️', '👑', '🐉']
  
  const getMessageContent = () => {
    switch (message.type) {
      case 'eldrun':
        return (
          <div className="flex items-center gap-2 text-gold-400">
            <Coins className="w-5 h-5" />
            <span>
              hat <strong>{message.eldrunAmount?.toLocaleString()}</strong> Eldruns an{' '}
              <strong className="text-gold-300">@{message.eldrunRecipient}</strong> geschenkt! ✨
            </span>
          </div>
        )
      case 'heart':
        return (
          <div className="flex items-center gap-2 text-pink-400">
            <Heart className="w-5 h-5 fill-pink-400" />
            <span>
              hat sein Herz an <strong className="text-pink-300">@{message.heartRecipient}</strong> vergeben! 💕
            </span>
          </div>
        )
      case 'rose':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-2xl">🌹</span>
            <span>
              hat eine {message.roseColor || 'rote'} Rose an{' '}
              <strong className="text-red-300">@{message.roseRecipient}</strong> geschickt!
              {message.roseMessage && <em className="text-metal-400 ml-2">&quot;{message.roseMessage}&quot;</em>}
            </span>
          </div>
        )
      case 'kiss':
        return (
          <div className="flex items-center gap-2 text-pink-400">
            <span className="text-2xl">💋</span>
            <span>
              hat <strong className="text-pink-300">@{message.kissRecipient}</strong> geküsst!
            </span>
          </div>
        )
      case 'system':
        return (
          <div className="flex items-center gap-2 text-gold-400 bg-gold-500/10 px-3 py-2 rounded-lg border border-gold-500/30">
            <Sparkles className="w-4 h-4" />
            <span>{message.content}</span>
          </div>
        )
      default:
        return (
          <p className="text-metal-200 break-words">
            {message.content}
          </p>
        )
    }
  }
  
  const getNickEffect = () => {
    switch (message.userNickEffect) {
      case 'flame':
        return 'animate-pulse text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]'
      case 'sparkle':
        return 'animate-pulse text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]'
      case 'glow':
        return 'drop-shadow-[0_0_10px_rgba(212,168,83,0.5)]'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative px-4 py-2 hover:bg-metal-800/50 ${message.isHighlighted ? 'bg-gold-500/10 border-l-2 border-gold-500' : ''} ${message.isPinned ? 'bg-amber-500/5' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false) }}
    >
      {/* Reply indicator */}
      {message.replyTo && (
        <div className="flex items-center gap-2 text-xs text-metal-500 mb-1 ml-12">
          <Reply className="w-3 h-3" />
          <span>Antwort auf</span>
          <span className="text-metal-400">@{message.replyTo.username}</span>
          <span className="truncate max-w-xs">{message.replyTo.content}</span>
        </div>
      )}
      
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-amber-800 flex items-center justify-center text-white font-bold border-2 border-gold-500/30">
            {message.avatar ? (
              <img
                src={message.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/default.svg'
                }}
              />
            ) : (
              message.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className={`font-medieval font-bold ${message.userColor ? '' : 'text-white'} ${getNickEffect()}`}
              style={{ color: message.userColor }}
            >
              {message.displayName}
            </span>
            <RoleBadge role={message.userRole} />
            {message.userBadges.slice(0, 3).map((badge, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 bg-metal-700 rounded text-metal-400">
                {badge}
              </span>
            ))}
            <span className="text-xs text-metal-600">
              {new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.editedAt && (
              <span className="text-xs text-metal-600">(bearbeitet)</span>
            )}
            {message.isPinned && (
              <Pin className="w-3 h-3 text-amber-400" />
            )}
          </div>
          
          {/* Message content */}
          <div className="mt-1">
            {getMessageContent()}
          </div>
          
          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-metal-800 hover:bg-metal-700 rounded-full text-sm transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-metal-400">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-4 top-2 flex items-center gap-1 bg-metal-800 border border-metal-700 rounded-lg p-1 shadow-xl"
          >
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 hover:bg-metal-700 rounded text-metal-400 hover:text-white transition-colors"
              title="Reagieren"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReply(message)}
              className="p-1.5 hover:bg-metal-700 rounded text-metal-400 hover:text-white transition-colors"
              title="Antworten"
            >
              <Reply className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-metal-700 rounded text-metal-400 hover:text-white transition-colors"
              title="Mehr"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick reactions popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-12 flex items-center gap-1 bg-metal-800 border border-metal-700 rounded-lg p-2 shadow-xl z-10"
          >
            {quickReactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => { onReact(message.id, emoji); setShowReactions(false) }}
                className="p-1.5 hover:bg-metal-700 rounded text-lg transition-colors hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ChannelSidebar({ 
  channels, 
  currentChannelId, 
  onSelectChannel,
  onlineCount,
  onCreateChannel
}: { 
  channels: Channel[]
  currentChannelId: string | null
  onSelectChannel: (id: string) => void
  onlineCount: number
  onCreateChannel: () => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  
  const channelsByType = channels.reduce((acc, channel) => {
    const type = channel.type
    if (!acc[type]) acc[type] = []
    acc[type].push(channel)
    return acc
  }, {} as Record<string, Channel[]>)
  
  const typeLabels: Record<string, string> = {
    public: '🏰 Öffentliche Hallen',
    vip: '👑 VIP Gemächer',
    game: '🎮 Spielstuben',
    clan: '⚔️ Clan Räume',
    private: '🔒 Private Räume',
  }

  return (
    <div className="hidden lg:flex w-64 bg-metal-900/80 border-r border-gold-900/30 flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gold-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-amber-700 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="font-medieval-decorative font-bold text-gold-400">ELDRUN</h2>
            <p className="text-xs text-metal-500">{onlineCount} Online</p>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
          <input
            type="text"
            placeholder="Suchen..."
            className="w-full pl-9 pr-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-sm text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none"
          />
        </div>
      </div>
      
      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.entries(channelsByType).map(([type, typeChannels]) => (
          <div key={type} className="mb-4">
            <button
              onClick={() => setCollapsed({ ...collapsed, [type]: !collapsed[type] })}
              className="w-full flex items-center gap-2 px-2 py-1 text-xs font-medieval text-metal-500 hover:text-metal-300 uppercase tracking-wider"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${collapsed[type] ? '-rotate-90' : ''}`} />
              {typeLabels[type] || type}
            </button>
            
            {!collapsed[type] && (
              <div className="space-y-0.5 mt-1">
                {typeChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                      currentChannelId === channel.id
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                        : 'text-metal-400 hover:bg-metal-800 hover:text-white'
                    }`}
                  >
                    <ChannelIcon type={channel.type} icon={channel.icon} />
                    <span className="flex-1 truncate text-sm">{channel.name}</span>
                    {channel.isLocked && <Lock className="w-3 h-3 text-metal-600" />}
                    {channel.userCount > 0 && (
                      <span className="text-xs text-metal-600">{channel.userCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Create Channel Button */}
      <div className="p-3 border-t border-metal-800">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCreateChannel}
          className="w-full gap-2 text-metal-400 hover:text-gold-400"
        >
          <Plus className="w-4 h-4" />
          Channel erstellen
        </Button>
      </div>
    </div>
  )
}

function UsersSidebar({ users, onUserClick }: { users: ChatUser[], onUserClick?: (user: ChatUser) => void }) {
  const onlineUsers = users.filter(u => u.status === 'online')
  const awayUsers = users.filter(u => u.status === 'away')
  const offlineUsers = users.filter(u => u.status === 'offline' || u.status === 'invisible')

  const UserItem = ({ user }: { user: ChatUser }) => (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-metal-800/50 cursor-pointer group">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-amber-800 flex items-center justify-center text-white text-sm font-bold">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <UserStatusBadge status={user.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span 
            className="text-sm font-medium truncate"
            style={{ color: user.customColor || '#fff' }}
          >
            {user.displayName}
          </span>
          <RoleBadge role={user.role} />
        </div>
        {user.statusMessage && (
          <p className="text-xs text-metal-500 truncate">{user.statusMessage}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-60 bg-metal-900/80 border-l border-gold-900/30 flex flex-col">
      <div className="p-4 border-b border-gold-900/30">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-500" />
          <span className="font-medieval text-gold-400">Anwesende</span>
          <span className="text-xs text-metal-500">({users.length})</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {onlineUsers.length > 0 && (
          <div className="mb-4">
            <p className="px-3 py-1 text-xs font-medieval text-green-500 uppercase tracking-wider">
              Online — {onlineUsers.length}
            </p>
            {onlineUsers.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </div>
        )}
        
        {awayUsers.length > 0 && (
          <div className="mb-4">
            <p className="px-3 py-1 text-xs font-medieval text-yellow-500 uppercase tracking-wider">
              Abwesend — {awayUsers.length}
            </p>
            {awayUsers.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ChatPage() {
  const { currentUser, openAuthModal } = useStore()
  const {
    channels,
    messages,
    onlineUsers,
    currentChannelId,
    setCurrentChannel,
    sendMessage,
    addReaction,
    createChannel,
    sendEldruns,
    sendHeart,
    sendRose,
    sendKiss,
    typingUsers,
    compactMode,
    isApiEnabled,
    syncChannels,
    syncMessagesForChannel,
  } = useChatStore()
  
  const [messageInput, setMessageInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [isModerating, setIsModerating] = useState(false)
  const [moderationWarning, setModerationWarning] = useState<string | null>(null)
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null)
  const [voiceParticipants, setVoiceParticipants] = useState<ChatUser[]>([])
  const [showCreateVoiceChannel, setShowCreateVoiceChannel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    void syncChannels()
  }, [syncChannels])

  useEffect(() => {
    const ids = ['voice-gaming', 'voice-events', 'voice-vip', 'voice-clan']
    const existing = new Set(channels.map((c) => c.id))
    if (ids.every((id) => existing.has(id))) return

    if (!existing.has('voice-gaming')) {
      createChannel({
        id: 'voice-gaming',
        name: '🎮 Gaming Squad',
        description: 'Für Raids und Clan-Fights',
        type: 'voice',
        icon: '🎮',
        maxUsers: 20,
        userCount: 0,
        allowVoice: true,
      })
    }

    if (!existing.has('voice-events')) {
      createChannel({
        id: 'voice-events',
        name: '📢 Event Broadcast',
        description: 'Für Live-Events und Ankündigungen',
        type: 'voice',
        icon: '📢',
        maxUsers: 100,
        userCount: 0,
        allowVoice: true,
      })
    }

    if (!existing.has('voice-vip')) {
      createChannel({
        id: 'voice-vip',
        name: '👑 VIP Lounge',
        description: 'Exklusiv für VIP-Mitglieder',
        type: 'voice',
        icon: '👑',
        vipOnly: true,
        isLocked: true,
        inviteOnly: true,
        maxUsers: 15,
        userCount: 0,
        allowVoice: true,
      })
    }

    if (!existing.has('voice-clan')) {
      createChannel({
        id: 'voice-clan',
        name: '⚔️ Clan War Room',
        description: 'Koordination & Strategien',
        type: 'voice',
        icon: '⚔️',
        inviteOnly: true,
        maxUsers: 30,
        userCount: 0,
        allowVoice: true,
      })
    }
  }, [channels, createChannel])

  useEffect(() => {
    if (!isApiEnabled || !currentChannelId) return
    const interval = setInterval(() => {
      void syncMessagesForChannel(currentChannelId)
    }, 5000)
    return () => clearInterval(interval)
  }, [isApiEnabled, currentChannelId, syncMessagesForChannel])
  
  const currentChannel = channels.find(c => c.id === currentChannelId)
  const channelMessages = useMemo(
    () => (currentChannelId ? messages[currentChannelId] || [] : []),
    [currentChannelId, messages]
  )

  const voiceUser: ChatUser = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username || 'User',
        displayName: currentUser.displayName || currentUser.username || 'User',
        avatar: currentUser.avatar,
        level: currentUser.level || 1,
        xp: currentUser.xp || 0,
        status: 'online',
        role: (currentUser.role as any) || 'user',
        loyaltyTier: 'copper',
        loyaltyPoints: 0,
        badges: [],
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        eldruns: 0,
        eldrunsReceived: 0,
        eldrunsSent: 0,
        hearts: 0,
        heartsGiven: null,
        roses: 0,
        rosesReceived: 0,
        kisses: 0,
        profileViews: 0,
      }
    : {
        id: 'guest',
        username: 'gast',
        displayName: 'Gast',
        avatar: '',
        level: 0,
        xp: 0,
        status: 'offline',
        role: 'user',
        loyaltyTier: 'copper',
        loyaltyPoints: 0,
        badges: [],
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        eldruns: 0,
        eldrunsReceived: 0,
        eldrunsSent: 0,
        hearts: 0,
        heartsGiven: null,
        roses: 0,
        rosesReceived: 0,
        kisses: 0,
        profileViews: 0,
      }

  const voiceChannels = useMemo(() => channels.filter((c) => c.type === 'voice'), [channels])
  const currentVoiceChannel = useMemo(
    () => voiceChannels.find((c) => c.id === activeVoiceChannelId),
    [voiceChannels, activeVoiceChannelId]
  )

  const handleJoinVoice = (channelId: string) => {
    const channel = voiceChannels.find((c) => c.id === channelId)
    if (!channel) return

    if (!currentUser) {
      addToast({
        title: 'Nicht angemeldet',
        message: 'Bitte melde dich an, um Voice-Räumen beizutreten.',
        type: 'error',
      })
      openAuthModal('login')
      return
    }

    if (channel.vipOnly && currentUser.role !== 'vip' && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      addToast({
        title: 'VIP erforderlich',
        message: 'Dieser Voice-Raum ist exklusiv für VIP-Mitglieder.',
        type: 'error',
      })
      return
    }

    if (channel.userCount >= channel.maxUsers) {
      addToast({
        title: 'Raum voll',
        message: 'Dieser Voice-Raum ist aktuell voll.',
        type: 'error',
      })
      return
    }

    setActiveVoiceChannelId(channelId)
    setVoiceParticipants(onlineUsers.filter((u) => u.status === 'online').slice(0, 6))
  }

  const handleLeaveVoice = () => {
    setActiveVoiceChannelId(null)
    setVoiceParticipants([])
  }
  
  // Scroll only within the messages container, not the whole page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [channelMessages])
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChannelId) return

    if (!currentUser) {
      addToast({
        title: 'Nicht angemeldet',
        message: 'Bitte melde dich an, um Nachrichten zu senden.',
        type: 'error',
      })
      openAuthModal('login')
      return
    }

    // Skip moderation for admins and mods
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      setIsModerating(true)
      setModerationWarning(null)
      
      try {
        const response = await fetch('/api/ai/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: messageInput,
            userId: currentUser.id,
            context: 'chat'
          })
        })
        
        const data = await response.json()
        
        if (!data.result.isAllowed) {
          setModerationWarning(data.result.reason || 'Nachricht verstößt gegen Community-Richtlinien')
          setIsModerating(false)
          return
        }
      } catch (error) {
        console.error('Moderation check failed:', error)
        // Allow message if moderation fails
      } finally {
        setIsModerating(false)
      }
    }

    const role = currentUser.role
    const chatRole =
      role === 'admin' ? 'admin' : role === 'moderator' ? 'moderator' : role === 'vip' ? 'vip_gold' : 'user'
    
    sendMessage(currentChannelId, {
      userId: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      userRole: chatRole,
      userBadges: [],
      type: 'text',
      content: messageInput,
      mentions: [],
      replyTo: replyingTo ? {
        id: replyingTo.id,
        username: replyingTo.username,
        content: replyingTo.content,
      } : undefined,
    })
    
    setMessageInput('')
    setReplyingTo(null)
    setModerationWarning(null)
  }
  
  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji, currentUser?.id || 'guest')
  }

  return (
    <AuthGate>
    <div className="bg-metal-950 flex flex-col h-screen pt-24 overflow-hidden">
      {/* Hero Header */}
      <div className="relative flex-none border-b border-gold-900/30 bg-gradient-to-r from-metal-900 via-metal-950 to-metal-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-medieval-decorative text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600">
                  COMMUNITY CHAT
                </h1>
                <p className="text-sm text-metal-500 font-medieval tracking-wider">
                  Die Große Halle von ELDRUN
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-metal-800/50 rounded-full border border-metal-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-metal-400">{onlineUsers.filter(u => u.status === 'online').length} Online</span>
              </div>
              <Button variant="ghost" size="sm" className="text-metal-400">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Channel Sidebar */}
        <ChannelSidebar 
          channels={channels}
          currentChannelId={currentChannelId}
          onSelectChannel={setCurrentChannel}
          onlineCount={onlineUsers.filter(u => u.status === 'online').length}
          onCreateChannel={() => setShowCreateChannel(true)}
        />
        
        {/* Chat Content */}
        <div className="flex-1 flex flex-col bg-metal-950">
          {/* Channel Header */}
          {currentChannel && (
            <div className="px-4 py-3 border-b border-metal-800 flex items-center justify-between bg-metal-900/50">
              <div className="flex items-center gap-3">
                <ChannelIcon type={currentChannel.type} icon={currentChannel.icon} />
                <div>
                  <h2 className="font-medieval font-bold text-white">{currentChannel.name}</h2>
                  <p className="text-xs text-metal-500">{currentChannel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-metal-400">
                  <Pin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-metal-400">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-metal-400">
                  <Users className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Welcome Message */}
          {currentChannel?.welcomeMessage && (
            <div className="px-4 py-3 bg-gradient-to-r from-gold-500/10 to-transparent border-b border-gold-500/20">
              <p className="text-gold-400 text-sm font-medieval">{currentChannel.welcomeMessage}</p>
            </div>
          )}
          
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
            {channelMessages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                onReply={setReplyingTo}
                onReact={handleReaction}
                compact={compactMode}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Typing Indicator */}
          {currentChannelId && typingUsers[currentChannelId]?.length > 0 && (
            <div className="px-4 py-2 text-xs text-metal-500">
              <span className="animate-pulse">Jemand tippt...</span>
            </div>
          )}
          
          {/* Reply Preview */}
          {replyingTo && (
            <div className="px-4 py-2 bg-metal-800 border-t border-metal-700 flex items-center gap-3">
              <Reply className="w-4 h-4 text-metal-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-metal-400">Antwort an <strong>{replyingTo.username}</strong></p>
                <p className="text-xs text-metal-500 truncate">{replyingTo.content}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-metal-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Moderation Warning */}
          {moderationWarning && (
            <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/30">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-400">{moderationWarning}</p>
                <button 
                  onClick={() => setModerationWarning(null)}
                  className="ml-auto text-red-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <div className="p-4 border-t border-metal-800 bg-metal-900/50">
            <div className="flex items-end gap-3">
              <div className="flex gap-1">
                <button className="p-2 text-metal-500 hover:text-gold-400 hover:bg-metal-800 rounded-lg transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder={`Nachricht an #${currentChannel?.name || 'Chat'}...`}
                  rows={1}
                  disabled={isModerating}
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:border-gold-500/50 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isModerating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-1 relative">
                <button 
                  onClick={() => setShowGiftModal(true)}
                  className="p-2 text-metal-500 hover:text-pink-400 hover:bg-metal-800 rounded-lg transition-colors"
                >
                  <Gift className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-metal-500 hover:text-gold-400 hover:bg-metal-800 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isModerating}
                  className="p-2 bg-gold-500 hover:bg-gold-400 disabled:bg-metal-700 disabled:text-metal-500 text-black rounded-lg transition-colors"
                >
                  {isModerating ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
                
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onSelect={(emoji) => setMessageInput(prev => prev + emoji)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 bg-metal-900/50 border-l border-metal-800 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-metal-800 flex items-center justify-between bg-metal-900/60">
            <span className="text-sm font-semibold text-white">VOICE RÄUME</span>
            <button
              onClick={() => {
                if (!currentUser) {
                  addToast({
                    title: 'Nicht angemeldet',
                    message: 'Bitte melde dich an, um Voice-Räume zu erstellen.',
                    type: 'error',
                  })
                  openAuthModal('login')
                  return
                }
                setShowCreateVoiceChannel(true)
              }}
              className="text-metal-400 hover:text-white transition-colors text-sm"
              title="Voice-Raum erstellen"
            >
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <VoiceChannelList
              channels={voiceChannels}
              currentUser={voiceUser}
              onJoinVoice={handleJoinVoice}
              activeVoiceChannelId={activeVoiceChannelId || undefined}
              onCreateVoiceChannel={() => {
                if (!currentUser) {
                  addToast({
                    title: 'Nicht angemeldet',
                    message: 'Bitte melde dich an, um Voice-Räume zu erstellen.',
                    type: 'error',
                  })
                  openAuthModal('login')
                  return
                }
                setShowCreateVoiceChannel(true)
              }}
            />
          </div>
        </div>
        
        {/* Users Sidebar */}
        <UsersSidebar users={onlineUsers} />
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showCreateChannel && (
          <CreateChannelModal
            onClose={() => setShowCreateChannel(false)}
            onCreate={(data) => {
              createChannel(data)
              setShowCreateChannel(false)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateVoiceChannel && currentUser && (
          <CreateVoiceChannelModal
            onClose={() => setShowCreateVoiceChannel(false)}
            onCreate={(data) => {
              createChannel({
                name: `${data.icon} ${data.name}`,
                description: data.description,
                type: 'voice',
                icon: data.icon,
                maxUsers: data.maxUsers,
                isLocked: data.isPrivate,
                inviteOnly: data.isPrivate,
                allowVoice: true,
              })
              setShowCreateVoiceChannel(false)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVoiceChannelId && currentVoiceChannel && currentUser && (
          <VoiceRoom
            roomId={currentVoiceChannel.id}
            roomName={currentVoiceChannel.name}
            roomIcon={currentVoiceChannel.icon}
            maxUsers={currentVoiceChannel.maxUsers}
            isPrivate={currentVoiceChannel.isLocked}
            currentUser={voiceUser}
            participants={voiceParticipants}
            onLeave={handleLeaveVoice}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showGiftModal && (
          <GiftModal
            onClose={() => setShowGiftModal(false)}
            users={onlineUsers}
            onSend={(userId, type, amount) => {
              const targetUser = onlineUsers.find(u => u.id === userId)
              if (!targetUser || !currentChannelId) return

              if (!currentUser) {
                openAuthModal('login')
                return
              }
              
              if (type === 'eldrun') {
                sendEldruns(currentUser.id, userId, amount)
                sendMessage(currentChannelId, {
                  userId: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName || currentUser.username,
                  userRole: 'user',
                  userBadges: [],
                  type: 'eldrun',
                  content: '',
                  eldrunAmount: amount,
                  eldrunRecipient: targetUser.username,
                  mentions: [],
                })
              } else if (type === 'heart') {
                sendHeart(currentUser.id, userId)
                sendMessage(currentChannelId, {
                  userId: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName || currentUser.username,
                  userRole: 'user',
                  userBadges: [],
                  type: 'heart',
                  content: '',
                  heartRecipient: targetUser.username,
                  mentions: [],
                })
              } else if (type === 'rose') {
                sendRose(currentUser.id, userId, 'rot', '')
                sendMessage(currentChannelId, {
                  userId: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName || currentUser.username,
                  userRole: 'user',
                  userBadges: [],
                  type: 'rose',
                  content: '',
                  roseRecipient: targetUser.username,
                  roseColor: 'rot',
                  mentions: [],
                })
              } else if (type === 'kiss') {
                sendKiss(currentUser.id, userId)
                sendMessage(currentChannelId, {
                  userId: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName || currentUser.username,
                  userRole: 'user',
                  userBadges: [],
                  type: 'kiss',
                  content: '',
                  kissRecipient: targetUser.username,
                  mentions: [],
                })
                addToast({
                  type: 'success',
                  title: '💋 Kuss geschickt!',
                  message: `An ${targetUser.displayName || targetUser.username}`,
                })
              }
              
              setShowGiftModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </AuthGate>
  )
}
