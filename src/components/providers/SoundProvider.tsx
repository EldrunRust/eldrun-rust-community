'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'

type TrackKey = 'ambient' | 'forge' | 'casino' | 'boss'

const TRACKS: Record<TrackKey, string> = {
  ambient: '',
  forge: '',
  casino: '',
  boss: '',
}

function pickTrack(pathname: string): TrackKey {
  if (pathname.startsWith('/casino')) return 'casino'
  if (pathname.startsWith('/boss') || pathname.includes('boss')) return 'boss'
  if (pathname.startsWith('/shop') || pathname.startsWith('/features')) return 'forge'
  return 'ambient'
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const { isSoundEnabled } = useStore()
  const [current, setCurrent] = useState<TrackKey>(() => pickTrack(pathname))
  const soundsRef = useRef<Partial<Record<TrackKey, Howl>>>({})
  const [reduced, setReduced] = useState(false)

  const loadSound = useCallback((key: TrackKey) => {
    if (soundsRef.current[key]) return soundsRef.current[key]!
    if (!TRACKS[key]) {
      return { play: () => {}, pause: () => {}, fade: () => {}, volume: () => 0, unload: () => {} } as unknown as Howl
    }
    try {
      const sound = new Howl({
        src: [TRACKS[key]],
        loop: true,
        volume: reduced ? 0.05 : 0.12,
        html5: true,
        preload: true,
        onloaderror: () => {
          console.warn(`Sound file not found: ${TRACKS[key]}`)
        },
      })
      soundsRef.current[key] = sound
      return sound
    } catch {
      // Return a silent stub if sound fails to load
      return { play: () => {}, pause: () => {}, fade: () => {}, volume: () => 0, unload: () => {} } as unknown as Howl
    }
  }, [reduced])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Track switching
  useEffect(() => {
    const nextTrack = pickTrack(pathname)
    if (current === nextTrack) return
    setCurrent(nextTrack)
  }, [pathname, current])

  // Play / pause logic
  useEffect(() => {
    const target = loadSound(current)
    const all = Object.values(soundsRef.current).filter(Boolean) as Howl[]

    if (isSoundEnabled && !reduced) {
      // fade out others, fade in target
      all.forEach((snd) => {
        if (snd === target) return
        snd.fade(snd.volume(), 0, 300)
        snd.once('fade', () => snd.pause())
      })
      target.volume(0)
      target.play()
      target.fade(0, reduced ? 0.05 : 0.12, 300)
    } else {
      all.forEach((snd) => snd.fade(snd.volume(), 0, 200))
    }

    return () => {
      // don't unload to allow quick switching; fades handled above
    }
  }, [current, isSoundEnabled, reduced, loadSound])

  // Preload all sounds once
  useEffect(() => {
    (Object.keys(TRACKS) as TrackKey[]).forEach((key) => loadSound(key))
    const sounds = soundsRef.current
    return () => {
      Object.values(sounds).forEach((snd) => snd?.unload())
    }
  }, [loadSound])

  return <>{children}</>
}
