/**
 * Mobile Emergency UX Patterns for Tyre Service
 * Research-backed patterns for stressed users in emergency situations
 *
 * Based on emergency psychology research and mobile UX best practices
 * Designed specifically for roadside emergency scenarios
 */

class MobileEmergencyUX {
    constructor(options = {}) {
        this.options = {
            maxCognitiveBurden: 3, // Maximum choices to show at once
            emergencyTimeoutMs: 30000, // 30s to complete primary action
            panicModeThreshold: 10000, // 10s of inactivity = panic mode
            helpTextDelayMs: 5000, // Show help after 5s
            locationAccuracy: 'high', // GPS accuracy for emergency services
            ...options
        };

        this.userState = {
            isPanicking: false,
            interactionCount: 0,
            timeOnPage: 0,
            hasCalledEmergency: false,
            locationShared: false,
            lastInteraction: Date.now()
        };

        this.deviceCapabilities = {
            hasGPS: 'geolocation' in navigator,
            hasVibration: 'vibrate' in navigator,
            hasShare: 'share' in navigator,
            hasClipboard: 'clipboard' in navigator,
            hasBattery: 'getBattery' in navigator,
            hasNotifications: 'Notification' in window
        };

        this.emergencyPatterns = new Map();
        this.init();
    }

    init() {
        this.detectUserStressLevel();
        this.setupEmergencyPatterns();
        this.implementProgressiveDisclosure();
        this.setupPanicModeDetection();
        this.optimizeForOneHandedUse();
        this.setupAccessibilityEnhancements();
        this.implementEmergencyShortcuts();
        this.setupContextualHelp();
        this.monitorUserBehavior();
    }

    setupEmergencyPatterns() {
        // Pattern 1: Single Primary Action (F-Pattern optimization)
        this.emergencyPatterns.set('primaryAction', {
            name: 'Dominant Emergency Call Button',
            implementation: () => {
                const callButton = document.querySelector('.emergency-call-btn, .mega-call-button, [href^="tel:"]');
                if (callButton) {
                    // Make it MASSIVE (30% of screen height minimum)
                    const screenHeight = window.innerHeight;
                    const buttonHeight = Math.max(screenHeight * 0.3, 120);

                    callButton.style.cssText += `
                        height: ${buttonHeight}px !important;
                        width: 90% !important;
                        max-width: 400px !important;
                        margin: 20px auto !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: clamp(20px, 5vw, 32px) !important;
                        font-weight: 800 !important;
                        border-radius: 16px !important;
                        box-shadow: 0 8px 32px rgba(220, 38, 38, 0.4) !important;
                        transform: translateZ(0) !important;
                        position: relative !important;
                        z-index: 99999 !important;
                    `;

                    // Add pulsing animation for attention
                    if (!this.userState.hasCalledEmergency) {
                        callButton.style.animation = 'emergencyPulse 2s infinite';
                    }

                    // Add haptic feedback on touch
                    this.addHapticFeedback(callButton);
                }
            }
        });

        // Pattern 2: Stress-Reducing Visual Hierarchy
        this.emergencyPatterns.set('visualHierarchy', {
            name: 'Cognitive Load Reduction',
            implementation: () => {
                // Hide non-essential elements initially
                const nonEssential = document.querySelectorAll(
                    '.footer, .header-nav, .sidebar, .testimonials, .about, .services-grid'
                );

                nonEssential.forEach(element => {
                    element.style.display = 'none';
                    element.setAttribute('data-hidden-for-emergency', 'true');
                });

                // Show only critical information
                this.showCriticalInfoOnly();
            }
        });

        // Pattern 3: Progressive Task Completion
        this.emergencyPatterns.set('progressiveTasks', {
            name: 'Stepped Emergency Process',
            implementation: () => {
                this.createEmergencyWizard();
            }
        });

        // Pattern 4: Contextual Location Awareness
        this.emergencyPatterns.set('locationContext', {
            name: 'Smart Location Services',
            implementation: () => {
                this.implementIntelligentLocationSharing();
            }
        });

        // Pattern 5: Panic Mode Adaptation
        this.emergencyPatterns.set('panicMode', {
            name: 'Emergency Behavior Adaptation',
            implementation: () => {
                this.setupPanicModeUI();
            }
        });

        // Activate all patterns
        this.emergencyPatterns.forEach(pattern => pattern.implementation());
    }

