/**
 * TyreHero Service Worker
 * Emergency-focused offline functionality for critical scenarios
 */

const CACHE_NAME = 'tyrehero-emergency-v1.2';
const OFFLINE_CACHE = 'tyrehero-offline-v1.2';

// Critical resources for emergency scenarios
const CRITICAL_RESOURCES = [
    '/',
    '/emergency.html',
    '/critical.css',
    '/emergency-scripts.js',
    '/images/tyrehero-logo.svg',
    '/images/emergency-icon.png'
];

// Offline emergency data
const EMERGENCY_DATA = {
    phone: '08001234567',
    emergencyForm: '/emergency.html',
    locationService: true,
    offlineMessage: 'You are currently offline. Emergency call functionality is still available.'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    console.log('TyreHero Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache critical emergency resources
            caches.open(CACHE_NAME).then((cache) => {
                console.log('TyreHero Service Worker: Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES.map(url => new Request(url, {
                    mode: 'no-cors',
                    cache: 'reload'
                })));
            }),
            
            // Cache offline emergency page
            caches.open(OFFLINE_CACHE).then((cache) => {
                return cache.put('/offline-emergency', new Response(
                    generateOfflineEmergencyPage(),
                    {
                        headers: {
                            'Content-Type': 'text/html',
                            'Cache-Control': 'max-age=86400'
                        }
                    }
                ));
            })
        ]).then(() => {
            console.log('TyreHero Service Worker: Installation complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('TyreHero Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Delete old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                            console.log('TyreHero Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Claim control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('TyreHero Service Worker: Activation complete');
        })
    );
});

// Fetch event - implement emergency-first caching strategy
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Emergency pages - Cache First with Network Fallback
    if (isEmergencyResource(url.pathname)) {
        event.respondWith(handleEmergencyRequest(request));
        return;
    }
    
    // Static assets - Cache First
    if (isStaticAsset(url.pathname)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }
    
    // API calls - Network First with Emergency Fallback
    if (isApiCall(url.pathname)) {
        event.respondWith(handleApiCall(request));
        return;
    }
    
    // Default - Network First
    event.respondWith(handleDefault(request));
});

// Background sync for emergency form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'emergency-form-sync') {
        event.waitUntil(syncEmergencyForms());
    }
});

// Push notifications for emergency updates
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        if (data.type === 'emergency-update') {
            event.waitUntil(
                self.registration.showNotification('TyreHero Emergency Update', {
                    body: data.message,
                    icon: '/images/emergency-icon.png',
                    badge: '/images/tyrehero-logo.svg',
                    tag: 'emergency-update',
                    requireInteraction: true,
                    actions: [
                        {
                            action: 'call',
                            title: 'Call Now',
                            icon: '/images/phone-icon.png'
                        },
                        {
                            action: 'view',
                            title: 'View Details',
                            icon: '/images/view-icon.png'
                        }
                    ]
                })
            );
        }
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'call') {
        // Open phone dialer
        event.waitUntil(
            clients.openWindow(`tel:${EMERGENCY_DATA.phone}`)
        );
    } else if (event.action === 'view') {
        // Open emergency page
        event.waitUntil(
            clients.openWindow('/emergency.html')
        );
    } else {
        // Default action - open app
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/emergency.html');
            })
        );
    }
});

// Helper functions
function isEmergencyResource(pathname) {
    const emergencyPaths = ['/emergency.html', '/emergency', '/', '/index.html'];
    return emergencyPaths.includes(pathname) || pathname.startsWith('/emergency');
}

