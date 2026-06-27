import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API calls (Supabase): NetworkFirst — always try to get fresh data, fall back to cache
    {
      matcher: ({ url }) =>
        url.hostname.endsWith('.supabase.co') || url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'supabase-api',
        plugins: [
          new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
        ],
      }),
    },
    // Static images / receipts: CacheFirst
    {
      matcher: ({ request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
        ],
      }),
    },
    // Google Fonts: CacheFirst
    {
      matcher: ({ url }) =>
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com',
      handler: new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }), // 1 year
        ],
      }),
    },
  ],
})

serwist.addEventListeners()