    showCriticalInfoOnly() {
        // Create a critical info container if it doesn't exist
        let criticalContainer = document.querySelector('.emergency-critical-info');
        if (!criticalContainer) {
            criticalContainer = document.createElement('div');
            criticalContainer.className = 'emergency-critical-info';
            criticalContainer.innerHTML = `
                <div class="emergency-status">
                    <div class="status-indicator">
                        <span class="status-dot"></span>
                        <span class="status-text">EMERGENCY SERVICE AVAILABLE</span>
                    </div>
                    <div class="response-time">45-60 minute response time</div>
                </div>

                <div class="location-confirmation">
                    <span class="location-icon">📍</span>
                    <span class="location-text" id="detectedLocation">Detecting your location...</span>
                </div>
            `;

            // Insert at the top of the page
            document.body.insertBefore(criticalContainer, document.body.firstChild);
        }

        // Auto-detect and display location
        this.updateLocationDisplay();

        // Style the critical container
        this.styleCriticalContainer(criticalContainer);
    }

    styleCriticalContainer(container) {
        container.style.cssText = `
            position: fixed;
            top: env(safe-area-inset-top, 20px);
            left: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            z-index: 99998;
            font-size: 16px;
            line-height: 1.4;
            border: 2px solid #16A34A;
        `;

        // Status indicator styles
        const statusDot = container.querySelector('.status-dot');
        if (statusDot) {
            statusDot.style.cssText = `
                display: inline-block;
                width: 12px;
                height: 12px;
                background: #16A34A;
                border-radius: 50%;
                margin-right: 8px;
                animation: statusPulse 2s infinite;
            `;
        }
    }

    createEmergencyWizard() {
        // Simple 3-step wizard for panicked users
        const wizard = document.createElement('div');
        wizard.className = 'emergency-wizard';
        wizard.innerHTML = `
            <div class="wizard-step active" data-step="1">
                <h2>Step 1: You're Safe</h2>
                <p>Move away from traffic to a safe location</p>
                <button class="wizard-next">I'm in a safe place ✓</button>
            </div>

            <div class="wizard-step" data-step="2">
                <h2>Step 2: Call for Help</h2>
                <p>Tap the big red button to call emergency tyre service</p>
                <div class="wizard-call-container">
                    <!-- Call button will be moved here -->
                </div>
                <button class="wizard-next">I've called ✓</button>
            </div>

            <div class="wizard-step" data-step="3">
                <h2>Step 3: Share Location</h2>
                <p>Help us find you quickly</p>
                <button class="wizard-location">📍 Share My Location</button>
                <button class="wizard-complete">Help is on the way ✓</button>
            </div>
        `;

        // Only show wizard if user seems confused (multiple clicks without action)
        if (this.userState.interactionCount > 5 && !this.userState.hasCalledEmergency) {
            document.body.appendChild(wizard);
            this.styleEmergencyWizard(wizard);
            this.setupWizardBehavior(wizard);
        }
    }

    setupWizardBehavior(wizard) {
        const steps = wizard.querySelectorAll('.wizard-step');
        let currentStep = 1;

        // Next button behavior
        wizard.addEventListener('click', (e) => {
            if (e.target.classList.contains('wizard-next')) {
                if (currentStep < 3) {
                    steps[currentStep - 1].classList.remove('active');
                    currentStep++;
                    steps[currentStep - 1].classList.add('active');
                }
            }

            if (e.target.classList.contains('wizard-location')) {
                this.shareLocationWithVibration();
            }

            if (e.target.classList.contains('wizard-complete')) {
                wizard.style.transform = 'translateY(-100%)';
                setTimeout(() => wizard.remove(), 300);
            }
        });
    }

