'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ServerStats {
  players: number
  maxPlayers: number
  status: string
  uptime: number
  fps: number
  entities: number
  sleepers: number
  queue: number
}

interface Player {
  rank: number
  name: string
  kills: number
  deaths: number
  kd: number
  playtime: number
  clan: string | null
}

interface News {
  id: string
  title: string
  excerpt: string
  content: string
  image: string | null
  category: string
  publishedAt: string
}

interface Clan {
  name: string
  fullName: string
  members: number
  territory: number
  totalKills: number
  logo: string | null
}

// Simple cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30_000 // 30 seconds

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  if (entry) cache.delete(key)
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Generic fetch hook with caching and deduplication
function useFetchWithCache<T>(url: string, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(() => getCachedData<T>(url))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastFetchRef = useRef<number>(0)

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastFetchRef.current < 1000) return // Deduplicate rapid calls
    lastFetchRef.current = now

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(url, { signal: abortControllerRef.current.signal })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      
      const fetchedData = await res.json()
      setData(fetchedData)
      setCachedData(url, fetchedData)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      import('@/lib/logger').then(({ log }) => {
        log.error('Fetch error', { 
          error: err instanceof Error ? err.message : 'Unknown error',
          url 
        }, 'API')
      }).catch(() => {
        // Fallback if logger not available
        console.error('Fetch error:', err)
      })
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (data) return // Already have cached data
    fetchData()
  }, [fetchData, data])

  useEffect(() => {
    if (!refreshInterval) return
    const interval = setInterval(() => fetchData(), refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { data, loading, error, refetch: () => fetchData(true) }
}

export function useServerStats() {
  const { data: stats, loading, error, refetch } = useFetchWithCache<ServerStats>('/api/server', 30000)
  return { stats, loading, error, refetch }
}

export function usePlayers() {
  const { data: players, loading, error, refetch } = useFetchWithCache<Player[]>('/api/players')
  return { players, loading, error, refetch }
}

export function useNews() {
  const { data: news, loading, error, refetch } = useFetchWithCache<News[]>('/api/news')
  return { news, loading, error, refetch }
}

export function useClans() {
  const { data: clans, loading, error, refetch } = useFetchWithCache<Clan[]>('/api/clans')
  return { clans, loading, error, refetch }
}
