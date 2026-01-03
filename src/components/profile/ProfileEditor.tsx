'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Upload, X, Check, User, Mail, Globe, MapPin,
  Calendar, Link2, Twitter, Instagram, Youtube, Twitch,
  Github, Linkedin, MessageSquare, Gamepad2, Save, Wand2,
  Palette, Type, Heart, Sparkles
} from 'lucide-react'
import { UserProfile } from '@/store/useStore'
import { AvatarGenerator } from './AvatarGenerator'

interface ProfileEditorProps {
  user: UserProfile
  onSave: (updates: Partial<UserProfile>) => void
  onClose: () => void
}

// Social platforms configuration
const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter className="w-4 h-4" />, placeholder: '@username', prefix: 'https://twitter.com/' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-4 h-4" />, placeholder: '@username', prefix: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="w-4 h-4" />, placeholder: 'Channel URL', prefix: 'https://youtube.com/' },
  { id: 'twitch', name: 'Twitch', icon: <Twitch className="w-4 h-4" />, placeholder: 'username', prefix: 'https://twitch.tv/' },
  { id: 'github', name: 'GitHub', icon: <Github className="w-4 h-4" />, placeholder: 'username', prefix: 'https://github.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, placeholder: 'Profile URL', prefix: 'https://linkedin.com/in/' },
  { id: 'discord', name: 'Discord', icon: <MessageSquare className="w-4 h-4" />, placeholder: 'username#0000', prefix: '' },
  { id: 'steam', name: 'Steam', icon: <Gamepad2 className="w-4 h-4" />, placeholder: 'Profile URL', prefix: 'https://steamcommunity.com/id/' },
]

// Available themes
const PROFILE_THEMES = [
  { id: 'default', name: 'Standard', colors: ['#c45c2c', '#1a1a1a'] },
  { id: 'seraphar', name: 'Seraphar Gold', colors: ['#f59e0b', '#1a1a1a'] },
  { id: 'vorgaroth', name: 'Vorgaroth Rot', colors: ['#dc2626', '#1a1a1a'] },
  { id: 'netharis', name: 'Netharis Purpur', colors: ['#8b5cf6', '#1a1a1a'] },
  { id: 'kaldrim', name: 'Kaldrim Blau', colors: ['#3b82f6', '#1a1a1a'] },
  { id: 'nature', name: 'Natur', colors: ['#22c55e', '#1a1a1a'] },
  { id: 'cosmic', name: 'Kosmisch', colors: ['#ec4899', '#6366f1'] },
  { id: 'sunset', name: 'Sonnenuntergang', colors: ['#f97316', '#7c3aed'] },
]

// Badge options
const PROFILE_BADGES = [
  { id: 'founder', name: 'Gründer', icon: '🏛️', description: 'Früher Unterstützer' },
  { id: 'veteran', name: 'Veteran', icon: '⚔️', description: '1000+ Stunden gespielt' },
  { id: 'champion', name: 'Champion', icon: '🏆', description: 'Turniersieger' },
  { id: 'streamer', name: 'Streamer', icon: '📺', description: 'Verifizierter Streamer' },
  { id: 'artist', name: 'Künstler', icon: '🎨', description: 'Community Künstler' },
  { id: 'helper', name: 'Helfer', icon: '💝', description: 'Community Helfer' },
  { id: 'bug_hunter', name: 'Bug Hunter', icon: '🐛', description: 'Bug Reporter' },
  { id: 'whale', name: 'Unterstützer', icon: '💎', description: 'Top Supporter' },
]