function isStaticAsset(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isApiCall(pathname) {
    return pathname.startsWith('/api/') || pathname.includes('emergency-request');
}

async function handleEmergencyRequest(request) {
    try {
        // Try network first for fresh content
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Update cache with fresh content
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Ultimate fallback - offline emergency page
        return caches.match('/offline-emergency');
    }
}

async function handleStaticAsset(request) {
    try {
        // Cache first strategy for static assets
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Update cache in background
            updateCacheInBackground(request);
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return cached version if available
        return caches.match(request) || new Response('Asset not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function handleApiCall(request) {
    try {
        // Network first for API calls
        const networkResponse = await fetch(request, {
            timeout: 10000 // 10 second timeout for emergency scenarios
        });
        
        return networkResponse;
    } catch (error) {
        // Emergency form submissions - queue for background sync
        if (request.url.includes('emergency-request') && request.method === 'POST') {
            return handleOfflineEmergencySubmission(request);
        }
        
        return new Response(
            JSON.stringify({
                error: 'Service temporarily unavailable',
                message: 'Please try calling our emergency line: ' + EMERGENCY_DATA.phone,
                offline: true
            }),
            {
                status: 503,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}

async function handleDefault(request) {
    try {
        return await fetch(request);
    } catch (error) {
        // Fallback to cache or offline page
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match('/offline-emergency');
    }
}

async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silent fail for background updates
        console.log('Background cache update failed for:', request.url);
    }
}

async function handleOfflineEmergencySubmission(request) {
    // Store form data for background sync
    const formData = await request.formData();
    const emergencyData = Object.fromEntries(formData.entries());
    
    // Store in IndexedDB for later sync
    await storeOfflineEmergencyRequest(emergencyData);
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await self.registration.sync.register('emergency-form-sync');
    }
    
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Emergency request queued. Will be submitted when connection is restored.',
            emergencyPhone: EMERGENCY_DATA.phone,
            offline: true
        }),
        {
            status: 202,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

async function storeOfflineEmergencyRequest(data) {
    // Simple storage using cache API for emergency requests
    const timestamp = Date.now();
    const requestId = `emergency-${timestamp}`;
    
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(
        `/offline-requests/${requestId}`,
        new Response(JSON.stringify({
            ...data,
            timestamp,
            id: requestId,
            synced: false
        }))
    );
}

async function syncEmergencyForms() {
    const cache = await caches.open(OFFLINE_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
        if (request.url.includes('/offline-requests/')) {
            try {
                const response = await cache.match(request);
                const data = await response.json();
                
                if (!data.synced) {
                    // Attempt to sync with server
                    const syncResponse = await fetch('/api/emergency-request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (syncResponse.ok) {
                        // Mark as synced
                        data.synced = true;
                        await cache.put(request, new Response(JSON.stringify(data)));
                        
                        // Notify user of successful sync
                        await self.registration.showNotification('Emergency Request Sent', {
                            body: 'Your emergency request has been successfully submitted.',
                            icon: '/images/success-icon.png',
                            tag: 'sync-success'
                        });
                    }
                }
            } catch (error) {
                console.log('Failed to sync emergency request:', error);
            }
        }
    }
}

function generateOfflineEmergencyPage() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TyreHero - Emergency Service Offline</title>
    <style>
        body {
            font-family: 'Poppins', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #E53935, #C62828);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .offline-container {
            max-width: 500px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .emergency-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            background: #FFCC00;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }
        
        h1 {
            margin-bottom: 1rem;
            font-size: 1.8rem;
        }
        
        .emergency-phone {
            display: inline-block;
            background: #FFCC00;
            color: #212121;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.2rem;
            margin: 1rem 0;
            transition: transform 0.2s ease;
        }
        
        .emergency-phone:hover {
            transform: scale(1.05);
        }
        
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 1rem;
        }
        
        .status {
            margin-top: 1rem;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .offline {
            background: rgba(255, 0, 0, 0.2);
        }
        
        .online {
            background: rgba(0, 255, 0, 0.2);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="emergency-icon">⚠️</div>
        <h1>Emergency Service Available Offline</h1>
        <p>You're currently offline, but emergency assistance is still available.</p>
        
        <a href="tel:${EMERGENCY_DATA.phone}" class="emergency-phone">
            📞 Call Now: ${EMERGENCY_DATA.phone}
        </a>
        
        <p>Our 24/7 emergency line is always available, even when your internet connection isn't working.</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
            Try Reconnecting
        </button>
        
        <div class="status offline" id="status">
            Status: Offline Mode - Emergency calls available
        </div>
    </div>
    
    <script>
        // Check connectivity status
        function updateStatus() {
            const status = document.getElementById('status');
            if (navigator.onLine) {
                status.textContent = 'Status: Back Online';
                status.className = 'status online';
                setTimeout(() => {
                    window.location.href = '/emergency.html';
                }, 2000);
            } else {
                status.textContent = 'Status: Offline Mode - Emergency calls available';
                status.className = 'status offline';
            }
        }
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        // Geolocation for emergency services (works offline)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    console.log('Emergency location available:', position.coords);
                    // Store location for when connection is restored
                    localStorage.setItem('emergencyLocation', JSON.stringify({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: Date.now()
                    }));
                },
                function(error) {
                    console.log('Location access denied or unavailable');
                }
            );
        }
        
        updateStatus();
    </script>
</body>
</html>`;
}