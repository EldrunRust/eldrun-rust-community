'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Smile, Plus, Upload, X, Heart, Star, Clock, TrendingUp,
  Filter, ChevronLeft, ChevronRight, Download, Zap, Award,
  Palette, Users, Globe, Settings, Sparkles, Gift, PartyPopper,
  Laugh, Angry, Frown, Meh
} from 'lucide-react'
import { useChatStore } from '@/store/chatStore'

// Emoji categories with icons
const EMOJI_CATEGORIES = [
  { id: 'smileys', name: 'Smileys & People', icon: <Smile className="w-4 h-4" />, color: 'text-yellow-400' },
  { id: 'animals', name: 'Animals & Nature', icon: <Heart className="w-4 h-4" />, color: 'text-green-400' },
  { id: 'food', name: 'Food & Drink', icon: <Star className="w-4 h-4" />, color: 'text-orange-400' },
  { id: 'activities', name: 'Activities', icon: <Award className="w-4 h-4" />, color: 'text-blue-400' },
  { id: 'travel', name: 'Travel & Places', icon: <Globe className="w-4 h-4" />, color: 'text-purple-400' },
  { id: 'objects', name: 'Objects', icon: <Settings className="w-4 h-4" />, color: 'text-gray-400' },
  { id: 'symbols', name: 'Symbols', icon: <Zap className="w-4 h-4" />, color: 'text-pink-400' },
  { id: 'flags', name: 'Flags', icon: <Users className="w-4 h-4" />, color: 'text-red-400' },
  { id: 'custom', name: 'Custom', icon: <Sparkles className="w-4 h-4" />, color: 'text-rust-400' },
  { id: 'animated', name: 'Animated', icon: <PartyPopper className="w-4 h-4" />, color: 'text-cyan-400' },
  { id: 'recent', name: 'Recent', icon: <Clock className="w-4 h-4" />, color: 'text-metal-400' },
  { id: 'frequent', name: 'Frequent', icon: <TrendingUp className="w-4 h-4" />, color: 'text-amber-400' },
]

// Sample emoji data (in real app, load from JSON/DB)
const SAMPLE_EMOJIS = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕'],
  food: ['🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '🚀', '✈️', '🛩', '🛫', '🛬', '⛵', '🛥', '🚤', '🛳', '⛴', '🚢', '⚓', '⛽', '🚧', '🚨', '🚥', '🚦', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜'],
  objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👁‍🗨', '🛑', '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↖️', '↪️', '↩️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔝', '🛐', '⚛️', '🕉', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯'],
  flags: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿'],
}

// Skin tone variants
const SKIN_TONES = [
  { tone: 'default', emoji: '👋' },
  { tone: 'light', emoji: '👋🏻' },
  { tone: 'medium-light', emoji: '👋🏼' },
  { tone: 'medium', emoji: '👋🏽' },
  { tone: 'medium-dark', emoji: '👋🏾' },
  { tone: 'dark', emoji: '👋🏿' },
]

interface UltimateEmojiPickerProps {
  onSelect: (emoji: string, type: 'emoji' | 'custom' | 'animated' | 'sticker' | 'gif') => void
  onClose: () => void
  isOpen: boolean
  allowCustom?: boolean
  allowAnimated?: boolean
  allowStickers?: boolean
  allowGifs?: boolean
  recentEmojis?: string[]
  frequentEmojis?: string[]
  customEmojis?: Array<{ id: string; name: string; url: string; animated?: boolean }>
}

