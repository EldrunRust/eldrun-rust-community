'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false
  })
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        setRegistration(reg)
        // console.log('[PWA] Service Worker registered:', reg.scope)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }))
                // console.log('[PWA] New version available!')
              }
            })
          }
        })
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    }

    registerSW()
  }, [])

  // Listen for install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState(prev => ({ ...prev, isInstallable: true }))
      // console.log('[PWA] Install prompt available')
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setState(prev => ({ ...prev, isInstallable: false, isInstalled: true }))
      // console.log('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState(prev => ({ ...prev, isInstalled: true }))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        // console.log('[PWA] User accepted install prompt')
        setState(prev => ({ ...prev, isInstallable: false, isInstalled: true }))
        setDeferredPrompt(null)
        return true
      } else {
        // console.log('[PWA] User dismissed install prompt')
        return false
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error)
      return false
    }
  }, [deferredPrompt])

  // Update app
  const updateApp = useCallback(() => {
    if (!registration?.waiting) return

    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }, [registration])

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!('caches' in window)) return

    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    // console.log('[PWA] Cache cleared')
  }, [])

  return {
    ...state,
    installApp,
    updateApp,
    clearCache,
    canInstall: state.isInstallable && !state.isInstalled
  }
}

// Component for showing install prompt
export function InstallPrompt() {
  return null
}

// Component for showing update notification
export function UpdateNotification() {
  return null
}

// Offline indicator component
export function OfflineIndicator() {
  return null
}
