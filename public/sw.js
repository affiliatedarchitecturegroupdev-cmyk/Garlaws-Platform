const CACHE_NAME = 'garlaws-v1';
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        const clone = response.clone();
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

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