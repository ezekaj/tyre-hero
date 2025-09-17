// TyreHero PWA Manager - Installation, Updates, and Emergency Features

class TyreHeroPWA {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.notificationPermission = 'default';
        
        this.init();
    }
    
    async init() {
        console.log('[PWA] Initializing TyreHero PWA Manager');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup installation handlers
        this.setupInstallationHandlers();
        
        // Setup update handlers
        this.setupUpdateHandlers();
        
        // Setup offline handlers
        this.setupOfflineHandlers();
        
        // Setup emergency features
        this.setupEmergencyFeatures();
        
        // Setup push notifications
        await this.setupPushNotifications();
        
        // Initialize emergency location tracking
        this.initEmergencyLocation();
        
        console.log('[PWA] TyreHero PWA Manager initialized');
    }
    
    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('[PWA] Service Worker registered:', this.swRegistration);
                
                // Listen for service worker messages
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });
                
                return this.swRegistration;
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }
    }
    
    // Installation Handlers
    setupInstallationHandlers() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt triggered');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Check if already installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackInstallation();
        });
        
        // Check for iOS standalone mode
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('[PWA] App running in standalone mode');
        }
    }
    
    // Show install button for emergency quick access
    showInstallButton() {
        let installBanner = document.getElementById('pwa-install-banner');
        
        if (!installBanner) {
            installBanner = this.createInstallBanner();
            document.body.appendChild(installBanner);
        }
        
        installBanner.style.display = 'block';
        
        // Auto-show for emergency scenarios
        if (this.isEmergencyPage()) {
            this.showEmergencyInstallPrompt();
        }
    }
    
    createInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="none" d="M0 0h24v24H0z"/>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="pwa-install-text">
                    <div class="pwa-install-title">Install TyreHero</div>
                    <div class="pwa-install-subtitle">Get instant emergency access</div>
                </div>
                <div class="pwa-install-actions">
                    <button class="pwa-install-btn" onclick="tyreHeroPWA.installApp()">Install</button>
                    <button class="pwa-install-close" onclick="tyreHeroPWA.hideInstallButton()">×</button>
                </div>
            </div>
        `;
        
        // Add styles
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #E53935, #C62828);
            color: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(229, 57, 53, 0.3);
            z-index: 10000;
            display: none;
            animation: slideUp 0.3s ease;
        `;
        
        return banner;
    }
    
    showEmergencyInstallPrompt() {
        if (this.deferredPrompt && !this.isInstalled) {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="emergency-install-modal">
                    <div class="emergency-install-content">
                        <h3>🚨 Install for Emergency Access</h3>
                        <p>Install TyreHero for instant emergency access, even when offline.</p>
                        <div class="emergency-features">
                            <div>📱 Instant app launch</div>
                            <div>📡 Works offline</div>
                            <div>📞 One-tap emergency call</div>
                            <div>📍 Location sharing</div>
                        </div>
                        <div class="emergency-install-actions">
                            <button onclick="tyreHeroPWA.installApp(); this.closest('.emergency-install-modal').remove();" class="emergency-install-yes">Install Now</button>
                            <button onclick="this.closest('.emergency-install-modal').remove();" class="emergency-install-later">Maybe Later</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    }
    
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('[PWA] User accepted installation');
                this.trackInstallation();
            } else {
                console.log('[PWA] User dismissed installation');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }
    
    hideInstallButton() {
        const installBanner = document.getElementById('pwa-install-banner');
        if (installBanner) {
            installBanner.style.display = 'none';
        }
    }
    
    // Update Handlers
    setupUpdateHandlers() {
        if (this.swRegistration) {
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdatePrompt();
                    }
                });
            });
        }
        
        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
    
    showUpdatePrompt() {
        const updateBanner = document.createElement('div');
        updateBanner.innerHTML = `
            <div class="pwa-update-banner">
                <div class="pwa-update-content">
                    <span>📱 New version available</span>
                    <button onclick="tyreHeroPWA.updateApp()">Update</button>
                    <button onclick="this.parentElement.parentElement.remove()">Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
    }
    
    updateApp() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }
    
    // Offline Handlers
    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOffline();
        });
        
        // Show offline indicator
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }
    
    handleOnline() {
        console.log('[PWA] Connection restored');
        this.hideOfflineIndicator();
        this.syncPendingRequests();
    }
    
    handleOffline() {
        console.log('[PWA] Connection lost');
        this.showOfflineIndicator();
    }
    
    showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = '📡 Offline - Emergency services still available';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #FFA000;
                color: white;
                text-align: center;
                padding: 8px;
                z-index: 9999;
                font-size: 14px;
                font-weight: 500;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.display = 'block';
    }
    
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // Emergency Features
    setupEmergencyFeatures() {
        // Add emergency shortcuts to PWA
        this.addEmergencyShortcuts();
        
        // Setup haptic feedback for emergency actions
        this.setupHapticFeedback();
        
        // Setup emergency location sharing
        this.setupEmergencyLocationSharing();
        
        // Setup voice activation (if supported)
        this.setupVoiceActivation();
    }
    
    addEmergencyShortcuts() {
        // Create floating emergency button for quick access
        const emergencyFloat = document.createElement('div');
        emergencyFloat.id = 'emergency-float';
        emergencyFloat.innerHTML = `
            <button class="emergency-float-btn" onclick="tyreHeroPWA.emergencyCall()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.20.322.042.55.064a.5.5 0 0 1 .449.498z" fill="currentColor"/>
                </svg>
            </button>
        `;
        
        document.body.appendChild(emergencyFloat);
    }
    
    setupHapticFeedback() {
        // Add haptic feedback to emergency buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.emergency-call-fixed, .emergency-float-btn, .btn-primary')) {
                this.vibrate([200, 100, 200]);
            }
        });
    }
    
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    setupEmergencyLocationSharing() {
        // Auto-get location for emergency requests
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.cacheEmergencyLocation(position);
                },
                (error) => {
                    console.log('[PWA] Location access denied:', error);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }
    
    cacheEmergencyLocation(position) {
        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        };
        
        // Send to service worker for caching
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_EMERGENCY_LOCATION',
                payload: locationData
            });
        }
        
        // Store in localStorage as backup
        localStorage.setItem('emergency-location', JSON.stringify(locationData));
    }
    
    setupVoiceActivation() {
        // Setup voice commands for emergency scenarios
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // Voice activation implementation would go here
            console.log('[PWA] Voice recognition available');
        }
    }
    
    // Push Notifications
    async setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            this.notificationPermission = Notification.permission;
            
            if (this.notificationPermission === 'default') {
                // Request permission on emergency page
                if (this.isEmergencyPage()) {
                    await this.requestNotificationPermission();
                }
            }
            
            if (this.notificationPermission === 'granted' && this.swRegistration) {
                await this.subscribeToPush();
            }
        }
    }
    
    async requestNotificationPermission() {
        try {
            this.notificationPermission = await Notification.requestPermission();
            
            if (this.notificationPermission === 'granted') {
                console.log('[PWA] Notification permission granted');
                await this.subscribeToPush();
            }
        } catch (error) {
            console.error('[PWA] Error requesting notification permission:', error);
        }
    }
    
    async subscribeToPush() {
        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with actual VAPID key
            });
            
            console.log('[PWA] Push subscription:', subscription);
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
        } catch (error) {
            console.error('[PWA] Push subscription failed:', error);
        }
    }
    
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
    
    async sendSubscriptionToServer(subscription) {
        // In a real implementation, send this to your backend
        console.log('[PWA] Would send subscription to server:', subscription);
    }
    
    // Emergency Functions
    emergencyCall() {
        this.vibrate([200, 100, 200, 100, 200]);
        window.location.href = 'tel:08001234567';
    }
    
    async requestEmergencyService() {
        // Get current location
        const location = await this.getCurrentLocation();
        
        // Pre-fill emergency form
        const emergencyForm = document.getElementById('emergencyForm');
        if (emergencyForm && location) {
            const locationField = emergencyForm.querySelector('#location');
            if (locationField) {
                locationField.value = `Lat: ${location.latitude}, Lng: ${location.longitude}`;
            }
        }
        
        // Navigate to emergency page
        if (window.location.pathname !== '/emergency.html') {
            window.location.href = '/emergency.html';
        }
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    (error) => {
                        // Try cached location
                        const cached = localStorage.getItem('emergency-location');
                        if (cached) {
                            resolve(JSON.parse(cached));
                        } else {
                            reject(error);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    }
    
    // Utility Functions
    isEmergencyPage() {
        return window.location.pathname.includes('emergency') || 
               window.location.search.includes('emergency=true');
    }
    
    syncPendingRequests() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'REQUEST_SYNC'
            });
        }
    }
    
    handleServiceWorkerMessage(event) {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'UPDATE_AVAILABLE':
                this.showUpdatePrompt();
                break;
                
            case 'CACHE_UPDATE':
                console.log('[PWA] Cache updated:', payload);
                break;
                
            case 'SYNC_COMPLETE':
                console.log('[PWA] Background sync complete');
                break;
        }
    }
    
    trackInstallation() {
        // Track PWA installation for analytics
        console.log('[PWA] App installation tracked');
        
        // Could send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: 'TyreHero Install'
            });
        }
    }
    
    initEmergencyLocation() {
        // Initialize emergency location tracking
        if (this.isEmergencyPage()) {
            this.getCurrentLocation().then(location => {
                console.log('[PWA] Emergency location detected:', location);
            }).catch(error => {
                console.log('[PWA] Could not get emergency location:', error);
            });
        }
    }
}

// Initialize PWA Manager
let tyreHeroPWA;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroPWA = new TyreHeroPWA();
});

// Add emergency keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E for emergency
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (tyreHeroPWA) {
            tyreHeroPWA.requestEmergencyService();
        }
    }
    
    // Ctrl/Cmd + C for call
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (tyreHeroPWA) {
            tyreHeroPWA.emergencyCall();
        }
    }
});

// Export for global access
window.tyreHeroPWA = tyreHeroPWA;