export function UltimateEmojiPicker({
  onSelect,
  onClose,
  isOpen,
  allowCustom = true,
  allowAnimated = true,
  allowStickers = true,
  allowGifs = true,
  recentEmojis = [],
  frequentEmojis = [],
  customEmojis = [],
}: UltimateEmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('smileys')
  const [selectedSkinTone, setSelectedSkinTone] = useState('default')
  const [showUpload, setShowUpload] = useState(false)
  const [showSkinTonePicker, setShowSkinTonePicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [isAnimated, setIsAnimated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { addCustomEmoji, addRecentEmoji, addFrequentEmoji } = useChatStore()

  // Filter emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery) {
      if (selectedCategory === 'recent') return recentEmojis
      if (selectedCategory === 'frequent') return frequentEmojis
      if (selectedCategory === 'custom') return customEmojis.map(e => e.url)
      if (selectedCategory === 'animated') return customEmojis.filter(e => e.animated).map(e => e.url)
      return SAMPLE_EMOJIS[selectedCategory as keyof typeof SAMPLE_EMOJIS] || []
    }

    const query = searchQuery.toLowerCase()
    const allEmojis: string[] = []

    // Search in all categories
    Object.values(SAMPLE_EMOJIS).forEach(emojis => {
      allEmojis.push(...emojis.filter(e => e.includes(query)))
    })

    // Search in custom emojis
    customEmojis.forEach(emoji => {
      if (emoji.name.toLowerCase().includes(query)) {
        allEmojis.push(emoji.url)
      }
    })

    return allEmojis
  }, [searchQuery, selectedCategory, recentEmojis, frequentEmojis, customEmojis])

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string, type: 'emoji' | 'custom' | 'animated' = 'emoji') => {
    onSelect(emoji, type)
    addRecentEmoji(emoji)
    addFrequentEmoji(emoji)
    
    // Close picker on mobile after selection
    if (window.innerWidth < 768) {
      onClose()
    }
  }, [onSelect, addRecentEmoji, addFrequentEmoji, onClose])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)

    // Check if animated
    setIsAnimated(file.type === 'image/gif')
  }, [])

  // Handle upload confirm
  const handleUploadConfirm = useCallback(async () => {
    if (!uploadPreview || !uploadName) return

    const newEmoji = {
      id: Date.now().toString(),
      name: uploadName,
      url: uploadPreview,
      animated: isAnimated,
    }

    await addCustomEmoji(newEmoji)
    setShowUpload(false)
    setUploadPreview(null)
    setUploadName('')
    setIsAnimated(false)
    setSelectedCategory('custom')
  }, [uploadPreview, uploadName, isAnimated, addCustomEmoji])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '/' && e.ctrlKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'Tab') {
        e.preventDefault()
        // Cycle through categories
        const currentIndex = EMOJI_CATEGORIES.findIndex(cat => cat.id === selectedCategory)
        const nextIndex = (currentIndex + 1) % EMOJI_CATEGORIES.length
        setSelectedCategory(EMOJI_CATEGORIES[nextIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, selectedCategory])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-metal-900 border border-metal-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-metal-700">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-rust-400" />
            <h3 className="text-lg font-semibold text-white">Emoji Picker</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Skin Tone Picker */}
            <button
              onClick={() => setShowSkinTonePicker(!showSkinTonePicker)}
              className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
              title="Skin Tone"
            >
              <Palette className="w-4 h-4 text-metal-400" />
            </button>
            
            {/* Upload Custom Emoji */}
            {allowCustom && (
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
                title="Upload Custom Emoji"
              >
                <Upload className="w-4 h-4 text-metal-400" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-metal-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-metal-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-metal-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search emojis... (Ctrl+/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 p-2 border-b border-metal-700 overflow-x-auto">
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-rust-600 text-white'
                  : 'hover:bg-metal-800 text-metal-400'
              }`}
              title={category.name}
            >
              <span className={category.color}>{category.icon}</span>
              <span className="text-sm hidden sm:inline">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="p-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
            <AnimatePresence>
              {filteredEmojis.map((emoji, index) => (
                <motion.button
                  key={`${selectedCategory}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleEmojiSelect(
                    emoji,
                    selectedCategory === 'custom' ? 'custom' : 
                    selectedCategory === 'animated' ? 'animated' : 'emoji'
                  )}
                  className="p-2 hover:bg-metal-800 rounded-lg transition-all hover:scale-110 text-2xl"
                >
                  {emoji.startsWith('http') ? (
                    <img src={emoji} alt="Custom emoji" className="w-6 h-6" />
                  ) : (
                    <span>{emoji}</span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Skin Tone Picker */}
        <AnimatePresence>
          {showSkinTonePicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-20 right-4 bg-metal-800 border border-metal-600 rounded-lg p-3 shadow-xl"
            >
              <div className="grid grid-cols-6 gap-2">
                {SKIN_TONES.map(({ tone, emoji }) => (
                  <button
                    key={tone}
                    onClick={() => {
                      setSelectedSkinTone(tone)
                      setShowSkinTonePicker(false)
                    }}
                    className={`p-2 rounded hover:bg-metal-700 transition-colors ${
                      selectedSkinTone === tone ? 'bg-rust-600' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                className="bg-metal-900 border border-metal-700 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Upload Custom Emoji</h3>
                
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-metal-600 rounded-lg p-8 text-center hover:border-rust-500 transition-colors cursor-pointer"
                >
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="w-16 h-16 mx-auto mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-metal-500 mx-auto mb-2" />
                  )}
                  <p className="text-metal-400 text-sm">
                    {uploadPreview ? 'Click to change image' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-metal-500 text-xs mt-1">
                    PNG, JPG, GIF up to 256KB
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                
                {/* Emoji Name */}
                <input
                  type="text"
                  placeholder="Emoji name (e.g., :myemoji:)"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full mt-4 px-3 py-2 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder-metal-500 focus:outline-none focus:border-rust-500"
                />
                
                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleUploadConfirm}
                    disabled={!uploadPreview || !uploadName || isUploading}
                    className="flex-1 py-2 bg-rust-600 hover:bg-rust-700 disabled:bg-metal-700 disabled:text-metal-500 text-white rounded-lg transition-colors"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpload(false)
                      setUploadPreview(null)
                      setUploadName('')
                      setIsAnimated(false)
                    }}
                    className="flex-1 py-2 bg-metal-700 hover:bg-metal-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
