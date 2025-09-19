/*
 * TyreHero Intelligent Device Detection System
 * Ultra-fast device detection with adaptive loading optimization
 * Runs before page load to optimize experience per device type
 */

const TyreHeroDeviceDetector = {
    // Ultra-fast device detection
    detect() {
        const ua = navigator.userAgent.toLowerCase();
        const screen = window.screen || {};
        const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        // Device type detection
        const isMobile = /android|iphone|ipod|blackberry|iemobile|opera mini|mobile/.test(ua) ||
                         (screen.width && screen.width <= 480) ||
                         (touch && screen.width <= 768);

        const isTablet = /ipad|tablet|kindle|silk/.test(ua) ||
                        (touch && screen.width > 480 && screen.width <= 1024 &&
                         screen.height > 600);

        const isDesktop = !isMobile && !isTablet;

        // Performance capabilities
        const isHighPerformance = screen.width >= 1920 &&
                                 navigator.hardwareConcurrency >= 4;

        const connectionSpeed = connection ? connection.effectiveType : 'unknown';
        const isSlowConnection = connectionSpeed === 'slow-2g' || connectionSpeed === '2g';

        return {
            type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
            isMobile,
            isTablet,
            isDesktop,
            touch,
            screenWidth: screen.width || 0,
            screenHeight: screen.height || 0,
            pixelRatio: window.devicePixelRatio || 1,
            connectionSpeed,
            isSlowConnection,
            isHighPerformance,
            cores: navigator.hardwareConcurrency || 2,
            memory: navigator.deviceMemory || 4,
            userAgent: ua
        };
    },

    // Apply device-specific optimizations
    applyOptimizations(device) {
        // Set CSS custom properties for responsive design
        document.documentElement.setAttribute('data-device', device.type);
        document.documentElement.setAttribute('data-touch', device.touch);
        document.documentElement.setAttribute('data-performance',
            device.isHighPerformance ? 'high' : device.isMobile ? 'mobile' : 'standard');

        // Apply device-specific CSS variables
        const root = document.documentElement.style;

        if (device.isMobile) {
            root.setProperty('--header-height', '60px');
            root.setProperty('--hero-padding', '15px');
            root.setProperty('--grid-columns', '1');
            root.setProperty('--font-scale', '0.9');
            root.setProperty('--3d-enabled', '0');
            root.setProperty('--animation-duration', '0.2s');
        } else if (device.isTablet) {
            root.setProperty('--header-height', '70px');
            root.setProperty('--hero-padding', '30px');
            root.setProperty('--grid-columns', '2');
            root.setProperty('--font-scale', '1');
            root.setProperty('--3d-enabled', device.isHighPerformance ? '1' : '0.5');
            root.setProperty('--animation-duration', '0.3s');
        } else {
            root.setProperty('--header-height', '80px');
            root.setProperty('--hero-padding', '60px');
            root.setProperty('--grid-columns', '4');
            root.setProperty('--font-scale', '1.1');
            root.setProperty('--3d-enabled', '1');
            root.setProperty('--animation-duration', '0.4s');
        }

        // Performance-based feature loading
        this.loadFeaturesByDevice(device);

        // Log detection results
        console.log('🎯 TyreHero Device Detected:', device);
    },

    // Load features based on device capabilities
    loadFeaturesByDevice(device) {
        const loadQueue = [];

        if (device.isMobile) {
            // Mobile-first: Emergency features only
            loadQueue.push('emergency-features');
            loadQueue.push('voice-basic');

            // Skip heavy features on slow connections
            if (!device.isSlowConnection) {
                loadQueue.push('ar-scanner-lite');
            }
        } else if (device.isTablet) {
            // Tablet: Enhanced features
            loadQueue.push('emergency-features');
            loadQueue.push('voice-enhanced');
            loadQueue.push('ar-scanner');

            if (device.isHighPerformance) {
                loadQueue.push('3d-background-lite');
            }
        } else {
            // Desktop: Full features
            loadQueue.push('emergency-features');
            loadQueue.push('voice-enhanced');
            loadQueue.push('ar-scanner');
            loadQueue.push('3d-background');
            loadQueue.push('ai-features');
            loadQueue.push('live-stats');
        }

        // Store feature queue for progressive loading
        window.TyreHeroFeatureQueue = loadQueue;

        // Add loading indicator
        this.showLoadingProgress(device);
    },

    // Progressive loading indicator
    showLoadingProgress(device) {
        const indicator = document.createElement('div');
        indicator.id = 'tyrehero-device-loader';
        indicator.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; right: 0;
                background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
                color: white; text-align: center; padding: 10px;
                z-index: 10000; font-size: 14px; font-weight: 600;
            ">
                🚨 TyreHero Loading for ${device.type.toUpperCase()} device...
                <div style="
                    width: 0%; height: 2px; background: #FFD700;
                    margin: 5px auto 0; transition: width 0.3s ease;
                " id="progress-bar"></div>
            </div>
        `;

        document.body.insertBefore(indicator, document.body.firstChild);

        // Animate progress
        setTimeout(() => {
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) progressBar.style.width = '100%';
        }, 100);

        // Remove after 2 seconds
        setTimeout(() => {
            const loader = document.getElementById('tyrehero-device-loader');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                setTimeout(() => loader.remove(), 500);
            }
        }, 2000);
    },

    // Initialize device detection
    init() {
        try {
            const device = this.detect();
            this.applyOptimizations(device);

            // Store device info globally
            window.TyreHeroDevice = device;

            // Dispatch device detection event
            window.dispatchEvent(new CustomEvent('tyrehero:deviceDetected', {
                detail: device
            }));

            return device;
        } catch (error) {
            console.error('🚨 Device detection failed:', error);
            // Fallback to desktop experience
            return this.detect();
        }
    }
};

// Auto-initialize on script load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TyreHeroDeviceDetector.init());
} else {
    TyreHeroDeviceDetector.init();
}

// Export for global access
window.TyreHeroDeviceDetector = TyreHeroDeviceDetector;