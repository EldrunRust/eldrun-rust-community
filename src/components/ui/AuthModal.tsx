'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Lock, Eye, EyeOff, Gamepad2, CheckCircle, AlertCircle, Zap, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'

// OAuth Provider Icons
const SteamIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.8 8.206 11.387l3.278-4.68c-.089-.006-.179-.009-.269-.009-2.619 0-4.742-2.123-4.742-4.742 0-2.619 2.123-4.742 4.742-4.742s4.742 2.123 4.742 4.742c0 .09-.003.179-.009.268l4.68-3.278C18.801 3.438 14.305 0 9 0h3z"/>
  </svg>
)

const DiscordIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
)

const TwitchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#9146FF">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

const EpicGamesIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44a4.262 4.262 0 00.136 1.209c.248.794.962 1.361 1.74 1.363l16.921.004c.778-.002 1.493-.569 1.741-1.363a4.263 4.263 0 00.136-1.209V1.879c0-1.373-.506-1.879-1.878-1.879zm14.5 3.638h1.635V9.1h-1.635zm-2.845 0h1.635v5.462h1.779v1.395h-3.414zm-2.844 0h3.413v1.395h-1.778v1.333h1.635v1.395h-1.635v1.339h1.778v1.395h-3.413zm-4.168 0h1.635v5.462h1.779v1.395h-3.414zm-2.844 0h3.413v1.395H7.071v1.333h1.635v1.395H7.071v2.734H5.436z"/>
  </svg>
)

// OAuth Providers Configuration
const oauthProviders = [
  { id: 'steam', name: 'Steam', icon: SteamIcon, bg: 'bg-[#171a21]', hover: 'hover:bg-[#1b2838]', border: 'border-[#2a475e]', recommended: true },
  { id: 'discord', name: 'Discord', icon: DiscordIcon, bg: 'bg-[#5865F2]', hover: 'hover:bg-[#4752c4]', border: 'border-[#5865F2]', recommended: true },
  { id: 'google', name: 'Google', icon: GoogleIcon, bg: 'bg-white', hover: 'hover:bg-gray-100', border: 'border-gray-300', textColor: 'text-gray-700' },
  { id: 'microsoft', name: 'Microsoft', icon: MicrosoftIcon, bg: 'bg-[#2F2F2F]', hover: 'hover:bg-[#3a3a3a]', border: 'border-[#5a5a5a]' },
  { id: 'twitch', name: 'Twitch', icon: TwitchIcon, bg: 'bg-[#9146FF]', hover: 'hover:bg-[#7c3aed]', border: 'border-[#9146FF]' },
  { id: 'github', name: 'GitHub', icon: GitHubIcon, bg: 'bg-[#24292e]', hover: 'hover:bg-[#2f363d]', border: 'border-[#444d56]' },
  { id: 'apple', name: 'Apple', icon: AppleIcon, bg: 'bg-black', hover: 'hover:bg-gray-900', border: 'border-gray-700' },
  { id: 'epic', name: 'Epic Games', icon: EpicGamesIcon, bg: 'bg-[#313131]', hover: 'hover:bg-[#3a3a3a]', border: 'border-[#444]' },
]

