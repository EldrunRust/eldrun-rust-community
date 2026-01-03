// Eldrun Service Worker - PWA Implementation v1.0.0
const CACHE_NAME = 'eldrun-v1.0.0';
const STATIC_CACHE = 'eldrun-static-v1';
const DYNAMIC_CACHE = 'eldrun-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/apple-touch-icon.svg',
  // Critical CSS
  '/_next/static/css/',
  // Critical JS
  '/_next/static/chunks/',
  // Images
  '/images/avatars/default.svg',
  '/images/factions/seraphar.png',
  '/images/factions/vorgaroth.png',
  '/images/backgrounds/eldrun-bg.jpg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests and external resources
  if (url.pathname.startsWith('/api/') || !url.origin.includes(self.location.origin)) {
    return
  }

  // Network-first strategy for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clonedResponse = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache, then offline page
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/offline')
            })
        })
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache the fetched response
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncPendingActions())
  }
})

async function syncPendingActions() {
  // Get pending actions from IndexedDB and sync them
  console.log('[SW] Syncing pending actions...')
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  const options = {
    body: event.data?.text() || 'Neue Benachrichtigung von ELDRUN',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'Öffnen', icon: '/icons/checkmark.png' },
      { action: 'close', title: 'Schließen', icon: '/icons/xmark.png' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('ELDRUN', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action)
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }
})
