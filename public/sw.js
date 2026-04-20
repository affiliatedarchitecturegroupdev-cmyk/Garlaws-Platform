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

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  '/api/health',
  '/api/services',
  '/api/dashboard/summary',
  '/api/notifications',
  '/api/user/profile',
  '/api/financial/summary',
  '/api/supply-chain/summary',
  '/api/crm/summary',
  '/api/security/summary',
  '/api/projects/summary',
  '/api/bi/summary',
  '/api/ml/summary',
];

// Cache names for different types of data
const CACHE_NAMES = {
  STATIC: CACHE_NAME,
  DYNAMIC: DYNAMIC_CACHE,
  API: API_CACHE,
  IMAGES: 'garlaws-images-v1',
  DOCUMENTS: 'garlaws-documents-v1'
};

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

// Fetch event - enhanced caching strategy for mobile and offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (except for some POST requests we want to handle)
  if (request.method !== 'GET') return;

  // Handle images with cache-first strategy
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAMES.IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // Handle documents with cache-first strategy
  if (url.pathname.match(/\.(pdf|doc|docx|xls|xlsx|txt)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAMES.DOCUMENTS).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // Handle critical API requests with network-first, cache fallback
  if (url.pathname.startsWith('/api/') && API_ENDPOINTS.includes(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              // Add cache expiration metadata
              const responseWithMetadata = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                  ...Object.fromEntries(responseClone.headers),
                  'sw-cache-time': Date.now().toString(),
                  'sw-cache-expiry': (Date.now() + 5 * 60 * 1000).toString() // 5 minutes
                }
              });
              cache.put(request, responseWithMetadata);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request).then((cached) => {
            if (cached) {
              // Check if cache is still fresh
              const cacheTime = cached.headers.get('sw-cache-time');
              const expiryTime = cached.headers.get('sw-cache-expiry');
              if (cacheTime && expiryTime && Date.now() < parseInt(expiryTime)) {
                return cached;
              }
            }
            return caches.match('/offline.html');
          });
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

  // Handle pages with stale-while-revalidate strategy
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      const fetchPromise = fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      });

      // Return cached version immediately if available, then update in background
      if (cached) {
        // Update cache in background
        fetchPromise.catch(() => {}); // Ignore background fetch errors
        return cached;
      }

      // No cache available, fetch from network
      return fetchPromise.catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});

// Enhanced Background sync for comprehensive offline functionality
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncMessages());
  }

  if (event.tag === 'background-sync-bookings') {
    event.waitUntil(syncBookings());
  }

  if (event.tag === 'background-sync-financial') {
    event.waitUntil(syncFinancialData());
  }

  if (event.tag === 'background-sync-inventory') {
    event.waitUntil(syncInventoryData());
  }

  if (event.tag === 'background-sync-projects') {
    event.waitUntil(syncProjectData());
  }

  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncFormData());
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

async function syncFinancialData() {
  try {
    console.log('Syncing financial data...');
    // Sync offline financial transactions, invoices, expenses
    // Implementation would sync pending financial operations
  } catch (error) {
    console.error('Financial sync failed:', error);
  }
}

async function syncInventoryData() {
  try {
    console.log('Syncing inventory data...');
    // Sync offline inventory movements, stock adjustments
    // Implementation would sync pending inventory operations
  } catch (error) {
    console.error('Inventory sync failed:', error);
  }
}

async function syncProjectData() {
  try {
    console.log('Syncing project data...');
    // Sync offline task updates, time entries, comments
    // Implementation would sync pending project operations
  } catch (error) {
    console.error('Project sync failed:', error);
  }
}

async function syncFormData() {
  try {
    console.log('Syncing form data...');
    // Sync offline form submissions, inspections, reports
    // Implementation would sync pending form data
  } catch (error) {
    console.error('Form sync failed:', error);
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
    // Sync all pending offline data across all modules
    await Promise.all([
      syncMessages(),
      syncBookings(),
      syncFinancialData(),
      syncInventoryData(),
      syncProjectData(),
      syncFormData(),
      updateCachedData()
    ]);
    console.log('All data sync completed successfully');
  } catch (error) {
    console.error('Data sync failed:', error);
  }
}

// Enhanced Push Notifications for mobile and PWA
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.', event);

  event.notification.close();

  // Handle notification click with enhanced mobile support
  const data = event.notification.data;
  if (data) {
    if (data.type === 'message' && data.conversationId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/chat?conversation=${data.conversationId}`)
      );
    } else if (data.type === 'booking' && data.bookingId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/bookings?id=${data.bookingId}`)
      );
    } else if (data.type === 'support_ticket' && data.ticketId) {
      event.waitUntil(
        clients.openWindow(`/dashboard/support?ticket=${data.ticketId}`)
      );
    } else if (data.type === 'financial_alert') {
      event.waitUntil(
        clients.openWindow('/financial')
      );
    } else if (data.type === 'supply_chain_alert') {
      event.waitUntil(
        clients.openWindow('/supply-chain')
      );
    } else if (data.type === 'crm_alert') {
      event.waitUntil(
        clients.openWindow('/crm')
      );
    } else if (data.type === 'project_update') {
      event.waitUntil(
        clients.openWindow('/projects')
      );
    } else if (data.type === 'security_alert') {
      event.waitUntil(
        clients.openWindow('/security')
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