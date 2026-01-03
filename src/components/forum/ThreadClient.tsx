'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Pin, Lock, Eye, MessageSquare, Clock, Share2,
  Bell, BellOff, Bookmark, BookmarkCheck, Flag, MoreHorizontal,
  ThumbsUp, Heart, Laugh, Flame, Award, Sword, Trophy,
  Quote, Reply, Edit, Trash2, ChevronUp, ChevronDown,
  User, Calendar, MapPin, Send, Image as ImageIcon, Smile,
  CheckCircle, AlertCircle, Hash
} from 'lucide-react'
import { useForumStore, getRankInfo, getFactionInfo, ForumThread, ForumPost, ReactionType } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { AIModerator } from '@/features/ai-moderation/moderator'
import { useTypingChannel } from '@/hooks/useTypingChannel'
import { useForumSSE, ForumSSEEvent } from '@/hooks/useForumSSE'

interface ThreadClientProps {
  threadId: string
}

const REACTIONS: { type: ReactionType; icon: React.ReactNode }[] = [
  { type: '👍', icon: <ThumbsUp className="w-4 h-4" /> },
  { type: '❤️', icon: <Heart className="w-4 h-4" /> },
  { type: '😂', icon: <Laugh className="w-4 h-4" /> },
  { type: '🔥', icon: <Flame className="w-4 h-4" /> },
  { type: '⚔️', icon: <Sword className="w-4 h-4" /> },
  { type: '🏆', icon: <Trophy className="w-4 h-4" /> },
]

