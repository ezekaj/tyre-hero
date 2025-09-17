// TyreHero Service Worker - Emergency-Focused PWA
// Optimized for emergency mobile tyre service scenarios

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `tyrehero-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `tyrehero-dynamic-${CACHE_VERSION}`;
const EMERGENCY_CACHE = `tyrehero-emergency-${CACHE_VERSION}`;

// Critical resources for emergency functionality
const EMERGENCY_ASSETS = [
  '/',
  '/index.html',
  '/emergency.html',
  '/styles.css',
  '/scripts.js',
  '/preloader.js',
  '/images/tyrehero-logo.svg',
  '/offline.html'
];

// Static assets to cache
const STATIC_ASSETS = [
  '/services.html',
  '/pricing.html',
  '/contact.html',
  '/about.html',
  '/locations.html'
];

// External resources
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.woff2',
  'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical emergency assets first
      caches.open(EMERGENCY_CACHE).then(cache => {
        console.log('[SW] Caching emergency assets');
        return cache.addAll(EMERGENCY_ASSETS);
      }),
      
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.concat(EXTERNAL_RESOURCES));
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Skip waiting to activate immediately
      self.skipWaiting();
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== EMERGENCY_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch Strategy - Emergency-First Approach
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle emergency requests with highest priority
  if (isEmergencyRequest(request)) {
    event.respondWith(handleEmergencyRequest(request));
    return;
  }
  
  // Handle API calls
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Default: Cache First with Network Fallback
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(fetchResponse => {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
    })
  );
});

// Emergency Request Handler - Network First with Fast Fallback
async function handleEmergencyRequest(request) {
  try {
    // Try network first for emergency requests
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);
    
    // Cache successful emergency responses
    const cache = await caches.open(EMERGENCY_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Emergency request failed, trying cache:', error);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline emergency page
    return caches.match('/emergency.html');
  }
}

// API Request Handler - Network First with Background Sync
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed:', error);
    
    // Queue for background sync if it's a POST request
    if (request.method === 'POST') {
      await queueBackgroundSync(request);
    }
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Request will be sent when connection is restored'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Navigation Request Handler
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Static Asset Handler - Cache First
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    fetch(request).then(networkResponse => {
      caches.open(STATIC_CACHE).then(cache => {
        cache.put(request, networkResponse);
      });
    }).catch(() => {
      // Network failed, cached version is fine
    });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Return fallback for critical assets
    if (request.url.includes('tyrehero-logo')) {
      return caches.match('/images/tyrehero-logo.svg');
    }
    throw error;
  }
}

// Helper Functions
function isEmergencyRequest(request) {
  return request.url.includes('/emergency') || 
         request.url.includes('/api/emergency') ||
         request.url.includes('tel:') ||
         request.headers.get('X-Emergency-Request') === 'true';
}

function isApiRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('/submit') ||
         request.headers.get('Content-Type') === 'application/json';
}

function isStaticAsset(request) {
  return request.url.includes('/images/') ||
         request.url.includes('/styles.css') ||
         request.url.includes('/scripts.js') ||
         request.url.includes('/fonts/') ||
         request.url.includes('fonts.googleapis.com') ||
         request.url.includes('fonts.gstatic.com');
}

// Background Sync for Failed Requests
async function queueBackgroundSync(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB for background sync
  const db = await openDB();
  const transaction = db.transaction(['requests'], 'readwrite');
  transaction.objectStore('requests').add(requestData);
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TyreHeroRequests', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Background Sync Event
self.addEventListener('sync', event => {
  if (event.tag === 'emergency-request-sync') {
    event.waitUntil(syncEmergencyRequests());
  }
});

async function syncEmergencyRequests() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['requests'], 'readonly');
    const requests = await transaction.objectStore('requests').getAll();
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: new Headers(requestData.headers),
          body: requestData.body
        });
        
        if (response.ok) {
          // Remove successful request from queue
          const deleteTransaction = db.transaction(['requests'], 'readwrite');
          deleteTransaction.objectStore('requests').delete(requestData.id);
        }
      } catch (error) {
        console.log('[SW] Background sync failed for request:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync error:', error);
  }
}

// Push Notification Handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'tyrehero-update',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/images/icon-view.png'
      },
      {
        action: 'call',
        title: 'Call Now',
        icon: '/images/icon-phone.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('TyreHero Update', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const action = event.action;
  
  if (action === 'call') {
    // Open phone dialer
    clients.openWindow('tel:08001234567');
  } else {
    // Open app or specific page
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('tyrehero') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/emergency.html');
        }
      })
    );
  }
});

// Message Handler for communication with main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_EMERGENCY_LOCATION':
      cacheEmergencyLocation(payload);
      break;
      
    case 'REQUEST_SYNC':
      // Register background sync
      self.registration.sync.register('emergency-request-sync');
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
  }
});

// Cache user's emergency location for offline use
async function cacheEmergencyLocation(locationData) {
  try {
    const cache = await caches.open(EMERGENCY_CACHE);
    const response = new Response(JSON.stringify(locationData));
    await cache.put('/emergency-location', response);
    console.log('[SW] Emergency location cached');
  } catch (error) {
    console.error('[SW] Failed to cache emergency location:', error);
  }
}

// Get cache status for UI updates
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const totalCaches = cacheNames.length;
  
  const emergencyCache = await caches.open(EMERGENCY_CACHE);
  const emergencyKeys = await emergencyCache.keys();
  
  return {
    totalCaches,
    emergencyAssetsCached: emergencyKeys.length,
    lastUpdated: Date.now()
  };
}

console.log('[SW] Service Worker script loaded');