/**
 * TyreHero 3D Interactive Hero Background System
 * Emergency-First Design with Progressive Enhancement
 * 
 * Phase 1: Emergency-Safe Foundation (no dependencies)
 * Phase 2: Enhanced Professional Look (CSS 3D, GSAP)
 * Phase 3: Full 3D Implementation (Three.js)
 * Phase 4: Advanced Features (WebGPU, physics)
 */

export class TyreHero3DBackground {
    constructor(options = {}) {
        this.options = {
            containerId: 'hero-background',
            emergencyMode: true,
            maxLoadTime: 5000, // 5 seconds max initialization
            maxBundleSize: 2000000, // 2MB max
            ...options
        };
        
        this.deviceCapabilities = null;
        this.performanceTier = 'fallback';
        this.initStartTime = performance.now();
        this.emergencyContactElement = null;
        
        this.init();
    }
    
    async init() {
        try {
            // 1. Ensure emergency contact is always functional first
            this.ensureEmergencyContact();
            
            // 2. Detect device capabilities
            this.deviceCapabilities = await this.detectDeviceCapabilities();
            
            // 3. Determine performance tier
            this.performanceTier = this.calculatePerformanceTier();
            
            // 4. Initialize appropriate background system
            await this.initializeBackgroundSystem();
            
            console.log(`TyreHero 3D Background initialized: ${this.performanceTier} tier`);
        } catch (error) {
            console.warn('3D Background failed, maintaining emergency functionality:', error);
            this.fallbackToBasicBackground();
        }
    }
    
    ensureEmergencyContact() {
        // Ensure emergency call button is always functional regardless of 3D features
        this.emergencyContactElement = document.querySelector('.emergency-call-btn');
        if (this.emergencyContactElement) {
            // Add extra safety measures
            this.emergencyContactElement.style.position = 'relative';
            this.emergencyContactElement.style.zIndex = '9999';
            this.emergencyContactElement.style.pointerEvents = 'auto';
        }
    }
    
    async detectDeviceCapabilities() {
        const capabilities = {
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            connection: this.getConnectionSpeed(),
            webgl: this.checkWebGLSupport(),
            webgpu: await this.checkWebGPUSupport(),
            touch: 'ontouchstart' in window,
            mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            battery: await this.getBatteryStatus()
        };
        
        return capabilities;
    }
    
