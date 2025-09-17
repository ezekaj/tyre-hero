// TyreHero Push Notifications - Emergency Service Updates

class TyreHeroPushNotifications {
    constructor() {
        this.swRegistration = null;
        this.subscription = null;
        this.vapidPublicKey = 'BJ1YKlh7wRNaHj0w6Y9A8w8QlQv5Zb0QsQ5ZCcZ2VbB3Y5zX7Qw9tH8j6K5l4M3nO2pR1s0T9uV8x7C6dE5fG4h'; // Replace with actual VAPID key
        this.apiEndpoint = '/api/push-notifications'; // Replace with actual endpoint
        
        this.init();
    }
    
    async init() {
        console.log('[Push] Initializing push notifications');
        
        if (!this.isSupported()) {
            console.log('[Push] Push notifications not supported');
            return;
        }
        
        try {
            this.swRegistration = await navigator.serviceWorker.ready;
            await this.checkExistingSubscription();
            this.setupEventListeners();
            
            console.log('[Push] Push notifications initialized');
        } catch (error) {
            console.error('[Push] Initialization failed:', error);
        }
    }
    
    isSupported() {
        return 'serviceWorker' in navigator && 
               'PushManager' in window && 
               'Notification' in window;
    }
    
    async checkExistingSubscription() {
        try {
            this.subscription = await this.swRegistration.pushManager.getSubscription();
            
            if (this.subscription) {
                console.log('[Push] Existing subscription found');
                await this.sendSubscriptionToServer(this.subscription);
            }
        } catch (error) {
            console.error('[Push] Error checking subscription:', error);
        }
    }
    