export function ProfileEditor({ user, onSave, onClose }: ProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'avatar' | 'social' | 'appearance' | 'privacy'>('general')
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    birthday: user.birthday || '',
    pronouns: user.pronouns || '',
    occupation: user.occupation || '',
    interests: user.interests?.join(', ') || '',
    favoriteGame: user.favoriteGame || 'Rust',
    motto: user.motto || '',
    avatar: user.avatar || '',
    banner: user.banner || '',
    profileTheme: user.profileTheme || 'default',
    featuredBadge: user.featuredBadge || '',
    socialLinks: user.socialLinks || {},
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateSocialLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximum: 5MB')
      return
    }

    // Read and convert to base64 for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      updateField('avatar', result)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarFromGenerator = (avatarData: string) => {
    updateField('avatar', avatarData)
    setShowAvatarGenerator(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Prepare data for saving
    const updates: Partial<UserProfile> = {
      displayName: formData.displayName,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      birthday: formData.birthday,
      pronouns: formData.pronouns,
      occupation: formData.occupation,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      favoriteGame: formData.favoriteGame,
      motto: formData.motto,
      avatar: formData.avatar,
      banner: formData.banner,
      profileTheme: formData.profileTheme,
      featuredBadge: formData.featuredBadge,
      socialLinks: formData.socialLinks,
    }

    try {
      onSave(updates)
      setTimeout(() => {
        setIsSaving(false)
        onClose()
      }, 500)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: <User className="w-4 h-4" /> },
    { id: 'avatar', label: 'Avatar', icon: <Camera className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Link2 className="w-4 h-4" /> },
    { id: 'appearance', label: 'Aussehen', icon: <Palette className="w-4 h-4" /> },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-metal-900 border border-metal-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-metal-800">
            <h2 className="font-display font-bold text-xl text-white">Profil bearbeiten</h2>
            <button onClick={onClose} className="p-2 hover:bg-metal-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-metal-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-metal-800 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-rust-400 border-rust-500'
                    : 'text-metal-400 border-transparent hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* General Tab */}
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-2">
                      Anzeigename
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={e => updateField('displayName', e.target.value)}
                      className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                      placeholder="Dein Anzeigename"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-2">
                      Über mich
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={e => updateField('bio', e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none resize-none"
                      placeholder="Erzähle etwas über dich..."
                    />
                    <p className="text-xs text-metal-500 mt-1">{formData.bio.length}/500</p>
                  </div>

                  {/* Motto */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-2">
                      <Heart className="w-4 h-4 inline mr-1" />
                      Motto / Lieblingszitat
                    </label>
                    <input
                      type="text"
                      value={formData.motto}
                      onChange={e => updateField('motto', e.target.value)}
                      className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white italic focus:border-rust-500 focus:outline-none"
                      placeholder='"Der Winter naht..."'
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-metal-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Standort
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => updateField('location', e.target.value)}
                        className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                        placeholder="z.B. Berlin, Deutschland"
                      />
                    </div>

                    {/* Birthday */}
                    <div>
                      <label className="block text-sm font-medium text-metal-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Geburtstag
                      </label>
                      <input
                        type="date"
                        value={formData.birthday}
                        onChange={e => updateField('birthday', e.target.value)}
                        className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                      />
                    </div>

                    {/* Pronouns */}
                    <div>
                      <label className="block text-sm font-medium text-metal-300 mb-2">
                        Pronomen
                      </label>
                      <select
                        value={formData.pronouns}
                        onChange={e => updateField('pronouns', e.target.value)}
                        className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                      >
                        <option value="">Nicht angeben</option>
                        <option value="er/ihm">er/ihm</option>
                        <option value="sie/ihr">sie/ihr</option>
                        <option value="they/them">they/them</option>
                        <option value="custom">Andere</option>
                      </select>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-sm font-medium text-metal-300 mb-2">
                        Beruf / Tätigkeit
                      </label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={e => updateField('occupation', e.target.value)}
                        className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                        placeholder="z.B. Game Developer"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => updateField('website', e.target.value)}
                      className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                      placeholder="https://deine-website.de"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-2">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Interessen (kommagetrennt)
                    </label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={e => updateField('interests', e.target.value)}
                      className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-rust-500 focus:outline-none"
                      placeholder="Gaming, Programmieren, Musik, ..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Avatar Tab */}
              {activeTab === 'avatar' && (
                <motion.div
                  key="avatar"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Current Avatar Preview */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-metal-800 border-4 border-metal-700">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-rust-500 to-amber-600">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {formData.avatar && (
                        <button
                          onClick={() => updateField('avatar', '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-400 rounded-full"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Upload from device */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-3 p-6 bg-metal-800/50 border-2 border-dashed border-metal-600 hover:border-rust-500 rounded-xl transition-colors"
                    >
                      <Upload className="w-8 h-8 text-metal-400" />
                      <div className="text-center">
                        <p className="font-medium text-white">Bild hochladen</p>
                        <p className="text-xs text-metal-500">PNG, JPG, GIF bis 5MB</p>
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />

                    {/* Use Avatar Generator */}
                    <button
                      onClick={() => setShowAvatarGenerator(true)}
                      className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-rust-900/50 to-amber-900/50 border-2 border-rust-600/50 hover:border-rust-500 rounded-xl transition-colors"
                    >
                      <Wand2 className="w-8 h-8 text-amber-400" />
                      <div className="text-center">
                        <p className="font-medium text-white">Avatar Generator</p>
                        <p className="text-xs text-metal-400">Erstelle deinen Eldrun-Charakter</p>
                      </div>
                    </button>
                  </div>

                  {/* Avatar Tips */}
                  <div className="bg-metal-800/50 border border-metal-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Tipps für dein Avatar</h4>
                    <ul className="text-sm text-metal-400 space-y-1">
                      <li>• Quadratische Bilder funktionieren am besten</li>
                      <li>• Mindestens 200x200 Pixel empfohlen</li>
                      <li>• Nutze den Avatar Generator für einen einzigartigen Eldrun-Look</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-metal-400 text-sm mb-4">
                    Verknüpfe deine Social Media Profile und lass andere dich finden.
                  </p>
                  
                  {SOCIAL_PLATFORMS.map(platform => (
                    <div key={platform.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-metal-800 rounded-lg flex items-center justify-center text-metal-400">
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-metal-500 mb-1">{platform.name}</label>
                        <input
                          type="text"
                          value={formData.socialLinks[platform.id] || ''}
                          onChange={e => updateSocialLink(platform.id, e.target.value)}
                          className="w-full bg-metal-800 border border-metal-700 rounded-lg px-3 py-2 text-white text-sm focus:border-rust-500 focus:outline-none"
                          placeholder={platform.placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Theme */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-3">
                      Profil-Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROFILE_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => updateField('profileTheme', theme.id)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            formData.profileTheme === theme.id
                              ? 'border-rust-500'
                              : 'border-metal-700 hover:border-metal-600'
                          }`}
                        >
                          <div 
                            className="h-8 rounded mb-2"
                            style={{ 
                              background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` 
                            }}
                          />
                          <p className="text-xs text-white text-center">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div>
                    <label className="block text-sm font-medium text-metal-300 mb-3">
                      Hervorgehobenes Badge
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => updateField('featuredBadge', '')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          !formData.featuredBadge
                            ? 'border-rust-500'
                            : 'border-metal-700 hover:border-metal-600'
                        }`}
                      >
                        <div className="text-2xl text-center mb-1">❌</div>
                        <p className="text-xs text-metal-400 text-center">Keins</p>
                      </button>
                      {PROFILE_BADGES.map(badge => (
                        <button
                          key={badge.id}
                          onClick={() => updateField('featuredBadge', badge.id)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            formData.featuredBadge === badge.id
                              ? 'border-rust-500'
                              : 'border-metal-700 hover:border-metal-600'
                          }`}
                        >
                          <div className="text-2xl text-center mb-1">{badge.icon}</div>
                          <p className="text-xs text-white text-center">{badge.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-metal-800">
            <button
              onClick={onClose}
              className="px-6 py-2 text-metal-400 hover:text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-rust-600 hover:bg-rust-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Speichern
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Avatar Generator Modal */}
      <AnimatePresence>
        {showAvatarGenerator && (
          <AvatarGenerator
            onSelect={handleAvatarFromGenerator}
            onClose={() => setShowAvatarGenerator(false)}
            currentFaction={user.faction || undefined}
            currentClass={user.playerClass || undefined}
          />
        )}
      </AnimatePresence>
    </>
  )
}
