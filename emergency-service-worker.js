/**
 * Emergency Service Worker
 * Ensures basic functionality works offline for emergency scenarios
 * Cache critical resources, provide offline emergency contact
 */

const CACHE_NAME = 'tyrehero-emergency-v1';
const EMERGENCY_CACHE = 'tyrehero-emergency-critical';

// Critical resources that must work offline
const CRITICAL_RESOURCES = [
    '/',
    '/emergency.html',
    '/emergency-background-fallback.css',
    '/images/tyrehero-logo.svg',
    'data:text/html;charset=utf-8,<html><body><h1>📞 Emergency: 01234 567890</h1></body></html>'
];

// Emergency contact information
const EMERGENCY_CONTACT = {
    phone: '+441234567890',
    displayPhone: '01234 567890',
    message: '24/7 Mobile Tyre Service - Average response: 90 minutes'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    console.log('Emergency Service Worker installing...');

    event.waitUntil(
        Promise.all([
            // Cache critical resources
            caches.open(EMERGENCY_CACHE).then((cache) => {
                return cache.addAll(CRITICAL_RESOURCES.filter(url => !url.startsWith('data:')));
            }),

            // Cache emergency fallback page
            caches.open(EMERGENCY_CACHE).then((cache) => {
                const emergencyHTML = createEmergencyHTML();
                const response = new Response(emergencyHTML, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
                return cache.put('/emergency-offline', response);
            })
        ]).then(() => {
            console.log('Emergency resources cached');
            self.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Emergency Service Worker activated');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName =>
                            cacheName.startsWith('tyrehero-') &&
                            cacheName !== CACHE_NAME &&
                            cacheName !== EMERGENCY_CACHE
                        )
                        .map(cacheName => caches.delete(cacheName))
                );
            }),

            // Take control of all pages immediately
            self.clients.claim()
        ])
    );
});

