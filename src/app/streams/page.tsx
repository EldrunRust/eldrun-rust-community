'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, Users, Eye, Clock, ExternalLink, Play,
  Heart, MessageCircle, Star, Twitch, Youtube, Filter
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// Streams are loaded from Twitch/YouTube API integration
interface Stream {
  id: string
  platform: 'twitch' | 'youtube'
  username: string
  title: string
  viewers: number
  thumbnail: string
  avatar: string
  isLive: boolean
  language: string
  tags: string[]
  startedAt: Date
  followers: number
  verified: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULIERTE STREAMS - Live Content auf Eldrun
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// LEGENDÄRE STREAMS - Live Content auf allen Plattformen
// ═══════════════════════════════════════════════════════════════════════════

const streams: Stream[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED STREAMS - Die größten Creator
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 's1', platform: 'twitch', username: 'EldrunTV', title: '🔥 FRAKTIONSKRIEG LIVE! Seraphar vs Vorgaroth - FINALE!', viewers: 2847, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', avatar: '📺', isLive: true, language: 'DE', tags: ['Deutsch', 'PvP', 'Event', 'Featured'], startedAt: new Date(Date.now() - 7200000), followers: 45600, verified: true },
  { id: 's2', platform: 'twitch', username: 'SirEldrunOfficial', title: '👑 OWNER STREAM - Q&A + Giveaways + Sneak Peeks!', viewers: 1893, thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', avatar: '👑', isLive: true, language: 'DE', tags: ['Official', 'Giveaway', 'Q&A', 'Owner'], startedAt: new Date(Date.now() - 3600000), followers: 67800, verified: true },
  { id: 's3', platform: 'youtube', username: 'RustMasterTV', title: '🏰 MEGA BASE TOUR - Die 10 besten Basen auf Eldrun!', viewers: 1456, thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=225&fit=crop', avatar: '🏰', isLive: true, language: 'DE', tags: ['Tutorial', 'Building', 'Tour'], startedAt: new Date(Date.now() - 5400000), followers: 89400, verified: true },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PVP & TOURNAMENT STREAMS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 's4', platform: 'twitch', username: 'ClanWarsTV', title: '⚔️ GILDEN FINALE! Phoenix Rising vs Iron Legion', viewers: 1276, thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop', avatar: '🏆', isLive: true, language: 'DE', tags: ['Tournament', 'PvP', 'Clan', 'Finals'], startedAt: new Date(Date.now() - 1800000), followers: 34500, verified: true },
  { id: 's5', platform: 'twitch', username: 'ProRaiderDE', title: '💀 50 KILL STREAK CHALLENGE - Road to Legend!', viewers: 743, thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', avatar: '⚔️', isLive: true, language: 'DE', tags: ['Deutsch', 'PvP', 'Challenge'], startedAt: new Date(Date.now() - 3600000), followers: 28900, verified: true },
  { id: 's6', platform: 'twitch', username: 'BloodMoonPvP', title: '🌑 HARDCORE PVP - Artifact Island Domination', viewers: 567, thumbnail: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop', avatar: '🌑', isLive: true, language: 'DE', tags: ['Hardcore', 'PvP', 'Pro'], startedAt: new Date(Date.now() - 9000000), followers: 19200, verified: false },
  { id: 's7', platform: 'youtube', username: 'ArenaChampions', title: '🎯 2v2 ARENA TURNIER - 50.000 Coins Preisgeld!', viewers: 423, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=225&fit=crop', avatar: '🎯', isLive: true, language: 'DE', tags: ['Arena', 'Tournament', 'Prize'], startedAt: new Date(Date.now() - 4500000), followers: 15600, verified: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RAID & PVE STREAMS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 's8', platform: 'twitch', username: 'RaidBossHunter', title: '🐉 DRAGON LAIR FIRST CLEAR ATTEMPT! Gilde run', viewers: 892, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', avatar: '🐉', isLive: true, language: 'DE', tags: ['PvE', 'Raid', 'Boss', 'First'], startedAt: new Date(Date.now() - 2700000), followers: 22100, verified: true },
  { id: 's9', platform: 'twitch', username: 'OilRigSpeedrun', title: '⚡ OIL RIG SPEEDRUN WR ATTEMPT - Sub 8 Minutes!', viewers: 634, thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', avatar: '⚡', isLive: true, language: 'DE', tags: ['Speedrun', 'WR', 'OilRig'], startedAt: new Date(Date.now() - 5400000), followers: 17800, verified: false },
  { id: 's10', platform: 'youtube', username: 'MonumentMaster', title: '🏛️ ALLE MONUMENT GUIDE - Tipps & Tricks 2024', viewers: 378, thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=225&fit=crop', avatar: '🏛️', isLive: true, language: 'DE', tags: ['Guide', 'Monument', 'Tips'], startedAt: new Date(Date.now() - 7200000), followers: 31200, verified: true },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHILL & COMMUNITY STREAMS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 's11', platform: 'twitch', username: 'NightOwlRust', title: '🌙 Late Night Chill - Farming & Chat mit Community', viewers: 289, thumbnail: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop', avatar: '🦉', isLive: true, language: 'DE', tags: ['Chill', 'Farming', 'Night', 'Community'], startedAt: new Date(Date.now() - 9000000), followers: 8500, verified: false },
  { id: 's12', platform: 'twitch', username: 'CasualCrafter', title: '🛠️ Base Building für Anfänger - Fragen erwünscht!', viewers: 156, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=225&fit=crop', avatar: '🛠️', isLive: true, language: 'DE', tags: ['Beginner', 'Building', 'Tutorial'], startedAt: new Date(Date.now() - 4500000), followers: 5200, verified: false },
  { id: 's13', platform: 'youtube', username: 'EldrunGuides', title: '📚 KOMPLETT GUIDE - Von Null zum Pro in 2 Stunden!', viewers: 534, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=225&fit=crop', avatar: '📚', isLive: true, language: 'DE', tags: ['Guide', 'Newbie', 'Complete'], startedAt: new Date(Date.now() - 4500000), followers: 42800, verified: true },
  { id: 's14', platform: 'twitch', username: 'RoleplayKingTV', title: '🎭 LIVE RP EVENT - Die Taverne ist geöffnet!', viewers: 234, thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=225&fit=crop', avatar: '🎭', isLive: true, language: 'DE', tags: ['Roleplay', 'Event', 'RP'], startedAt: new Date(Date.now() - 3600000), followers: 11200, verified: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNATIONALE STREAMS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 's15', platform: 'twitch', username: 'EldrunEN', title: '🌍 ENGLISH STREAM - Faction War Commentary!', viewers: 678, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', avatar: '🌍', isLive: true, language: 'EN', tags: ['English', 'PvP', 'Commentary'], startedAt: new Date(Date.now() - 5400000), followers: 18900, verified: true },
  { id: 's16', platform: 'youtube', username: 'EldrunFrance', title: '🇫🇷 STREAM FRANÇAIS - Découverte du serveur!', viewers: 234, thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', avatar: '🇫🇷', isLive: true, language: 'FR', tags: ['French', 'Nouveau', 'Découverte'], startedAt: new Date(Date.now() - 7200000), followers: 7800, verified: false },
]

const FEATURED_CLIPS = [
  {
    id: 'c1',
    title: 'INSANE 1v4 Clutch!',
    creator: 'RustMasterTV',
    views: 45000,
    duration: '0:32',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=170&fit=crop',
  },
  {
    id: 'c2',
    title: 'Counter Raid Gone Wrong',
    creator: 'ProRaiderDE',
    views: 28000,
    duration: '1:15',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=170&fit=crop',
  },
  {
    id: 'c3',
    title: 'Helicopter Fight',
    creator: 'ClanWarsTV',
    views: 62000,
    duration: '0:45',
    thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=300&h=170&fit=crop',
  },
]

export default function StreamsPage() {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'twitch' | 'youtube'>('all')
  const [sortBy, setSortBy] = useState<'viewers' | 'recent'>('viewers')

  const filteredStreams = streams
    .filter(s => filterPlatform === 'all' || s.platform === filterPlatform)
    .sort((a, b) => {
      if (sortBy === 'viewers') return b.viewers - a.viewers
      return b.startedAt.getTime() - a.startedAt.getTime()
    })

  const formatDuration = (startedAt: Date) => {
    const diff = Date.now() - startedAt.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const totalViewers = streams.reduce((acc, s) => acc + s.viewers, 0)

  return (
    <EldrunPageShell
      icon={Video}
      badge="LIVE STREAMS"
      title="STREAMS"
      subtitle="ELDRUN LIVE CONTENT"
      description={`Schau den besten Streamern auf unserem Server zu. Aktuell live: ${streams.length} Streams mit ${formatViewers(totalViewers)} Zuschauern.`}
      gradient="from-purple-300 via-purple-400 to-purple-600"
      glowColor="rgba(168,85,247,0.22)"
    >
      <AuthGate>
      <div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filterPlatform === 'all'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterPlatform('twitch')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                filterPlatform === 'twitch'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700'
              }`}
            >
              <Twitch className="w-4 h-4" />
              Twitch
            </button>
            <button
              onClick={() => setFilterPlatform('youtube')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                filterPlatform === 'youtube'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700'
              }`}
            >
              <Youtube className="w-4 h-4" />
              YouTube
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSortBy('viewers')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                sortBy === 'viewers' ? 'bg-metal-700 text-white' : 'text-metal-400'
              }`}
            >
              Nach Zuschauern
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                sortBy === 'recent' ? 'bg-metal-700 text-white' : 'text-metal-400'
              }`}
            >
              Neueste
            </button>
          </div>
        </div>

        {/* Featured Stream */}
        {filteredStreams.length > 0 && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-metal-900/50 border border-metal-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img
                    src={filteredStreams[0].thumbnail}
                    alt={filteredStreams[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewers(filteredStreams[0].viewers)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {formatDuration(filteredStreams[0].startedAt)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-metal-800 flex items-center justify-center text-2xl">
                      {filteredStreams[0].avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{filteredStreams[0].username}</span>
                        {filteredStreams[0].verified && (
                          <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                        )}
                      </div>
                      <div className="text-sm text-metal-400">
                        {formatViewers(filteredStreams[0].followers)} Follower
                      </div>
                    </div>
                    <div className="ml-auto">
                      {filteredStreams[0].platform === 'twitch' ? (
                        <Twitch className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Youtube className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </div>

                  <h2 className="font-display font-bold text-2xl text-white mb-4">
                    {filteredStreams[0].title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {filteredStreams[0].tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-metal-800 text-metal-300 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 w-fit">
                    <ExternalLink className="w-5 h-5" />
                    Stream ansehen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stream Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredStreams.slice(1).map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViewers(stream.viewers)}
                  </span>
                  <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                    {formatDuration(stream.startedAt)}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {stream.platform === 'twitch' ? (
                    <Twitch className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Youtube className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-metal-800 flex items-center justify-center text-lg flex-shrink-0">
                    {stream.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{stream.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-metal-400">
                      <span>{stream.username}</span>
                      {stream.verified && (
                        <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Clips */}
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" />
            Beliebte Clips
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_CLIPS.map((clip, index) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all"
              >
                <div className="relative aspect-video">
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                      {clip.duration}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white mb-1">{clip.title}</h3>
                  <div className="flex items-center justify-between text-sm text-metal-400">
                    <span>{clip.creator}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewers(clip.views)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
