'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Pin, Lock, Eye, MessageSquare, Clock,
  ChevronDown, Filter, SortAsc, SortDesc, Tag, Bell, BellOff,
  Flame, Star, User, Calendar, MoreHorizontal, Bookmark,
  TrendingUp, MessageCircle, Hash
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, ForumThread, ForumBoard } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { canAccessBoard } from '@/lib/forumPermissions'

interface BoardClientProps {
  boardId: string
}

export function BoardClient({ boardId }: BoardClientProps) {
  const [mounted, setMounted] = useState(false)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest')
  const [showFilters, setShowFilters] = useState(false)
  
  const { 
    categories, 
    getThreadsForBoard, 
    fetchThreadsForBoard, 
    fetchCategories,
    isLoadingThreads 
  } = useForumStore()
  const { currentUser, openAuthModal } = useStore()

  // Find the board
  const board = useMemo(() => {
    for (const category of categories) {
      const found = category.boards.find(b => b.id === boardId)
      if (found) return { ...found, categoryName: category.name }
    }
    return null
  }, [categories, boardId])

  const canAccess = board ? canAccessBoard(board as any, currentUser) : true

  // Get threads for this board from store
  const displayThreads = useMemo(() => {
    return getThreadsForBoard(boardId)
  }, [getThreadsForBoard, boardId])

  useEffect(() => {
    setMounted(true)
    // Fetch categories if not loaded
    if (categories.length === 0) {
      fetchCategories()
    }
    // Fetch threads for this board
    fetchThreadsForBoard(boardId)
  }, [boardId, categories.length, fetchCategories, fetchThreadsForBoard])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Board nicht gefunden</h1>
          <Link href="/forum" className="text-rust-400 hover:text-rust-300">
            Zurück zum Forum
          </Link>
        </div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-metal-900/50 border border-metal-800 rounded-xl max-w-md">
          <Lock className="w-12 h-12 text-rust-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Zugriff beschränkt</h2>
          <p className="text-metal-400 mb-6">Dieses Board ist nur für berechtigte Benutzer verfügbar.</p>
          {currentUser ? (
            <Link href="/forum" className="text-rust-400 hover:text-rust-300">
              Zurück zum Forum
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
            >
              Anmelden
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-6"
        >
          <Link href="/forum" className="text-metal-500 hover:text-white transition-colors">
            Forum
          </Link>
          <span className="text-metal-600">/</span>
          <span className="text-metal-400">{(board as any).categoryName}</span>
          <span className="text-metal-600">/</span>
          <span className="text-white">{board.name}</span>
        </motion.div>

        {/* Board Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-metal-800 flex items-center justify-center text-3xl">
                {board.icon}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{board.name}</h1>
                <p className="text-metal-400 mt-1">{board.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-metal-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {board.threadCount} Themen
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {board.postCount} Beiträge
                  </span>
                </div>
              </div>
            </div>

            {currentUser ? (
              <Link
                href={`/forum/new?board=${boardId}`}
                className="flex items-center gap-2 px-4 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Neues Thema
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-4 py-2 bg-metal-800 hover:bg-metal-700 text-metal-400 font-bold rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Anmelden zum Posten
              </button>
            )}
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'latest' 
                  ? 'bg-rust-500 text-white' 
                  : 'bg-metal-800 text-metal-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Neueste
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'popular' 
                  ? 'bg-rust-500 text-white' 
                  : 'bg-metal-800 text-metal-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Beliebt
            </button>
            <button
              onClick={() => setSortBy('unanswered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'unanswered' 
                  ? 'bg-rust-500 text-white' 
                  : 'bg-metal-800 text-metal-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Unbeantwortet
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </motion.div>

        {/* Thread List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-metal-900/30 border border-metal-800 rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-metal-900/50 border-b border-metal-800 text-sm font-medium text-metal-500">
            <div className="col-span-7">Thema</div>
            <div className="col-span-2 text-center">Antworten</div>
            <div className="col-span-3 text-right">Letzte Aktivität</div>
          </div>

          {/* Threads */}
          <div className="divide-y divide-metal-800">
            {displayThreads.map((thread, index) => (
              <ThreadRow key={thread.id} thread={thread} index={index} />
            ))}
          </div>

          {displayThreads.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-metal-700 mx-auto mb-4" />
              <p className="text-metal-500">Noch keine Themen in diesem Board</p>
              {currentUser && (
                <Link
                  href={`/forum/new?board=${boardId}`}
                  className="inline-flex items-center gap-2 mt-4 text-rust-400 hover:text-rust-300"
                >
                  <Plus className="w-4 h-4" />
                  Erstelle das erste Thema
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-6"
        >
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === 1 
                    ? 'bg-rust-500 text-white' 
                    : 'bg-metal-800 text-metal-400 hover:text-white hover:bg-metal-700'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="text-metal-500 px-2">...</span>
            <button className="w-10 h-10 rounded-lg bg-metal-800 text-metal-400 hover:text-white hover:bg-metal-700 font-medium transition-colors">
              24
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ThreadRow({ thread, index }: { thread: ForumThread; index: number }) {
  const rankInfo = getRankInfo(thread.authorRank)
  const factionInfo = thread.authorFaction ? getFactionInfo(thread.authorFaction) : null

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'vor wenigen Minuten'
    if (hours < 24) return `vor ${hours} Stunden`
    if (days < 7) return `vor ${days} Tagen`
    return new Date(date).toLocaleDateString('de-DE')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/forum/thread/${thread.id}`}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-metal-800/30 transition-colors"
      >
        {/* Thread Info */}
        <div className="col-span-7 flex items-start gap-3">
          {/* Author Avatar */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
            factionInfo 
              ? `bg-gradient-to-br ${factionInfo.gradient}` 
              : 'bg-gradient-to-br from-rust-500 to-amber-600'
          }`}>
            {thread.authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 flex-wrap">
              {thread.isPinned && (
                <Pin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              {thread.isLocked && (
                <Lock className="w-4 h-4 text-metal-500 flex-shrink-0" />
              )}
              {thread.isAnnouncement && (
                <span className="px-2 py-0.5 bg-rust-500/20 text-rust-400 text-xs rounded-full flex-shrink-0">
                  Ankündigung
                </span>
              )}
              <h3 className="font-medium text-white hover:text-rust-400 transition-colors truncate">
                {thread.title}
              </h3>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1 text-xs text-metal-500">
              <span className={factionInfo ? factionInfo.color : rankInfo.color}>
                {thread.authorName}
              </span>
              <span>{formatDate(thread.createdAt)}</span>
              {thread.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {thread.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-metal-800 rounded text-metal-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-2 flex md:flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-1 text-metal-400">
            <MessageSquare className="w-4 h-4" />
            <span className="font-bold text-white">{thread.replyCount}</span>
          </div>
          <div className="flex items-center gap-1 text-metal-500 text-xs">
            <Eye className="w-3 h-3" />
            <span>{thread.viewCount}</span>
          </div>
        </div>

        {/* Last Reply */}
        <div className="col-span-3 text-right">
          {thread.lastReply ? (
            <div className="text-sm">
              <p className="text-metal-400 truncate">{thread.lastReply.authorName}</p>
              <p className="text-metal-500 text-xs">{formatDate(thread.lastReply.timestamp)}</p>
            </div>
          ) : (
            <p className="text-metal-500 text-sm">Keine Antworten</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