export function AuthModal() {
  const { isAuthModalOpen, authMode, closeAuthModal, openAuthModal, setCurrentUser } = useStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showAllProviders, setShowAllProviders] = useState(false)
  
  // Form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const resetForm = () => {
    setUsername('')
    setEmail('')
    setPassword('')
    setError(null)
    setSuccess(null)
    setShowEmailForm(false)
    setShowAllProviders(false)
  }

  const handleOAuthLogin = async (providerId: string) => {
    setLoadingProvider(providerId)
    setError(null)
    
    // Redirect to real OAuth provider
    try {
      switch (providerId) {
        case 'steam':
          window.location.href = '/api/auth/steam'
          break
        case 'discord':
          window.location.href = '/api/auth/discord'
          break
        case 'google':
          // Google OAuth - requires setup
          setError('Google-Login wird bald verfügbar sein. Bitte nutze Steam oder Discord.')
          setLoadingProvider(null)
          break
        case 'twitch':
          // Twitch OAuth - requires setup
          setError('Twitch-Login wird bald verfügbar sein. Bitte nutze Steam oder Discord.')
          setLoadingProvider(null)
          break
        default:
          setError(`${providerId} Login ist noch nicht verfügbar. Bitte nutze Steam oder Discord.`)
          setLoadingProvider(null)
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.')
      setLoadingProvider(null)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body = authMode === 'register' 
        ? { username, email, password }
        : { login: email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten')
        return
      }

      setSuccess(data.message)
      
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          username: data.user.username,
          displayName: data.user.displayName || data.user.username,
          email: data.user.email || email,
          avatar: data.user.avatar || '',
          banner: '',
          bio: '',
          steamId: data.user.steamId || '',
          discordId: data.user.discordId || '',
          role: data.user.role || 'player',
          faction: null,
          playerClass: null,
          level: data.user.level || 1,
          xp: data.user.xp || 0,
          xpToNextLevel: data.user.xpToNextLevel || 1000,
          prestige: 0,
          playtime: 0,
          kills: 0,
          deaths: 0,
          kd: 0,
          headshots: 0,
          longestKillStreak: 0,
          totalDamageDealt: 0,
          coins: data.user.coins || 1000,
          casinoCoins: data.user.casinoCoins || 0,
          totalWagered: 0,
          totalWon: 0,
          friends: [],
          blockedUsers: [],

          guildId: null,
          guildRole: null,
          achievements: [],
          totalAchievementPoints: 0,
          lastOnline: new Date(),
          joinedAt: new Date(),
          isOnline: true,
          currentServer: null,
          settings: {
            theme: 'dark',
            language: 'de',
            emailNotifications: true,
            pushNotifications: true,
            showOnlineStatus: true,
            showPlaytime: true,
            showStats: true,
            allowFriendRequests: true,
            allowMessages: true,
            profileVisibility: 'public',
            casinoPopupsEnabled: true
          }
        })
      }

      if (data.redirect) {
        setTimeout(() => {
          window.location.href = data.redirect
        }, 1000)
      }

      setTimeout(() => {
        closeAuthModal()
        resetForm()
      }, 1500)

    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es später erneut.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const displayedProviders = showAllProviders ? oauthProviders : oauthProviders.slice(0, 4)

  // No portal needed - AuthModal is rendered outside TransitionProvider in layout.tsx
  // This avoids the CSS filter stacking context bug that breaks fixed positioning

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop - covers entire viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { closeAuthModal(); resetForm(); }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 99998,
            }}
          />

          {/* Modal Container - centers the modal in viewport */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ pointerEvents: 'auto' }}
              className="relative w-full max-w-md bg-gradient-to-b from-metal-900 to-metal-950 border border-metal-800 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rust-600 via-amber-500 to-rust-600" />
              
              {/* Close button */}
              <button
                onClick={() => { closeAuthModal(); resetForm(); }}
                className="absolute top-4 right-4 p-2 text-metal-500 hover:text-white hover:bg-metal-800 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Logo & Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-rust-500 to-amber-600 rounded-xl shadow-lg shadow-rust-500/25">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display font-black text-2xl text-white mb-1">
                    {authMode === 'login' ? 'Willkommen zurück!' : 'Schnell starten'}
                  </h2>
                  <p className="text-metal-400 text-sm">
                    {authMode === 'login' 
                      ? 'Wähle deine bevorzugte Anmeldemethode' 
                      : 'In Sekunden registriert - wähle eine Option'}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="flex justify-center gap-6 mb-6 py-3 px-4 bg-metal-800/50 rounded-lg border border-metal-700/50">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-metal-300">Sofort spielen</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-metal-300">100% sicher</span>
                  </div>
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
                    >
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showEmailForm ? (
                  <>
                    {/* OAuth Providers */}
                    <div className="space-y-2 mb-4">
                      {displayedProviders.map((provider) => (
                        <motion.button
                          key={provider.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleOAuthLogin(provider.id)}
                          disabled={loadingProvider !== null}
                          className={`w-full flex items-center justify-between px-4 py-3 ${provider.bg} ${provider.hover} border ${provider.border} rounded-lg font-medium ${provider.textColor || 'text-white'} transition-all disabled:opacity-50 relative overflow-hidden group`}
                        >
                          <div className="flex items-center gap-3">
                            <provider.icon />
                            <span>Mit {provider.name} {authMode === 'login' ? 'anmelden' : 'registrieren'}</span>
                          </div>
                          {provider.recommended && (
                            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                              Empfohlen
                            </span>
                          )}
                          {loadingProvider === provider.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>

                    {/* Show More Providers */}
                    {!showAllProviders && (
                      <button
                        onClick={() => setShowAllProviders(true)}
                        className="w-full py-2 text-sm text-metal-400 hover:text-white transition-colors"
                      >
                        + {oauthProviders.length - 4} weitere Optionen anzeigen
                      </button>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-5">
                      <div className="flex-1 h-px bg-metal-700" />
                      <span className="text-metal-500 text-xs font-mono uppercase">oder</span>
                      <div className="flex-1 h-px bg-metal-700" />
                    </div>

                    {/* Email Option */}
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-metal-800 hover:bg-metal-700 border border-metal-600 rounded-lg text-metal-300 hover:text-white transition-all"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Mit E-Mail {authMode === 'login' ? 'anmelden' : 'registrieren'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Back Button */}
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="flex items-center gap-2 text-metal-400 hover:text-white text-sm mb-4 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Zurück zu allen Optionen
                    </button>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {authMode === 'register' && (
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
                          <input
                            type="text"
                            placeholder="Benutzername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500/50 transition-all"
                            required
                            minLength={3}
                          />
                        </div>
                      )}

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
                        <input
                          type="email"
                          placeholder="Benutzername oder E-Mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500/50 transition-all"
                          required
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Passwort"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 bg-metal-800 border border-metal-600 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500/50 transition-all"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-metal-500 hover:text-metal-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {authMode === 'login' && (
                        <div className="flex justify-end">
                          <button type="button" className="text-sm text-rust-400 hover:text-rust-300 transition-colors">
                            Passwort vergessen?
                          </button>
                        </div>
                      )}

                      <Button
                        type="submit"
                        variant="rust"
                        size="lg"
                        className="w-full"
                        isLoading={isLoading}
                      >
                        {authMode === 'login' ? 'Anmelden' : 'Account erstellen'}
                      </Button>
                    </form>
                  </>
                )}

                {/* Switch mode */}
                <p className="mt-6 text-center text-metal-400 text-sm">
                  {authMode === 'login' ? (
                    <>
                      Noch keinen Account?{' '}
                      <button
                        onClick={() => { openAuthModal('register'); setShowEmailForm(false); }}
                        className="text-rust-400 hover:text-rust-300 font-bold transition-colors"
                      >
                        Jetzt registrieren
                      </button>
                    </>
                  ) : (
                    <>
                      Bereits registriert?{' '}
                      <button
                        onClick={() => { openAuthModal('login'); setShowEmailForm(false); }}
                        className="text-rust-400 hover:text-rust-300 font-bold transition-colors"
                      >
                        Anmelden
                      </button>
                    </>
                  )}
                </p>

                {/* Terms */}
                <p className="mt-4 text-center text-metal-500 text-xs">
                  Mit der Registrierung akzeptierst du unsere{' '}
                  <a href="/terms" className="text-metal-400 hover:text-white underline">AGB</a>
                  {' '}und{' '}
                  <a href="/privacy" className="text-metal-400 hover:text-white underline">Datenschutzrichtlinien</a>
                </p>
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rust-500/30 to-transparent" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
