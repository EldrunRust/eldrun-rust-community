'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Send, Search, Plus, Trash2, Archive,
  MoreHorizontal, User, Users, Clock, Check, CheckCheck,
  Image as ImageIcon, Smile, Paperclip, Star, StarOff,
  ChevronLeft, Settings, Bell, BellOff, X
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, Conversation, PrivateMessage } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { useTypingChannel } from '@/hooks/useTypingChannel'

// Conversations are loaded from API/store
type ConversationWithMessages = Conversation & { messages: PrivateMessage[] }

export function MessagesClient() {
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { currentUser, openAuthModal } = useStore()
  const { conversations: storeConversations } = useForumStore()

  const activeConversation = conversations.find(c => c.id === selectedConversation)

  const { typingUsers, setTyping } = useTypingChannel(
    'dm',
    selectedConversation || 'none',
    currentUser ? { userId: currentUser.id, username: currentUser.displayName || currentUser.username } : null
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !currentUser) return
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: messageInput.trim()
        })
      })
      
      if (res.ok) {
        const newMessage = await res.json()
        // Add message to local state
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, messages: [...c.messages, newMessage] }
            : c
        ))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    
    setMessageInput('')
    setTyping(false)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Gerade eben'
    if (hours < 24) return `vor ${hours}h`
    if (days < 7) return `vor ${days}d`
    return new Date(date).toLocaleDateString('de-DE')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-metal-900/50 border border-metal-800 rounded-xl max-w-md">
          <User className="w-12 h-12 text-rust-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Anmeldung erforderlich</h2>
          <p className="text-metal-400 mb-6">Melde dich an, um deine Nachrichten zu sehen.</p>
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
          >
            Anmelden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Link href="/forum" className="p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-metal-400" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Nachrichten</h1>
              <p className="text-metal-400 text-sm">{conversations.length} Konversationen</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neue Nachricht
          </button>
        </motion.div>

        {/* Messages Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
          style={{ height: 'calc(100vh - 220px)' }}
        >
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-metal-800 flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
              {/* Search */}
              <div className="p-4 border-b border-metal-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Konversationen durchsuchen..."
                    className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder-metal-500 text-sm focus:outline-none focus:border-rust-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                  const otherParticipant = conv.participants.find(p => p.userId !== 'current')
                  const lastMessage = conv.messages[conv.messages.length - 1]

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-metal-800/50 transition-colors border-b border-metal-800/50 ${
                        selectedConversation === conv.id ? 'bg-metal-800/50' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rust-500 to-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {otherParticipant?.userName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white truncate">
                            {conv.title || otherParticipant?.userName}
                          </span>
                          <span className="text-xs text-metal-500">{formatTime(conv.updatedAt)}</span>
                        </div>
                        <p className="text-sm text-metal-400 truncate mt-0.5">
                          {lastMessage?.senderId === 'current' && <span className="text-metal-500">Du: </span>}
                          {lastMessage?.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-rust-500 text-white text-xs font-bold rounded-full mt-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}

                {conversations.length === 0 && (
                  <div className="p-8 text-center">
                    <User className="w-12 h-12 text-metal-700 mx-auto mb-4" />
                    <p className="text-metal-500">Keine Nachrichten</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat View */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-metal-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 hover:bg-metal-800 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5 text-metal-400" />
                      </button>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rust-500 to-amber-600 flex items-center justify-center text-white font-bold">
                        {activeConversation.participants.find(p => p.userId !== 'current')?.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {activeConversation.title || activeConversation.participants.find(p => p.userId !== 'current')?.userName}
                        </h3>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
                        <Bell className="w-5 h-5 text-metal-400" />
                      </button>
                      <button className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-metal-400" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeConversation.messages.map((msg, idx) => {
                      const isOwn = msg.senderId === 'current'
                      const showAvatar = idx === 0 || activeConversation.messages[idx - 1].senderId !== msg.senderId

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          {showAvatar ? (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                              isOwn 
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                                : 'bg-gradient-to-br from-rust-500 to-amber-600'
                            }`}>
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-8" />
                          )}
                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl ${
                              isOwn 
                                ? 'bg-rust-500 text-white rounded-br-md' 
                                : 'bg-metal-800 text-white rounded-bl-md'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-metal-500 ${isOwn ? 'justify-end' : ''}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isOwn && (
                                msg.isRead 
                                  ? <CheckCheck className="w-3 h-3 text-blue-400" />
                                  : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-metal-800">
                    {typingUsers.length > 0 && (
                      <div className="px-4 pb-2 text-xs text-metal-400">
                        <span className="text-white">{typingUsers[0].username}</span> tippt...
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5 text-metal-400" />
                      </button>
                      <button className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
                        <ImageIcon className="w-5 h-5 text-metal-400" />
                      </button>
                      <textarea
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value)
                          setTyping(true)
                        }}
                        onFocus={() => setTyping(true)}
                        onBlur={() => setTyping(false)}
                        placeholder="Nachricht schreiben..."
                        className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 resize-none"
                        rows={2}
                      />
                      <button className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
                        <Smile className="w-5 h-5 text-metal-400" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="p-2 bg-rust-500 hover:bg-rust-400 disabled:bg-metal-700 rounded-xl transition-colors"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-metal-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Send className="w-10 h-10 text-metal-600" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">Deine Nachrichten</h3>
                    <p className="text-metal-400 mb-4">Wähle eine Konversation oder starte eine neue</p>
                    <button
                      onClick={() => setShowNewMessage(true)}
                      className="px-4 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
                    >
                      Neue Nachricht
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowNewMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-metal-900 border border-metal-800 rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-metal-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-white">Neue Nachricht</h3>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="p-1 hover:bg-metal-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-metal-400" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-metal-400 text-sm mb-2">Empfänger</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                    <input
                      type="text"
                      value={newMessageRecipient}
                      onChange={(e) => setNewMessageRecipient(e.target.value)}
                      placeholder="Benutzername eingeben..."
                      className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-metal-400 text-sm mb-2">Nachricht</label>
                  <textarea
                    placeholder="Deine Nachricht..."
                    className="w-full h-32 px-4 py-2 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 resize-none"
                  />
                </div>
                <button className="w-full py-3 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors">
                  Nachricht senden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
