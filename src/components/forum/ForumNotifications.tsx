'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Bell, X, Check, CheckCheck, MessageSquare, Heart, 
  AtSign, Quote, Award, AlertTriangle, Megaphone,
  UserPlus, Settings, Trash2
} from 'lucide-react'
import { useForumStore, ForumNotification } from '@/store/forumStore'
import { useForumSSE, ForumSSEEvent } from '@/hooks/useForumSSE'

interface ForumNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

export function ForumNotifications({ isOpen, onClose }: ForumNotificationsProps) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    getUnreadNotificationCount,
    addNotification,
  } = useForumStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // SSE: Live-Notifications
  useForumSSE((event: ForumSSEEvent) => {
    if (event.type === 'notification') {
      addNotification(event.data)
    }
  })

  const unreadCount = getUnreadNotificationCount()
  const displayNotifications = useMemo(() => {
    return filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications
  }, [filter, notifications])

  const deleteNotification = (id: string) => {
    removeNotification(id)
  }

  const getIcon = (type: ForumNotification['type']) => {
    switch (type) {
      case 'reply': return <MessageSquare className="w-4 h-4" />
      case 'reaction': return <Heart className="w-4 h-4" />
      case 'mention': return <AtSign className="w-4 h-4" />
      case 'quote': return <Quote className="w-4 h-4" />
      case 'badge': return <Award className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'announcement': return <Megaphone className="w-4 h-4" />
      case 'friend_request': return <UserPlus className="w-4 h-4" />
      case 'pm': return <MessageSquare className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getIconColor = (type: ForumNotification['type']) => {
    switch (type) {
      case 'reply': return 'text-blue-400 bg-blue-500/20'
      case 'reaction': return 'text-pink-400 bg-pink-500/20'
      case 'mention': return 'text-purple-400 bg-purple-500/20'
      case 'badge': return 'text-amber-400 bg-amber-500/20'
      case 'warning': return 'text-red-400 bg-red-500/20'
      case 'announcement': return 'text-rust-400 bg-rust-500/20'
      case 'friend_request': return 'text-green-400 bg-green-500/20'
      default: return 'text-metal-400 bg-metal-500/20'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `vor ${minutes}m`
    if (hours < 24) return `vor ${hours}h`
    if (days < 7) return `vor ${days}d`
    return new Date(date).toLocaleDateString('de-DE')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed right-4 top-20 w-96 max-h-[80vh] bg-metal-900 border border-metal-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-metal-900 to-metal-900/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-rust-400" />
                  <h3 className="font-display font-bold text-white">Benachrichtigungen</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rust-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-metal-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-metal-400" />
                </button>
              </div>

              {/* Tabs & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filter === 'all' ? 'bg-rust-500 text-white' : 'text-metal-400 hover:text-white'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filter === 'unread' ? 'bg-rust-500 text-white' : 'text-metal-400 hover:text-white'
                    }`}
                  >
                    Ungelesen
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-rust-400 hover:text-rust-300 transition-colors"
                  >
                    Alle als gelesen markieren
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {displayNotifications.length > 0 ? (
                displayNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`relative group ${!notif.isRead ? 'bg-metal-800/30' : ''}`}
                  >
                    <Link
                      href={notif.link || '#'}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="flex items-start gap-3 p-4 hover:bg-metal-800/50 transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{notif.title}</p>
                        <p className="text-sm text-metal-400 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-metal-500 mt-1">{formatTime(notif.createdAt)}</p>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-rust-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="absolute right-2 top-2 p-1.5 bg-metal-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3 text-metal-400 hover:text-red-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-metal-700 mx-auto mb-4" />
                  <p className="text-metal-500">
                    {filter === 'unread' ? 'Keine ungelesenen Benachrichtigungen' : 'Keine Benachrichtigungen'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-metal-800 bg-metal-900/50">
              <Link
                href="/forum/settings/notifications"
                className="flex items-center justify-center gap-2 text-sm text-metal-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Benachrichtigungs-Einstellungen
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Notification Bell Button for Header
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = useForumStore(s => s.getUnreadNotificationCount())

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-metal-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rust-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <ForumNotifications isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
