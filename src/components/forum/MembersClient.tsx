'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Search, Users, Crown, Shield, Zap, Star,
  Filter, SortAsc, SortDesc, Calendar, MessageSquare,
  ChevronDown, Grid, List, MapPin
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, UserRank } from '@/store/forumStore'

interface Member {
  id: string
  username: string
  displayName: string
  avatar?: string
  rank: UserRank
  faction?: string
  postCount: number
  joinedAt: Date
  lastOnline: Date
  isOnline: boolean
  reputation: number
}

export function MembersClient() {
  const [mounted, setMounted] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'posts' | 'reputation' | 'joined' | 'name'>('reputation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterRank, setFilterRank] = useState<UserRank | 'all'>('all')
  const [filterFaction, setFilterFaction] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch members from API
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/users?limit=50')
        if (res.ok) {
          const data = await res.json()
          const mappedMembers: Member[] = data.users?.map((u: any) => ({
            id: u.id,
            username: u.username,
            displayName: u.displayName || u.username,
            avatar: u.avatar,
            rank: u.role === 'admin' ? 'admin' : u.role === 'moderator' ? 'moderator' : 'member',
            faction: u.faction,
            postCount: u._count?.forumPosts || 0,
            joinedAt: new Date(u.createdAt),
            lastOnline: new Date(u.lastActive || u.createdAt),
            isOnline: u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 15 * 60 * 1000),
            reputation: u.reputation || 0
          })) || []
          setMembers(mappedMembers)
        }
      } catch (error) {
        console.error('Failed to fetch members:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    let result = [...members]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m => 
        m.username.toLowerCase().includes(query) || 
        m.displayName.toLowerCase().includes(query)
      )
    }

    // Filter by rank
    if (filterRank !== 'all') {
      result = result.filter(m => m.rank === filterRank)
    }

    // Filter by faction
    if (filterFaction !== 'all') {
      result = result.filter(m => m.faction === filterFaction)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'posts':
          comparison = a.postCount - b.postCount
          break
        case 'reputation':
          comparison = a.reputation - b.reputation
          break
        case 'joined':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          break
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName)
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [members, searchQuery, sortBy, sortOrder, filterRank, filterFaction])

  const onlineCount = members.filter(m => m.isOnline).length

  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/forum" className="p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-metal-400" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Mitglieder</h1>
              <p className="text-metal-400 text-sm">
                {members.length} Mitglieder • <span className="text-green-400">{onlineCount} online</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-metal-900/50 border border-metal-800 rounded-xl p-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mitglieder suchen..."
                className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder-metal-500 text-sm focus:outline-none focus:border-rust-500"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-rust-500"
              >
                <option value="reputation">Reputation</option>
                <option value="posts">Beiträge</option>
                <option value="joined">Beigetreten</option>
                <option value="name">Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? (
                  <SortDesc className="w-4 h-4 text-metal-400" />
                ) : (
                  <SortAsc className="w-4 h-4 text-metal-400" />
                )}
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* View Mode */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-metal-800 flex flex-wrap gap-4"
            >
              <div>
                <label className="block text-metal-500 text-xs mb-1">Rang</label>
                <select
                  value={filterRank}
                  onChange={(e) => setFilterRank(e.target.value as any)}
                  className="px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-rust-500"
                >
                  <option value="all">Alle Ränge</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="legend">Legende</option>
                  <option value="elite">Elite</option>
                  <option value="veteran">Veteran</option>
                  <option value="active">Aktiv</option>
                  <option value="member">Mitglied</option>
                  <option value="newcomer">Neuling</option>
                </select>
              </div>
              <div>
                <label className="block text-metal-500 text-xs mb-1">Fraktion</label>
                <select
                  value={filterFaction}
                  onChange={(e) => setFilterFaction(e.target.value)}
                  className="px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg text-white text-sm focus:outline-none focus:border-rust-500"
                >
                  <option value="all">Alle Fraktionen</option>
                  <option value="seraphar">🦁 Seraphar</option>
                  <option value="vorgaroth">🐉 Vorgaroth</option>
                  <option value="netharis">🐍 Netharis</option>
                  <option value="kaldrim">🐺 Kaldrim</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Members Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-2'
          }
        >
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {viewMode === 'grid' ? (
                <MemberCard member={member} />
              ) : (
                <MemberRow member={member} />
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-metal-700 mx-auto mb-4" />
            <p className="text-metal-500">Keine Mitglieder gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MemberCard({ member }: { member: Member }) {
  const rankInfo = getRankInfo(member.rank)
  const factionInfo = member.faction ? getFactionInfo(member.faction) : null

  return (
    <Link
      href={`/profile/${member.id}`}
      className={`block p-4 bg-metal-900/50 border border-metal-800 rounded-xl hover:border-rust-500/50 transition-all ${
        factionInfo ? `bg-gradient-to-br ${factionInfo.gradient}` : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white ${
            factionInfo ? 'bg-metal-800/50' : 'bg-gradient-to-br from-rust-500 to-amber-600'
          }`}>
            {member.displayName.charAt(0).toUpperCase()}
          </div>
          {member.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-metal-900 rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate ${factionInfo ? factionInfo.color : rankInfo.color}`}>
              {member.displayName}
            </h3>
            {member.rank === 'admin' && <Crown className="w-4 h-4 text-rust-400" />}
            {member.rank === 'moderator' && <Shield className="w-4 h-4 text-cyan-400" />}
          </div>
          <p className={`text-xs ${rankInfo.color}`}>{rankInfo.icon} {rankInfo.name}</p>
          {factionInfo && (
            <p className={`text-xs ${factionInfo.color}`}>{factionInfo.icon} {factionInfo.name}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-metal-800/50 text-xs text-metal-500">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {member.postCount}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" />
          {member.reputation}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(member.joinedAt).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  )
}

function MemberRow({ member }: { member: Member }) {
  const rankInfo = getRankInfo(member.rank)
  const factionInfo = member.faction ? getFactionInfo(member.faction) : null

  return (
    <Link
      href={`/profile/${member.id}`}
      className="flex items-center gap-4 p-4 bg-metal-900/50 border border-metal-800 rounded-xl hover:border-rust-500/50 transition-all"
    >
      {/* Avatar */}
      <div className="relative">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
          factionInfo ? `bg-gradient-to-br ${factionInfo.gradient}` : 'bg-gradient-to-br from-rust-500 to-amber-600'
        }`}>
          {member.displayName.charAt(0).toUpperCase()}
        </div>
        {member.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-metal-900 rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-bold ${factionInfo ? factionInfo.color : rankInfo.color}`}>
            {member.displayName}
          </h3>
          {member.rank === 'admin' && <Crown className="w-4 h-4 text-rust-400" />}
          {member.rank === 'moderator' && <Shield className="w-4 h-4 text-cyan-400" />}
        </div>
        <p className="text-xs text-metal-500">@{member.username}</p>
      </div>

      {/* Rank & Faction */}
      <div className="hidden sm:block text-right">
        <p className={`text-sm ${rankInfo.color}`}>{rankInfo.icon} {rankInfo.name}</p>
        {factionInfo && <p className={`text-xs ${factionInfo.color}`}>{factionInfo.name}</p>}
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-white">{member.postCount}</p>
          <p className="text-xs text-metal-500">Beiträge</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-amber-400">{member.reputation}</p>
          <p className="text-xs text-metal-500">Reputation</p>
        </div>
      </div>
    </Link>
  )
}
