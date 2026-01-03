'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ContentItem } from '@/data/infiniteContent'
import { ContentRenderer } from './ContentRenderer'

const ITEMS_PER_LOAD = 3

export function InfiniteScrollContainer() {
  const [loadedItems, setLoadedItems] = useState<ContentItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  
  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load more items from API
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const res = await fetch(`/api/content?page=${page}&limit=${ITEMS_PER_LOAD}`)
      if (res.ok) {
        const data = await res.json()
        const newItems: ContentItem[] = data.items || []
        
        if (newItems.length > 0) {
          setLoadedItems(prev => [...prev, ...newItems])
          setPage(prev => prev + 1)
        }
        
        if (data.total) {
          setTotalCount(data.total)
        }
        
        if (newItems.length < ITEMS_PER_LOAD || !data.hasMore) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load content:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [page, isLoading, hasMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreItems()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreItems, hasMore, isLoading])

  // Initial load
  useEffect(() => {
    loadMoreItems()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      {/* Content sections */}
      <div>
        {loadedItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
          >
            <ContentRenderer item={item} index={index} />
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div 
          ref={observerRef}
          className="flex items-center justify-center py-16"
        >
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-rust-500 animate-spin" />
              <span className="font-mono text-sm text-metal-500">Lade mehr Inhalte...</span>
            </motion.div>
          )}
        </div>
      )}

      {/* End of content message */}
      {!hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-gradient-to-b from-transparent to-metal-950"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-rust-500/10 border border-rust-500/30 rounded-full mb-4">
            <span className="font-mono text-sm text-rust-400">🎉 Du hast alles gesehen!</span>
          </div>
          <p className="text-metal-500 text-sm">
            {loadedItems.length} Inhalte durchgescrollt
          </p>
        </motion.div>
      )}
    </div>
  )
}
