'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type TypingScope = 'thread' | 'dm'

type TypingEvent = {
  scope: TypingScope
  scopeId: string
  userId: string
  username: string
  typing: boolean
  ts: number
}

type TypingUser = {
  userId: string
  username: string
  ts: number
}

export function useTypingChannel(scope: TypingScope, scopeId: string, self?: { userId: string; username: string } | null) {
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map())
  const stopTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const bc = new BroadcastChannel('eldrun-forum-typing')
    channelRef.current = bc

    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as TypingEvent | undefined
      if (!data) return
      if (data.scope !== scope || data.scopeId !== scopeId) return
      if (self && data.userId === self.userId) return

      setTypingUsers(prev => {
        const next = new Map(prev)
        if (!data.typing) {
          next.delete(data.userId)
          return next
        }
        next.set(data.userId, { userId: data.userId, username: data.username, ts: data.ts })
        return next
      })
    }

    bc.addEventListener('message', onMessage)
    return () => {
      bc.removeEventListener('message', onMessage)
      bc.close()
      channelRef.current = null
    }
  }, [scope, scopeId, self])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const interval = window.setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => {
        let changed = false
        const next = new Map(prev)
        for (const [key, v] of Array.from(next.entries())) {
          if (now - v.ts > 8000) {
            next.delete(key)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  const typingList = useMemo(() => Array.from(typingUsers.values()).sort((a, b) => b.ts - a.ts), [typingUsers])

  const setTyping = (typing: boolean) => {
    if (!self) return
    if (!channelRef.current) return

    const evt: TypingEvent = {
      scope,
      scopeId,
      userId: self.userId,
      username: self.username,
      typing,
      ts: Date.now(),
    }

    channelRef.current.postMessage(evt)

    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    if (typing) {
      stopTimerRef.current = window.setTimeout(() => {
        channelRef.current?.postMessage({ ...evt, typing: false, ts: Date.now() } satisfies TypingEvent)
        stopTimerRef.current = null
      }, 4500)
    }
  }

  return {
    typingUsers: typingList,
    setTyping,
  }
}
