/**
 * TyreHero Emergency Scripts - Optimized for Performance
 * Critical emergency functionality with offline support
 */

// Performance optimized initialization
(function() {
    'use strict';
    
    // Emergency configuration
    const EMERGENCY_CONFIG = {
        phone: '08001234567',
        maxLocationAge: 300000, // 5 minutes
        locationTimeout: 10000, // 10 seconds
        emergencyApiEndpoint: '/api/emergency-request',
        retryAttempts: 3,
        retryDelay: 1000
    };
    
    // Initialize emergency features when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmergencyFeatures);
    } else {
        initEmergencyFeatures();
    }
    
    function initEmergencyFeatures() {
        initPreloader();
        initMobileMenu();
        initStickyHeader();
        initEmergencyForm();
        initLocationTracking();
        initOfflineDetection();
        initPerformanceTracking();
        initEmergencyNotifications();
        
        console.log('TyreHero Emergency features initialized');
    }
    
    /**
     * Preloader with optimized animations
     */
    function initPreloader() {
        const preloader = document.querySelector('.preloader');
        
        if (preloader) {
            // Preloader timeout for emergency scenarios (faster)
            setTimeout(() => {
                preloader.classList.add('fade-out');
                
                setTimeout(() => {
                    preloader.style.display = 'none';
                    // Trigger emergency button animation after preloader
                    animateEmergencyButton();
                }, 300); // Reduced from 500ms
            }, 800); // Reduced from 1000ms for emergency urgency
        }
    }
    
    /**
     * Emergency button animation to draw attention
     */
    function animateEmergencyButton() {
        const emergencyButton = document.querySelector('.emergency-call-fixed');
        if (emergencyButton) {
            // Add extra emphasis for emergency scenarios
            emergencyButton.style.animation = 'pulse-glow 1.5s infinite, bounce 3s ease-in-out 2';
        }
    }
    
    /**
     * Mobile menu with emergency prioritization
     */
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                this.classList.toggle('menu-open');
                navMenu.classList.toggle('menu-open');
                document.body.classList.toggle('menu-open');
                
                // Ensure emergency button remains accessible
                const emergencyButton = document.querySelector('.emergency-call-fixed');
                if (emergencyButton) {
                    emergencyButton.style.zIndex = '10001';
                }
                
                // Accessibility
                const isExpanded = this.classList.contains('menu-open');
                this.setAttribute('aria-expanded', isExpanded);
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && menuToggle.classList.contains('menu-open')) {
                    menuToggle.click();
                }
            });
        }
    }
    
    /**
     * Sticky header with performance optimization
     */
    function initStickyHeader() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        function updateHeader() {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide header when scrolling down, show when scrolling up
            if (scrollY > lastScrollY && scrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }
    
    /**
     * Emergency form with offline support
     */
    function initEmergencyForm() {
        const form = document.getElementById('emergencyForm');
        if (!form) return;
        
        // Auto-populate location if available
        const savedLocation = localStorage.getItem('emergencyLocation');
        if (savedLocation) {
            try {
                const location = JSON.parse(savedLocation);
                const locationField = document.getElementById('location');
                if (locationField && !locationField.value) {
                    locationField.value = `Detected location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
                }
            } catch (e) {
                console.warn('Invalid saved location data');
            }
        }
        
        // Form validation with emergency focus
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', function() {
                clearTimeout(this.validationTimeout);
                this.validationTimeout = setTimeout(() => validateField.call(this), 500);
            });
        });
        
        function validateField() {
            const field = this;
            const value = field.value.trim();
            
            // Remove existing error styling
            field.classList.remove('error');
            
            if (field.hasAttribute('required') && !value) {
                field.classList.add('error');
                return false;
            }
            
            // Phone number validation
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
                if (!phoneRegex.test(value)) {
                    field.classList.add('error');
                    return false;
                }
            }
            
            return true;
        }
        
        // Emergency form submission with retry logic
        form.addEventListener('submit', handleEmergencySubmission);
    }
    
    /**
     * Handle emergency form submission with offline support
     */
    async function handleEmergencySubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Disable form during submission
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        try {
            const formData = new FormData(form);
            const emergencyData = Object.fromEntries(formData.entries());
            
            // Add metadata
            emergencyData.timestamp = new Date().toISOString();
            emergencyData.requestId = generateRequestId();
            emergencyData.userAgent = navigator.userAgent;
            emergencyData.priority = 'emergency';
            
            // Add location data if available
            const locationData = await getCurrentLocation();
            if (locationData) {
                emergencyData.coordinates = locationData;
            }
            
            // Attempt submission
            const success = await submitEmergencyRequest(emergencyData);
            
            if (success) {
                showSuccessMessage(emergencyData.name);
                trackEvent('emergency_form_submitted', { online: navigator.onLine });
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Emergency submission error:', error);
            showErrorMessage();
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
    
    /**
     * Submit emergency request with retry logic
     */
    async function submitEmergencyRequest(data, retryCount = 0) {
        try {
            const response = await fetch(EMERGENCY_CONFIG.emergencyApiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emergency-Request': 'true'
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(15000) // 15 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn(`Submission attempt ${retryCount + 1} failed:`, error);
            
            // Retry logic for network errors
            if (retryCount < EMERGENCY_CONFIG.retryAttempts && 
                (error.name === 'NetworkError' || error.name === 'TimeoutError')) {
                
                await new Promise(resolve => 
                    setTimeout(resolve, EMERGENCY_CONFIG.retryDelay * (retryCount + 1))
                );
                
                return submitEmergencyRequest(data, retryCount + 1);
            }
            
            // Store for offline sync if all retries failed
            await storeOfflineRequest(data);
            throw error;
        }
    }
    
    /**
     * Store emergency request for offline sync
     */
    async function storeOfflineRequest(data) {
        try {
            const offlineRequests = JSON.parse(localStorage.getItem('offlineEmergencyRequests') || '[]');
            offlineRequests.push({
                ...data,
                storedAt: Date.now(),
                synced: false
            });
            
            localStorage.setItem('offlineEmergencyRequests', JSON.stringify(offlineRequests));
            
            // Register background sync if available
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('emergency-form-sync');
            }
            
            console.log('Emergency request stored for offline sync');
            
        } catch (error) {
            console.error('Failed to store offline request:', error);
        }
    }
    
    /**
     * Location tracking with emergency optimization
     */
    function initLocationTracking() {
        // Aggressive location acquisition for emergency scenarios
        if (navigator.geolocation) {
            // High accuracy location for emergencies
            navigator.geolocation.getCurrentPosition(
                saveEmergencyLocation,
                handleLocationError,
                {
                    enableHighAccuracy: true,
                    timeout: EMERGENCY_CONFIG.locationTimeout,
                    maximumAge: EMERGENCY_CONFIG.maxLocationAge
                }
            );
            
            // Watch location changes for emergency scenarios
            if (isEmergencyPage()) {
                const watchId = navigator.geolocation.watchPosition(
                    saveEmergencyLocation,
                    handleLocationError,
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 60000 // 1 minute for watch
                    }
                );
                
                // Store watch ID for cleanup
                window.emergencyLocationWatchId = watchId;
            }
        }
    }
    
    function saveEmergencyLocation(position) {
        const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            source: 'gps'
        };
        
        localStorage.setItem('emergencyLocation', JSON.stringify(locationData));
        
        // Update location field if present
        const locationField = document.getElementById('location');
        if (locationField && !locationField.value) {
            locationField.value = `Current location (±${Math.round(position.coords.accuracy)}m)`;
        }
        
        console.log('Emergency location saved:', locationData);
    }
    
    function handleLocationError(error) {
        console.warn('Location error:', error.message);
        
        // Fallback to IP-based location
        if (error.code === error.PERMISSION_DENIED) {
            console.log('GPS denied, attempting IP-based location...');
            // In production, you'd call an IP geolocation service here
        }
    }
    
    /**
     * Get current location with promise
     */
    function getCurrentLocation() {
        return new Promise((resolve) => {
            // Check cached location first
            const cached = localStorage.getItem('emergencyLocation');
            if (cached) {
                try {
                    const location = JSON.parse(cached);
                    if (Date.now() - location.timestamp < EMERGENCY_CONFIG.maxLocationAge) {
                        resolve(location);
                        return;
                    }
                } catch (e) {
                    console.warn('Invalid cached location');
                }
            }
            
            // Get fresh location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const locationData = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: Date.now(),
                            source: 'gps'
                        };
                        saveEmergencyLocation(position);
                        resolve(locationData);
                    },
                    () => resolve(null),
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 60000
                    }
                );
            } else {
                resolve(null);
            }
        });
    }
    
    /**
     * Offline detection and handling
     */
    function initOfflineDetection() {
        const indicator = document.getElementById('offline-indicator');
        
        function updateOnlineStatus() {
            if (navigator.onLine) {
                if (indicator) indicator.style.display = 'none';
                syncOfflineRequests();
                console.log('Back online - syncing offline requests');
            } else {
                if (indicator) {
                    indicator.style.display = 'block';
                    indicator.textContent = '⚠️ Offline: Emergency call still available at ' + EMERGENCY_CONFIG.phone;
                }
                console.log('Gone offline - emergency features still available');
            }
        }
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial check
        updateOnlineStatus();
    }
    
    /**
     * Sync offline emergency requests
     */
    async function syncOfflineRequests() {
        try {
            const offlineRequests = JSON.parse(localStorage.getItem('offlineEmergencyRequests') || '[]');
            const unsynced = offlineRequests.filter(req => !req.synced);
            
            for (const request of unsynced) {
                try {
                    await submitEmergencyRequest(request);
                    request.synced = true;
                    console.log('Synced offline request:', request.requestId);
                } catch (error) {
                    console.warn('Failed to sync request:', request.requestId, error);
                }
            }
            
            // Update storage
            localStorage.setItem('offlineEmergencyRequests', JSON.stringify(offlineRequests));
            
            // Clean up old synced requests (older than 24 hours)
            const cutoff = Date.now() - (24 * 60 * 60 * 1000);
            const cleaned = offlineRequests.filter(req => 
                !req.synced || req.storedAt > cutoff
            );
            
            if (cleaned.length !== offlineRequests.length) {
                localStorage.setItem('offlineEmergencyRequests', JSON.stringify(cleaned));
            }
            
        } catch (error) {
            console.error('Failed to sync offline requests:', error);
        }
    }
    
    /**
     * Performance tracking for emergency scenarios
     */
    function initPerformanceTracking() {
        // Track emergency page load performance
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (typeof performance !== 'undefined' && performance.timing) {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                    
                    console.log('Emergency page performance:', {
                        loadTime: loadTime + 'ms',
                        domReady: domReady + 'ms',
                        emergency: isEmergencyPage()
                    });
                    
                    // Track slow loads for emergency pages
                    if (isEmergencyPage() && loadTime > 3000) {
                        trackEvent('slow_emergency_load', { 
                            loadTime: loadTime,
                            connection: navigator.connection?.effectiveType || 'unknown'
                        });
                    }
                }
            }, 100);
        });
    }
    
    /**
     * Emergency notifications
     */
    function initEmergencyNotifications() {
        // Request notification permission for emergency updates
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }
    
    /**
     * Utility functions
     */
    function generateRequestId() {
        return 'emr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    function isEmergencyPage() {
        return window.location.pathname.includes('emergency') || 
               window.location.pathname === '/' ||
               document.body.classList.contains('emergency-page');
    }
    
    function trackEvent(eventName, params = {}) {
        // Console logging for demo (replace with actual analytics)
        console.log('Track event:', eventName, params);
        
        // Google Analytics 4 example
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Emergency',
                emergency_page: isEmergencyPage(),
                online_status: navigator.onLine,
                ...params
            });
        }
    }
    
    function showSuccessMessage(name) {
        const form = document.getElementById('emergencyForm');
        if (form) {
            form.innerHTML = `
                <div class="success-message" style="text-align: center; padding: 2rem; background: #E8F5E8; border: 2px solid #4CAF50; border-radius: 12px;">
                    <div style="font-size: 4rem; color: #4CAF50; margin-bottom: 1rem;">✅</div>
                    <h3 style="color: #2E7D32; margin-bottom: 1rem;">Emergency Request Submitted Successfully</h3>
                    <p><strong>Thank you, ${name}!</strong></p>
                    <p>Your emergency request has been received and a technician is being dispatched to your location.</p>
                    <p>You will receive a confirmation text message with the estimated arrival time.</p>
                    <div style="margin: 1.5rem 0; padding: 1rem; background: #FFF; border-radius: 8px; border: 1px solid #E0E0E0;">
                        <p><strong>For immediate assistance:</strong></p>
                        <a href="tel:${EMERGENCY_CONFIG.phone}" class="btn btn-primary btn-lg" style="margin: 0.5rem;">
                            📞 ${EMERGENCY_CONFIG.phone}
                        </a>
                    </div>
                    <p style="font-size: 0.9rem; color: #666;">Request ID: <span id="requestId"></span></p>
                </div>
            `;
            
            // Add request ID
            document.getElementById('requestId').textContent = generateRequestId();
        }
    }
    
    function showErrorMessage() {
        const form = document.getElementById('emergencyForm');
        if (form) {
            const existingError = form.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <div style="background: #FFEBEE; border: 2px solid #F44336; border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
                    <div style="font-size: 2rem; color: #F44336; margin-bottom: 0.5rem;">⚠️</div>
                    <p><strong>Unable to submit request</strong></p>
                    <p>Please call our emergency line directly:</p>
                    <a href="tel:${EMERGENCY_CONFIG.phone}" class="btn btn-primary btn-lg" style="margin: 0.5rem;">
                        📞 ${EMERGENCY_CONFIG.phone}
                    </a>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                        ${navigator.onLine ? 'Server temporarily unavailable' : 'Your request has been saved and will be sent when you\'re back online'}
                    </p>
                </div>
            `;
            
            form.appendChild(errorDiv);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 10000);
        }
    }
    
    // Global functions for HTML onclick handlers
    window.trackEmergencyCall = function() {
        trackEvent('emergency_call_clicked', {
            source: 'button',
            timestamp: Date.now()
        });
    };
    
    window.requestLocation = function() {
        const button = event.target;
        const originalText = button.textContent;
        
        button.disabled = true;
        button.textContent = '📍 Getting location...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                saveEmergencyLocation(position);
                button.textContent = '✅ Location found';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 2000);
                
                trackEvent('location_acquired', {
                    accuracy: position.coords.accuracy,
                    source: 'manual_request'
                });
            },
            function(error) {
                button.textContent = '❌ Location failed';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 2000);
                
                alert('Unable to get your location. Please enter it manually or check your location permissions.');
                trackEvent('location_failed', {
                    error: error.message,
                    code: error.code
                });
            },
            {
                enableHighAccuracy: true,
                timeout: EMERGENCY_CONFIG.locationTimeout,
                maximumAge: 5000
            }
        );
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (window.emergencyLocationWatchId) {
            navigator.geolocation.clearWatch(window.emergencyLocationWatchId);
        }
    });
    
})();