    getConnectionSpeed() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return 'unknown';
        
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        if (effectiveType === '4g' && downlink > 10) return 'fast';
        if (effectiveType === '4g' || downlink > 1.5) return 'good';
        if (effectiveType === '3g') return 'slow';
        return 'very-slow';
    }
    
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    async checkWebGPUSupport() {
        if (!navigator.gpu) return false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch (e) {
            return false;
        }
    }
    
    async getBatteryStatus() {
        try {
            if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                return {
                    level: battery.level,
                    charging: battery.charging
                };
            }
        } catch (e) {
            // Ignore battery API errors
        }
        return { level: 1, charging: true }; // Assume good battery
    }
    
    calculatePerformanceTier() {
        const caps = this.deviceCapabilities;
        
        // Emergency mode: prioritize reliability over visual flair
        if (this.options.emergencyMode && caps.battery.level < 0.2 && !caps.battery.charging) {
            return 'fallback';
        }
        
        // Flagship tier: High-end devices with good connection
        if (caps.memory >= 8 && caps.cores >= 6 && caps.webgl && 
            caps.connection === 'fast' && !caps.mobile) {
            return 'flagship';
        }
        
        // Mid-range tier: Decent devices
        if (caps.memory >= 4 && caps.cores >= 4 && caps.webgl && 
            ['fast', 'good'].includes(caps.connection)) {
            return 'midRange';
        }
        
        // Budget tier: Basic 3D support
        if (caps.memory >= 2 && caps.webgl && caps.connection !== 'very-slow') {
            return 'budget';
        }
        
        // Fallback: No 3D features, pure CSS
        return 'fallback';
    }
    
    async initializeBackgroundSystem() {
        const container = document.getElementById(this.options.containerId) || 
                         document.querySelector('.hero-section') ||
                         document.body;
        
        switch (this.performanceTier) {
            case 'flagship':
                await this.initFlagshipTier(container);
                break;
            case 'midRange':
                await this.initMidRangeTier(container);
                break;
            case 'budget':
                await this.initBudgetTier(container);
                break;
            default:
                this.initFallbackTier(container);
        }
    }
    
    async initFlagshipTier(container) {
        // Phase 3 & 4: Full Three.js scene with WebGPU enhancements
        await this.loadThreeJS();
        this.createFull3DWorkshop(container);
    }
    
    async initMidRangeTier(container) {
        // Phase 3: Three.js scene with optimizations
        await this.loadThreeJS();
        this.createOptimized3DWorkshop(container);
    }
    
    async initBudgetTier(container) {
        // Phase 2: CSS 3D with basic GSAP animations
        await this.loadGSAP();
        this.createCSS3DWorkshop(container);
    }
    
    initFallbackTier(container) {
        // Phase 1: Pure CSS professional background
        this.createCSS3DWorkshop(container, { reducedMotion: true });
    }
    
    createCSS3DWorkshop(container, options = {}) {
        // Create professional tyre workshop scene using CSS 3D
        const workshopScene = document.createElement('div');
        workshopScene.className = 'workshop-3d-scene';
        workshopScene.innerHTML = `
            <div class="debug-indicator" style="
                position: absolute;
                top: 20px;
                left: 20px;
                color: #00ff00;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 0 0 5px #00ff00;
                z-index: 10;
                background: rgba(0,0,0,0.5);
                padding: 5px 10px;
                border-radius: 5px;
                pointer-events: none;
            ">🔧 3D WORKSHOP ACTIVE</div>
            <div class="workshop-floor"></div>
            <div class="workshop-walls">
                <div class="wall wall-back"></div>
                <div class="wall wall-left"></div>
                <div class="wall wall-right"></div>
            </div>
            <div class="floating-tools">
                <div class="tool torque-wrench" data-tool="torque-wrench">
                    <div class="tool-body"></div>
                    <div class="tool-handle"></div>
                </div>
                <div class="tool pressure-gauge" data-tool="pressure-gauge">
                    <div class="gauge-body"></div>
                    <div class="gauge-needle"></div>
                </div>
                <div class="tool hydraulic-jack" data-tool="hydraulic-jack">
                    <div class="jack-base"></div>
                    <div class="jack-arm"></div>
                </div>
                <div class="tool wheel-balancer" data-tool="wheel-balancer">
                    <div class="balancer-base"></div>
                    <div class="balancer-wheel"></div>
                </div>
            </div>
            <div class="workshop-lighting">
                <div class="light-beam light-1"></div>
                <div class="light-beam light-2"></div>
                <div class="light-beam light-3"></div>
            </div>
            <div class="ambient-particles"></div>
        `;
        
        // Add CSS for the 3D workshop
        this.injectWorkshopCSS(options.reducedMotion);
        
        // Position behind content but in front of any background
        workshopScene.style.position = 'fixed';
        workshopScene.style.top = '0';
        workshopScene.style.left = '0';
        workshopScene.style.width = '100%';
        workshopScene.style.height = '100%';
        workshopScene.style.zIndex = '-1';
        workshopScene.style.pointerEvents = 'none';
        
        container.appendChild(workshopScene);
        
        // Initialize animations if not reduced motion
        if (!options.reducedMotion && this.performanceTier !== 'fallback') {
            this.initToolAnimations();
        }
        
        this.updateProgressTodo('budget');
    }
    
    injectWorkshopCSS(reducedMotion = false) {
        const style = document.createElement('style');
        style.textContent = `
            .workshop-3d-scene {
                perspective: 1000px;
                perspective-origin: center center;
                overflow: hidden;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            }
            
            .workshop-floor {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 40%;
                background: linear-gradient(to bottom, 
                    rgba(45, 55, 72, 0.9) 0%,
                    rgba(26, 32, 44, 0.95) 100%);
                transform: rotateX(60deg) translateZ(-100px);
                transform-origin: bottom;
            }
            
            .workshop-walls {
                position: absolute;
                width: 100%;
                height: 100%;
            }
            
            .wall {
                position: absolute;
                background: linear-gradient(rgba(45, 55, 72, 0.6), rgba(26, 32, 44, 0.8));
            }
            
            .wall-back {
                top: 0;
                left: 10%;
                width: 80%;
                height: 60%;
                transform: translateZ(-200px);
            }
            
            .wall-left {
                top: 0;
                left: 0;
                width: 20%;
                height: 60%;
                transform: rotateY(45deg) translateZ(-100px);
                transform-origin: left;
            }
            
            .wall-right {
                top: 0;
                right: 0;
                width: 20%;
                height: 60%;
                transform: rotateY(-45deg) translateZ(-100px);
                transform-origin: right;
            }
            
            .floating-tools {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 2;
            }
            
            .tool {
                position: absolute;
                transform-style: preserve-3d;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .tool:hover {
                transform: scale(1.1) rotateY(15deg);
            }
            
            .torque-wrench {
                top: 20%;
                left: 15%;
                width: 60px;
                height: 200px;
                transform: rotateZ(45deg) rotateX(20deg);
            }
            
            .tool-body {
                width: 100%;
                height: 70%;
                background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
            }
            
            .tool-handle {
                width: 60%;
                height: 30%;
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                border-radius: 12px;
                margin: 5px auto;
            }
            
            .pressure-gauge {
                top: 30%;
                right: 20%;
                width: 80px;
                height: 80px;
                transform: rotateX(30deg) rotateY(-15deg);
            }
            
            .gauge-body {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, #f39c12 0%, #e67e22 100%);
                border-radius: 50%;
                box-shadow: 0 6px 16px rgba(243, 156, 18, 0.4);
                position: relative;
            }
            
            .gauge-needle {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 2px;
                height: 30px;
                background: #c0392b;
                transform-origin: bottom;
                transform: translate(-50%, -100%) rotate(45deg);
                ${reducedMotion ? '' : 'animation: gaugeNeedle 3s ease-in-out infinite alternate;'}
            }
            
            .hydraulic-jack {
                bottom: 30%;
                left: 25%;
                width: 70px;
                height: 100px;
                transform: rotateY(25deg) rotateX(10deg);
            }
            
            .jack-base {
                width: 100%;
                height: 60%;
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                border-radius: 8px 8px 0 0;
                box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
            }
            
            .jack-arm {
                width: 20px;
                height: 40%;
                background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
                margin: 0 auto;
                border-radius: 4px;
                ${reducedMotion ? '' : 'animation: jackPump 2.5s ease-in-out infinite;'}
            }
            
            .wheel-balancer {
                top: 50%;
                right: 15%;
                width: 90px;
                height: 90px;
                transform: rotateY(-30deg) rotateX(20deg);
            }
            
            .balancer-base {
                width: 100%;
                height: 30px;
                background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
            }
            
            .balancer-wheel {
                width: 60px;
                height: 60px;
                background: radial-gradient(circle, #34495e 30%, #2c3e50 100%);
                border-radius: 50%;
                margin: 10px auto 0;
                border: 3px solid #95a5a6;
                ${reducedMotion ? '' : 'animation: wheelSpin 4s linear infinite;'}
            }
            
            .workshop-lighting {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            
            .light-beam {
                position: absolute;
                background: radial-gradient(ellipse, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                border-radius: 50%;
                ${reducedMotion ? '' : 'animation: lightFlicker 6s ease-in-out infinite alternate;'}
            }
            
            .light-1 {
                top: 10%;
                left: 20%;
                width: 200px;
                height: 300px;
                animation-delay: 0s;
            }
            
            .light-2 {
                top: 15%;
                right: 30%;
                width: 180px;
                height: 250px;
                animation-delay: 2s;
            }
            
            .light-3 {
                top: 20%;
                left: 50%;
                width: 160px;
                height: 200px;
                animation-delay: 4s;
            }
            
            .ambient-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                background-image: 
                    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
                    radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
                    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent),
                    radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.3), transparent);
                background-repeat: repeat;
                background-size: 200px 100px;
                ${reducedMotion ? '' : 'animation: particleFloat 20s linear infinite;'}
            }
            
            ${reducedMotion ? '' : `
            @keyframes gaugeNeedle {
                0% { transform: translate(-50%, -100%) rotate(0deg); }
                100% { transform: translate(-50%, -100%) rotate(90deg); }
            }
            
            @keyframes jackPump {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes wheelSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes lightFlicker {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            @keyframes particleFloat {
                0% { transform: translateY(0); }
                100% { transform: translateY(-100px); }
            }
            `}
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                .tool {
                    transform: scale(0.8);
                }
                
                .light-beam {
                    opacity: 0.5;
                }
                
                .ambient-particles {
                    opacity: 0.3;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .workshop-3d-scene {
                    background: #000;
                }
                
                .tool {
                    border: 2px solid #fff;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .tool, .gauge-needle, .jack-arm, .balancer-wheel, .light-beam, .ambient-particles {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    initToolAnimations() {
        // Add interactive hover effects and floating animations
        const tools = document.querySelectorAll('.tool');
        tools.forEach(tool => {
            tool.addEventListener('mouseenter', () => {
                tool.style.transform += ' translateZ(20px)';
            });
            
            tool.addEventListener('mouseleave', () => {
                tool.style.transform = tool.style.transform.replace(' translateZ(20px)', '');
            });
        });
    }
    
    async loadGSAP() {
        if (window.gsap) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    async loadThreeJS() {
        if (window.THREE) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    createFull3DWorkshop(container) {
        // Phase 3: Full Three.js implementation
        console.log('Creating full 3D workshop scene...');
        // Implementation for Phase 3 would go here
        this.updateProgressTodo('flagship');
    }
    
    createOptimized3DWorkshop(container) {
        // Phase 3: Optimized Three.js implementation  
        console.log('Creating optimized 3D workshop scene...');
        // Implementation for Phase 3 would go here
        this.updateProgressTodo('midRange');
    }
    
    fallbackToBasicBackground() {
        // Ensure we always have a professional background even if everything fails
        const style = document.createElement('style');
        style.textContent = `
            body {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    updateProgressTodo(tier) {
        console.log(`3D Background initialized with ${tier} tier`);
        // In a real implementation, this would update the todo system
    }
}

let tyreHeroBackgroundInstance = null;

export function initTyreHeroBackground(options = {}) {
    tyreHeroBackgroundInstance = new TyreHero3DBackground(options);
    return tyreHeroBackgroundInstance;
}
