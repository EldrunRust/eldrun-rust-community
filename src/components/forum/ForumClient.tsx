'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  MessageSquare, Users, TrendingUp, Clock, Search, 
  ChevronDown, ChevronRight, Pin, Lock, Bell, BellOff,
  Eye, MessageCircle, Flame, Star, Crown, Shield,
  Settings, Plus, Filter, LayoutGrid, List, Zap,
  Hash, Activity, Globe, UserPlus, Award, Sparkles
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { ForumShoutbox } from './ForumShoutbox'
import { ForumStats } from './ForumStats'
import { ForumOnlineUsers } from './ForumOnlineUsers'
import { ForumSearch } from './ForumSearch'

export function ForumClient() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const { 
    categories, 
    stats, 
    toggleCategoryCollapse, 
    fetchCategories, 
    fetchStats, 
    fetchOnlineUsers,
    isLoadingCategories 
  } = useForumStore()
  const { currentUser, openAuthModal } = useStore()

  useEffect(() => {
    setMounted(true)
    // Fetch forum data from API
    fetchCategories()
    fetchStats()
    fetchOnlineUsers()
  }, [fetchCategories, fetchStats, fetchOnlineUsers])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-metal-400 font-mono text-sm">Forum lädt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats & Actions Header */}
      <div className="flex flex-col items-center gap-8 pb-8 border-b border-metal-800">
        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6">
          <QuickStat icon={<MessageSquare className="w-5 h-5" />} value={stats.totalPosts.toLocaleString()} label="Beiträge" />
          <QuickStat icon={<Hash className="w-5 h-5" />} value={stats.totalThreads.toLocaleString()} label="Themen" />
          <QuickStat icon={<Users className="w-5 h-5" />} value={stats.totalMembers.toLocaleString()} label="Mitglieder" />
          <QuickStat icon={<Activity className="w-5 h-5" />} value={`${stats.onlineUsers + stats.onlineGuests}`} label="Online" color="text-green-400" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {currentUser ? (
            <>
              <Link
                href="/forum/new"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rust-600 to-rust-500 hover:from-rust-500 hover:to-rust-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-rust-500/25"
              >
                <Plus className="w-5 h-5" />
                Neues Thema
              </Link>
              <Link
                href="/forum/messages"
                className="flex items-center gap-2 px-6 py-3 bg-metal-800 hover:bg-metal-700 border border-metal-700 text-white font-bold rounded-xl transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Nachrichten
              </Link>
            </>
          ) : (
            <button
              onClick={() => openAuthModal('register')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rust-600 to-rust-500 hover:from-rust-500 hover:to-rust-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-rust-500/25"
            >
              <UserPlus className="w-5 h-5" />
              Jetzt registrieren & mitmachen
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Forum Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-between gap-4 p-4 bg-metal-900/50 border border-metal-800 rounded-xl"
          >
            <ForumSearch />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Categories & Boards */}
          <div className="space-y-6">
            {categories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + catIndex * 0.05 }}
              >
                <CategorySection 
                  category={category} 
                  viewMode={viewMode}
                  onToggle={() => toggleCategoryCollapse(category.id)}
                  currentUser={currentUser}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shoutbox */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ForumShoutbox />
          </motion.div>

          {/* Online Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ForumOnlineUsers />
          </motion.div>

          {/* Forum Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ForumStats />
          </motion.div>

          {/* Popular Tags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PopularTags />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Quick Stat Component
function QuickStat({ icon, value, label, color = 'text-rust-400' }: { icon: React.ReactNode; value: string; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-metal-900/50 border border-metal-800 rounded-xl">
      <div className={color}>{icon}</div>
      <div>
        <p className="font-display font-bold text-white">{value}</p>
        <p className="text-xs text-metal-500">{label}</p>
      </div>
    </div>
  )
}

// Category Section Component
function CategorySection({ 
  category, 
  viewMode, 
  onToggle,
  currentUser 
}: { 
  category: any; 
  viewMode: 'cards' | 'list'; 
  onToggle: () => void;
  currentUser: any;
}) {
  return (
    <div className="bg-metal-900/30 border border-metal-800 rounded-xl overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-metal-900 to-metal-900/50 hover:from-metal-800 hover:to-metal-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h2 className="font-display font-bold text-white text-lg">{category.name}</h2>
            <p className="text-metal-500 text-sm">{category.description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: category.isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-metal-500" />
        </motion.div>
      </button>

      {/* Boards */}
      <AnimatePresence>
        {!category.isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 p-4' : 'divide-y divide-metal-800'}>
              {category.boards.map((board: any) => (
                <BoardItem 
                  key={board.id} 
                  board={board} 
                  viewMode={viewMode}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Board Item Component
function BoardItem({ board, viewMode, currentUser }: { board: any; viewMode: 'cards' | 'list'; currentUser: any }) {
  const factionInfo = board.factionOnly ? getFactionInfo(board.factionOnly) : null
  const canAccess = !board.isPrivate || (currentUser && (!board.factionOnly || currentUser.faction === board.factionOnly))

  if (viewMode === 'cards') {
    return (
      <Link
        href={canAccess ? `/forum/board/${board.id}` : '#'}
        className={`group block p-4 rounded-xl border transition-all ${
          canAccess 
            ? 'bg-metal-900/50 border-metal-800 hover:border-rust-500/50 hover:bg-metal-900' 
            : 'bg-metal-900/30 border-metal-800/50 cursor-not-allowed opacity-60'
        } ${factionInfo ? `bg-gradient-to-br ${factionInfo.gradient}` : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            factionInfo ? 'bg-metal-800/50' : 'bg-metal-800'
          }`}>
            {board.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold truncate ${canAccess ? 'text-white group-hover:text-rust-400' : 'text-metal-500'}`}>
                {board.name}
              </h3>
              {board.isPrivate && <Lock className="w-4 h-4 text-metal-500" />}
            </div>
            <p className="text-metal-500 text-sm line-clamp-2 mt-1">{board.description}</p>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-metal-500">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {board.threadCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {board.postCount}
              </span>
            </div>

            {board.lastPost && (
              <div className="mt-3 pt-3 border-t border-metal-800">
                <p className="text-xs text-metal-400 truncate">
                  <span className="text-rust-400">{board.lastPost.authorName}</span>
                  {' in '}
                  <span className="text-metal-300">{board.lastPost.threadTitle}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // List View
  return (
    <Link
      href={canAccess ? `/forum/board/${board.id}` : '#'}
      className={`group flex items-center gap-4 p-4 transition-colors ${
        canAccess 
          ? 'hover:bg-metal-800/50' 
          : 'cursor-not-allowed opacity-60'
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-metal-800 flex items-center justify-center text-xl">
        {board.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-bold ${canAccess ? 'text-white group-hover:text-rust-400' : 'text-metal-500'}`}>
            {board.name}
          </h3>
          {board.isPrivate && <Lock className="w-4 h-4 text-metal-500" />}
        </div>
        <p className="text-metal-500 text-sm truncate">{board.description}</p>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-metal-500">
        <div className="text-center">
          <p className="font-bold text-white">{board.threadCount}</p>
          <p className="text-xs">Themen</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-white">{board.postCount}</p>
          <p className="text-xs">Beiträge</p>
        </div>
      </div>

      {board.lastPost && (
        <div className="hidden lg:block text-right min-w-0 max-w-[200px]">
          <p className="text-sm text-metal-300 truncate">{board.lastPost.threadTitle}</p>
          <p className="text-xs text-metal-500">
            von <span className="text-rust-400">{board.lastPost.authorName}</span>
          </p>
        </div>
      )}
    </Link>
  )
}

// Popular Tags Component
function PopularTags() {
  const { popularTags } = useForumStore()

  return (
    <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-4">
      <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
        <Hash className="w-5 h-5 text-rust-400" />
        Beliebte Tags
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {popularTags.slice(0, 15).map((tag) => (
          <Link
            key={tag}
            href={`/forum/tag/${tag}`}
            className="px-3 py-1 bg-metal-800 hover:bg-metal-700 text-metal-400 hover:text-white text-sm rounded-full transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
