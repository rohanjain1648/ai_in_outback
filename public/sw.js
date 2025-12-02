// Service Worker for Rural Connect AI
// Provides offline functionality and background sync

const CACHE_NAME = 'rural-connect-v1';
const STATIC_CACHE = 'rural-connect-static-v1';
const DYNAMIC_CACHE = 'rural-connect-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add other critical static assets
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/emergency/crisis-resources',
  '/api/wellbeing/resources',
  '/api/community/members',
  '/api/resources',
  '/api/users/profile'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      // Static assets - cache first
      event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url)) {
      // API requests - network first with cache fallback
      event.respondWith(networkFirstWithCache(request));
    } else if (isNavigationRequest(request)) {
      // Navigation requests - network first with offline fallback
      event.respondWith(navigationHandler(request));
    } else {
      // Other requests - network first
      event.respondWith(networkFirst(request));
    }
  } else {
    // Non-GET requests - handle offline queueing
    event.respondWith(handleNonGetRequest(request));
  }
});

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from Rural Connect AI',
      icon: data.icon || '/vite.svg',
      badge: data.badge || '/vite.svg',
      tag: data.tag || 'default',
      data: data.data || { dateOfArrival: Date.now() },
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: Date.now()
    };

    // Handle different notification types
    if (data.data?.type === 'emergency') {
      options.requireInteraction = true;
      options.vibrate = [300, 100, 300, 100, 300];
      options.actions = [
        {
          action: 'acknowledge',
          title: 'Acknowledge',
          icon: '/vite.svg'
        },
        {
          action: 'safe',
          title: 'I\'m Safe',
          icon: '/vite.svg'
        },
        {
          action: 'need_help',
          title: 'Need Help',
          icon: '/vite.svg'
        }
      ];
    } else if (data.data?.type === 'chat_message') {
      options.actions = [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/vite.svg'
        },
        {
          action: 'view',
          title: 'View Chat',
          icon: '/vite.svg'
        }
      ];
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Rural Connect AI', options)
    );
  } catch (error) {
    console.error('Error parsing push notification data:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Rural Connect AI', {
        body: 'You have a new notification',
        icon: '/vite.svg',
        badge: '/vite.svg'
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;

  if (action) {
    // Handle action button clicks
    switch (action) {
      case 'acknowledge':
        // Send acknowledgment to server
        event.waitUntil(
          fetch('/api/v1/emergency/acknowledge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
              alertId: data.alertId,
              action: 'acknowledged'
            })
          }).catch(console.error)
        );
        break;
      case 'safe':
        // Report safe status
        event.waitUntil(
          fetch('/api/v1/emergency/safety-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
              alertId: data.alertId,
              status: 'safe'
            })
          }).catch(console.error)
        );
        break;
      case 'need_help':
        // Report need help status and open app
        event.waitUntil(
          Promise.all([
            fetch('/api/v1/emergency/safety-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({
                alertId: data.alertId,
                status: 'need_help'
              })
            }).catch(console.error),
            clients.openWindow('/emergency')
          ])
        );
        break;
      case 'reply':
        // Open chat to reply
        event.waitUntil(
          clients.openWindow(`/chat?user=${data.senderId}`)
        );
        break;
      case 'view':
        // Open the app to view details
        event.waitUntil(
          clients.openWindow(data.url || '/')
        );
        break;
      default:
        console.log('Unknown action:', action);
    }
  } else {
    // Handle notification click (no action button)
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise, open new window
        if (clients.openWindow) {
          const url = data.url || '/';
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Helper functions

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isCacheableAPI(url) {
  return CACHEABLE_APIs.some(api => url.pathname.startsWith(api));
}

// Cache strategies

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && isCacheableAPI(new URL(request.url))) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This data is not available offline',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation offline, serving offline page');
    
    // Try to serve cached version of the page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleNonGetRequest(request) {
  try {
    // Try to make the request
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Non-GET request failed, queueing for background sync');
    
    // Queue the request for background sync
    await queueRequest(request);
    
    // Return a response indicating the request was queued
    return new Response(
      JSON.stringify({
        queued: true,
        message: 'Request queued for when connection is restored'
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function queueRequest(request) {
  try {
    // Open IndexedDB to store the request
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : undefined,
      timestamp: Date.now()
    };
    
    await store.add(requestData);
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('background-sync');
    }
  } catch (error) {
    console.error('Failed to queue request:', error);
  }
}

async function processBackgroundSync() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          // Remove successful request from queue
          await store.delete(requestData.id);
          console.log('Background sync: Request processed successfully');
        }
      } catch (error) {
        console.error('Background sync: Failed to process request', error);
        // Keep failed requests in queue for retry
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rural-connect-sw', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Sync critical content when device is idle and connected
    const criticalEndpoints = [
      '/api/emergency/crisis-resources',
      '/api/wellbeing/resources'
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          await cache.put(endpoint, response);
        }
      } catch (error) {
        console.log('Failed to sync content for:', endpoint);
      }
    }
  } catch (error) {
    console.error('Content sync failed:', error);
  }
}