// TyreHero Emergency Battery Optimization - Critical for Emergency Scenarios

class TyreHeroEmergencyOptimization {
    constructor() {
        this.batteryManager = null;
        this.batteryLevel = 1;
        this.isCharging = false;
        this.emergencyMode = false;
        this.lowBatteryThreshold = 0.20; // 20%
        this.criticalBatteryThreshold = 0.10; // 10%
        this.performanceObserver = null;
        this.networkMonitor = null;
        
        this.init();
    }
    
    async init() {
        console.log('[Battery] Initializing emergency battery optimization');
        
        // Initialize battery monitoring
        await this.initializeBatteryMonitor();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup network optimization
        this.setupNetworkOptimization();
        
        // Initialize emergency features
        this.initializeEmergencyFeatures();
        
        // Setup power management
        this.setupPowerManagement();
        
        // Setup dark mode for battery saving
        this.setupBatterySavingModes();
        
        console.log('[Battery] Emergency optimization initialized');
    }
    
    async initializeBatteryMonitor() {
        if ('getBattery' in navigator) {
            try {
                this.batteryManager = await navigator.getBattery();
                
                this.batteryLevel = this.batteryManager.level;
                this.isCharging = this.batteryManager.charging;
                
                // Setup battery event listeners
                this.batteryManager.addEventListener('chargingchange', () => {
                    this.isCharging = this.batteryManager.charging;
                    this.handleBatteryChange();
                });
                
                this.batteryManager.addEventListener('levelchange', () => {
                    this.batteryLevel = this.batteryManager.level;
                    this.handleBatteryChange();
                });
                
                this.batteryManager.addEventListener('chargingtimechange', () => {
                    this.handleBatteryChange();
                });
                
                this.batteryManager.addEventListener('dischargingtimechange', () => {
                    this.handleBatteryChange();
                });
                
                // Initial battery check
                this.handleBatteryChange();
                
                console.log('[Battery] Battery API initialized');
            } catch (error) {
                console.log('[Battery] Battery API not available:', error);
                this.fallbackBatteryEstimation();
            }
        } else {
            console.log('[Battery] Battery API not supported');
            this.fallbackBatteryEstimation();
        }
    }
    
