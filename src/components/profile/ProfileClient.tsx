'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Settings, Trophy, Sword, Coins, Clock, 
  Target, Skull, Star, Camera, Edit3, MapPin, Globe, Heart,
  Users, Crown, TrendingUp, Calendar, Link2,
  Bell, Lock, MessageSquare, Smile, Gift,
  LogOut, Gamepad2, Dices
} from 'lucide-react'
import { useStore, UserProfile, UserSettings } from '@/store/useStore'
import { ProfileEditor } from './ProfileEditor'

type ProfileTab = 'overview' | 'stats' | 'achievements' | 'settings'

const FACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  seraphar: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  vorgaroth: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  netharis: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  kaldrim: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
}

const CLASS_ICONS: Record<string, string> = {
  krieger: '⚔️',
  assassine: '🗡️',
  magier: '🔮',
  heiler: '💚',
  tank: '🛡️',
}

export function ProfileClient() {
  const { currentUser, updateUserProfile, updateUserSettings, logout, openAuthModal } = useStore()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [mounted, setMounted] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Handle tab query parameter from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab && ['overview', 'stats', 'achievements', 'settings'].includes(tab)) {
        setActiveTab(tab as ProfileTab)
      }
    }
  }, [])

  // Show login prompt if not authenticated
  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rust-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-metal-800 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-metal-500" />
          </div>
          <h1 className="font-display font-black text-3xl text-white mb-4">
            Nicht angemeldet
          </h1>
          <p className="text-metal-400 mb-8">
            Melde dich an oder registriere dich, um dein Profil zu sehen und alle Features zu nutzen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-3 bg-rust-600 hover:bg-rust-500 text-white font-display font-bold transition-colors"
            >
              Anmelden
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-8 py-3 bg-metal-800 hover:bg-metal-700 text-white font-display font-bold border border-metal-600 transition-colors"
            >
              Registrieren
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatPlaytime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    return `${hours.toLocaleString('de-DE')}h`
  }

  const factionStyle = currentUser.faction ? FACTION_COLORS[currentUser.faction] : null

  return (
    <div className="min-h-screen bg-metal-950">
      {/* Profile Header / Banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-rust-900 via-metal-900 to-rust-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-metal-950 to-transparent" />
        
        {/* Edit Banner Button */}
        <button 
          onClick={() => setShowProfileEditor(true)}
          className="absolute top-24 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors flex items-center gap-2"
        >
          <Edit3 className="w-5 h-5" />
          <span className="hidden sm:inline">Bearbeiten</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-rust-500 to-amber-600 rounded-xl flex items-center justify-center text-5xl border-4 border-metal-950 shadow-xl">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/default.svg'
                  }}
                />
              ) : (
                currentUser.username.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              onClick={() => setShowProfileEditor(true)}
              className="absolute -bottom-2 -right-2 p-2 bg-metal-800 hover:bg-metal-700 rounded-lg border border-metal-600 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            {/* Online Status */}
            <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-metal-950 ${currentUser.isOnline ? 'bg-green-500' : 'bg-metal-500'}`} />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
                {currentUser.displayName || currentUser.username}
              </h1>
              {/* Role Badge */}
              {currentUser.role !== 'player' && (
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${
                  currentUser.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                  currentUser.role === 'moderator' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                }`}>
                  {currentUser.role}
                </span>
              )}
            </div>
            <p className="text-metal-400 mt-1">@{currentUser.username}</p>
            
            {/* Level & XP Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-metal-400">Level {currentUser.level}</span>
                <span className="text-metal-500">{currentUser.xp.toLocaleString()} / {currentUser.xpToNextLevel.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rust-500 to-amber-500 transition-all"
                  style={{ width: `${(currentUser.xp / currentUser.xpToNextLevel) * 100}%` }}
                />
              </div>
              {currentUser.prestige > 0 && (
                <div className="flex items-center gap-1 mt-2 text-amber-400 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Prestige {currentUser.prestige}</span>
                </div>
              )}
            </div>

            {/* Faction & Class */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {currentUser.faction && factionStyle && (
                <span className={`px-3 py-1.5 text-sm font-bold rounded border ${factionStyle.bg} ${factionStyle.text} ${factionStyle.border}`}>
                  {currentUser.faction.charAt(0).toUpperCase() + currentUser.faction.slice(1)}
                </span>
              )}
              {currentUser.playerClass && (
                <span className="px-3 py-1.5 text-sm font-bold rounded bg-metal-800 text-metal-300 border border-metal-600">
                  {CLASS_ICONS[currentUser.playerClass]} {currentUser.playerClass.charAt(0).toUpperCase() + currentUser.playerClass.slice(1)}
                </span>
              )}
            </div>

            {/* Bio & Extended Info */}
            <div className="mt-4 space-y-3 max-w-xl">
              {/* Motto */}
              {currentUser.motto && (
                <p className="text-metal-400 italic flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400 flex-shrink-0" />
                  &quot;{currentUser.motto}&quot;
                </p>
              )}
              
              {/* Bio */}
              {currentUser.bio && (
                <p className="text-metal-300">{currentUser.bio}</p>
              )}
              
              {/* Location & Website */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {currentUser.location && (
                  <span className="flex items-center gap-1 text-metal-400">
                    <MapPin className="w-4 h-4" />
                    {currentUser.location}
                  </span>
                )}
                {currentUser.website && (
                  <a 
                    href={currentUser.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-rust-400 hover:text-rust-300"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {currentUser.socialLinks && Object.keys(currentUser.socialLinks).length > 0 && (
                  <span className="flex items-center gap-1 text-metal-400">
                    <Link2 className="w-4 h-4" />
                    {Object.keys(currentUser.socialLinks).length} Social Links
                  </span>
                )}
              </div>

              {/* Interests */}
              {currentUser.interests && currentUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((interest, i) => (
                    <span key={i} className="px-2 py-1 bg-metal-800 text-metal-400 text-xs rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            <QuickStat icon={<Clock />} label="Spielzeit" value={formatPlaytime(currentUser.playtime)} />
            <QuickStat icon={<Sword />} label="Kills" value={currentUser.kills.toLocaleString()} />
            <QuickStat icon={<Coins />} label="Coins" value={currentUser.coins.toLocaleString()} />
            <QuickStat icon={<Gift />} label="Eldruns" value="5,000" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-metal-800 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Übersicht', icon: <User className="w-4 h-4" /> },
            { id: 'stats', label: 'Statistiken', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
            { id: 'settings', label: 'Einstellungen', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'text-rust-400 border-rust-500' 
                  : 'text-metal-400 border-transparent hover:text-white hover:border-metal-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab user={currentUser} />}
            {activeTab === 'stats' && <StatsTab user={currentUser} />}
            {activeTab === 'achievements' && <AchievementsTab user={currentUser} />}
            {activeTab === 'settings' && <SettingsTab user={currentUser} updateSettings={updateUserSettings} logout={logout} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {showProfileEditor && (
          <ProfileEditor
            user={currentUser}
            onSave={(updates) => updateUserProfile(updates)}
            onClose={() => setShowProfileEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Quick Stat Component
function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-metal-900/50 border border-metal-800 rounded-lg p-3 min-w-[100px]">
      <div className="flex items-center gap-2 text-metal-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-display font-bold text-white text-lg">{value}</p>
    </div>
  )
}

// Overview Tab
function OverviewTab({ user }: { user: UserProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Main Stats */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats Grid (Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:hidden">
          <StatCard icon={<Clock />} label="Spielzeit" value={`${Math.floor(user.playtime / 3600)}h`} color="text-blue-400" />
          <StatCard icon={<Sword />} label="Kills" value={user.kills.toLocaleString()} color="text-red-400" />
          <StatCard icon={<Trophy />} label="Achievements" value={user.achievements.length.toString()} color="text-amber-400" />
          <StatCard icon={<Coins />} label="Coins" value={user.coins.toLocaleString()} color="text-green-400" />
        </div>

        {/* Combat Stats */}
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-400" />
            Kampfstatistiken
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatItem label="Kills" value={user.kills} />
            <StatItem label="Deaths" value={user.deaths} />
            <StatItem label="K/D Ratio" value={user.kd.toFixed(2)} highlight />
            <StatItem label="Headshots" value={user.headshots} />
            <StatItem label="Kill Streak" value={user.longestKillStreak} />
            <StatItem label="Damage" value={`${(user.totalDamageDealt / 1000000).toFixed(1)}M`} />
          </div>
        </div>

        {/* Casino Stats */}
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            Casino
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatItem label="Balance" value={user.casinoCoins.toLocaleString()} highlight />
            <StatItem label="Gewettet" value={user.totalWagered.toLocaleString()} />
            <StatItem label="Gewonnen" value={user.totalWon.toLocaleString()} />
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Neueste Achievements
          </h3>
          <div className="space-y-3">
            {user.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-metal-800/50 rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{achievement.name}</p>
                  <p className="text-metal-400 text-sm">+{achievement.points} Punkte</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Guild Card */}
        {user.guildId && (
          <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Gilde
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-white">Eldrun Warriors</p>
                <p className="text-metal-400 text-sm capitalize">{user.guildRole}</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Account
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-metal-400">Beigetreten</span>
              <span className="text-white">{new Date(user.joinedAt).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metal-400">Achievement Punkte</span>
              <span className="text-amber-400">{user.totalAchievementPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metal-400">Server</span>
              <span className="text-green-400">{user.currentServer || 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-4">Verbundene Accounts</h3>
          <div className="space-y-3">
            {user.steamId && (
              <div className="flex items-center gap-3 p-2 bg-[#171a21] rounded-lg">
                <div className="w-8 h-8 bg-[#1b2838] rounded flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">Steam verbunden</span>
              </div>
            )}
            {user.discordId && (
              <div className="flex items-center gap-3 p-2 bg-[#5865F2]/20 rounded-lg">
                <div className="w-8 h-8 bg-[#5865F2]/30 rounded flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                </div>
                <span className="text-white text-sm">Discord verbunden</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Stats Tab
function StatsTab({ user }: { user: UserProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStatCard icon={<Sword />} label="Kills" value={user.kills} color="text-red-400" bgColor="from-red-500/10" />
        <BigStatCard icon={<Skull />} label="Deaths" value={user.deaths} color="text-metal-400" bgColor="from-metal-500/10" />
        <BigStatCard icon={<Target />} label="K/D Ratio" value={user.kd.toFixed(2)} color="text-green-400" bgColor="from-green-500/10" />
        <BigStatCard icon={<Clock />} label="Spielzeit" value={`${Math.floor(user.playtime / 3600)}h`} color="text-blue-400" bgColor="from-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-6">Kampf Details</h3>
          <div className="space-y-4">
            <ProgressStat label="Headshot Rate" value={(user.headshots / user.kills * 100).toFixed(1)} max={100} suffix="%" />
            <ProgressStat label="Längster Kill Streak" value={user.longestKillStreak} max={20} />
            <ProgressStat label="Durchschnittlicher Schaden" value={Math.floor(user.totalDamageDealt / user.kills)} max={10000} />
          </div>
        </div>

        <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
          <h3 className="font-display font-bold text-white mb-6">Casino Statistiken</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-metal-400">Gesamte Einsätze</span>
              <span className="text-white font-bold">{user.totalWagered.toLocaleString()} 🪙</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-metal-400">Gesamte Gewinne</span>
              <span className="text-green-400 font-bold">{user.totalWon.toLocaleString()} 🪙</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-metal-400">Gewinn/Verlust</span>
              <span className={`font-bold ${user.totalWon - user.totalWagered >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {user.totalWon - user.totalWagered >= 0 ? '+' : ''}{(user.totalWon - user.totalWagered).toLocaleString()} 🪙
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Achievements Tab
function AchievementsTab({ user }: { user: UserProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Achievements</h2>
          <p className="text-metal-400">{user.achievements.length} freigeschaltet • {user.totalAchievementPoints} Punkte</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {user.achievements.map((achievement) => (
          <div key={achievement.id} className="bg-metal-900 border border-metal-800 rounded-lg p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-3xl">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{achievement.name}</p>
              <p className="text-amber-400 text-sm">+{achievement.points} Punkte</p>
              <p className="text-metal-500 text-xs">{new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Settings Tab
function SettingsTab({ user, updateSettings, logout }: { user: UserProfile; updateSettings: (s: Partial<UserSettings>) => void; logout: () => void }) {
  const [settings, setSettings] = useState<UserSettings>(user.settings)

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] }
    setSettings(newSettings)
    updateSettings({ [key]: newSettings[key as keyof typeof newSettings] })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl space-y-6"
    >
      {/* Privacy Settings */}
      <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-metal-400" />
          Privatsphäre
        </h3>
        <div className="space-y-4">
          <SettingsToggle 
            label="Online-Status anzeigen" 
            description="Andere können sehen, ob du online bist"
            checked={settings.showOnlineStatus}
            onChange={() => handleToggle('showOnlineStatus')}
          />
          <SettingsToggle 
            label="Spielzeit anzeigen" 
            description="Deine Spielzeit ist für andere sichtbar"
            checked={settings.showPlaytime}
            onChange={() => handleToggle('showPlaytime')}
          />
          <SettingsToggle 
            label="Statistiken anzeigen" 
            description="Deine Kills, Deaths, etc. sind sichtbar"
            checked={settings.showStats}
            onChange={() => handleToggle('showStats')}
          />
        </div>
      </div>

      {/* Social Settings */}
      <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-metal-400" />
          Soziales
        </h3>
        <div className="space-y-4">
          <SettingsToggle 
            label="Freundschaftsanfragen erlauben" 
            description="Andere können dir Anfragen senden"
            checked={settings.allowFriendRequests}
            onChange={() => handleToggle('allowFriendRequests')}
          />
          <SettingsToggle 
            label="Nachrichten erlauben" 
            description="Andere können dir Nachrichten schreiben"
            checked={settings.allowMessages}
            onChange={() => handleToggle('allowMessages')}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-metal-900 border border-metal-800 rounded-lg p-6">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-metal-400" />
          Benachrichtigungen
        </h3>
        <div className="space-y-4">
          <SettingsToggle 
            label="E-Mail Benachrichtigungen" 
            description="Wichtige Updates per E-Mail erhalten"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <SettingsToggle 
            label="Push Benachrichtigungen" 
            description="Browser-Benachrichtigungen erhalten"
            checked={settings.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Abmelden
      </button>
    </motion.div>
  )
}

// Helper Components
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-metal-900 border border-metal-800 rounded-lg p-4">
      <div className={`flex items-center gap-2 ${color} mb-2`}>
        {icon}
        <span className="text-xs text-metal-400">{label}</span>
      </div>
      <p className="font-display font-bold text-xl text-white">{value}</p>
    </div>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-metal-400 text-sm">{label}</p>
      <p className={`font-display font-bold text-xl ${highlight ? 'text-rust-400' : 'text-white'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function BigStatCard({ icon, label, value, color, bgColor }: { icon: React.ReactNode; label: string; value: string | number; color: string; bgColor: string }) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} to-metal-900 border border-metal-800 rounded-lg p-6`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-metal-400 text-sm">{label}</p>
      <p className="font-display font-black text-3xl text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

function ProgressStat({ label, value, max, suffix = '' }: { label: string; value: string | number; max: number; suffix?: string }) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const percentage = Math.min((numValue / max) * 100, 100)
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-metal-400">{label}</span>
        <span className="text-white">{value}{suffix}</span>
      </div>
      <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
        <div className="h-full bg-rust-500 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function SettingsToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-metal-500 text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-rust-500' : 'bg-metal-700'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
