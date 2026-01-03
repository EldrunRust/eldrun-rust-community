'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { activityPool, mockActivities, mockFactionScores, mockServerStats, mockUser } from '@/lib/demo/mockData'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const seededRef = useRef(false)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Memoize selectors to prevent unnecessary re-renders
  const storeActions = useMemo(() => ({
    setCurrentUser: useStore.getState().setCurrentUser,
    setServerStats: useStore.getState().setServerStats,
    addUserActivity: useStore.getState().addUserActivity,
    setFactionScore: useStore.getState().setFactionScore,
  }), [])

  useEffect(() => {
    const result = useStore.persist.rehydrate()
    if (result instanceof Promise) {
      result.finally(() => setMounted(true))
    } else {
      setMounted(true)
    }
  }, [])

  const seedDemoData = useCallback(() => {
    if (!DEMO_MODE || seededRef.current) return
    seededRef.current = true

    storeActions.setCurrentUser(mockUser)
    storeActions.setServerStats(mockServerStats)
    storeActions.setFactionScore(mockFactionScores)
    mockActivities.forEach(activity => storeActions.addUserActivity(activity))

    // auto-generate rotating demo activity
    activityTimerRef.current = setInterval(() => {
      const entry = activityPool[Math.floor(Math.random() * activityPool.length)]
      storeActions.addUserActivity(entry)
    }, 8000)
  }, [storeActions])

  useEffect(() => {
    if (!mounted) return
    seedDemoData()
  }, [mounted, seedDemoData])

  useEffect(() => {
    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current)
        activityTimerRef.current = null
      }
    }
  }, [])

  if (!mounted) return null

  return <>{children}</>
}
