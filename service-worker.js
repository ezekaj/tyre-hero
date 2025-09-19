/**
 * TyreHero Emergency Service - Service Worker
 * 
 * Provides offline functionality and emergency features for PWA
 * Caches critical resources and enables offline emergency calls
 */

const CACHE_NAME = 'tyrehero-v1.0.0';
const EMERGENCY_CACHE = 'tyrehero-emergency-v1.0.0';

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/main.js',
    '/images/favicon.ico',
    '/manifest.json'
];

// Emergency-specific resources
const EMERGENCY_ASSETS = [
    '/images/emergency-icon.png',
    '/assets/sounds/emergency-alert.mp3'
];

// API endpoints to cache for offline functionality
const API_CACHE_URLS = [
    '/api/coverage-check',
    '/health'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache critical assets
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching critical assets');
                return cache.addAll(CRITICAL_ASSETS);
            }),
            // Cache emergency assets
            caches.open(EMERGENCY_CACHE).then((cache) => {
                console.log('Service Worker: Caching emergency assets');
                return cache.addAll(EMERGENCY_ASSETS);
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== EMERGENCY_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle emergency calls
    if (url.pathname === '/api/emergency-call') {
        event.respondWith(handleEmergencyCall(request));
        return;
    }

    // Handle static assets
    event.respondWith(handleStaticAssets(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses for specific endpoints
        if (networkResponse.ok && API_CACHE_URLS.includes(url.pathname)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache for:', url.pathname);
        
        // For emergency booking, provide offline fallback
        if (url.pathname === '/api/emergency-booking') {
            return handleOfflineEmergencyBooking(request);
        }
        
        // Try cache for other API requests
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Service unavailable offline',
                offline: true,
                message: 'Please try again when online or call our emergency number directly',
                emergencyPhone: '+447700900000'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle emergency calls with special offline support
async function handleEmergencyCall(request) {
    try {
        // Try to make the call online first
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // If offline, store the emergency call attempt locally
        const callData = {
            id: generateOfflineId(),
            timestamp: new Date().toISOString(),
            offline: true,
            userAgent: navigator.userAgent
        };
        
        // Store in IndexedDB for later sync
        await storeOfflineEmergencyCall(callData);
        
        // Return immediate response
        return new Response(
            JSON.stringify({
                success: true,
                offline: true,
                callId: callData.id,
                phone: '+447700900000',
                message: 'Emergency call logged offline. Please call directly now.',
                urgent: true
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle offline emergency booking
async function handleOfflineEmergencyBooking(request) {
    try {
        const formData = await request.clone().json();
        
        // Generate offline booking
        const offlineBooking = {
            id: generateOfflineId(),
            type: 'emergency',
            timestamp: new Date().toISOString(),
            offline: true,
            data: formData,
            status: 'pending_sync'
        };
        
        // Store offline booking
        await storeOfflineBooking(offlineBooking);
        
        // Show notification to user
        self.registration.showNotification('Emergency Booking Saved', {
            body: 'Your emergency booking has been saved offline. Please call our emergency number for immediate assistance.',
            icon: '/images/emergency-icon.png',
            badge: '/images/badge-icon.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            actions: [
                {
                    action: 'call',
                    title: 'Call Now',
                    icon: '/images/phone-icon.png'
                }
            ]
        });
        
        return new Response(
            JSON.stringify({
                success: true,
                offline: true,
                bookingId: offlineBooking.id,
                message: 'Emergency booking saved offline. Please call our emergency line immediately.',
                phone: '+447700900000',
                urgent: true
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Could not process offline emergency booking',
                phone: '+447700900000',
                message: 'Please call our emergency line directly'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        // Try network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match('/index.html');
            return offlineResponse || new Response('Offline', { status: 503 });
        }
        
        throw error;
    }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'call') {
        // Open phone app
        event.waitUntil(
            clients.openWindow('tel:+447700900000')
        );
    } else {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'emergency-sync') {
        event.waitUntil(syncOfflineEmergencyData());
    } else if (event.tag === 'booking-sync') {
        event.waitUntil(syncOfflineBookings());
    }
});

// Push notification handler for emergency alerts
self.addEventListener('push', (event) => {
    const options = {
        body: 'Emergency service update',
        icon: '/images/emergency-icon.png',
        badge: '/images/badge-icon.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.message || options.body;
        options.title = data.title || 'TyreHero Emergency';
    }
    
    event.waitUntil(
        self.registration.showNotification('TyreHero Emergency', options)
    );
});

// Utility functions
function generateOfflineId() {
    return 'OFFLINE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// IndexedDB operations for offline storage
async function storeOfflineEmergencyCall(callData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TyreHeroOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['emergencyCalls'], 'readwrite');
            const store = transaction.objectStore('emergencyCalls');
            store.add(callData);
            transaction.oncomplete = () => resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('emergencyCalls')) {
                db.createObjectStore('emergencyCalls', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('bookings')) {
                db.createObjectStore('bookings', { keyPath: 'id' });
            }
        };
    });
}

async function storeOfflineBooking(bookingData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TyreHeroOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['bookings'], 'readwrite');
            const store = transaction.objectStore('bookings');
            store.add(bookingData);
            transaction.oncomplete = () => resolve();
        };
    });
}

async function syncOfflineEmergencyData() {
    // Sync offline emergency calls when online
    console.log('Service Worker: Syncing offline emergency data...');
    // Implementation would sync with server
}

async function syncOfflineBookings() {
    // Sync offline bookings when online
    console.log('Service Worker: Syncing offline bookings...');
    // Implementation would sync with server
}

console.log('Service Worker: Loaded and ready for emergency service');