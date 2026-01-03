'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Send, Smile, ChevronDown, ChevronUp, 
  Minimize2, Maximize2, MoreHorizontal, Image as ImageIcon,
  Crown, Sparkles, Star
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, ShoutboxMessage } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { useSmileyStore, SmileyCategory } from '@/store/smileyStore'

export function ForumShoutbox() {
  const [message, setMessage] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    shoutboxMessages, 
    isShoutboxExpanded, 
    isShoutboxMinimized,
    toggleShoutboxExpanded,
    toggleShoutboxMinimized,
    addShoutboxMessage 
  } = useForumStore()
  const { currentUser, openAuthModal } = useStore()
  const { smileys, getFreeSmileys, addToRecent, recentSmileys } = useSmileyStore()
  const [emojiCategory, setEmojiCategory] = useState<SmileyCategory | 'recent'>('smileys')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isShoutboxExpanded && !isShoutboxMinimized) {
      scrollToBottom()
    }
  }, [shoutboxMessages, isShoutboxExpanded, isShoutboxMinimized])

  const handleSend = () => {
    if (!message.trim() || !currentUser) return

    const newMessage: ShoutboxMessage = {
      id: `shout-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.displayName || currentUser.username,
      authorAvatar: currentUser.avatar,
      authorRank: 'member',
      authorFaction: currentUser.faction || undefined,
      content: message.trim(),
      timestamp: new Date(),
      reactions: []
    }

    addShoutboxMessage(newMessage)
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Get smileys from store based on category
  const getDisplaySmileys = () => {
    if (emojiCategory === 'recent') {
      return recentSmileys
        .map(id => smileys.find(s => s.id === id))
        .filter(Boolean)
        .slice(0, 16)
    }
    return smileys
      .filter(s => s.category === emojiCategory && s.rarity === 'free')
      .slice(0, 24)
  }
  
  const EMOJI_CATEGORIES: { key: SmileyCategory | 'recent'; label: string; icon: string }[] = [
    { key: 'recent', label: 'Zuletzt', icon: '🕐' },
    { key: 'smileys', label: 'Smileys', icon: '😀' },
    { key: 'reactions', label: 'Reaktionen', icon: '👍' },
    { key: 'gaming', label: 'Gaming', icon: '⚔️' },
    { key: 'animals', label: 'Tiere', icon: '🐉' },
    { key: 'fantasy', label: 'Fantasy', icon: '🔮' },
  ]

  if (isShoutboxMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-metal-900/50 border border-metal-800 rounded-xl"
      >
        <button
          onClick={toggleShoutboxMinimized}
          className="w-full flex items-center justify-between p-4 hover:bg-metal-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rust-400" />
            <span className="font-display font-bold text-white">Shoutbox</span>
            <span className="px-2 py-0.5 bg-rust-500/20 text-rust-400 text-xs rounded-full">
              {shoutboxMessages.length}
            </span>
          </div>
          <Maximize2 className="w-4 h-4 text-metal-500" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-metal-800 bg-gradient-to-r from-metal-900 to-metal-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-rust-400" />
          <h3 className="font-display font-bold text-white">Shoutbox</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleShoutboxExpanded}
            className="p-1.5 hover:bg-metal-800 rounded-lg transition-colors"
          >
            {isShoutboxExpanded ? (
              <ChevronUp className="w-4 h-4 text-metal-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-metal-400" />
            )}
          </button>
          <button
            onClick={toggleShoutboxMinimized}
            className="p-1.5 hover:bg-metal-800 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-metal-400" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isShoutboxExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-metal-700 scrollbar-track-metal-900">
              {shoutboxMessages.map((msg, index) => (
                <ShoutboxMessageItem key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-metal-800 bg-metal-900/50">
              {currentUser ? (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Schreibe eine Nachricht..."
                        className="w-full px-4 py-2 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 text-sm"
                        maxLength={200}
                      />
                      <button
                        onClick={() => setShowEmojis(!showEmojis)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-metal-500 hover:text-white transition-colors"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="p-2 bg-rust-500 hover:bg-rust-400 disabled:bg-metal-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Emoji Picker - Integrated with Smiley Store */}
                  <AnimatePresence>
                    {showEmojis && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 p-2 bg-metal-800 border border-metal-700 rounded-xl shadow-xl w-72"
                      >
                        {/* Category Tabs */}
                        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                          {EMOJI_CATEGORIES.map((cat) => (
                            <button
                              key={cat.key}
                              onClick={() => setEmojiCategory(cat.key)}
                              className={`px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                emojiCategory === cat.key 
                                  ? 'bg-rust-500 text-white' 
                                  : 'bg-metal-700 text-metal-400 hover:bg-metal-600'
                              }`}
                            >
                              {cat.icon}
                            </button>
                          ))}
                        </div>
                        {/* Emoji Grid */}
                        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                          {getDisplaySmileys().map((smiley) => smiley && (
                            <button
                              key={smiley.id}
                              onClick={() => {
                                setMessage((prev) => prev + smiley.emoji)
                                addToRecent(smiley.id)
                                setShowEmojis(false)
                              }}
                              className="p-1.5 hover:bg-metal-700 rounded text-lg transition-colors"
                              title={smiley.name}
                            >
                              {smiley.emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-2 text-center text-metal-400 hover:text-rust-400 text-sm transition-colors"
                >
                  Melde dich an, um zu schreiben
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ShoutboxMessageItem({ message }: { message: ShoutboxMessage }) {
  const rankInfo = getRankInfo(message.authorRank)
  const factionInfo = message.authorFaction ? getFactionInfo(message.authorFaction) : null

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group"
    >
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
          factionInfo 
            ? `bg-gradient-to-br ${factionInfo.gradient}` 
            : 'bg-gradient-to-br from-rust-500 to-amber-600'
        }`}>
          {message.authorAvatar ? (
            <img
              src={message.authorAvatar}
              alt=""
              className="w-full h-full rounded-lg object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/default.svg'
              }}
            />
          ) : (
            message.authorName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${factionInfo ? factionInfo.color : rankInfo.color}`}>
              {message.authorName}
            </span>
            <span className="text-metal-600 text-xs">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-metal-300 text-sm break-words">{message.content}</p>
        </div>
      </div>
    </motion.div>
  )
}
