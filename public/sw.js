// Service Worker for QuietTube background playback
const CACHE_NAME = 'quiet-tube-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker cache opened');
        return cache.addAll([
          '/',
          '/favicon.svg',
          '/manifest.json'
        ]);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle YouTube iframe API requests
  if (event.request.url.includes('youtube.com') || event.request.url.includes('googlevideo.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('YouTube request failed, using cache');
          return caches.match(event.request);
        })
    );
  }
});

// Handle background sync for audio playback
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  if (event.tag === 'audio-playback') {
    event.waitUntil(
      // Keep the service worker alive for audio playback
      new Promise((resolve) => {
        setTimeout(resolve, 1000);
      })
    );
  }
});

// Handle push notifications for audio controls
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'QuietTube is playing in the background',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'quiet-tube-audio',
      requireInteraction: true,
      actions: [
        {
          action: 'play',
          title: 'Play',
          icon: '/favicon.svg'
        },
        {
          action: 'pause',
          title: 'Pause',
          icon: '/favicon.svg'
        },
        {
          action: 'next',
          title: 'Next',
          icon: '/favicon.svg'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('QuietTube', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'play') {
    // Send message to main thread to play
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'PLAY_AUDIO' });
      });
    });
  } else if (event.action === 'pause') {
    // Send message to main thread to pause
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'PAUSE_AUDIO' });
      });
    });
  } else if (event.action === 'next') {
    // Send message to main thread to play next
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'NEXT_TRACK' });
      });
    });
  } else {
    // Default action: focus the app
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        } else {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

// Keep service worker alive for audio playback
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    console.log('Keeping service worker alive for audio playback');
    // Respond to keep the connection alive
    event.ports[0].postMessage({ type: 'ALIVE' });
  }
}); 