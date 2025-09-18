/**
 * Premium Mobile-Optimized Hero Background for Emergency Tyre Service
 * Specifically designed for stressed users in roadside emergencies
 *
 * Key Principles:
 * - Emergency functionality NEVER compromised
 * - Works on lowest-spec phones (2GB RAM, slow 3G)
 * - One-handed operation support
 * - Battery-aware performance scaling
 * - Touch-first interaction design
 */

class MobileHeroBackground {
    constructor(options = {}) {
        this.options = {
            containerId: 'hero-background',
            emergencyMode: true,
            maxLoadTime: 3000, // Reduced for mobile
            maxBundleSize: 500000, // 500KB max for mobile
            touchOptimized: true,
            reducedMotionDefault: false,
            batteryThreshold: 0.15, // 15% battery = emergency mode
            ...options
        };

        // Mobile-specific state
        this.isMobile = this.detectMobile();
        this.isLowEndDevice = false;
        this.batteryLevel = 1;
        this.connectionType = 'unknown';
        this.orientation = 'portrait';
        this.safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
        this.viewportHeight = window.innerHeight;
        this.emergencyCallButton = null;

        // Performance monitoring
        this.frameDropCount = 0;
        this.lastFrameTime = performance.now();
        this.performanceMode = 'auto'; // auto, performance, quality

        this.init();
    }

    async init() {
        try {
            // 1. CRITICAL: Ensure emergency functions work first
            this.protectEmergencyFunctions();

            // 2. Mobile device analysis
            await this.analyzeMobileDevice();

            // 3. Setup viewport and orientation handling
            this.setupMobileViewport();

            // 4. Initialize appropriate background tier
            await this.initializeMobileBackground();

            // 5. Setup mobile-specific event listeners
            this.setupMobileEventListeners();

            console.log(`Mobile Hero Background: ${this.performanceMode} mode on ${this.isMobile ? 'mobile' : 'desktop'}`);
        } catch (error) {
            console.warn('Mobile background failed, emergency functionality preserved:', error);
            this.fallbackToEmergencyMode();
        }
    }

    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

        return {
            any: mobileRegex.test(userAgent),
            android: userAgent.includes('android'),
            ios: /ipad|iphone|ipod/.test(userAgent),
            chrome: userAgent.includes('chrome'),
            safari: userAgent.includes('safari') && !userAgent.includes('chrome'),
            samsung: userAgent.includes('samsung'),
            screenSize: this.getScreenCategory(),
            touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    getScreenCategory() {
        const width = window.screen.width;
        const height = window.screen.height;
        const minDimension = Math.min(width, height);

        if (minDimension <= 360) return 'small'; // iPhone SE, old Android
        if (minDimension <= 390) return 'medium'; // iPhone 12/13, most Android
        if (minDimension <= 428) return 'large'; // iPhone 14 Pro Max, large Android
        return 'xlarge'; // Tablets, foldables
    }

    protectEmergencyFunctions() {
        // Find and protect the emergency call button
        const emergencySelectors = [
            '.emergency-call-btn',
            '.mega-call-button',
            '[href^="tel:"]',
            '.call-button',
            '.emergency-button'
        ];

        for (const selector of emergencySelectors) {
            const button = document.querySelector(selector);
            if (button) {
                this.emergencyCallButton = button;
                // Ensure it's always accessible
                button.style.position = 'relative';
                button.style.zIndex = '99999';
                button.style.pointerEvents = 'auto';
                button.style.touchAction = 'manipulation';
                break;
            }
        }

        // Create emergency overlay protection
        this.createEmergencyOverlayProtection();
    }

    createEmergencyOverlayProtection() {
        const protectionStyle = document.createElement('style');
        protectionStyle.textContent = `
            /* Emergency button protection */
            .emergency-call-btn,
            .mega-call-button,
            [href^="tel:"] {
                position: relative !important;
                z-index: 99999 !important;
                pointer-events: auto !important;
                touch-action: manipulation !important;
                /* Ensure minimum touch target size */
                min-height: 44px !important;
                min-width: 44px !important;
            }

            /* Prevent any background from interfering */
            .mobile-hero-background {
                pointer-events: none !important;
                z-index: -1 !important;
            }

            /* Emergency mode overrides */
            .emergency-mode .mobile-hero-background {
                display: none !important;
            }
        `;
        document.head.appendChild(protectionStyle);
    }

    async analyzeMobileDevice() {
        // Device memory and capabilities
        const deviceMemory = navigator.deviceMemory || 2; // Assume 2GB if unknown
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;

        // Battery status
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                this.batteryLevel = battery.level;

                // Listen for battery changes
                battery.addEventListener('levelchange', () => {
                    this.batteryLevel = battery.level;
                    this.adjustForBatteryLevel();
                });
            }
        } catch (e) {
            // Battery API might be blocked or unavailable
        }

