/*
 * TyreHero Premium Hero Background System
 * Professional automotive-grade visual experience
 * Emergency-first mobile-optimized design
 */

class TyreHeroPremiumBackground {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'hero-background',
            emergencyMode: options.emergencyMode || false,
            quality: options.quality || 'auto', // auto, high, medium, low
            ...options
        };

        this.container = null;
        this.isActive = false;
        this.performanceMonitor = {
            fps: 60,
            lastFrame: 0,
            frameCount: 0,
            quality: 'high'
        };

        this.deviceCapabilities = {
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isLowPower: false,
            hasWebGL: false,
            batteryLevel: 1,
            connectionSpeed: 'fast'
        };

        this.init();
    }

    init() {
        this.detectCapabilities();
        this.createContainer();
        this.bindEvents();
        this.startBackgroundSystem();
        console.log('🏆 TyreHero Premium Background initialized');
    }

    detectCapabilities() {
        // Battery API detection
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.deviceCapabilities.batteryLevel = battery.level;
                this.deviceCapabilities.isLowPower = battery.level < 0.2;

                battery.addEventListener('levelchange', () => {
                    this.deviceCapabilities.batteryLevel = battery.level;
                    this.deviceCapabilities.isLowPower = battery.level < 0.2;
                    this.adaptToPerformance();
                });
            });
        }

        // WebGL detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        this.deviceCapabilities.hasWebGL = !!gl;

        // Connection speed detection
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                this.deviceCapabilities.connectionSpeed =
                    ['slow-2g', '2g'].includes(connection.effectiveType) ? 'slow' :
                    ['3g'].includes(connection.effectiveType) ? 'medium' : 'fast';
            }
        }

        // Memory detection (rough estimate)
        this.deviceCapabilities.estimatedRAM = navigator.deviceMemory || 4;
    }

    createContainer() {
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.warn('Premium background container not found');
            return;
        }

        // Create professional background layers
        this.container.innerHTML = `
            <div class="premium-background-system">
                <!-- Foundation Layer (CSS-only, instant load) -->
                <div class="foundation-layer">
                    <div class="automotive-gradient"></div>
                    <div class="professional-grid"></div>
                </div>

                <!-- Enhanced Layer (Progressive enhancement) -->
                <div class="enhanced-layer">
                    <div class="tyre-pattern-overlay"></div>
                    <div class="premium-particles"></div>
                </div>

                <!-- Premium Layer (High-end devices only) -->
                <div class="premium-layer">
                    <canvas class="premium-canvas" width="1920" height="1080"></canvas>
                    <div class="interactive-elements"></div>
                </div>

                <!-- Emergency Override Layer -->
                <div class="emergency-overlay hidden">
                    <div class="emergency-gradient"></div>
                </div>
            </div>
        `;

        this.addPremiumStyles();
    }

    addPremiumStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* TyreHero Premium Background System */
            .premium-background-system {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }

            /* Foundation Layer - Instant Load */
            .foundation-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }

            .automotive-gradient {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg,
                    #0A0A0A 0%,
                    #1A1A2E 25%,
                    #16213E 50%,
                    #0F3460 75%,
                    #0A0A0A 100%
                );
                opacity: 0.95;
            }

            .professional-grid {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image:
                    linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
                background-size: 40px 40px;
                opacity: 0.3;
                animation: gridShift 20s linear infinite;
            }

            @keyframes gridShift {
                0% { transform: translate(0, 0); }
                100% { transform: translate(40px, 40px); }
            }

            /* Enhanced Layer - Progressive Enhancement */
            .enhanced-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                opacity: 0;
                animation: enhancedFadeIn 2s ease-out 0.5s forwards;
            }

            .tyre-pattern-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, rgba(229, 57, 53, 0.1) 0%, transparent 50%);
                background-size: 200px 200px, 300px 300px;
                animation: tyreRotation 30s linear infinite;
            }

            @keyframes tyreRotation {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.1); }
                100% { transform: rotate(360deg) scale(1); }
            }

            .premium-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image:
                    radial-gradient(2px 2px at 20px 30px, rgba(0, 212, 255, 0.8), transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255, 215, 0, 0.8), transparent),
                    radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.8), transparent),
                    radial-gradient(1px 1px at 130px 80px, rgba(0, 212, 255, 0.8), transparent);
                background-repeat: repeat;
                background-size: 150px 100px;
                animation: particleFloat 25s linear infinite;
                opacity: 0.6;
            }

            @keyframes particleFloat {
                0% { transform: translateX(0px) translateY(0px); }
                33% { transform: translateX(-30px) translateY(-10px); }
                66% { transform: translateX(20px) translateY(-20px); }
                100% { transform: translateX(0px) translateY(0px); }
            }

            @keyframes enhancedFadeIn {
                from { opacity: 0; transform: scale(1.1); }
                to { opacity: 1; transform: scale(1); }
            }

            /* Premium Layer - High-end Devices */
            .premium-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 3;
                opacity: 0;
                pointer-events: none;
            }

            .premium-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.7;
            }

            .interactive-elements {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border: 2px solid rgba(0, 212, 255, 0.3);
                border-radius: 50%;
                animation: premiumPulse 4s ease-in-out infinite;
            }

            @keyframes premiumPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            }

            /* Emergency Mode Override */
            .emergency-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                background: linear-gradient(45deg,
                    rgba(229, 57, 53, 0.1) 0%,
                    rgba(0, 0, 0, 0.8) 100%
                );
                transition: opacity 0.3s ease;
            }

            .emergency-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }

            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .professional-grid {
                    background-size: 20px 20px;
                    animation-duration: 30s;
                }

                .premium-particles {
                    opacity: 0.3;
                    animation-duration: 40s;
                }

                .tyre-pattern-overlay {
                    animation-duration: 60s;
                }

                .interactive-elements {
                    display: none; /* Hide on mobile for performance */
                }
            }

            /* Low Power Mode */
            @media (prefers-reduced-motion: reduce) {
                .professional-grid,
                .tyre-pattern-overlay,
                .premium-particles,
                .interactive-elements {
                    animation: none !important;
                }
            }

            /* High Performance Mode */
            @media (min-width: 1920px) and (min-resolution: 2dppx) {
                .enhanced-layer {
                    animation-duration: 1s;
                }

                .premium-layer {
                    opacity: 1;
                    animation: premiumLayerReveal 3s ease-out 1s forwards;
                }
            }

            @keyframes premiumLayerReveal {
                from { opacity: 0; transform: scale(1.05); }
                to { opacity: 1; transform: scale(1); }
            }
        `;

        document.head.appendChild(style);
    }

    startBackgroundSystem() {
        this.isActive = true;
        this.determineQualityTier();
        this.initializeAppropriateLayer();
        this.startPerformanceMonitoring();
    }

    determineQualityTier() {
        const { isMobile, isLowPower, hasWebGL, connectionSpeed, estimatedRAM } = this.deviceCapabilities;

        if (this.options.emergencyMode || isLowPower) {
            this.performanceMonitor.quality = 'emergency';
        } else if (isMobile || connectionSpeed === 'slow' || estimatedRAM < 2) {
            this.performanceMonitor.quality = 'low';
        } else if (connectionSpeed === 'medium' || estimatedRAM < 4) {
            this.performanceMonitor.quality = 'medium';
        } else if (hasWebGL && connectionSpeed === 'fast' && estimatedRAM >= 4) {
            this.performanceMonitor.quality = 'high';
        } else {
            this.performanceMonitor.quality = 'medium';
        }

        console.log(`🎯 Background quality tier: ${this.performanceMonitor.quality}`);
    }

    initializeAppropriateLayer() {
        const quality = this.performanceMonitor.quality;
        const foundationLayer = this.container.querySelector('.foundation-layer');
        const enhancedLayer = this.container.querySelector('.enhanced-layer');
        const premiumLayer = this.container.querySelector('.premium-layer');
        const emergencyOverlay = this.container.querySelector('.emergency-overlay');

        // Foundation layer is always active (CSS-only)
        if (foundationLayer) foundationLayer.style.opacity = '1';

        // Progressive enhancement based on quality
        if (quality === 'emergency') {
            if (emergencyOverlay) emergencyOverlay.classList.remove('hidden');
            if (enhancedLayer) enhancedLayer.style.display = 'none';
            if (premiumLayer) premiumLayer.style.display = 'none';
        } else if (quality === 'low') {
            if (enhancedLayer) enhancedLayer.style.opacity = '0.5';
            if (premiumLayer) premiumLayer.style.display = 'none';
        } else if (quality === 'medium') {
            if (enhancedLayer) enhancedLayer.style.opacity = '1';
            if (premiumLayer) premiumLayer.style.display = 'none';
        } else if (quality === 'high') {
            if (enhancedLayer) enhancedLayer.style.opacity = '1';
            if (premiumLayer) {
                premiumLayer.style.display = 'block';
                this.initializePremiumCanvas();
            }
        }
    }

    initializePremiumCanvas() {
        const canvas = this.container.querySelector('.premium-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create sophisticated automotive-inspired canvas animation
        let time = 0;

        const animate = () => {
            if (!this.isActive) return;

            time += 0.01;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create premium automotive patterns
            this.drawAutomotivePatterns(ctx, time);

            requestAnimationFrame(animate);
        };

        animate();
    }

    drawAutomotivePatterns(ctx, time) {
        const { width, height } = ctx.canvas;

        // Premium tyre tread pattern
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 5; i++) {
            const y = (height / 6) * (i + 1);
            const offset = Math.sin(time + i) * 20;

            ctx.beginPath();
            ctx.moveTo(offset, y);

            for (let x = 0; x <= width + 50; x += 50) {
                const treadY = y + Math.sin((x + offset) * 0.02) * 10;
                ctx.lineTo(x, treadY);
            }

            ctx.stroke();
        }

        // Subtle particle system
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        for (let i = 0; i < 20; i++) {
            const x = (width / 20 * i + time * 30) % width;
            const y = height * 0.3 + Math.sin(time + i) * 100;
            const size = 2 + Math.sin(time * 2 + i) * 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const monitorPerformance = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                this.performanceMonitor.fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // Auto-degrade if performance is poor
                if (this.performanceMonitor.fps < 30 && this.performanceMonitor.quality === 'high') {
                    this.performanceMonitor.quality = 'medium';
                    this.adaptToPerformance();
                } else if (this.performanceMonitor.fps < 20 && this.performanceMonitor.quality === 'medium') {
                    this.performanceMonitor.quality = 'low';
                    this.adaptToPerformance();
                }
            }

            if (this.isActive) {
                requestAnimationFrame(monitorPerformance);
            }
        };

        requestAnimationFrame(monitorPerformance);
    }

    adaptToPerformance() {
        console.log(`🔄 Adapting to performance: ${this.performanceMonitor.quality}`);
        this.initializeAppropriateLayer();
    }

    activateEmergencyMode() {
        this.options.emergencyMode = true;
        this.performanceMonitor.quality = 'emergency';

        const emergencyOverlay = this.container.querySelector('.emergency-overlay');
        if (emergencyOverlay) {
            emergencyOverlay.classList.remove('hidden');
        }

        // Disable all animations for emergency mode
        const style = document.createElement('style');
        style.textContent = `
            .premium-background-system * {
                animation-play-state: paused !important;
            }
        `;
        document.head.appendChild(style);

        console.log('🚨 Emergency mode activated - minimal resources');
    }

    bindEvents() {
        // Listen for device orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adaptToPerformance(), 300);
        });

        // Listen for visibility changes (battery saving)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
            } else {
                this.isActive = true;
                this.startPerformanceMonitoring();
            }
        });

        // Listen for emergency events
        window.addEventListener('tyrehero:emergency', () => {
            this.activateEmergencyMode();
        });
    }

    destroy() {
        this.isActive = false;
        if (this.container) {
            this.container.innerHTML = '';
        }
        console.log('🏆 Premium background destroyed');
    }
}

// Global initialization
let tyreHeroPremiumBg;

document.addEventListener('DOMContentLoaded', () => {
    tyreHeroPremiumBg = new TyreHeroPremiumBackground({
        containerId: 'hero-background',
        emergencyMode: false,
        quality: 'auto'
    });
});

// Global functions for compatibility
function activateEmergencyBackground() {
    if (tyreHeroPremiumBg) {
        tyreHeroPremiumBg.activateEmergencyMode();
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TyreHeroPremiumBackground;
}