// Fetch event - handle requests with emergency-first strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle emergency scenarios
    if (isEmergencyRequest(request)) {
        event.respondWith(handleEmergencyRequest(request));
        return;
    }

    // Network-first strategy for regular requests
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response.ok && shouldCache(request)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed - try cache
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // Last resort - emergency page
                        if (request.mode === 'navigate') {
                            return caches.match('/emergency-offline');
                        }

                        // Return minimal emergency response
                        return new Response('Emergency Service Unavailable', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle emergency-specific requests
async function handleEmergencyRequest(request) {
    try {
        // Try network first for real-time emergency info
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            return networkResponse;
        }
    } catch (error) {
        console.log('Network unavailable for emergency request');
    }

    // Network failed - return cached emergency response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // Ultimate fallback - inline emergency page
    return new Response(createEmergencyHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Check if request is emergency-related
function isEmergencyRequest(request) {
    const url = new URL(request.url);
    const emergencyPaths = ['/emergency', '/emergency.html', '/emergency-offline'];

    return (
        emergencyPaths.some(path => url.pathname.includes(path)) ||
        url.searchParams.has('emergency') ||
        request.headers.get('X-Emergency') === 'true'
    );
}

// Check if response should be cached
function shouldCache(request) {
    const url = new URL(request.url);

    // Don't cache dynamic API responses
    if (url.pathname.includes('/api/')) return false;

    // Don't cache external resources (except fonts)
    if (url.origin !== self.location.origin && !url.hostname.includes('fonts')) return false;

    // Cache static assets
    return true;
}

// Create emergency HTML page
function createEmergencyHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Tyre Service | TyreHero</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .emergency-container {
            max-width: 400px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #FFD700;
        }

        .emergency-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }

        .call-button {
            display: block;
            width: 100%;
            padding: 20px;
            background: #E53935;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 20px 0;
            transition: background 0.2s;
            border: none;
            cursor: pointer;
        }

        .call-button:hover {
            background: #D32F2F;
        }

        .service-info {
            margin-top: 20px;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .offline-notice {
            background: rgba(255, 68, 68, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 68, 68, 0.3);
        }

        @media (max-width: 480px) {
            .emergency-container {
                padding: 20px;
                margin: 10px;
            }

            h1 {
                font-size: 1.5rem;
            }

            .call-button {
                padding: 18px;
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <div class="emergency-container">
        <div class="emergency-icon">🚨</div>
        <h1>TyreHero Emergency</h1>

        <div class="offline-notice">
            📵 You're currently offline, but emergency contact is available
        </div>

        <a href="tel:${EMERGENCY_CONTACT.phone}" class="call-button">
            📞 Call Now: ${EMERGENCY_CONTACT.displayPhone}
        </a>

        <div class="service-info">
            <p>${EMERGENCY_CONTACT.message}</p>
            <p><strong>Services Available:</strong></p>
            <ul style="text-align: left; margin: 10px 0;">
                <li>Emergency tyre replacement</li>
                <li>Puncture repair</li>
                <li>Roadside assistance</li>
                <li>24/7 mobile service</li>
            </ul>
            <p><small>Coverage: Reading, Slough, Windsor, Maidenhead & surrounding areas</small></p>
        </div>
    </div>

    <script>
        // Track offline emergency contact attempts
        document.querySelector('.call-button').addEventListener('click', function() {
            // Store attempt in localStorage for analytics when back online
            try {
                const attempts = JSON.parse(localStorage.getItem('emergency_attempts') || '[]');
                attempts.push({
                    timestamp: new Date().toISOString(),
                    type: 'offline_call',
                    source: 'service_worker'
                });
                localStorage.setItem('emergency_attempts', JSON.stringify(attempts));
            } catch (e) {
                console.log('Could not store emergency attempt');
            }
        });

        // Check for network restoration
        window.addEventListener('online', function() {
            // Reload page when back online to get latest info
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });

        // Visual indicator for offline status
        if (!navigator.onLine) {
            document.body.style.filter = 'grayscale(20%)';
        }
    </script>
</body>
</html>`;
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'EMERGENCY_MODE':
            handleEmergencyMode(data);
            break;

        case 'UPDATE_EMERGENCY_CONTACT':
            updateEmergencyContact(data);
            break;

        case 'CACHE_CRITICAL_RESOURCE':
            cacheCriticalResource(data.url);
            break;

        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
    }
});

// Handle emergency mode activation
function handleEmergencyMode(data) {
    console.log('Emergency mode activated in service worker');

    // Clear non-essential cache to save space
    caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
            if (cacheName !== EMERGENCY_CACHE) {
                caches.delete(cacheName);
            }
        });
    });

    // Broadcast emergency mode to all clients
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'EMERGENCY_MODE_ACTIVE',
                data: { reason: data.reason }
            });
        });
    });
}

// Update emergency contact information
function updateEmergencyContact(newContact) {
    Object.assign(EMERGENCY_CONTACT, newContact);

    // Update cached emergency page
    caches.open(EMERGENCY_CACHE).then((cache) => {
        const emergencyHTML = createEmergencyHTML();
        const response = new Response(emergencyHTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
        cache.put('/emergency-offline', response);
    });
}

// Cache a critical resource
function cacheCriticalResource(url) {
    caches.open(EMERGENCY_CACHE).then((cache) => {
        cache.add(url).catch((error) => {
            console.warn('Failed to cache critical resource:', url, error);
        });
    });
}

// Get cache status
async function getCacheStatus() {
    const cache = await caches.open(EMERGENCY_CACHE);
    const keys = await cache.keys();

    return {
        cachedResources: keys.length,
        emergencyReady: keys.length >= CRITICAL_RESOURCES.length - 1, // -1 for data: URL
        lastUpdated: new Date().toISOString()
    };
}

// Background sync for emergency analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'emergency-analytics') {
        event.waitUntil(syncEmergencyAnalytics());
    }
});

// Sync emergency analytics when back online
async function syncEmergencyAnalytics() {
    try {
        const clients = await self.clients.matchAll();

        clients.forEach((client) => {
            client.postMessage({
                type: 'SYNC_EMERGENCY_ANALYTICS'
            });
        });
    } catch (error) {
        console.log('Failed to sync emergency analytics:', error);
    }
}

// Push notification handling for emergency updates
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        if (data.type === 'emergency') {
            event.waitUntil(
                self.registration.showNotification('TyreHero Emergency Update', {
                    body: data.message,
                    icon: '/images/tyrehero-logo.svg',
                    badge: '/images/emergency-badge.png',
                    tag: 'emergency',
                    requireInteraction: true,
                    actions: [
                        {
                            action: 'call',
                            title: 'Call Now'
                        },
                        {
                            action: 'dismiss',
                            title: 'Dismiss'
                        }
                    ]
                })
            );
        }
    } catch (error) {
        console.log('Failed to handle push notification:', error);
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'call') {
        // Open phone app
        event.waitUntil(
            clients.openWindow(`tel:${EMERGENCY_CONTACT.phone}`)
        );
    } else if (event.action === 'dismiss') {
        // Just close notification
        return;
    } else {
        // Open emergency page
        event.waitUntil(
            clients.openWindow('/emergency')
        );
    }
});

console.log('Emergency Service Worker loaded and ready');