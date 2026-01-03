'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, Paperclip, Image, Smile, Plus, Search, Filter, 
  Settings, Users, Phone, Video, Pin, Bookmark, Share2, MoreVertical,
  Hash, Lock, Crown, Zap, Gift, Heart, Star, Calendar, Clock,
  ChevronLeft, ChevronRight, Volume2, VolumeX, Bell, BellOff,
  Edit3, Trash2, Archive, Flag, UserPlus, AtSign, Link2,
  Bold, Italic, Strikethrough, Code, Quote, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Palette, Sun, Moon,
  Wifi, WifiOff, Download, Upload, RefreshCw, Eye, EyeOff,
  MessageSquare, ThumbsUp, ThumbsDown, Laugh, Angry, Heart as HeartIcon,
  Award, Trophy, Target, Flame, Sparkles, PartyPopper, X
} from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useStore } from '@/store/useStore'
import { UltimateEmojiPicker } from './UltimateEmojiPicker'

interface UltimateChatInterfaceProps {
  channelId?: string
  isDM?: boolean
  className?: string
}

export function UltimateChatInterface({ 
  channelId: propChannelId, 
  isDM = false, 
  className = '' 
}: UltimateChatInterfaceProps) {
  // Store hooks
  const { 
    channels, 
    messages, 
    onlineUsers, 
    currentChannelId, 
    setCurrentChannel,
    sendMessage,
    addReaction,
    createThread,
    createPoll,
    scheduleMessage,
    executeSlashCommand,
    addCommandToHistory,
    toggleSound,
    toggleNotifications,
    toggleCompactMode,
    setTheme,
    generateAISummary,
    createCanvas,
    addSharedFile,
    recentEmojis,
    frequentEmojis,
    customEmojis,
    slashCommands,
    commandHistory,
    soundEnabled,
    notificationsEnabled,
    compactMode,
    theme
  } = useChatStore()
  
  const { currentUser } = useStore()

  // Local state
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showThreadCreator, setShowThreadCreator] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState(onlineUsers)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [draggedFile, setDraggedFile] = useState<File | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(theme)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showVIPPanel, setShowVIPPanel] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showCanvasPanel, setShowCanvasPanel] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Current channel
  const activeChannelId = propChannelId || currentChannelId
  const currentChannel = useMemo(() => 
    channels.find(c => c.id === activeChannelId), 
    [channels, activeChannelId]
  )
  const channelMessages = useMemo(() => 
    messages[activeChannelId || ''] || [], 
    [messages, activeChannelId]
  )

  // Filter users based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(onlineUsers)
    } else {
      setFilteredUsers(
        onlineUsers.filter(user => 
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [searchQuery, onlineUsers])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages])

  // Handle typing indicator
  useEffect(() => {
    if (messageInput.trim()) {
      if (!isTyping) {
        setIsTyping(true)
        // Send typing indicator to server
      }
    } else {
      setIsTyping(false)
    }
  }, [messageInput, isTyping])

  // Handle message sending
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !currentUser || !currentChannelId) return

    // Check for slash commands
    if (messageInput.startsWith('/')) {
      const [command, ...args] = messageInput.slice(1).split(' ')
      executeSlashCommand(command, args, currentChannelId, currentUser.id)
      addCommandToHistory(messageInput)
      setMessageInput('')
      return
    }

    // Send regular message
    const message = {
      userId: currentUser.id,
      username: currentUser.username,
      content: messageInput.trim(),
      type: 'text' as const,
      replyTo: replyingTo ? { id: replyingTo, username: '', content: '' } : undefined,
      editOf: editingMessage ? { id: editingMessage, username: '', content: '' } : undefined,
    }

    sendMessage(activeChannelId || '', message)
    setMessageInput('')
    setReplyingTo(null)
    setEditingMessage(null)
  }, [messageInput, currentUser, activeChannelId, replyingTo, editingMessage, sendMessage, executeSlashCommand, addCommandToHistory, currentChannelId])

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string, type: 'emoji' | 'custom' | 'animated' | 'sticker' | 'gif') => {
    if (type === 'sticker' || type === 'gif') {
      // Send as separate message
      const message = {
        userId: currentUser?.id || '',
        username: currentUser?.username || '',
        content: emoji,
        type: type as 'sticker' | 'gif',
      }
      if (activeChannelId) {
        sendMessage(activeChannelId || '', message)
      }
    } else {
      // Add to input
      setMessageInput(prev => prev + emoji)
      messageInputRef.current?.focus()
    }
    setShowEmojiPicker(false)
  }, [currentUser, activeChannelId, sendMessage])

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!currentUser || !activeChannelId) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const message = {
        userId: currentUser.id,
        username: currentUser.username,
        content,
        type: 'image' as const,
        fileName: file.name,
        fileSize: file.size,
      }
      sendMessage(activeChannelId || '', message)
    }
    reader.readAsDataURL(file)
  }, [currentUser, activeChannelId, sendMessage])

  // Handle voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (currentUser && activeChannelId) {
          const message = {
            userId: currentUser.id,
            username: currentUser.username,
            content: audioUrl,
            type: 'voice' as const,
            duration: recordingTime,
          }
          sendMessage(activeChannelId || '', message)
        }
        
        setRecordingTime(0)
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [currentUser, activeChannelId, sendMessage, recordingTime])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get message reactions
  const getMessageReactions = (messageId: string) => {
    const message = channelMessages.find(m => m.id === messageId)
    return message?.reactions || []
  }

  // Handle reaction
  const handleReaction = useCallback((messageId: string, emoji: string) => {
    if (!currentUser) return
    addReaction(messageId, emoji, currentUser.id)
  }, [currentUser, addReaction])

  // Handle thread creation
  const handleCreateThread = useCallback((messageId: string) => {
    createThread(messageId, activeChannelId || '')
    setShowThreadCreator(false)
  }, [createThread, activeChannelId])

  // Handle poll creation
  const handleCreatePoll = useCallback((question: string, options: string[]) => {
    const messageId = `msg-${Date.now()}`
    createPoll(messageId, question, options, new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24 hours
    setShowPollCreator(false)
  }, [createPoll])

  // Handle theme change
  const handleThemeChange = useCallback((newTheme: string) => {
    setSelectedTheme(newTheme as any)
    setTheme(newTheme as any)
  }, [setTheme])

  // Handle font size change
  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
  }, [])

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full bg-metal-900">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-metal-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Select a Channel</h3>
          <p className="text-metal-400">Choose a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-metal-900 ${className}`}>
      {/* Channel Header */}
      <div className="flex items-center justify-between p-4 border-b border-metal-800 bg-metal-800/50">
        <div className="flex items-center gap-3">
          {currentChannel.icon && (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentChannel.color}`}>
              {currentChannel.icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {currentChannel.name}
              {currentChannel.isLocked && <Lock className="w-4 h-4 text-rust-400" />}
              {currentChannel.vipOnly && <Crown className="w-4 h-4 text-yellow-400" />}
            </h3>
            <p className="text-sm text-metal-400">{currentChannel.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-metal-700 rounded-lg transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4 text-metal-400" />
          </button>
          
          {/* User List */}
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 hover:bg-metal-700 rounded-lg transition-colors relative"
            title="Online Users"
          >
            <Users className="w-4 h-4 text-metal-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
          </button>
          
          {/* Voice/Video Call */}
          <div className="flex gap-1">
            <button
              className="p-2 hover:bg-metal-700 rounded-lg transition-colors"
              title="Voice Call"
            >
              <Phone className="w-4 h-4 text-metal-400" />
            </button>
            <button
              className="p-2 hover:bg-metal-700 rounded-lg transition-colors"
              title="Video Call"
            >
              <Video className="w-4 h-4 text-metal-400" />
            </button>
          </div>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-metal-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-metal-400" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-metal-800 bg-metal-800/30"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-metal-500" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:border-rust-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div 
          className={`flex-1 flex flex-col ${showUserList ? 'border-r border-metal-800' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          <AnimatePresence>
            {isDraggingOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rust-600/20 border-2 border-dashed border-rust-400 z-10 flex items-center justify-center"
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-rust-400 mx-auto mb-2" />
                  <p className="text-rust-400 font-semibold">Drop file here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 ${compactMode ? 'space-y-1' : 'space-y-4'}`}>
            {channelMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group ${compactMode ? 'text-sm' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center text-white font-semibold text-sm">
                    {message.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{message.username}</span>
                      <span className="text-xs text-metal-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                      {message.editedAt && (
                        <span className="text-xs text-metal-500">(edited)</span>
                      )}
                    </div>
                    
                    <div className="text-white">
                      {message.type === 'text' && (
                        <p className="break-words">{message.content}</p>
                      )}
                      {message.type === 'image' && (
                        <img src={message.content} alt="Image" className="max-w-full rounded-lg" />
                      )}
                      {message.type === 'voice' && (
                        <audio controls className="w-full">
                          <source src={message.content} type="audio/webm" />
                        </audio>
                      )}
                      {message.type === 'gif' && (
                        <img src={message.content} alt="GIF" className="max-w-full rounded-lg" />
                      )}
                      {message.type === 'sticker' && (
                        <img src={message.content} alt="Sticker" className="w-32 h-32" />
                      )}
                    </div>
                    
                    {/* Reactions */}
                    {getMessageReactions(message.id).length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {getMessageReactions(message.id).map((reaction, index) => (
                          <button
                            key={index}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className="flex items-center gap-1 px-2 py-1 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs text-metal-400">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setReplyingTo(message.id)}
                        className="text-xs text-metal-500 hover:text-white transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleCreateThread(message.id)}
                        className="text-xs text-metal-500 hover:text-white transition-colors"
                      >
                        Thread
                      </button>
                      <button
                        onClick={() => setEditingMessage(message.id)}
                        className="text-xs text-metal-500 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-metal-500 hover:text-rust-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-metal-800 p-4">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-2 p-2 bg-metal-800 rounded-lg flex items-center justify-between">
                <span className="text-sm text-metal-400">Replying to message...</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-metal-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit Preview */}
            {editingMessage && (
              <div className="mb-2 p-2 bg-rust-600/20 border border-rust-600/50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-rust-400">Editing message...</span>
                <button
                  onClick={() => setEditingMessage(null)}
                  className="text-rust-500 hover:text-rust-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Formatting Toolbar */}
            {showFormatting && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-metal-800 rounded-lg">
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <Bold className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <Italic className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <Strikethrough className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <Code className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <Quote className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <List className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-1 hover:bg-metal-700 rounded transition-colors">
                  <ListOrdered className="w-4 h-4 text-metal-400" />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
              {/* Left Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => setShowCommands(!showCommands)}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                  title="Commands"
                >
                  <Plus className="w-4 h-4 text-metal-400" />
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4 text-metal-400" />
                </button>
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4 text-metal-400" />
                </button>
                
                <button
                  onClick={() => setShowGifPicker(!showGifPicker)}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                  title="GIF"
                >
                  <Image className="w-4 h-4 text-metal-400" aria-label="GIF" />
                </button>
                
                <button
                  onClick={() => setShowStickerPicker(!showStickerPicker)}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                  title="Sticker"
                >
                  <Gift className="w-4 h-4 text-metal-400" />
                </button>
              </div>

              {/* Message Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder={`Message #${currentChannel.name}...`}
                  className="w-full px-4 py-2 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 resize-none"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                
                {/* Character Count */}
                {messageInput.length > 100 && (
                  <div className="absolute bottom-2 right-2 text-xs text-metal-500">
                    {messageInput.length}/2000
                  </div>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex gap-1">
                {/* Voice Recording */}
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                    title="Voice Message"
                  >
                    <Mic className="w-4 h-4 text-metal-400" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1"
                    title="Stop Recording"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs text-white">{formatRecordingTime(recordingTime)}</span>
                  </button>
                )}
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-rust-600 hover:bg-rust-700 disabled:bg-metal-700 disabled:text-metal-500 rounded-lg transition-colors"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formatting Toggle */}
            <button
              onClick={() => setShowFormatting(!showFormatting)}
              className="mt-2 text-xs text-metal-500 hover:text-white transition-colors"
            >
              {showFormatting ? 'Hide' : 'Show'} formatting options
            </button>
          </div>
        </div>

        {/* User List Sidebar */}
        <AnimatePresence>
          {showUserList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-metal-800/50 border-l border-metal-800"
            >
              <div className="p-4">
                <h4 className="font-semibold text-white mb-4">Online Users</h4>
                
                {/* User Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-metal-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 text-sm"
                  />
                </div>
                
                {/* User List */}
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-metal-700 rounded-lg transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rust-500 to-rust-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-metal-800 ${
                          user.status === 'online' ? 'bg-green-400' :
                          user.status === 'away' ? 'bg-yellow-400' :
                          user.status === 'busy' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.displayName || user.username}</p>
                        <p className="text-xs text-metal-400">{user.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      {/* Emoji Picker */}
      <UltimateEmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
        recentEmojis={recentEmojis}
        frequentEmojis={frequentEmojis.map(e => e.emoji)}
        customEmojis={customEmojis}
      />

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-metal-900 border border-metal-700 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Chat Settings</h3>
              
              {/* Theme Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-2">Theme</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['dark', 'light', 'got'].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => handleThemeChange(themeOption)}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedTheme === themeOption
                          ? 'border-rust-500 bg-rust-600/20'
                          : 'border-metal-600 hover:border-metal-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {themeOption === 'dark' && <Moon className="w-4 h-4" />}
                        {themeOption === 'light' && <Sun className="w-4 h-4" />}
                        {themeOption === 'got' && <Crown className="w-4 h-4" />}
                        <span className="text-sm text-white capitalize">{themeOption}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Font Size */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-2">Font Size</h4>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`px-3 py-1 rounded-lg border transition-colors ${
                        fontSize === size
                          ? 'border-rust-500 bg-rust-600/20'
                          : 'border-metal-600 hover:border-metal-500'
                      }`}
                    >
                      <span className="text-sm text-white capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white">Sound Effects</span>
                  <button
                    onClick={toggleSound}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      soundEnabled ? 'bg-rust-600' : 'bg-metal-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white">Notifications</span>
                  <button
                    onClick={toggleNotifications}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-rust-600' : 'bg-metal-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white">Compact Mode</span>
                  <button
                    onClick={toggleCompactMode}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      compactMode ? 'bg-rust-600' : 'bg-metal-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      compactMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </label>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="mt-6 w-full py-2 bg-rust-600 hover:bg-rust-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
