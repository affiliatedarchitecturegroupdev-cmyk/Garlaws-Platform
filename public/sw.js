// Enhanced Service Worker for PWA functionality
const CACHE_NAME = 'garlaws-v2';
const DYNAMIC_CACHE = 'garlaws-dynamic-v1';
const API_CACHE = 'garlaws-api-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/services',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Create offline fallback page
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.add('/offline.html');
      })
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');

  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => !key.includes('garlaws-v2') && !key.includes('garlaws-dynamic') && !key.includes('garlaws-api')).map((key) => {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // Handle pages with network-first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version or offline page
        return caches.match(request).then((cached) => {
          return cached || caches.match('/offline.html');
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncMessages());
  }

  if (event.tag === 'background-sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync-data') {
    event.waitUntil(updateCachedData());
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URL':
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.add(payload.url);
      });
      break;

    case 'SYNC_DATA':
      event.waitUntil(syncData());
      break;
  }
});

// Helper functions
async function syncMessages() {
  try {
    // Sync pending messages from IndexedDB or similar
    console.log('Syncing messages...');
    // Implementation would sync offline messages
  } catch (error) {
    console.error('Message sync failed:', error);
  }
}

async function syncBookings() {
  try {
    // Sync pending booking actions
    console.log('Syncing bookings...');
    // Implementation would sync offline booking actions
  } catch (error) {
    console.error('Booking sync failed:', error);
  }
}

async function updateCachedData() {
  try {
    console.log('Updating cached data...');
    // Refresh API data in background
    const cache = await caches.open(API_CACHE);
    await Promise.all(
      API_ENDPOINTS.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            await cache.put(endpoint, response);
          }
        } catch (error) {
          console.log('Failed to update cache for:', endpoint);
        }
      })
    );
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

async function syncData() {
  try {
    // Sync all pending offline data
    await Promise.all([
      syncMessages(),
      syncBookings(),
      updateCachedData()
    ]);
  } catch (error) {
    console.error('Data sync failed:', error);
  }
}

// Push Notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.', event);

  event.notification.close();

  // Handle notification click
  const data = event.notification.data;
  if (data) {
    if (data.type === 'message' && data.conversationId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/chat?conversation=${data.conversationId}`)
      );
    } else if (data.type === 'booking' && data.bookingId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/bookings`)
      );
    } else if (data.type === 'support_ticket' && data.ticketId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/support`)
      );
    } else if (data.type === 'video_call' && data.roomId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/bookings`) // Navigate to bookings where video call can be joined
      );
    } else {
      event.waitUntil(
        clients.openWindow('/')
      );
    }
  }
});

self.addEventListener('push', (event) => {
  console.log('Push message received.', event);

  if (event.data) {
    const data = event.data.json();
    // Handle push message if needed for background notifications
  }
});