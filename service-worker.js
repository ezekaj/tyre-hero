/**
 * TyreHero Emergency Service - Service Worker
 * Provides offline emergency contact capabilities
 */

const CACHE_NAME = 'tyrehero-v1';
const EMERGENCY_CACHE = 'tyrehero-emergency-v1';
const EMERGENCY_PHONE = '+447700900000';

// Critical files to cache for offline emergency access
const CRITICAL_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/images/tyrehero-logo.svg'
];

// Emergency contact page for offline access
const EMERGENCY_OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TyreHero Emergency Contact - Offline</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #dc2626;
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .emergency-card {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 400px;
            margin: 0 auto;
        }
        .emergency-title {
            font-size: 2rem;
            margin-bottom: 20px;
        }
        .phone-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 20px 0;
            color: #fff;
        }
        .call-button {
            background: #fff;
            color: #dc2626;
            padding: 20px 40px;
            font-size: 1.2rem;
            font-weight: bold;
            border: none;
            border-radius: 50px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            cursor: pointer;
        }
        .offline-notice {
            margin-top: 30px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="emergency-card">
        <h1 class="emergency-title">🚨 Emergency Contact</h1>
        <p>TyreHero Emergency Service</p>
        <div class="phone-number">${EMERGENCY_PHONE}</div>
        <a href="tel:${EMERGENCY_PHONE}" class="call-button">
            📞 CALL NOW
        </a>
        <div class="offline-notice">
            <p><strong>You're currently offline</strong></p>
            <p>This emergency contact is always available</p>
        </div>
    </div>
</body>
</html>
`;

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('TyreHero Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical files
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(CRITICAL_CACHE);
      }),
      // Cache emergency offline page
      caches.open(EMERGENCY_CACHE).then(cache => {
        return cache.put('/emergency-offline', new Response(EMERGENCY_OFFLINE_PAGE, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ]).then(() => {
      console.log('TyreHero Service Worker installed successfully');
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('TyreHero Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== EMERGENCY_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('TyreHero Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle emergency requests with priority
  if (url.pathname.includes('emergency')) {
    event.respondWith(handleEmergencyRequest(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Emergency request handler - always provide fallback
async function handleEmergencyRequest(request) {
  try {
    // Try network first for emergency requests
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.log('Emergency request failed, using offline fallback');
  }

  // Return cached emergency page if network fails
  const cache = await caches.open(EMERGENCY_CACHE);
  return cache.match('/emergency-offline');
}

// API request handler
async function handleApiRequest(request) {
  try {
    // Try network first for API calls
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For offline API requests, return helpful error
    return new Response(JSON.stringify({
      success: false,
      error: 'Service temporarily unavailable',
      offline: true,
      emergency: {
        phone: EMERGENCY_PHONE,
        message: 'Please call directly for immediate assistance'
      }
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static asset handler - cache first strategy
async function handleStaticRequest(request) {
  // Try cache first
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background if needed
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }

  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/emergency-offline');
    }
    
    // Return error for other requests
    return new Response('Offline', { status: 503 });
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Handle sync events for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'emergency-booking') {
    event.waitUntil(syncEmergencyBookings());
  }
});

// Sync offline emergency bookings when back online
async function syncEmergencyBookings() {
  try {
    // Get stored offline bookings from IndexedDB
    const offlineBookings = await getOfflineBookings();
    
    for (const booking of offlineBookings) {
      try {
        await fetch('/api/emergency-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking.data)
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineBooking(booking.id);
      } catch (error) {
        console.log('Failed to sync booking:', booking.id);
      }
    }
  } catch (error) {
    console.log('Sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineBookings() {
  // In production, implement IndexedDB storage
  return [];
}

async function removeOfflineBooking(id) {
  // In production, implement IndexedDB removal
}

// Push notification handler for emergency updates
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'emergency-response') {
      event.waitUntil(
        self.registration.showNotification('TyreHero Emergency Update', {
          body: data.message,
          icon: '/images/icon-192.png',
          badge: '/images/badge-72.png',
          tag: 'emergency-update',
          requireInteraction: true,
          actions: [
            {
              action: 'call',
              title: 'Call Now'
            },
            {
              action: 'view',
              title: 'View Details'
            }
          ]
        })
      );
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'call') {
    // Open phone dialer
    event.waitUntil(
      clients.openWindow(`tel:${EMERGENCY_PHONE}`)
    );
  } else {
    // Open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('TyreHero Emergency Service Worker loaded');