    fallbackBatteryEstimation() {
        // Estimate battery level based on performance and network conditions
        this.estimatedBatteryLevel = 0.5; // Default to 50%
        
        // Check for power saving indicators
        if (navigator.hardwareConcurrency <= 2) {
            this.estimatedBatteryLevel = 0.3; // Likely low power device
        }
        
        // Monitor connection quality as battery indicator
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.estimatedBatteryLevel = 0.2; // Poor network often indicates low battery
            }
        }
    }
    
    handleBatteryChange() {
        const previousEmergencyMode = this.emergencyMode;
        
        // Determine if emergency mode should be activated
        this.emergencyMode = this.batteryLevel <= this.criticalBatteryThreshold && !this.isCharging;
        
        // Show battery status
        this.updateBatteryIndicator();
        
        // Adjust optimizations based on battery level
        if (this.batteryLevel <= this.criticalBatteryThreshold) {
            this.activateCriticalBatteryMode();
        } else if (this.batteryLevel <= this.lowBatteryThreshold) {
            this.activateLowBatteryMode();
        } else {
            this.activateNormalMode();
        }
        
        // Emergency mode transition
        if (this.emergencyMode && !previousEmergencyMode) {
            this.enterEmergencyMode();
        } else if (!this.emergencyMode && previousEmergencyMode) {
            this.exitEmergencyMode();
        }
    }
    
    activateCriticalBatteryMode() {
        console.log('[Battery] Activating critical battery mode');
        
        // Disable all non-essential features
        this.disableAnimations();
        this.disableBackgroundProcesses();
        this.minimizeNetworkRequests();
        this.activateDarkMode();
        this.reduceScreenUpdates();
        this.disableLocationTracking();
        
        // Show critical battery warning
        this.showCriticalBatteryWarning();
        
        // Cache emergency data
        this.cacheEssentialEmergencyData();
    }
    
    activateLowBatteryMode() {
        console.log('[Battery] Activating low battery mode');
        
        // Reduce non-essential features
        this.reduceAnimations();
        this.optimizeImageLoading();
        this.reducePollFrequency();
        this.activateDarkMode();
        
        // Show low battery notification
        this.showLowBatteryNotification();
    }
    
    activateNormalMode() {
        console.log('[Battery] Normal battery mode active');
        
        // Restore normal functionality
        this.enableAnimations();
        this.restoreNormalImageLoading();
        this.restoreNormalPollFrequency();
        this.restoreNormalLocationTracking();
        
        // Hide battery warnings
        this.hideBatteryWarnings();
    }
    
    enterEmergencyMode() {
        console.log('[Battery] Entering emergency mode');
        
        // Show emergency mode UI
        this.showEmergencyModeInterface();
        
        // Disable all non-critical features
        this.disableNonCriticalFeatures();
        
        // Enable emergency-only functionality
        this.enableEmergencyOnlyFeatures();
        
        // Vibrate to alert user
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300, 100, 300]);
        }
    }
    
    exitEmergencyMode() {
        console.log('[Battery] Exiting emergency mode');
        
        // Hide emergency mode UI
        this.hideEmergencyModeInterface();
        
        // Restore normal features
        this.enableNormalFeatures();
    }
    
    disableAnimations() {
        // Add CSS to disable all animations
        let style = document.getElementById('battery-optimization-animations');
        if (!style) {
            style = document.createElement('style');
            style.id = 'battery-optimization-animations';
            document.head.appendChild(style);
        }
        
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0s !important;
                transform: none !important;
            }
            
            .preloader {
                display: none !important;
            }
            
            .emergency-float-btn {
                animation: none !important;
            }
        `;
    }
    
    reduceAnimations() {
        // Reduce animation duration but keep essential ones
        let style = document.getElementById('battery-optimization-reduced-animations');
        if (!style) {
            style = document.createElement('style');
            style.id = 'battery-optimization-reduced-animations';
            document.head.appendChild(style);
        }
        
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .emergency-float-btn {
                animation-duration: 1s !important;
            }
        `;
    }
    
    enableAnimations() {
        // Remove animation restrictions
        const styles = document.querySelectorAll('#battery-optimization-animations, #battery-optimization-reduced-animations');
        styles.forEach(style => style.remove());
    }
    
    disableBackgroundProcesses() {
        // Cancel all intervals and timeouts except critical ones
        this.cancelNonCriticalTimers();
        
        // Disable location tracking
        if (this.locationWatcher) {
            navigator.geolocation.clearWatch(this.locationWatcher);
        }
        
        // Pause non-essential service worker updates
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PAUSE_NON_CRITICAL_UPDATES'
            });
        }
    }
    
    minimizeNetworkRequests() {
        // Disable automatic data fetching
        this.networkOptimizationLevel = 'minimal';
        
        // Cancel pending non-critical requests
        this.cancelNonCriticalRequests();
        
        // Increase cache lifetime
        this.extendCacheLifetime();
    }
    
    activateDarkMode() {
        // Force dark mode for OLED battery savings
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('battery-dark-mode');
        
        // Add dark mode styles for battery optimization
        let style = document.getElementById('battery-dark-mode');
        if (!style) {
            style = document.createElement('style');
            style.id = 'battery-dark-mode';
            document.head.appendChild(style);
        }
        
        style.textContent = `
            .battery-dark-mode {
                background-color: #000000 !important;
                color: #FFFFFF !important;
            }
            
            .battery-dark-mode .emergency-form-container,
            .battery-dark-mode .service-card,
            .battery-dark-mode .testimonial-card {
                background-color: #111111 !important;
                color: #FFFFFF !important;
            }
            
            .battery-dark-mode .form-input,
            .battery-dark-mode .form-select,
            .battery-dark-mode .form-textarea {
                background-color: #222222 !important;
                color: #FFFFFF !important;
                border-color: #333333 !important;
            }
            
            .battery-dark-mode img {
                filter: brightness(0.8) !important;
            }
        `;
    }
    
    reduceScreenUpdates() {
        // Reduce DOM manipulation frequency
        this.screenUpdateInterval = 5000; // Update every 5 seconds instead of real-time
        
        // Pause non-essential visual updates
        clearInterval(this.visualUpdateTimer);
        this.visualUpdateTimer = setInterval(() => {
            this.updateCriticalUI();
        }, this.screenUpdateInterval);
    }
    
    disableLocationTracking() {
        // Disable continuous location tracking
        if (this.locationWatcher) {
            navigator.geolocation.clearWatch(this.locationWatcher);
            this.locationWatcher = null;
        }
        
        // Use cached location only
        this.useLocation = 'cached';
    }
    
    optimizeImageLoading() {
        // Disable image loading for non-critical images
        const images = document.querySelectorAll('img:not(.critical-image)');
        images.forEach(img => {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
                img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
            }
        });
    }
    
    restoreNormalImageLoading() {
        // Restore image loading
        const images = document.querySelectorAll('img[data-original-src]');
        images.forEach(img => {
            img.src = img.dataset.originalSrc;
            delete img.dataset.originalSrc;
        });
    }
    
    cacheEssentialEmergencyData() {
        // Cache only the most critical emergency data
        const essentialData = {
            emergencyNumber: '08001234567',
            location: this.getLastKnownLocation(),
            timestamp: Date.now(),
            batteryLevel: this.batteryLevel
        };
        
        localStorage.setItem('emergency-essential-data', JSON.stringify(essentialData));
    }
    
    showCriticalBatteryWarning() {
        let warning = document.getElementById('critical-battery-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'critical-battery-warning';
            warning.innerHTML = `
                <div class="critical-battery-content">
                    <div class="battery-icon">🔋</div>
                    <div class="battery-text">
                        <div class="battery-title">Critical Battery Level</div>
                        <div class="battery-message">Emergency features only. Charge your device immediately.</div>
                    </div>
                    <div class="battery-percentage">${Math.round(this.batteryLevel * 100)}%</div>
                </div>
            `;
            
            warning.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #D32F2F;
                color: white;
                z-index: 10003;
                padding: 12px 16px;
                animation: criticalPulse 1s infinite alternate;
            `;
            
            document.body.appendChild(warning);
        }
        
        warning.style.display = 'block';
    }
    
    showLowBatteryNotification() {
        let notification = document.getElementById('low-battery-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'low-battery-notification';
            notification.innerHTML = `
                <div class="low-battery-content">
                    <span class="battery-icon">🔋</span>
                    <span class="battery-text">Low battery - Power saving mode active</span>
                    <span class="battery-percentage">${Math.round(this.batteryLevel * 100)}%</span>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: #FF8F00;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                z-index: 9999;
                font-size: 0.875rem;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            document.body.appendChild(notification);
        }
        
        notification.style.display = 'flex';
    }
    
    hideBatteryWarnings() {
        const warnings = document.querySelectorAll('#critical-battery-warning, #low-battery-notification');
        warnings.forEach(warning => warning.style.display = 'none');
    }
    
    updateBatteryIndicator() {
        let indicator = document.getElementById('battery-level-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'battery-level-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 6px 10px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            document.body.appendChild(indicator);
        }
        
        const percentage = Math.round(this.batteryLevel * 100);
        const chargingIcon = this.isCharging ? '⚡' : '';
        const batteryIcon = this.getBatteryIcon(percentage);
        
        indicator.innerHTML = `${batteryIcon}${chargingIcon} ${percentage}%`;
        
        // Color coding
        if (percentage <= 10) {
            indicator.style.background = '#D32F2F';
        } else if (percentage <= 20) {
            indicator.style.background = '#FF8F00';
        } else {
            indicator.style.background = 'rgba(0, 0, 0, 0.8)';
        }
    }
    
    getBatteryIcon(percentage) {
        if (percentage <= 10) return '🔋'; // Empty
        if (percentage <= 25) return '🔋'; // Low
        if (percentage <= 50) return '🔋'; // Medium
        if (percentage <= 75) return '🔋'; // High
        return '🔋'; // Full
    }
    
    showEmergencyModeInterface() {
        let emergencyUI = document.getElementById('emergency-mode-ui');
        if (!emergencyUI) {
            emergencyUI = document.createElement('div');
            emergencyUI.id = 'emergency-mode-ui';
            emergencyUI.innerHTML = `
                <div class="emergency-mode-content">
                    <div class="emergency-mode-header">
                        <h2>🚨 Emergency Mode Active</h2>
                        <p>Critical battery level - Only essential features available</p>
                    </div>
                    
                    <div class="emergency-actions">
                        <a href="tel:08001234567" class="emergency-call-large">
                            📞 Emergency Call
                        </a>
                        
                        <button onclick="tyreHeroEmergencyOptimization.shareLocation()" class="emergency-location">
                            📍 Share Location
                        </button>
                        
                        <button onclick="tyreHeroEmergencyOptimization.sendEmergencyMessage()" class="emergency-message">
                            💬 Send Emergency Info
                        </button>
                    </div>
                    
                    <div class="battery-tips">
                        <h3>Extend Battery Life:</h3>
                        <ul>
                            <li>Close other apps</li>
                            <li>Enable airplane mode after call</li>
                            <li>Reduce screen brightness</li>
                            <li>Find a charger immediately</li>
                        </ul>
                    </div>
                </div>
            `;
            
            emergencyUI.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #000000;
                color: #FFFFFF;
                z-index: 10004;
                padding: 20px;
                overflow-y: auto;
            `;
            
            document.body.appendChild(emergencyUI);
        }
        
        emergencyUI.style.display = 'block';
    }
    
    hideEmergencyModeInterface() {
        const emergencyUI = document.getElementById('emergency-mode-ui');
        if (emergencyUI) {
            emergencyUI.style.display = 'none';
        }
    }
    
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure' && entry.duration > 100) {
                        console.warn('[Battery] Slow operation detected:', entry.name, entry.duration);
                        this.optimizeSlowOperation(entry);
                    }
                }
            });
            
            this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }
    
    setupNetworkOptimization() {
        if ('connection' in navigator) {
            this.networkMonitor = navigator.connection;
            
            this.networkMonitor.addEventListener('change', () => {
                this.optimizeForConnection();
            });
            
            // Initial optimization
            this.optimizeForConnection();
        }
    }
    
    optimizeForConnection() {
        if (!this.networkMonitor) return;
        
        const connection = this.networkMonitor;
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // Very slow connection - minimal data usage
            this.setNetworkOptimization('minimal');
        } else if (connection.effectiveType === '3g') {
            // Moderate connection - reduced data usage
            this.setNetworkOptimization('reduced');
        } else {
            // Fast connection - normal usage
            this.setNetworkOptimization('normal');
        }
    }
    
    setNetworkOptimization(level) {
        this.networkOptimizationLevel = level;
        
        switch (level) {
            case 'minimal':
                this.disableImageLoading();
                this.reducePollFrequency(10000); // 10 seconds
                break;
            case 'reduced':
                this.optimizeImageLoading();
                this.reducePollFrequency(5000); // 5 seconds
                break;
            case 'normal':
                this.restoreNormalImageLoading();
                this.restoreNormalPollFrequency();
                break;
        }
    }
    
    initializeEmergencyFeatures() {
        // Add emergency gesture detection
        this.setupEmergencyGestures();
        
        // Add voice activation for emergency
        this.setupVoiceEmergencyActivation();
        
        // Setup emergency contacts quick access
        this.setupEmergencyContactsAccess();
    }
    
    setupPowerManagement() {
        // Monitor device orientation changes for power optimization
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.optimizeForOrientation();
            }, 500);
        });
        
        // Monitor visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.enterBackgroundMode();
            } else {
                this.exitBackgroundMode();
            }
        });
    }
    
    setupBatterySavingModes() {
        // Auto-enable dark mode based on battery level
        if (this.batteryLevel < this.lowBatteryThreshold) {
            this.activateDarkMode();
        }
        
        // Reduce screen refresh rate if possible
        this.optimizeRefreshRate();
    }
    
    enterBackgroundMode() {
        console.log('[Battery] Entering background mode');
        
        // Reduce all background activity
        this.pauseNonCriticalProcesses();
        this.reduceUpdateFrequency();
    }
    
    exitBackgroundMode() {
        console.log('[Battery] Exiting background mode');
        
        // Resume normal activity if battery allows
        if (this.batteryLevel > this.criticalBatteryThreshold) {
            this.resumeNormalProcesses();
        }
    }
    
    // Emergency-specific methods
    async shareLocation() {
        try {
            const position = await this.getCurrentLocation();
            const locationText = `Emergency location: https://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            
            if (navigator.share) {
                await navigator.share({
                    title: 'Emergency Location',
                    text: locationText
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(locationText);
                this.showNotification('Location copied to clipboard');
            }
        } catch (error) {
            console.error('[Battery] Error sharing location:', error);
            this.showNotification('Could not share location');
        }
    }
    
    async sendEmergencyMessage() {
        const emergencyData = {
            type: 'emergency',
            timestamp: new Date().toISOString(),
            batteryLevel: Math.round(this.batteryLevel * 100),
            location: await this.getCurrentLocation().catch(() => null),
            userAgent: navigator.userAgent
        };
        
        const message = `Emergency: TyreHero assistance needed. Battery: ${emergencyData.batteryLevel}%. Time: ${new Date().toLocaleString()}`;
        
        if (navigator.share) {
            await navigator.share({
                title: 'Emergency Assistance Needed',
                text: message
            });
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(message);
            this.showNotification('Emergency message copied to clipboard');
        }
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    }
    
    getLastKnownLocation() {
        try {
            const cached = localStorage.getItem('last-known-location');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            return null;
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Utility methods
    cancelNonCriticalTimers() {
        // This would cancel specific timers identified as non-critical
        // Implementation would depend on the specific timers used in the app
    }
    
    cancelNonCriticalRequests() {
        // Cancel pending requests that are not emergency-related
        // Implementation would depend on the specific requests used in the app
    }
    
    extendCacheLifetime() {
        // Extend cache lifetime to reduce network requests
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'EXTEND_CACHE_LIFETIME',
                payload: { multiplier: 5 }
            });
        }
    }
    
    disableNonCriticalFeatures() {
        // Disable features not essential for emergency scenarios
        document.querySelectorAll('.non-critical').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    enableEmergencyOnlyFeatures() {
        // Show only emergency-related UI elements
        document.querySelectorAll('.emergency-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    enableNormalFeatures() {
        // Restore normal UI
        document.querySelectorAll('.non-critical').forEach(el => {
            el.style.display = '';
        });
        
        document.querySelectorAll('.emergency-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Public API
    getBatteryStatus() {
        return {
            level: this.batteryLevel,
            charging: this.isCharging,
            emergencyMode: this.emergencyMode,
            optimizationLevel: this.getOptimizationLevel()
        };
    }
    
    getOptimizationLevel() {
        if (this.batteryLevel <= this.criticalBatteryThreshold) {
            return 'critical';
        } else if (this.batteryLevel <= this.lowBatteryThreshold) {
            return 'low';
        } else {
            return 'normal';
        }
    }
    
    forceEmergencyMode() {
        this.emergencyMode = true;
        this.enterEmergencyMode();
    }
    
    exitForcedEmergencyMode() {
        this.emergencyMode = false;
        this.exitEmergencyMode();
    }
}

// Initialize emergency optimization
let tyreHeroEmergencyOptimization;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroEmergencyOptimization = new TyreHeroEmergencyOptimization();
});

// Export for global access
window.tyreHeroEmergencyOptimization = tyreHeroEmergencyOptimization;

// Add CSS for emergency battery optimization
const emergencyOptimizationStyles = document.createElement('style');
emergencyOptimizationStyles.textContent = `
    .critical-battery-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .battery-icon {
        font-size: 24px;
    }
    
    .battery-text {
        flex: 1;
    }
    
    .battery-title {
        font-weight: 600;
        font-size: 1rem;
        line-height: 1.2;
    }
    
    .battery-message {
        font-size: 0.875rem;
        opacity: 0.9;
        line-height: 1.2;
    }
    
    .battery-percentage {
        font-weight: 700;
        font-size: 1.1rem;
    }
    
    .low-battery-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .emergency-mode-content {
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
    }
    
    .emergency-mode-header h2 {
        color: #FF6B6B;
        margin-bottom: 8px;
        font-size: 1.5rem;
    }
    
    .emergency-mode-header p {
        color: #CCCCCC;
        margin-bottom: 32px;
    }
    
    .emergency-actions {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;
    }
    
    .emergency-call-large,
    .emergency-location,
    .emergency-message {
        background: #E53935;
        color: white;
        padding: 16px 24px;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: background 0.2s ease;
    }
    
    .emergency-call-large:hover,
    .emergency-location:hover,
    .emergency-message:hover {
        background: #C62828;
    }
    
    .battery-tips {
        text-align: left;
        background: #111111;
        padding: 20px;
        border-radius: 12px;
    }
    
    .battery-tips h3 {
        color: #FFCC00;
        margin-bottom: 12px;
        font-size: 1.1rem;
    }
    
    .battery-tips ul {
        list-style: none;
        padding: 0;
    }
    
    .battery-tips li {
        padding: 4px 0;
        color: #CCCCCC;
        font-size: 0.9rem;
    }
    
    .battery-tips li::before {
        content: "⚡ ";
        color: #FFCC00;
    }
    
    @keyframes criticalPulse {
        0% { background: #D32F2F; }
        100% { background: #F44336; }
    }
    
    @media (max-width: 768px) {
        .emergency-mode-content {
            padding: 16px;
        }
        
        .emergency-actions {
            gap: 12px;
        }
        
        .emergency-call-large,
        .emergency-location,
        .emergency-message {
            padding: 14px 20px;
            font-size: 1rem;
        }
    }
`;

document.head.appendChild(emergencyOptimizationStyles);