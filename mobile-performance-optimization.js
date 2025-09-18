/**
 * Mobile Performance Optimization System
 * Emergency-first tyre service background optimization
 * Target: <100ms first paint, 60fps on mobile, <200KB bundle
 */

class MobilePerformanceOptimizer {
    constructor() {
        this.metrics = {
            firstPaint: null,
            firstContentfulPaint: null,
            timeToInteractive: null,
            cumulativeLayoutShift: 0,
            largestContentfulPaint: null
        };

        this.deviceProfile = this.createDeviceProfile();
        this.connectionProfile = this.createConnectionProfile();
        this.performanceBudget = this.calculatePerformanceBudget();

        this.init();
    }

    init() {
        // 1. Immediate critical path optimization
        this.optimizeCriticalPath();

        // 2. Progressive enhancement based on device capabilities
        this.setupProgressiveEnhancement();

        // 3. Battery and thermal monitoring
        this.setupPowerManagement();

        // 4. Real-time performance monitoring
        this.setupPerformanceMonitoring();

        // 5. Emergency fallback systems
        this.setupEmergencyFallbacks();
    }

    // === 1. CRITICAL PATH OPTIMIZATION ===
    optimizeCriticalPath() {
        // Preload critical resources only
        this.preloadCriticalResources();

        // Inline critical CSS (already done in HTML)
        this.inlineCriticalCSS();

        // Defer non-critical JavaScript
        this.deferNonCriticalJS();

        // Optimize font loading
        this.optimizeFontLoading();
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'tel:+441234567890', as: 'fetch', importance: 'high' },
            { href: 'emergency-background-fallback.css', as: 'style', importance: 'high' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.importance) link.fetchPriority = resource.importance;
            document.head.appendChild(link);
        });
    }

    inlineCriticalCSS() {
        // Critical CSS is already inlined in HTML for emergency scenarios
        // This method ensures additional critical styles if needed
        const criticalCSS = `
            .emergency-call-btn {
                display: block !important;
                z-index: 9999 !important;
                position: relative !important;
            }
            body { background: #1a1a2e; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        style.setAttribute('data-critical', 'true');
        document.head.insertBefore(style, document.head.firstChild);
    }

    deferNonCriticalJS() {
        // Defer all non-emergency scripts
        const scripts = document.querySelectorAll('script[src]:not([data-critical])');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                script.defer = true;
            }
        });
    }

    optimizeFontLoading() {
        // Use system fonts for emergency scenarios
        if (this.deviceProfile.isEmergencyMode) {
            const style = document.createElement('style');
            style.textContent = `
                * {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                system-ui, sans-serif !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            // Progressive font loading for better connections
            this.setupProgressiveFontLoading();
        }
    }

    setupProgressiveFontLoading() {
        const fontDisplay = this.connectionProfile.speed === 'slow' ? 'swap' : 'fallback';
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@400;500&display=${fontDisplay}`;
        link.rel = 'stylesheet';
        link.media = 'print';
        link.onload = () => { link.media = 'all'; };
        document.head.appendChild(link);
    }

    // === 2. PROGRESSIVE ENHANCEMENT ===
    setupProgressiveEnhancement() {
        // Layer 1: Foundation (works everywhere)
        this.enableFoundationLayer();

        // Layer 2: Enhanced (good devices/connections)
        if (this.shouldEnableEnhancedLayer()) {
            this.enableEnhancedLayer();
        }

        // Layer 3: Premium (high-end devices)
        if (this.shouldEnablePremiumLayer()) {
            this.enablePremiumLayer();
        }
    }

    enableFoundationLayer() {
        // Already implemented in CSS fallback
        document.body.classList.add('foundation-tier');
    }

    shouldEnableEnhancedLayer() {
        return (
            this.deviceProfile.memory >= 2 &&
            this.deviceProfile.cores >= 2 &&
            this.connectionProfile.speed !== 'slow' &&
            !this.deviceProfile.saveData &&
            this.deviceProfile.battery.level > 0.2
        );
    }

    enableEnhancedLayer() {
        import('./premium-hero-background.js').then(module => {
            new module.default({
                tier: 'enhanced',
                emergencyMode: this.deviceProfile.isEmergencyMode
            });
        });
    }

    shouldEnablePremiumLayer() {
        return (
            this.deviceProfile.memory >= 4 &&
            this.deviceProfile.cores >= 4 &&
            this.connectionProfile.speed === 'fast' &&
            !this.deviceProfile.prefersReducedMotion &&
            this.deviceProfile.battery.level > 0.5 &&
            !this.deviceProfile.isMobile
        );
    }

    enablePremiumLayer() {
        import('./premium-hero-background.js').then(module => {
            new module.default({
                tier: 'premium',
                emergencyMode: false
            });
        });
    }

    // === 3. BATTERY AND THERMAL MANAGEMENT ===
    setupPowerManagement() {
        // Battery monitoring
        this.monitorBattery();

        // Thermal throttling detection
        this.monitorThermalState();

        // CPU usage monitoring
        this.monitorCPUUsage();
    }

    async monitorBattery() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();

                // Initial check
                this.handleBatteryChange(battery);

                // Listen for changes
                battery.addEventListener('levelchange', () => this.handleBatteryChange(battery));
                battery.addEventListener('chargingchange', () => this.handleBatteryChange(battery));
            } catch (error) {
                console.warn('Battery API not available:', error);
            }
        }
    }

    handleBatteryChange(battery) {
        const lowBattery = battery.level < 0.2 && !battery.charging;
        const criticalBattery = battery.level < 0.1;

        if (criticalBattery) {
            this.enableEmergencyMode();
        } else if (lowBattery) {
            this.enablePowerSavingMode();
        } else if (battery.charging && battery.level > 0.5) {
            this.restoreNormalMode();
        }
    }

    monitorThermalState() {
        // Check for thermal throttling indicators
        let frameDrops = 0;
        let lastFrameTime = performance.now();

        const checkThermalThrottling = () => {
            const now = performance.now();
            const frameDelta = now - lastFrameTime;

            if (frameDelta > 20) { // More than 20ms = potential throttling
                frameDrops++;
                if (frameDrops > 30) { // 30 consecutive drops
                    this.handleThermalThrottling();
                }
            } else {
                frameDrops = Math.max(0, frameDrops - 1);
            }

            lastFrameTime = now;
            requestAnimationFrame(checkThermalThrottling);
        };

        requestAnimationFrame(checkThermalThrottling);
    }

    handleThermalThrottling() {
        console.log('Thermal throttling detected - reducing visual effects');

        // Disable animations
        document.querySelectorAll('[style*="animation"]').forEach(el => {
            el.style.animation = 'none';
        });

        // Reduce visual effects
        document.body.classList.add('thermal-throttled');
    }

    monitorCPUUsage() {
        let isMonitoring = false;

        const measureCPU = () => {
            if (isMonitoring) return;
            isMonitoring = true;

            const start = performance.now();
            const iterations = 100000;

            // CPU-intensive task
            for (let i = 0; i < iterations; i++) {
                Math.random();
            }

            const duration = performance.now() - start;

            // If this simple task takes too long, CPU is likely stressed
            if (duration > 50) {
                this.handleHighCPUUsage();
            }

            isMonitoring = false;
        };

        // Check every 30 seconds
        setInterval(measureCPU, 30000);
    }

    handleHighCPUUsage() {
        console.log('High CPU usage detected - optimizing performance');

        // Reduce animation complexity
        document.body.classList.add('cpu-optimized');

        // Cancel non-essential operations
        this.cancelNonEssentialOperations();
    }

    // === 4. PERFORMANCE MONITORING ===
    setupPerformanceMonitoring() {
        // Web Vitals monitoring
        this.observeWebVitals();

        // Custom performance metrics
        this.setupCustomMetrics();

        // Real-time FPS monitoring
        this.monitorFPS();

        // Memory usage monitoring
        this.monitorMemoryUsage();
    }

    observeWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                    this.checkPerformanceBudget('FCP', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.largestContentfulPaint = entry.startTime;
                this.checkPerformanceBudget('LCP', entry.startTime);
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.cumulativeLayoutShift += entry.value;
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }

    setupCustomMetrics() {
        // Time to Emergency Contact Visible
        const checkEmergencyContact = () => {
            const emergencyBtn = document.querySelector('.emergency-call-btn');
            if (emergencyBtn && emergencyBtn.offsetHeight > 0) {
                const timeToEmergencyContact = performance.now();
                console.log(`Emergency contact visible: ${timeToEmergencyContact.toFixed(2)}ms`);

                // This should be <100ms for emergency scenarios
                if (timeToEmergencyContact > 100) {
                    console.warn('Emergency contact slow to load!');
                }
                return;
            }
            requestAnimationFrame(checkEmergencyContact);
        };
        checkEmergencyContact();
    }

    monitorFPS() {
        let frames = 0;
        let lastTime = performance.now();

        const countFrame = () => {
            frames++;
            const now = performance.now();

            if (now - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));

                // Target: 60fps for smooth experience
                if (fps < 30) {
                    this.handleLowFPS(fps);
                }

                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(countFrame);
        };

        requestAnimationFrame(countFrame);
    }

    handleLowFPS(fps) {
        console.log(`Low FPS detected: ${fps}fps - optimizing`);

        // Reduce visual complexity
        document.body.classList.add('low-fps-mode');

        // Disable heavy animations
        this.disableHeavyAnimations();
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1048576;
                const totalMB = memory.totalJSHeapSize / 1048576;
                const percentage = (usedMB / totalMB) * 100;

                if (percentage > 80) {
                    this.handleHighMemoryUsage(percentage);
                }
            }, 10000); // Check every 10 seconds
        }
    }

    handleHighMemoryUsage(percentage) {
        console.log(`High memory usage: ${percentage.toFixed(1)}% - cleaning up`);

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        // Remove non-essential elements
        this.cleanupNonEssentialElements();
    }

    // === 5. EMERGENCY FALLBACKS ===
    setupEmergencyFallbacks() {
        // Network failure fallback
        this.setupOfflineFallback();

        // JavaScript error fallback
        this.setupErrorFallback();

        // Timeout fallback
        this.setupTimeoutFallback();
    }

    setupOfflineFallback() {
        window.addEventListener('offline', () => {
            this.enableOfflineMode();
        });

        window.addEventListener('online', () => {
            this.restoreOnlineMode();
        });
    }

    enableOfflineMode() {
        document.body.classList.add('offline-mode');

        // Show offline emergency contact info
        const offlineInfo = document.createElement('div');
        offlineInfo.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: #FF4444; color: white; padding: 10px; text-align: center; z-index: 10000;">
                📵 Offline - Emergency: 01234 567890
            </div>
        `;
        document.body.appendChild(offlineInfo);
    }

    setupErrorFallback() {
        window.addEventListener('error', (event) => {
            console.error('JS Error detected:', event.error);
            this.handleJavaScriptError(event);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejection:', event.reason);
            this.handleJavaScriptError(event);
        });
    }

    handleJavaScriptError(event) {
        // Ensure emergency functionality still works
        this.ensureEmergencyFunctionality();

        // Disable problematic features
        this.disableEnhancedFeatures();
    }

    ensureEmergencyFunctionality() {
        // Force emergency button visibility
        const emergencyBtns = document.querySelectorAll('.emergency-call-btn, .call-now-btn');
        emergencyBtns.forEach(btn => {
            btn.style.display = 'block';
            btn.style.position = 'relative';
            btn.style.zIndex = '9999';
            btn.style.pointerEvents = 'auto';
        });
    }

    setupTimeoutFallback() {
        // If page load takes too long, show basic emergency info
        setTimeout(() => {
            if (!document.body.classList.contains('loaded')) {
                this.showEmergencyFallback();
            }
        }, 5000); // 5 second timeout
    }

    showEmergencyFallback() {
        document.body.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #1a1a2e; color: white; padding: 40px; border-radius: 10px;
                text-align: center; font-family: system-ui; z-index: 10000;
            ">
                <h1>🚨 TyreHero Emergency</h1>
                <p>24/7 Mobile Tyre Service</p>
                <a href="tel:+441234567890" style="
                    display: block; background: #E53935; color: white; padding: 15px 30px;
                    text-decoration: none; border-radius: 5px; font-size: 18px; margin: 20px 0;
                ">📞 Call Now: 01234 567890</a>
                <p>Average response: 90 minutes</p>
            </div>
        `;
    }

    // === UTILITY METHODS ===
    createDeviceProfile() {
        return {
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 2,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            saveData: navigator.connection?.saveData || false,
            battery: { level: 1, charging: true }, // Will be updated by battery monitoring
            isEmergencyMode: window.location.search.includes('emergency=true')
        };
    }

    createConnectionProfile() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (!connection) {
            return { speed: 'unknown', type: 'unknown' };
        }

        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        let speed = 'medium';
        if (effectiveType === '4g' && downlink > 5) speed = 'fast';
        else if (effectiveType === 'slow-2g' || effectiveType === '2g') speed = 'slow';

        return {
            speed,
            type: effectiveType,
            downlink,
            rtt: connection.rtt
        };
    }

    calculatePerformanceBudget() {
        const baseBudget = {
            FCP: 1000,  // First Contentful Paint
            LCP: 2500,  // Largest Contentful Paint
            FID: 100,   // First Input Delay
            CLS: 0.1    // Cumulative Layout Shift
        };

        // Adjust budget based on device capabilities
        if (this.deviceProfile.isMobile) {
            baseBudget.FCP = 1500;
            baseBudget.LCP = 3000;
        }

        if (this.connectionProfile.speed === 'slow') {
            baseBudget.FCP = 2000;
            baseBudget.LCP = 4000;
        }

        if (this.deviceProfile.isEmergencyMode) {
            baseBudget.FCP = 100;  // Emergency: must load in 100ms
            baseBudget.LCP = 500;
        }

        return baseBudget;
    }

    checkPerformanceBudget(metric, value) {
        const budget = this.performanceBudget[metric];
        if (value > budget) {
            console.warn(`Performance budget exceeded: ${metric} = ${value}ms (budget: ${budget}ms)`);
            this.handleBudgetExceeded(metric, value);
        }
    }

    handleBudgetExceeded(metric, value) {
        // Take corrective action based on which metric exceeded budget
        switch (metric) {
            case 'FCP':
                this.optimizeFirstPaint();
                break;
            case 'LCP':
                this.optimizeLargestContentfulPaint();
                break;
            default:
                this.enableEmergencyMode();
        }
    }

    // === MODE MANAGEMENT ===
    enableEmergencyMode() {
        document.body.classList.add('emergency-mode');
        this.disableAllAnimations();
        this.disableNonEssentialFeatures();
        console.log('Emergency mode activated');
    }

    enablePowerSavingMode() {
        document.body.classList.add('power-saving-mode');
        this.disableHeavyAnimations();
        console.log('Power saving mode activated');
    }

    restoreNormalMode() {
        document.body.classList.remove('emergency-mode', 'power-saving-mode');
        console.log('Normal mode restored');
    }

    disableAllAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    disableHeavyAnimations() {
        const heavyAnimations = document.querySelectorAll('.premium-particles, .depth-field, .professional-lighting');
        heavyAnimations.forEach(el => {
            el.style.animation = 'none';
        });
    }

    disableNonEssentialFeatures() {
        const nonEssential = document.querySelectorAll('.premium-hero-premium, .premium-hero-enhanced');
        nonEssential.forEach(el => el.remove());
    }

    cancelNonEssentialOperations() {
        // Cancel any running timeouts/intervals that aren't critical
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
    }

    cleanupNonEssentialElements() {
        const nonEssential = document.querySelectorAll('[data-non-essential]');
        nonEssential.forEach(el => el.remove());
    }

    optimizeFirstPaint() {
        // Remove anything that blocks first paint
        const blockingElements = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        blockingElements.forEach(el => {
            el.media = 'print';
            el.onload = () => { el.media = 'all'; };
        });
    }

    optimizeLargestContentfulPaint() {
        // Prioritize loading of main content
        const mainContent = document.querySelector('main, .hero-section');
        if (mainContent) {
            mainContent.style.willChange = 'auto'; // Remove GPU layer
        }
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    getDeviceProfile() {
        return this.deviceProfile;
    }

    getConnectionProfile() {
        return this.connectionProfile;
    }
}

// Initialize performance optimizer
const performanceOptimizer = new MobilePerformanceOptimizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePerformanceOptimizer;
}

// Global access
window.performanceOptimizer = performanceOptimizer;