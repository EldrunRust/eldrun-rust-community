'use client'

import { useEffect } from 'react'

export function ServiceWorkerDevGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (typeof window === 'undefined') return

    const reloadKey = 'eldrun_dev_sw_cache_reset_v1'
    const alreadyReloaded = window.sessionStorage.getItem(reloadKey) === '1'

    const run = async () => {
      let changed = false
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          if (regs.length > 0) changed = true
          await Promise.all(regs.map((r) => r.unregister()))
        }
      } catch {
        // ignore
      }

      try {
        if ('caches' in window) {
          const names = await caches.keys()
          if (names.length > 0) changed = true
          await Promise.all(names.map((n) => caches.delete(n)))
        }
      } catch {
        // ignore
      }

      if (changed && !alreadyReloaded) {
        window.sessionStorage.setItem(reloadKey, '1')
        window.setTimeout(() => {
          window.location.reload()
        }, 50)
      }
    }

    void run()
  }, [])

  return null
}