    setupEventListeners() {
        // Listen for emergency service requests
        document.addEventListener('emergency-request-submitted', (event) => {
            this.handleEmergencyRequest(event.detail);
        });
        
        // Listen for service status updates
        document.addEventListener('service-status-update', (event) => {
            this.handleServiceUpdate(event.detail);
        });
        
        // Listen for location updates
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (position) => this.handleLocationUpdate(position),
                (error) => console.log('[Push] Location error:', error),
                { enableHighAccuracy: true, maximumAge: 30000 }
            );
        }
    }
    
    async requestPermission() {
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            console.log('[Push] Notification permission denied');
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('[Push] Notification permission granted');
                await this.subscribe();
                return true;
            } else {
                console.log('[Push] Notification permission denied by user');
                return false;
            }
        } catch (error) {
            console.error('[Push] Error requesting permission:', error);
            return false;
        }
    }
    
    async subscribe() {
        if (!this.swRegistration) {
            console.error('[Push] Service worker not ready');
            return false;
        }
        
        try {
            const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
            
            this.subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
            
            console.log('[Push] Subscription successful:', this.subscription);
            
            await this.sendSubscriptionToServer(this.subscription);
            this.storeSubscriptionLocally(this.subscription);
            
            return true;
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            return false;
        }
    }
    
    async unsubscribe() {
        if (!this.subscription) {
            console.log('[Push] No subscription to unsubscribe');
            return true;
        }
        
        try {
            await this.subscription.unsubscribe();
            await this.removeSubscriptionFromServer(this.subscription);
            this.removeSubscriptionLocally();
            
            this.subscription = null;
            console.log('[Push] Unsubscribed successfully');
            
            return true;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return false;
        }
    }
    
    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch(this.apiEndpoint + '/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now(),
                    preferences: this.getNotificationPreferences()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[Push] Subscription sent to server:', result);
            
        } catch (error) {
            console.error('[Push] Error sending subscription to server:', error);
            
            // Store for retry when online
            this.storeFailedRequest('subscribe', subscription);
        }
    }
    
    async removeSubscriptionFromServer(subscription) {
        try {
            const response = await fetch(this.apiEndpoint + '/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('[Push] Subscription removed from server');
            
        } catch (error) {
            console.error('[Push] Error removing subscription from server:', error);
        }
    }
    
    getNotificationPreferences() {
        return {
            emergency_updates: true,
            service_status: true,
            technician_arrival: true,
            payment_confirmation: true,
            service_reminders: localStorage.getItem('notification-reminders') !== 'false',
            promotional: localStorage.getItem('notification-promotional') === 'true'
        };
    }
    
    async handleEmergencyRequest(requestData) {
        console.log('[Push] Emergency request submitted:', requestData);
        
        // Send immediate confirmation notification
        if (this.subscription) {
            await this.sendEmergencyConfirmation(requestData);
        }
        
        // Set up location tracking for this request
        this.startEmergencyTracking(requestData.requestId);
    }
    
    async sendEmergencyConfirmation(requestData) {
        try {
            const response = await fetch(this.apiEndpoint + '/emergency-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: this.subscription,
                    requestData: requestData,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                console.log('[Push] Emergency confirmation sent');
            }
        } catch (error) {
            console.error('[Push] Error sending emergency confirmation:', error);
        }
    }
    
    startEmergencyTracking(requestId) {
        // Store emergency request ID for tracking
        localStorage.setItem('active-emergency-request', requestId);
        localStorage.setItem('emergency-start-time', Date.now());
        
        // Enable high-frequency location updates during emergency
        if ('geolocation' in navigator) {
            this.emergencyLocationWatch = navigator.geolocation.watchPosition(
                (position) => this.sendEmergencyLocationUpdate(requestId, position),
                (error) => console.log('[Push] Emergency location error:', error),
                { 
                    enableHighAccuracy: true, 
                    timeout: 5000,
                    maximumAge: 10000 
                }
            );
        }
    }
    
    async sendEmergencyLocationUpdate(requestId, position) {
        try {
            const locationData = {
                requestId: requestId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
            };
            
            const response = await fetch(this.apiEndpoint + '/emergency-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(locationData)
            });
            
            if (response.ok) {
                console.log('[Push] Emergency location update sent');
            }
        } catch (error) {
            console.error('[Push] Error sending emergency location:', error);
            
            // Store for retry when online
            this.storeFailedRequest('emergency-location', {
                requestId,
                location: position.coords,
                timestamp: Date.now()
            });
        }
    }
    
    handleServiceUpdate(updateData) {
        console.log('[Push] Service status update:', updateData);
        
        // Show local notification if app is in background
        if (document.hidden && Notification.permission === 'granted') {
            this.showLocalNotification(updateData);
        }
        
        // Update UI if app is active
        this.updateServiceStatus(updateData);
    }
    
    showLocalNotification(data) {
        const options = {
            body: data.message,
            icon: '/images/icon-192.png',
            badge: '/images/badge-72.png',
            tag: 'service-update',
            requireInteraction: data.priority === 'high',
            vibrate: data.priority === 'high' ? [300, 100, 300] : [200, 100, 200],
            data: data,
            actions: this.getNotificationActions(data.type)
        };
        
        new Notification(data.title || 'TyreHero Update', options);
    }
    
    getNotificationActions(type) {
        switch (type) {
            case 'technician-dispatched':
                return [
                    {
                        action: 'track',
                        title: 'Track Technician',
                        icon: '/images/icon-track.png'
                    },
                    {
                        action: 'call',
                        title: 'Call Now',
                        icon: '/images/icon-phone.png'
                    }
                ];
                
            case 'technician-arriving':
                return [
                    {
                        action: 'view',
                        title: 'View Details',
                        icon: '/images/icon-view.png'
                    },
                    {
                        action: 'call',
                        title: 'Call Technician',
                        icon: '/images/icon-phone.png'
                    }
                ];
                
            case 'service-complete':
                return [
                    {
                        action: 'feedback',
                        title: 'Leave Feedback',
                        icon: '/images/icon-star.png'
                    },
                    {
                        action: 'receipt',
                        title: 'View Receipt',
                        icon: '/images/icon-receipt.png'
                    }
                ];
                
            default:
                return [
                    {
                        action: 'view',
                        title: 'View Details',
                        icon: '/images/icon-view.png'
                    }
                ];
        }
    }
    
    updateServiceStatus(data) {
        // Update service status indicator
        const statusElement = document.getElementById('service-status');
        if (statusElement) {
            statusElement.textContent = data.message;
            statusElement.className = `status-indicator status-${data.status}`;
        }
        
        // Update progress bar if exists
        const progressElement = document.getElementById('service-progress');
        if (progressElement && data.progress) {
            progressElement.style.width = `${data.progress}%`;
        }
        
        // Show in-app notification
        this.showInAppNotification(data);
    }
    
    showInAppNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(data.type)}
                </div>
                <div class="notification-text">
                    <div class="notification-title">${data.title || 'Update'}</div>
                    <div class="notification-message">${data.message}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(data.priority === 'high' ? [200, 100, 200] : [100]);
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            'technician-dispatched': '🚗',
            'technician-arriving': '📍',
            'service-started': '🔧',
            'service-complete': '✅',
            'payment-required': '💳',
            'feedback-request': '⭐',
            'default': '📢'
        };
        
        return icons[type] || icons.default;
    }
    
    handleLocationUpdate(position) {
        // Send location update if emergency is active
        const activeRequest = localStorage.getItem('active-emergency-request');
        if (activeRequest) {
            this.sendEmergencyLocationUpdate(activeRequest, position);
        }
    }
    
    storeSubscriptionLocally(subscription) {
        localStorage.setItem('push-subscription', JSON.stringify(subscription));
    }
    
    removeSubscriptionLocally() {
        localStorage.removeItem('push-subscription');
    }
    
    storeFailedRequest(type, data) {
        const failedRequests = JSON.parse(localStorage.getItem('failed-push-requests') || '[]');
        failedRequests.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
        localStorage.setItem('failed-push-requests', JSON.stringify(failedRequests));
    }
    
    async retryFailedRequests() {
        const failedRequests = JSON.parse(localStorage.getItem('failed-push-requests') || '[]');
        
        for (const request of failedRequests) {
            try {
                switch (request.type) {
                    case 'subscribe':
                        await this.sendSubscriptionToServer(request.data);
                        break;
                    case 'emergency-location':
                        await this.sendEmergencyLocationUpdate(
                            request.data.requestId,
                            { coords: request.data.location }
                        );
                        break;
                }
            } catch (error) {
                console.error('[Push] Retry failed for request:', request.type, error);
            }
        }
        
        // Clear failed requests
        localStorage.removeItem('failed-push-requests');
    }
    
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
    
    // Public API methods
    async enableNotifications() {
        const granted = await this.requestPermission();
        if (granted) {
            return await this.subscribe();
        }
        return false;
    }
    
    async disableNotifications() {
        return await this.unsubscribe();
    }
    
    isSubscribed() {
        return this.subscription !== null;
    }
    
    getSubscriptionStatus() {
        return {
            supported: this.isSupported(),
            permission: Notification.permission,
            subscribed: this.isSubscribed(),
            subscription: this.subscription
        };
    }
}

// Initialize push notifications
let tyreHeroPushNotifications;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroPushNotifications = new TyreHeroPushNotifications();
});

// Online event listener for retrying failed requests
window.addEventListener('online', () => {
    if (tyreHeroPushNotifications) {
        tyreHeroPushNotifications.retryFailedRequests();
    }
});

// Export for global access
window.tyreHeroPushNotifications = tyreHeroPushNotifications;

// Add CSS for in-app notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .in-app-notification {
        animation: slideDown 0.3s ease;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .notification-text {
        flex: 1;
    }
    
    .notification-title {
        font-weight: 600;
        color: #212121;
        margin-bottom: 4px;
    }
    
    .notification-message {
        color: #757575;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #757575;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        line-height: 1;
    }
    
    .notification-close:hover {
        background: #f0f0f0;
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(notificationStyles);