        // Network connection
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            this.connectionType = connection.effectiveType || 'unknown';

            // Listen for connection changes
            connection.addEventListener('change', () => {
                this.connectionType = connection.effectiveType;
                this.adjustForConnection();
            });
        }

        // Determine if this is a low-end device
        this.isLowEndDevice = (
            deviceMemory <= 2 ||
            hardwareConcurrency <= 2 ||
            this.connectionType === 'slow-2g' ||
            this.connectionType === '2g' ||
            this.batteryLevel < this.options.batteryThreshold
        );

        // Safe area insets for notched devices
        this.calculateSafeAreaInsets();
    }

    calculateSafeAreaInsets() {
        // Get CSS safe area insets
        const computedStyle = getComputedStyle(document.documentElement);
        this.safeAreaInsets = {
            top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
            bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
            left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
            right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
        };
    }

    setupMobileViewport() {
        // Dynamic viewport height handling
        this.updateViewportHeight();

        // Prevent zoom on input focus (iOS)
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        }

        // CSS custom properties for mobile
        const mobileVars = document.createElement('style');
        mobileVars.textContent = `
            :root {
                --vh: ${this.viewportHeight * 0.01}px;
                --safe-area-inset-top: ${this.safeAreaInsets.top}px;
                --safe-area-inset-bottom: ${this.safeAreaInsets.bottom}px;
                --safe-area-inset-left: ${this.safeAreaInsets.left}px;
                --safe-area-inset-right: ${this.safeAreaInsets.right}px;
                --touch-target-size: 44px;
                --mobile-padding: 16px;
            }
        `;
        document.head.appendChild(mobileVars);
    }

    updateViewportHeight() {
        this.viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${this.viewportHeight * 0.01}px`);
    }

    async initializeMobileBackground() {
        const container = this.getContainer();

        // Determine appropriate background tier for mobile
        let tier = 'fallback';

        if (!this.isLowEndDevice && !this.options.emergencyMode) {
            if (this.batteryLevel > 0.5 && ['4g', 'fast'].includes(this.connectionType)) {
                tier = 'enhanced';
            } else if (this.batteryLevel > 0.3) {
                tier = 'standard';
            }
        }

        // Emergency mode: always use fallback
        if (this.batteryLevel < this.options.batteryThreshold) {
            tier = 'emergency';
        }

        this.performanceMode = tier;

        switch (tier) {
            case 'enhanced':
                this.createEnhancedMobileBackground(container);
                break;
            case 'standard':
                this.createStandardMobileBackground(container);
                break;
            case 'emergency':
                this.createEmergencyModeBackground(container);
                break;
            default:
                this.createFallbackMobileBackground(container);
        }
    }

    getContainer() {
        return document.getElementById(this.options.containerId) ||
               document.querySelector('.hero-section') ||
               document.querySelector('main') ||
               document.body;
    }

    createEnhancedMobileBackground(container) {
        const background = document.createElement('div');
        background.className = 'mobile-hero-background enhanced';
        background.innerHTML = `
            <div class="mobile-workshop-scene">
                <div class="mobile-gradient-base"></div>
                <div class="mobile-floating-elements">
                    <div class="mobile-tool tool-wrench"></div>
                    <div class="mobile-tool tool-gauge"></div>
                    <div class="mobile-tool tool-tire"></div>
                </div>
                <div class="mobile-ambient-glow"></div>
            </div>
        `;

        this.injectEnhancedMobileCSS();
        this.addMobileBackground(container, background);
        this.startPerformanceMonitoring();
    }

    createStandardMobileBackground(container) {
        const background = document.createElement('div');
        background.className = 'mobile-hero-background standard';
        background.innerHTML = `
            <div class="mobile-simple-scene">
                <div class="mobile-gradient-base"></div>
                <div class="mobile-pattern-overlay"></div>
            </div>
        `;

        this.injectStandardMobileCSS();
        this.addMobileBackground(container, background);
    }

    createFallbackMobileBackground(container) {
        const background = document.createElement('div');
        background.className = 'mobile-hero-background fallback';
        background.innerHTML = `
            <div class="mobile-fallback-scene">
                <div class="mobile-solid-gradient"></div>
            </div>
        `;

        this.injectFallbackMobileCSS();
        this.addMobileBackground(container, background);
    }

    createEmergencyModeBackground(container) {
        // Ultra-minimal background for emergency situations
        const background = document.createElement('div');
        background.className = 'mobile-hero-background emergency';
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #FFFFFF;
            z-index: -1;
            pointer-events: none;
        `;

        this.addMobileBackground(container, background);

        // Add emergency mode class to body
        document.body.classList.add('emergency-mode');
    }

    addMobileBackground(container, background) {
        background.style.position = 'fixed';
        background.style.top = '0';
        background.style.left = '0';
        background.style.width = '100%';
        background.style.height = '100%';
        background.style.zIndex = '-1';
        background.style.pointerEvents = 'none';

        container.appendChild(background);
    }

    injectEnhancedMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-hero-background.enhanced {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                overflow: hidden;
            }

            .mobile-workshop-scene {
                position: relative;
                width: 100%;
                height: 100%;
                perspective: 800px;
            }

            .mobile-gradient-base {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(
                    ellipse at center,
                    rgba(74, 144, 226, 0.1) 0%,
                    transparent 70%
                );
            }

            .mobile-floating-elements {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 1;
            }

            .mobile-tool {
                position: absolute;
                opacity: 0.3;
                transition: transform 0.3s ease;
            }

            .tool-wrench {
                top: 20%;
                left: 10%;
                width: 40px;
                height: 40px;
                background: linear-gradient(45deg, #4a90e2, #357abd);
                border-radius: 8px;
                transform: rotate(45deg);
                animation: mobileFloat 6s ease-in-out infinite;
            }

            .tool-gauge {
                top: 60%;
                right: 15%;
                width: 35px;
                height: 35px;
                background: radial-gradient(circle, #f39c12, #e67e22);
                border-radius: 50%;
                animation: mobileFloat 8s ease-in-out infinite reverse;
            }

            .tool-tire {
                bottom: 30%;
                left: 20%;
                width: 45px;
                height: 45px;
                background: linear-gradient(45deg, #2c3e50, #34495e);
                border-radius: 50%;
                border: 3px solid #95a5a6;
                animation: mobileFloat 7s ease-in-out infinite;
            }

            .mobile-ambient-glow {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(
                    circle at 30% 20%,
                    rgba(255, 255, 255, 0.05) 0%,
                    transparent 50%
                );
                animation: mobileGlow 10s ease-in-out infinite alternate;
            }

            @keyframes mobileFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(5deg); }
                66% { transform: translateY(5px) rotate(-3deg); }
            }

            @keyframes mobileGlow {
                0% { opacity: 0.3; }
                100% { opacity: 0.6; }
            }

            /* Mobile-specific optimizations */
            @media (max-width: 428px) {
                .mobile-tool {
                    opacity: 0.2;
                    animation-duration: 8s;
                }
            }

            /* Landscape mobile adjustments */
            @media (orientation: landscape) and (max-height: 500px) {
                .mobile-tool {
                    transform: scale(0.8);
                }
            }

            /* High contrast support */
            @media (prefers-contrast: high) {
                .mobile-hero-background.enhanced {
                    background: #000;
                }
                .mobile-tool {
                    opacity: 0.8;
                    border: 1px solid #fff;
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .mobile-tool,
                .mobile-ambient-glow {
                    animation: none !important;
                }
            }

            /* Battery-aware animations */
            .low-battery .mobile-tool,
            .low-battery .mobile-ambient-glow {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    injectStandardMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-hero-background.standard {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            }

            .mobile-simple-scene {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .mobile-gradient-base {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(
                    ellipse at center bottom,
                    rgba(74, 144, 226, 0.15) 0%,
                    transparent 60%
                );
            }

            .mobile-pattern-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image:
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 50px 50px, 30px 30px;
                opacity: 0.3;
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .mobile-pattern-overlay {
                    background-image: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectFallbackMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-hero-background.fallback {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            }

            .mobile-solid-gradient {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%);
            }
        `;
        document.head.appendChild(style);
    }

    setupMobileEventListeners() {
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateViewportHeight();
                this.calculateSafeAreaInsets();
                this.adjustForOrientation();
            }, 100);
        });

        // Resize (for keyboard on mobile)
        window.addEventListener('resize', () => {
            this.updateViewportHeight();
        });

        // Visibility change (tab switching, background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Page lifecycle events (mobile browser tab management)
        window.addEventListener('pagehide', () => {
            this.pauseAnimations();
        });

        window.addEventListener('pageshow', () => {
            this.resumeAnimations();
        });

        // Touch events for interaction feedback
        if (this.isMobile.touchCapable) {
            this.setupTouchFeedback();
        }
    }

    setupTouchFeedback() {
        // Add subtle touch feedback to background elements
        const tools = document.querySelectorAll('.mobile-tool');
        tools.forEach(tool => {
            tool.addEventListener('touchstart', (e) => {
                e.preventDefault();
                tool.style.transform += ' scale(1.1)';
            }, { passive: false });

            tool.addEventListener('touchend', (e) => {
                e.preventDefault();
                tool.style.transform = tool.style.transform.replace(' scale(1.1)', '');
            }, { passive: false });
        });
    }

    adjustForBatteryLevel() {
        if (this.batteryLevel < this.options.batteryThreshold) {
            // Switch to emergency mode
            this.performanceMode = 'emergency';
            this.createEmergencyModeBackground(this.getContainer());
        } else if (this.batteryLevel < 0.3) {
            // Enable low battery mode
            document.body.classList.add('low-battery');
        } else {
            // Remove low battery mode
            document.body.classList.remove('low-battery');
        }
    }

    adjustForConnection() {
        if (['slow-2g', '2g'].includes(this.connectionType)) {
            // Disable animations for slow connections
            document.body.classList.add('slow-connection');
        } else {
            document.body.classList.remove('slow-connection');
        }
    }

    adjustForOrientation() {
        const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            document.body.classList.remove('portrait', 'landscape');
            document.body.classList.add(newOrientation);
        }
    }

    startPerformanceMonitoring() {
        if (this.performanceMode !== 'enhanced') return;

        const monitor = () => {
            const now = performance.now();
            const delta = now - this.lastFrameTime;

            // If frame time > 33ms (less than 30fps), count as dropped frame
            if (delta > 33) {
                this.frameDropCount++;

                // If too many dropped frames, downgrade performance
                if (this.frameDropCount > 10) {
                    this.downgradePerformance();
                    return;
                }
            }

            this.lastFrameTime = now;
            requestAnimationFrame(monitor);
        };

        requestAnimationFrame(monitor);
    }

    downgradePerformance() {
        console.log('Performance issues detected, downgrading mobile background');

        if (this.performanceMode === 'enhanced') {
            this.performanceMode = 'standard';
            this.createStandardMobileBackground(this.getContainer());
        } else if (this.performanceMode === 'standard') {
            this.performanceMode = 'fallback';
            this.createFallbackMobileBackground(this.getContainer());
        }

        this.frameDropCount = 0;
    }

    pauseAnimations() {
        const style = document.createElement('style');
        style.id = 'pause-animations';
        style.textContent = `
            .mobile-hero-background * {
                animation-play-state: paused !important;
            }
        `;
        document.head.appendChild(style);
    }

    resumeAnimations() {
        const pauseStyle = document.getElementById('pause-animations');
        if (pauseStyle) {
            pauseStyle.remove();
        }
    }

    fallbackToEmergencyMode() {
        // Complete fallback for any errors
        document.body.classList.add('emergency-mode');

        const emergencyStyle = document.createElement('style');
        emergencyStyle.textContent = `
            body.emergency-mode {
                background: #FFFFFF !important;
            }
            .mobile-hero-background {
                display: none !important;
            }
        `;
        document.head.appendChild(emergencyStyle);
    }

    // Public API methods
    setPerformanceMode(mode) {
        if (['auto', 'performance', 'quality'].includes(mode)) {
            this.performanceMode = mode;
            this.initializeMobileBackground();
        }
    }

    getPerformanceInfo() {
        return {
            mode: this.performanceMode,
            batteryLevel: this.batteryLevel,
            connectionType: this.connectionType,
            isLowEndDevice: this.isLowEndDevice,
            frameDropCount: this.frameDropCount,
            deviceInfo: this.isMobile
        };
    }

    destroy() {
        // Clean up event listeners and elements
        const background = document.querySelector('.mobile-hero-background');
        if (background) {
            background.remove();
        }

        // Remove dynamic styles
        const styles = document.querySelectorAll('style[data-mobile-hero]');
        styles.forEach(style => style.remove());
    }
}

// Auto-initialize on mobile devices
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on mobile or explicitly requested
    const shouldInitialize = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                             window.innerWidth <= 768 ||
                             document.querySelector('[data-mobile-hero="true"]');

    if (shouldInitialize) {
        window.mobileHeroBackground = new MobileHeroBackground({
            emergencyMode: true, // Always prioritize emergency functionality
            containerId: 'hero-background'
        });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileHeroBackground;
}