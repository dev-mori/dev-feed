const CACHE = 'dev-feed-cache-v1'
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
]
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : undefined))).then(() => self.clients.claim())
  )
})
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (url.pathname.includes('/data/') || url.pathname.endsWith('.json')) {
    // Network-first for data
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      }).catch(() => caches.match(e.request))
    )
  } else {
    // Cache-first for static
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    )
  }
})