    implementIntelligentLocationSharing() {
        if (!this.deviceCapabilities.hasGPS) return;

        // Auto-attempt location detection on page load
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.updateLocationDisplay(position);
                this.enhanceLocationServices(position);
            },
            (error) => {
                this.handleLocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    updateLocationDisplay(position = null) {
        const locationText = document.getElementById('detectedLocation');
        if (!locationText) return;

        if (position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);

            // Reverse geocoding for user-friendly location
            this.reverseGeocode(lat, lng)
                .then(address => {
                    locationText.textContent = address || `${lat}, ${lng}`;
                    locationText.style.color = '#16A34A';
                })
                .catch(() => {
                    locationText.textContent = `${lat}, ${lng}`;
                    locationText.style.color = '#16A34A';
                });

            this.userState.locationShared = true;
        } else {
            locationText.textContent = 'Tap to share location manually';
            locationText.style.color = '#F59E0B';
            locationText.style.cursor = 'pointer';
            locationText.onclick = () => this.shareLocationWithVibration();
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            // Using a free geocoding service (you might want to use Google Maps API in production)
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            const data = await response.json();
            return data.locality || data.city || data.principalSubdivision || 'Location detected';
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            return null;
        }
    }

    shareLocationWithVibration() {
        // Provide feedback that location sharing is happening
        if (this.deviceCapabilities.hasVibration) {
            navigator.vibrate([100, 50, 100]); // Short-short-short pattern
        }

        if (!this.deviceCapabilities.hasGPS) {
            this.fallbackLocationSharing();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                const locationText = `Emergency Location: ${lat}, ${lng}`;
                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

                // Try native sharing first
                if (this.deviceCapabilities.hasShare) {
                    navigator.share({
                        title: 'Emergency Tyre Service - My Location',
                        text: locationText,
                        url: mapsUrl
                    }).catch(() => {
                        this.copyLocationToClipboard(locationText, mapsUrl);
                    });
                } else {
                    this.copyLocationToClipboard(locationText, mapsUrl);
                }

                // Success feedback
                this.showLocationSharedFeedback();
            },
            (error) => {
                this.handleLocationError(error);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }

    copyLocationToClipboard(locationText, mapsUrl) {
        if (this.deviceCapabilities.hasClipboard) {
            navigator.clipboard.writeText(`${locationText}\n${mapsUrl}`)
                .then(() => {
                    this.showToast('Location copied! Paste it when calling for help.', 'success');
                })
                .catch(() => {
                    this.fallbackLocationSharing();
                });
        } else {
            this.fallbackLocationSharing();
        }
    }

    fallbackLocationSharing() {
        // Manual location input for devices without GPS
        const manualLocation = prompt(
            'GPS not available. Please describe your location:\n' +
            '(e.g., "M4 motorway, junction 6, eastbound")'
        );

        if (manualLocation) {
            this.showToast('Location noted! Tell this to the emergency service when you call.', 'info');
        }
    }

    setupPanicModeDetection() {
        let inactivityTimer;

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            this.userState.lastInteraction = Date.now();

            inactivityTimer = setTimeout(() => {
                if (!this.userState.hasCalledEmergency) {
                    this.enterPanicMode();
                }
            }, this.options.panicModeThreshold);
        };

        // Monitor user activity
        ['click', 'touch', 'scroll', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, resetInactivityTimer, { passive: true });
        });

        resetInactivityTimer();
    }

    enterPanicMode() {
        this.userState.isPanicking = true;
        document.body.classList.add('panic-mode');

        // Simplify UI even further
        this.activatePanicModeUI();

        // Show calming message
        this.showCalmingMessage();

        // Make call button even more prominent
        this.enhanceCallButtonForPanic();
    }

    activatePanicModeUI() {
        const panicOverlay = document.createElement('div');
        panicOverlay.className = 'panic-mode-overlay';
        panicOverlay.innerHTML = `
            <div class="panic-content">
                <div class="calm-message">
                    <h2>Take a deep breath</h2>
                    <p>Help is available. Follow these simple steps:</p>
                </div>

                <div class="panic-steps">
                    <div class="panic-step">
                        <span class="step-number">1</span>
                        <span class="step-text">Tap the red button to call</span>
                    </div>
                    <div class="panic-step">
                        <span class="step-number">2</span>
                        <span class="step-text">Say "I need emergency tyre service"</span>
                    </div>
                    <div class="panic-step">
                        <span class="step-number">3</span>
                        <span class="step-text">Tell them your location</span>
                    </div>
                </div>

                <button class="panic-close">I understand ✓</button>
            </div>
        `;

        document.body.appendChild(panicOverlay);
        this.stylePanicOverlay(panicOverlay);

        // Close panic overlay
        panicOverlay.querySelector('.panic-close').onclick = () => {
            panicOverlay.style.opacity = '0';
            setTimeout(() => panicOverlay.remove(), 300);
        };
    }

    optimizeForOneHandedUse() {
        // Detect hand preference and optimize layout
        const isLeftHanded = this.detectHandPreference();

        // Move important elements to thumb-reachable areas
        const callButton = document.querySelector('.emergency-call-btn, .mega-call-button');
        if (callButton) {
            // Position for easy thumb access
            callButton.style.cssText += `
                margin: 0 auto 60px auto !important;
                position: relative !important;
                display: block !important;
            `;

            // Add thumb zone indicator (subtle visual cue)
            this.addThumbZoneIndicator(callButton);
        }

        // Optimize secondary actions for thumb reach
        this.optimizeSecondaryActionsForThumb();
    }

    detectHandPreference() {
        // Simple heuristic based on touch patterns
        // In a real implementation, you might track touch positions over time
        return localStorage.getItem('handPreference') === 'left';
    }

    addThumbZoneIndicator(element) {
        // Visual indicator showing this is in the optimal thumb zone
        element.style.cssText += `
            border: 3px solid rgba(34, 197, 94, 0.3) !important;
            box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.2) inset !important;
        `;
    }

    optimizeSecondaryActionsForThumb() {
        const secondaryButtons = document.querySelectorAll('.action-btn, .quick-actions button');
        secondaryButtons.forEach(button => {
            button.style.cssText += `
                margin-bottom: 16px !important;
                width: 100% !important;
                max-width: 280px !important;
                height: 56px !important;
                border-radius: 28px !important;
            `;
        });
    }

    addHapticFeedback(element) {
        if (!this.deviceCapabilities.hasVibration) return;

        element.addEventListener('touchstart', () => {
            navigator.vibrate(50); // Short haptic feedback
        });

        element.addEventListener('click', () => {
            navigator.vibrate([100, 50, 100]); // Success pattern
            this.userState.hasCalledEmergency = true;
        });
    }

    setupAccessibilityEnhancements() {
        // Voice-over friendly emergency content
        this.enhanceForScreenReaders();

        // High contrast mode detection
        this.setupHighContrastMode();

        // Keyboard navigation for emergency actions
        this.setupKeyboardShortcuts();

        // Font size adjustment for vision issues
        this.setupDynamicFontSizing();
    }

    enhanceForScreenReaders() {
        const callButton = document.querySelector('.emergency-call-btn, .mega-call-button');
        if (callButton) {
            callButton.setAttribute('aria-label', 'Emergency tyre service hotline. Call now for immediate assistance.');
            callButton.setAttribute('role', 'button');
            callButton.setAttribute('aria-describedby', 'emergency-description');
        }

        // Add hidden description for screen readers
        const description = document.createElement('div');
        description.id = 'emergency-description';
        description.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
        description.textContent = 'Emergency tyre service available 24/7. Average response time 45 to 60 minutes.';
        document.body.appendChild(description);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Spacebar or Enter to trigger emergency call
            if (e.code === 'Space' || e.code === 'Enter') {
                const callButton = document.querySelector('.emergency-call-btn, .mega-call-button');
                if (callButton && document.activeElement !== callButton) {
                    e.preventDefault();
                    callButton.click();
                }
            }

            // 'L' key for location sharing
            if (e.code === 'KeyL' && e.altKey) {
                e.preventDefault();
                this.shareLocationWithVibration();
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `emergency-toast ${type}`;
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            bottom: calc(env(safe-area-inset-bottom, 20px) + 20px);
            left: 20px;
            right: 20px;
            background: ${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#3B82F6'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 99999;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);

        // Haptic feedback for toast
        if (this.deviceCapabilities.hasVibration) {
            navigator.vibrate(50);
        }
    }

    monitorUserBehavior() {
        // Track user interactions to improve emergency UX
        document.addEventListener('click', (e) => {
            this.userState.interactionCount++;

            // If user clicks emergency button
            if (e.target.closest('.emergency-call-btn, .mega-call-button, [href^="tel:"]')) {
                this.userState.hasCalledEmergency = true;
                this.showPostCallGuidance();
            }
        });

        // Track time on page
        setInterval(() => {
            this.userState.timeOnPage += 1000;

            // If user has been here too long without calling, help them
            if (this.userState.timeOnPage > 30000 && !this.userState.hasCalledEmergency) {
                this.showHelpGuidance();
            }
        }, 1000);
    }

    showPostCallGuidance() {
        const guidance = document.createElement('div');
        guidance.className = 'post-call-guidance';
        guidance.innerHTML = `
            <div class="guidance-content">
                <h3>✓ Call Made Successfully</h3>
                <p>While you wait for help:</p>
                <ul>
                    <li>Stay in a safe location away from traffic</li>
                    <li>Keep your phone charged and nearby</li>
                    <li>Have your location ready to share</li>
                    <li>Expected arrival: 45-60 minutes</li>
                </ul>
                <button class="guidance-ok">Got it ✓</button>
            </div>
        `;

        document.body.appendChild(guidance);
        this.stylePostCallGuidance(guidance);

        guidance.querySelector('.guidance-ok').onclick = () => {
            guidance.style.opacity = '0';
            setTimeout(() => guidance.remove(), 300);
        };
    }

    // Helper method to inject emergency animations
    injectEmergencyAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes emergencyPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(220, 38, 38, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(220, 38, 38, 0.6); }
            }

            @keyframes statusPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }

            .panic-mode-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: rgba(0, 0, 0, 0.9) !important;
                z-index: 100000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                backdrop-filter: blur(10px) !important;
            }

            .panic-content {
                background: white !important;
                padding: 32px 24px !important;
                border-radius: 20px !important;
                margin: 20px !important;
                text-align: center !important;
                max-width: 400px !important;
            }

            .calm-message h2 {
                color: #16A34A !important;
                font-size: 24px !important;
                margin-bottom: 12px !important;
            }

            .panic-step {
                display: flex !important;
                align-items: center !important;
                margin: 16px 0 !important;
                text-align: left !important;
            }

            .step-number {
                background: #DC2626 !important;
                color: white !important;
                width: 32px !important;
                height: 32px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-weight: bold !important;
                margin-right: 16px !important;
            }

            .panic-close {
                background: #16A34A !important;
                color: white !important;
                border: none !important;
                padding: 16px 32px !important;
                border-radius: 12px !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                margin-top: 24px !important;
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize emergency animations
    init() {
        this.injectEmergencyAnimations();
        // ... rest of init code
    }
}

// Auto-initialize on mobile devices
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;

    if (isMobile) {
        window.mobileEmergencyUX = new MobileEmergencyUX({
            emergencyMode: true,
            maxCognitiveBurden: 2, // Even simpler for mobile
            panicModeThreshold: 8000 // Faster panic detection on mobile
        });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEmergencyUX;
}