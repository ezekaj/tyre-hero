// TyreHero Offline Features - Critical Emergency Functionality

class TyreHeroOfflineFeatures {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineData = new Map();
        this.emergencyContacts = [
            { name: 'Emergency Hotline', number: '08001234567', type: 'emergency' },
            { name: 'Customer Service', number: '08001234568', type: 'support' },
            { name: 'Breakdown Cover', number: '08001234569', type: 'breakdown' }
        ];
        this.cachedLocations = [];
        this.pendingRequests = [];
        
        this.init();
    }
    
    async init() {
        console.log('[Offline] Initializing offline features');
        
        // Setup offline detection
        this.setupOfflineDetection();
        
        // Initialize offline storage
        await this.initializeOfflineStorage();
        
        // Setup emergency forms
        this.setupOfflineEmergencyForm();
        
        // Load cached data
        await this.loadCachedData();
        
        // Setup background sync
        this.setupBackgroundSync();
        
        // Initialize geolocation caching
        this.initializeLocationCaching();
        
        console.log('[Offline] Offline features initialized');
    }
    
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOffline();
        });
        
        // Initial state
        this.isOnline = navigator.onLine;
    }
    
    async initializeOfflineStorage() {
        // Initialize IndexedDB for offline storage
        this.db = await this.openDatabase();
        
        // Pre-cache critical emergency data
        await this.preCacheEmergencyData();
    }
    
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TyreHeroOffline', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Emergency requests store
                if (!db.objectStoreNames.contains('emergencyRequests')) {
                    const store = db.createObjectStore('emergencyRequests', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }
                
                // Cached locations store
                if (!db.objectStoreNames.contains('locations')) {
                    const store = db.createObjectStore('locations', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Service areas store
                if (!db.objectStoreNames.contains('serviceAreas')) {
                    const store = db.createObjectStore('serviceAreas', { 
                        keyPath: 'postcode' 
                    });
                }
                
                // Emergency contacts store
                if (!db.objectStoreNames.contains('contacts')) {
                    const store = db.createObjectStore('contacts', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('type', 'type', { unique: false });
                }
                
                // Cached forms store
                if (!db.objectStoreNames.contains('forms')) {
                    const store = db.createObjectStore('forms', { 
                        keyPath: 'formId' 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    async preCacheEmergencyData() {
        // Cache emergency contacts
        await this.cacheEmergencyContacts();
        
        // Cache service information
        await this.cacheServiceInformation();
        
        // Cache pricing information
        await this.cachePricingInformation();
    }
    
    async cacheEmergencyContacts() {
        const transaction = this.db.transaction(['contacts'], 'readwrite');
        const store = transaction.objectStore('contacts');
        
        for (const contact of this.emergencyContacts) {
            await store.put(contact);
        }
        
        console.log('[Offline] Emergency contacts cached');
    }
    
    async cacheServiceInformation() {
        const serviceInfo = {
            emergencyResponse: '90-minute average response time',
            coverage: 'Nationwide coverage across UK',
            availability: '24/7 service availability',
            services: [
                'Emergency tyre replacement',
                'Puncture repair',
                'Mobile tyre fitting',
                'Roadside assistance'
            ]
        };
        
        this.offlineData.set('serviceInfo', serviceInfo);
        localStorage.setItem('offline-service-info', JSON.stringify(serviceInfo));
    }
    
    async cachePricingInformation() {
        const pricingInfo = {
            calloutFee: 'No callout fees',
            emergencyService: 'From £80 + tyre cost',
            standardService: 'From £60 + tyre cost',
            punctureRepair: 'From £25',
            paymentMethods: ['Card', 'Contactless', 'Mobile payment']
        };
        
        this.offlineData.set('pricingInfo', pricingInfo);
        localStorage.setItem('offline-pricing-info', JSON.stringify(pricingInfo));
    }
    
    setupOfflineEmergencyForm() {
        // Override emergency form submission
        document.addEventListener('submit', (event) => {
            if (event.target.id === 'emergencyForm') {
                event.preventDefault();
                this.handleOfflineEmergencySubmission(event.target);
            }
        });
        
        // Add offline indicator to form
        this.addOfflineFormIndicator();
    }
    
    async handleOfflineEmergencySubmission(form) {
        const formData = new FormData(form);
        const emergencyRequest = {
            id: Date.now(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            vehicle: formData.get('vehicle'),
            issue: formData.get('issue'),
            details: formData.get('details'),
            timestamp: Date.now(),
            status: 'pending_sync',
            offline: true
        };
        
        // Add current location if available
        try {
            const position = await this.getCurrentLocation();
            emergencyRequest.coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
        } catch (error) {
            console.log('[Offline] Could not get current location:', error);
        }
        
        // Store in IndexedDB
        await this.storeEmergencyRequest(emergencyRequest);
        
        // Add to pending requests
        this.pendingRequests.push(emergencyRequest);
        
        // Show offline confirmation
        this.showOfflineConfirmation(emergencyRequest);
        
        // Register for background sync if supported
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            const registration = await navigator.serviceWorker.ready;
            registration.sync.register('emergency-request-sync');
        }
    }
    
    async storeEmergencyRequest(request) {
        const transaction = this.db.transaction(['emergencyRequests'], 'readwrite');
        const store = transaction.objectStore('emergencyRequests');
        
        await store.put(request);
        console.log('[Offline] Emergency request stored:', request.id);
    }
    
    showOfflineConfirmation(request) {
        const confirmationHTML = `
            <div class="offline-confirmation-modal">
                <div class="offline-confirmation-content">
                    <div class="offline-confirmation-icon">📡</div>
                    <h3>Request Saved Offline</h3>
                    <p>Your emergency request has been saved and will be submitted automatically when your connection is restored.</p>
                    
                    <div class="offline-request-details">
                        <h4>Request Details:</h4>
                        <p><strong>Name:</strong> ${request.name}</p>
                        <p><strong>Phone:</strong> ${request.phone}</p>
                        <p><strong>Issue:</strong> ${request.issue}</p>
                        <p><strong>Time:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div class="offline-emergency-actions">
                        <a href="tel:${this.emergencyContacts[0].number}" class="offline-call-btn">
                            📞 Call Emergency Hotline
                        </a>
                        <button onclick="this.closest('.offline-confirmation-modal').remove()" class="offline-close-btn">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = confirmationHTML;
        document.body.appendChild(modal);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 30000);
    }
    
    addOfflineFormIndicator() {
        const form = document.getElementById('emergencyForm');
        if (!form) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'offline-form-indicator';
        indicator.innerHTML = `
            <div class="offline-form-status">
                <span class="status-icon">📡</span>
                <span class="status-text">Offline - Form will sync when connection restored</span>
            </div>
        `;
        
        indicator.style.cssText = `
            background: #FFA000;
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            display: ${this.isOnline ? 'none' : 'block'};
            text-align: center;
            font-weight: 500;
        `;
        
        form.insertBefore(indicator, form.firstChild);
    }
    
    async loadCachedData() {
        // Load cached emergency contacts
        const contacts = await this.getStoredContacts();
        if (contacts.length > 0) {
            this.emergencyContacts = contacts;
        }
        
        // Load cached locations
        this.cachedLocations = await this.getStoredLocations();
        
        // Load pending requests
        this.pendingRequests = await this.getPendingRequests();
        
        console.log('[Offline] Cached data loaded');
    }
    
    async getStoredContacts() {
        try {
            const transaction = this.db.transaction(['contacts'], 'readonly');
            const store = transaction.objectStore('contacts');
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            console.error('[Offline] Error loading contacts:', error);
            return [];
        }
    }
    
    async getStoredLocations() {
        try {
            const transaction = this.db.transaction(['locations'], 'readonly');
            const store = transaction.objectStore('locations');
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            console.error('[Offline] Error loading locations:', error);
            return [];
        }
    }
    
    async getPendingRequests() {
        try {
            const transaction = this.db.transaction(['emergencyRequests'], 'readonly');
            const store = transaction.objectStore('emergencyRequests');
            const index = store.index('status');
            const request = index.getAll('pending_sync');
            
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            console.error('[Offline] Error loading pending requests:', error);
            return [];
        }
    }
    
    setupBackgroundSync() {
        // Listen for background sync events from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SYNC_COMPLETE') {
                    this.handleSyncComplete(event.data.payload);
                }
            });
        }
    }
    
    initializeLocationCaching() {
        if ('geolocation' in navigator) {
            // Cache current location
            navigator.geolocation.getCurrentPosition(
                (position) => this.cacheLocation(position),
                (error) => console.log('[Offline] Location caching failed:', error),
                { enableHighAccuracy: true, maximumAge: 300000 }
            );
            
            // Watch position for emergency scenarios
            this.locationWatcher = navigator.geolocation.watchPosition(
                (position) => this.cacheLocation(position),
                (error) => console.log('[Offline] Location watch error:', error),
                { enableHighAccuracy: false, maximumAge: 600000 }
            );
        }
    }
    
    async cacheLocation(position) {
        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        };
        
        // Store in IndexedDB
        try {
            const transaction = this.db.transaction(['locations'], 'readwrite');
            const store = transaction.objectStore('locations');
            await store.put(locationData);
            
            // Keep only last 10 locations
            const allLocations = await this.getStoredLocations();
            if (allLocations.length > 10) {
                const oldest = allLocations.sort((a, b) => a.timestamp - b.timestamp)[0];
                const deleteTransaction = this.db.transaction(['locations'], 'readwrite');
                deleteTransaction.objectStore('locations').delete(oldest.id);
            }
        } catch (error) {
            console.error('[Offline] Error caching location:', error);
        }
        
        // Also store in localStorage as backup
        localStorage.setItem('last-known-location', JSON.stringify(locationData));
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    (error) => {
                        // Try cached location
                        const cached = localStorage.getItem('last-known-location');
                        if (cached) {
                            const location = JSON.parse(cached);
                            resolve({
                                coords: {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    accuracy: location.accuracy
                                }
                            });
                        } else {
                            reject(error);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    }
    
    handleOnline() {
        console.log('[Offline] Connection restored');
        
        // Hide offline indicators
        this.hideOfflineIndicators();
        
        // Sync pending requests
        this.syncPendingRequests();
        
        // Update UI
        this.updateOnlineStatus(true);
    }
    
    handleOffline() {
        console.log('[Offline] Connection lost');
        
        // Show offline indicators
        this.showOfflineIndicators();
        
        // Update UI
        this.updateOnlineStatus(false);
        
        // Cache current page state
        this.cacheCurrentPageState();
    }
    
    hideOfflineIndicators() {
        const indicator = document.getElementById('offline-form-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        
        // Update any offline banners
        const banners = document.querySelectorAll('.offline-banner');
        banners.forEach(banner => banner.style.display = 'none');
    }
    
    showOfflineIndicators() {
        const indicator = document.getElementById('offline-form-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
        
        // Show pending requests count
        if (this.pendingRequests.length > 0) {
            this.showPendingRequestsIndicator();
        }
    }
    
    showPendingRequestsIndicator() {
        let indicator = document.getElementById('pending-requests-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pending-requests-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 20px;
                background: #FF8F00;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
                z-index: 9998;
                display: flex;
                align-items: center;
                gap: 6px;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.innerHTML = `
            📤 ${this.pendingRequests.length} pending request${this.pendingRequests.length !== 1 ? 's' : ''}
        `;
        indicator.style.display = 'flex';
    }
    
    async syncPendingRequests() {
        if (this.pendingRequests.length === 0) return;
        
        console.log('[Offline] Syncing pending requests:', this.pendingRequests.length);
        
        for (const request of this.pendingRequests) {
            try {
                await this.submitEmergencyRequest(request);
                
                // Mark as synced
                request.status = 'synced';
                await this.updateEmergencyRequest(request);
                
                // Remove from pending list
                this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
                
            } catch (error) {
                console.error('[Offline] Failed to sync request:', request.id, error);
            }
        }
        
        // Update indicator
        if (this.pendingRequests.length === 0) {
            const indicator = document.getElementById('pending-requests-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }
    
    async submitEmergencyRequest(request) {
        const response = await fetch('/api/emergency-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
    
    async updateEmergencyRequest(request) {
        const transaction = this.db.transaction(['emergencyRequests'], 'readwrite');
        const store = transaction.objectStore('emergencyRequests');
        
        await store.put(request);
    }
    
    updateOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        
        // Update status indicator
        let statusIndicator = document.getElementById('connection-status-indicator');
        
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'connection-status-indicator';
            statusIndicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 0.8rem;
                font-weight: 500;
                z-index: 9999;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusIndicator);
        }
        
        if (isOnline) {
            statusIndicator.innerHTML = '🟢 Online';
            statusIndicator.style.background = '#E8F5E8';
            statusIndicator.style.color = '#2E7D32';
        } else {
            statusIndicator.innerHTML = '🔴 Offline';
            statusIndicator.style.background = '#FFEBEE';
            statusIndicator.style.color = '#C62828';
        }
    }
    
    cacheCurrentPageState() {
        // Cache current page content for offline viewing
        const pageData = {
            url: window.location.href,
            title: document.title,
            content: document.documentElement.outerHTML,
            timestamp: Date.now()
        };
        
        localStorage.setItem('cached-page-state', JSON.stringify(pageData));
    }
    
    handleSyncComplete(payload) {
        console.log('[Offline] Sync complete:', payload);
        
        if (payload.type === 'emergency-request') {
            // Remove from pending requests
            this.pendingRequests = this.pendingRequests.filter(
                request => request.id !== payload.requestId
            );
            
            // Show success notification
            this.showSyncSuccessNotification(payload);
        }
    }
    
    showSyncSuccessNotification(payload) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="sync-success-notification">
                <div class="notification-content">
                    <span class="notification-icon">✅</span>
                    <span class="notification-text">Emergency request synced successfully</span>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #E8F5E8;
            color: #2E7D32;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Public API methods
    getOfflineCapabilities() {
        return {
            emergencyContacts: this.emergencyContacts,
            cachedLocations: this.cachedLocations,
            pendingRequests: this.pendingRequests.length,
            isOnline: this.isOnline,
            serviceInfo: this.offlineData.get('serviceInfo'),
            pricingInfo: this.offlineData.get('pricingInfo')
        };
    }
    
    async addEmergencyContact(contact) {
        this.emergencyContacts.push(contact);
        
        const transaction = this.db.transaction(['contacts'], 'readwrite');
        const store = transaction.objectStore('contacts');
        await store.put(contact);
    }
    
    getEmergencyContacts() {
        return this.emergencyContacts;
    }
    
    getPendingRequestsCount() {
        return this.pendingRequests.length;
    }
}

// Initialize offline features
let tyreHeroOfflineFeatures;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroOfflineFeatures = new TyreHeroOfflineFeatures();
});

// Export for global access
window.tyreHeroOfflineFeatures = tyreHeroOfflineFeatures;

// Add CSS for offline features
const offlineStyles = document.createElement('style');
offlineStyles.textContent = `
    .offline-confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 20px;
    }
    
    .offline-confirmation-content {
        background: white;
        border-radius: 16px;
        padding: 32px 24px;
        max-width: 400px;
        width: 100%;
        text-align: center;
    }
    
    .offline-confirmation-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }
    
    .offline-confirmation-content h3 {
        color: #E53935;
        margin-bottom: 16px;
        font-size: 1.5rem;
    }
    
    .offline-request-details {
        text-align: left;
        background: #F5F5F5;
        padding: 16px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .offline-request-details h4 {
        margin-bottom: 12px;
        color: #212121;
    }
    
    .offline-request-details p {
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #757575;
    }
    
    .offline-emergency-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 24px;
    }
    
    .offline-call-btn {
        background: #E53935;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: background 0.2s ease;
    }
    
    .offline-call-btn:hover {
        background: #C62828;
    }
    
    .offline-close-btn {
        background: #F5F5F5;
        color: #212121;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .offline-close-btn:hover {
        background: #E0E0E0;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(offlineStyles);