export function ThreadClient({ threadId }: ThreadClientProps) {
  const [mounted, setMounted] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModerating, setIsModerating] = useState(false)
  const [moderationWarning, setModerationWarning] = useState<string | null>(null)
  
  const { 
    threads, 
    posts, 
    categories, 
    getPostsForThread, 
    fetchThread, 
    fetchPostsForThread,
    fetchCategories,
    createPostAPI,
    isLoadingThreads,
    isLoadingPosts 
  } = useForumStore()
  const { currentUser, openAuthModal } = useStore()

  const { typingUsers, setTyping } = useTypingChannel(
    'thread',
    threadId,
    currentUser ? { userId: currentUser.id, username: currentUser.displayName || currentUser.username } : null
  )

  // SSE: Live Thread Updates
  useForumSSE((event: ForumSSEEvent) => {
    if (event.type === 'thread_update' && event.data.threadId === threadId) {
      // Refresh posts if a new reply was added
      if (event.data.type === 'new_post') {
        fetchPostsForThread(threadId)
      }
    }
  })

  // Get thread from store
  const thread = useMemo(() => {
    return threads.find(t => t.id === threadId)
  }, [threads, threadId])

  // Get posts from store
  const displayPosts = useMemo(() => {
    return getPostsForThread(threadId)
  }, [getPostsForThread, threadId])

  // Find board info
  const boardInfo = useMemo(() => {
    if (!thread) return null
    for (const category of categories) {
      const board = category.boards.find(b => b.id === thread.boardId)
      if (board) return { board, categoryName: category.name }
    }
    return null
  }, [categories, thread])

  useEffect(() => {
    setMounted(true)
    // Fetch categories if not loaded
    if (categories.length === 0) {
      fetchCategories()
    }
    // Fetch thread and posts
    fetchThread(threadId)
    fetchPostsForThread(threadId)
  }, [threadId, categories.length, fetchCategories, fetchThread, fetchPostsForThread])

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUser || isSubmitting) return

    // Skip moderation for admins and mods
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      setIsModerating(true)
      setModerationWarning(null)
      
      try {
        const response = await fetch('/api/ai/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyContent,
            userId: currentUser.id,
            context: 'forum'
          })
        })
        
        const data = await response.json()
        
        if (!data.result.isAllowed) {
          setModerationWarning(data.result.reason || 'Beitrag verstößt gegen Community-Richtlinien')
          setIsModerating(false)
          return
        }
      } catch (error) {
        console.error('Moderation check failed:', error)
        // Allow post if moderation fails
      } finally {
        setIsModerating(false)
      }
    }

    setIsSubmitting(true)
    const result = await createPostAPI({
      threadId,
      content: replyContent.trim()
    })
    
    if (result) {
      setReplyContent('')
      setShowReplyBox(false)
      setModerationWarning(null)
    }
    setIsSubmitting(false)
  }

  if (!mounted || isLoadingThreads) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Thread nicht gefunden</h1>
          <Link href="/forum" className="text-rust-400 hover:text-rust-300">
            Zurück zum Forum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-6 flex-wrap"
        >
          <Link href="/forum" className="text-metal-500 hover:text-white transition-colors">
            Forum
          </Link>
          <span className="text-metal-600">/</span>
          {boardInfo && (
            <>
              <span className="text-metal-500">{boardInfo.categoryName}</span>
              <span className="text-metal-600">/</span>
              <Link 
                href={`/forum/board/${thread.boardId}`}
                className="text-metal-400 hover:text-white transition-colors"
              >
                {boardInfo.board.name}
              </Link>
              <span className="text-metal-600">/</span>
            </>
          )}
          <span className="text-white truncate max-w-[200px]">{thread.title}</span>
        </motion.div>

        {/* Thread Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {thread.isPinned && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                    <Pin className="w-3 h-3" /> Angepinnt
                  </span>
                )}
                {thread.isAnnouncement && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-rust-500/20 text-rust-400 text-xs rounded-full">
                    <AlertCircle className="w-3 h-3" /> Ankündigung
                  </span>
                )}
                {thread.isLocked && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-metal-700 text-metal-400 text-xs rounded-full">
                    <Lock className="w-3 h-3" /> Geschlossen
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                {thread.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-metal-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className={getRankInfo(thread.authorRank).color}>{thread.authorName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(thread.createdAt).toLocaleDateString('de-DE', { 
                    day: '2-digit', month: 'long', year: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {thread.viewCount.toLocaleString()} Views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {thread.replyCount} Antworten
                </span>
              </div>

              {/* Tags */}
              {thread.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {thread.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/forum/tag/${tag}`}
                      className="px-2 py-1 bg-metal-800 hover:bg-metal-700 text-metal-400 text-sm rounded-lg transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`p-2 rounded-lg transition-colors ${
                  isSubscribed ? 'bg-rust-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'
                }`}
                title={isSubscribed ? 'Abmelden' : 'Benachrichtigen'}
              >
                {isSubscribed ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'bg-amber-500 text-white' : 'bg-metal-800 text-metal-400 hover:text-white'
                }`}
                title={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button
                className="p-2 bg-metal-800 text-metal-400 hover:text-white rounded-lg transition-colors"
                title="Teilen"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Original Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <PostCard 
            post={{
              id: 'op',
              threadId,
              authorId: thread.authorId,
              authorName: thread.authorName,
              authorRank: thread.authorRank,
              authorFaction: thread.authorFaction,
              content: thread.content,
              createdAt: thread.createdAt,
              updatedAt: thread.updatedAt,
              isEdited: false,
              reactions: [],
              attachments: [],
              isBestAnswer: false,
              isHidden: false
            }}
            isOP
            threadReactions={thread.reactions}
            currentUser={currentUser}
          />
        </motion.div>

        {/* Replies Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rust-400" />
            {displayPosts.length} Antworten
          </h2>
          
          {currentUser && !thread.isLocked && (
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-2 px-4 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
            >
              <Reply className="w-4 h-4" />
              Antworten
            </button>
          )}
        </motion.div>

        {/* Quick Reply Box */}
        <AnimatePresence>
          {showReplyBox && currentUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              {/* Moderation Warning */}
              {moderationWarning && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-400">{moderationWarning}</p>
                    <button 
                      onClick={() => setModerationWarning(null)}
                      className="ml-auto text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-4">
                {typingUsers.length > 0 && (
                  <div className="mb-3 text-xs text-metal-400">
                    {typingUsers.length === 1 ? (
                      <span>
                        <span className="text-white">{typingUsers[0].username}</span> schreibt gerade...
                      </span>
                    ) : (
                      <span>
                        <span className="text-white">{typingUsers[0].username}</span>
                        {typingUsers.length === 2
                          ? ` und ${typingUsers[1].username}`
                          : ` und ${typingUsers.length - 1} weitere`}{' '}
                        schreiben gerade...
                      </span>
                    )}
                  </div>
                )}
                <textarea
                  value={replyContent}
                  onChange={(e) => {
                    setReplyContent(e.target.value)
                    setTyping(true)
                  }}
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
                  placeholder="Schreibe deine Antwort..."
                  disabled={isModerating}
                  className="w-full h-32 px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-metal-800 text-metal-400 hover:text-white rounded-lg transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-metal-800 text-metal-400 hover:text-white rounded-lg transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="px-4 py-2 text-metal-400 hover:text-white transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || isModerating || isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-rust-500 hover:bg-rust-400 disabled:bg-metal-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                    >
                      {isModerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Prüfe...
                        </>
                      ) : isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Senden...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Absenden
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-4">
          {displayPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <PostCard post={post} currentUser={currentUser} postNumber={index + 1} />
            </motion.div>
          ))}
        </div>

        {/* Login CTA for guests */}
        {!currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-rust-500/10 to-amber-500/10 border border-rust-500/20 rounded-xl text-center"
          >
            <h3 className="font-display font-bold text-white text-lg mb-2">
              Möchtest du mitdiskutieren?
            </h3>
            <p className="text-metal-400 mb-4">
              Melde dich an oder registriere dich, um auf dieses Thema zu antworten.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => openAuthModal('login')}
                className="px-6 py-2 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-xl transition-colors"
              >
                Anmelden
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
              >
                Registrieren
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Post Card Component
function PostCard({ 
  post, 
  isOP = false, 
  threadReactions,
  currentUser,
  postNumber
}: { 
  post: ForumPost; 
  isOP?: boolean;
  threadReactions?: any[];
  currentUser: any;
  postNumber?: number;
}) {
  const [showReactions, setShowReactions] = useState(false)
  const rankInfo = getRankInfo(post.authorRank)
  const factionInfo = post.authorFaction ? getFactionInfo(post.authorFaction) : null

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-metal-900/50 border rounded-xl overflow-hidden ${
      post.isBestAnswer 
        ? 'border-green-500/50 ring-1 ring-green-500/20' 
        : 'border-metal-800'
    }`}>
      {/* Best Answer Banner */}
      {post.isBestAnswer && (
        <div className="px-4 py-2 bg-green-500/20 border-b border-green-500/30 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Beste Antwort</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Author Sidebar */}
        <div className={`md:w-48 p-4 border-b md:border-b-0 md:border-r border-metal-800 ${
          factionInfo ? `bg-gradient-to-b ${factionInfo.gradient}` : 'bg-metal-900/30'
        }`}>
          <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 text-center">
            {/* Avatar */}
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${
              factionInfo 
                ? 'bg-metal-800/50' 
                : 'bg-gradient-to-br from-rust-500 to-amber-600'
            }`}>
              {post.authorName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left md:text-center">
              {/* Name */}
              <Link 
                href={`/profile/${post.authorId}`}
                className={`font-bold hover:underline ${factionInfo ? factionInfo.color : rankInfo.color}`}
              >
                {post.authorName}
              </Link>

              {/* Rank */}
              <p className={`text-xs ${rankInfo.color}`}>
                {rankInfo.icon} {rankInfo.name}
              </p>

              {/* Faction */}
              {factionInfo && (
                <p className={`text-xs ${factionInfo.color}`}>
                  {factionInfo.icon} {factionInfo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-metal-500">
              <Clock className="w-3 h-3" />
              {formatDate(post.createdAt)}
              {post.isEdited && (
                <span className="text-metal-600">(bearbeitet)</span>
              )}
              {postNumber && (
                <span className="text-metal-600">#{postNumber}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {currentUser && (
                <>
                  <button className="p-1.5 text-metal-500 hover:text-white hover:bg-metal-800 rounded transition-colors">
                    <Quote className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-metal-500 hover:text-white hover:bg-metal-800 rounded transition-colors">
                    <Flag className="w-4 h-4" />
                  </button>
                </>
              )}
              <button className="p-1.5 text-metal-500 hover:text-white hover:bg-metal-800 rounded transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reply Reference */}
          {post.replyToPostId && (
            <div className="mb-4 p-3 bg-metal-800/50 border-l-2 border-rust-500 rounded-r-lg text-sm text-metal-400">
              Antwort auf einen vorherigen Beitrag
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-metal-200 whitespace-pre-wrap">{post.content}</div>
          </div>

          {/* Signature */}
          {post.authorSignature && (
            <div className="mt-4 pt-4 border-t border-metal-800">
              <p className="text-xs text-metal-500 italic">{post.authorSignature}</p>
            </div>
          )}

          {/* Reactions */}
          <div className="mt-4 pt-4 border-t border-metal-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Existing Reactions */}
              {(isOP ? threadReactions : post.reactions)?.filter((r: any) => r.count > 0 || r.userId).slice(0, 5).map((reaction: any, idx: number) => (
                <button
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 bg-metal-800 hover:bg-metal-700 rounded-full text-sm transition-colors"
                >
                  <span>{reaction.type}</span>
                  <span className="text-metal-400">{reaction.count || 1}</span>
                </button>
              ))}

              {/* Add Reaction */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="flex items-center gap-1 px-2 py-1 bg-metal-800 hover:bg-metal-700 rounded-full text-sm text-metal-400 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                  <span>+</span>
                </button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 p-2 bg-metal-800 border border-metal-700 rounded-xl shadow-xl flex gap-1"
                    >
                      {REACTIONS.map((r) => (
                        <button
                          key={r.type}
                          onClick={() => setShowReactions(false)}
                          className="p-2 hover:bg-metal-700 rounded-lg transition-colors text-lg"
                        >
                          {r.type}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {currentUser && (
              <button className="flex items-center gap-1 text-metal-500 hover:text-rust-400 text-sm transition-colors">
                <Reply className="w-4 h-4" />
                Antworten
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
