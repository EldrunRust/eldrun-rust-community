'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = usePrefersReducedMotion()

  // Simple fade effect on page change without breaking fixed positioning
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    // Brief fade out/in on route change
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  // No complex overlay scanning - just render children directly
  // This prevents any interference with click events
  return (
    <div 
      className="min-h-screen"
      style={{
        opacity: isVisible ? 1 : 0.95,
        transition: reduced ? 'none' : 'opacity 0.2s ease-out',
      }}
    >
      {children}
    </div>
  )
}
