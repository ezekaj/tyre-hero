/**
 * Performance Monitoring System for 3D Hero Background
 * Ensures emergency functionality is never compromised
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            frameRate: 0,
            memoryUsage: 0,
            emergencyButtonResponsive: true,
            backgroundRendering: false
        };
        
        this.emergencyThresholds = {
            maxLoadTime: 5000,    // 5 seconds max
            minFrameRate: 30,     // 30fps minimum
            maxMemoryUsage: 50    // 50MB max
        };
        
        this.init();
    }
    
    init() {
        this.monitorLoadTime();
        this.monitorFrameRate();
        this.monitorMemoryUsage();
        this.monitorEmergencyButton();
        this.setupPerformanceObserver();
    }
    
    monitorLoadTime() {
        const startTime = performance.now();
        
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - startTime;
            
            if (this.metrics.loadTime > this.emergencyThresholds.maxLoadTime) {
                console.warn('3D Background load time exceeded emergency threshold');
                this.fallbackToSafeMode();
            }
        });
    }
    
    monitorFrameRate() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFrameRate = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                if (this.metrics.frameRate < this.emergencyThresholds.minFrameRate) {
                    console.warn('Frame rate below emergency threshold');
                    this.optimizePerformance();
                }
            }
            
            requestAnimationFrame(measureFrameRate);
        };
        
        requestAnimationFrame(measureFrameRate);
    }
    
    monitorMemoryUsage() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                if (this.metrics.memoryUsage > this.emergencyThresholds.maxMemoryUsage) {
                    console.warn('Memory usage exceeded emergency threshold');
                    this.optimizeMemoryUsage();
                }
            }, 2000);
        }
    }
    
    monitorEmergencyButton() {
        const checkButtonResponsiveness = () => {
            const emergencyButton = document.querySelector('.emergency-call-btn');
            if (emergencyButton) {
                const startTime = performance.now();
                
                emergencyButton.addEventListener('touchstart', () => {
                    const responseTime = performance.now() - startTime;
                    this.metrics.emergencyButtonResponsive = responseTime < 100; // 100ms threshold
                }, { once: true, passive: true });
            }
        };
        
        // Check periodically
        setInterval(checkButtonResponsiveness, 5000);
    }
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('3d-hero-background')) {
                        console.log('3D Background Performance:', entry);
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
            } catch (e) {
                console.log('Performance Observer not fully supported');
            }
        }
    }
    
    fallbackToSafeMode() {
        // Disable 3D features and ensure emergency functionality
        const workshopScene = document.querySelector('.workshop-3d-scene');
        if (workshopScene) {
            workshopScene.style.display = 'none';
        }
        
        // Ensure emergency button is always accessible
        const emergencyButton = document.querySelector('.emergency-call-btn');
        if (emergencyButton) {
            emergencyButton.style.position = 'relative';
            emergencyButton.style.zIndex = '9999';
            emergencyButton.style.background = '#FF0000';
        }
        
        console.log('Switched to safe mode - emergency functionality preserved');
    }
    
    optimizePerformance() {
        // Reduce animation complexity
        const tools = document.querySelectorAll('.tool');
        tools.forEach(tool => {
            tool.style.animation = 'none';
        });
        
        // Reduce particle effects
        const particles = document.querySelector('.ambient-particles');
        if (particles) {
            particles.style.opacity = '0.1';
        }
    }
    
    optimizeMemoryUsage() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Reduce visual effects
        const lightBeams = document.querySelectorAll('.light-beam');
        lightBeams.forEach(beam => {
            beam.style.display = 'none';
        });
    }
    
    getPerformanceReport() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            emergency_safe: this.metrics.emergencyButtonResponsive && 
                           this.metrics.loadTime < this.emergencyThresholds.maxLoadTime
        };
    }
}

// Initialize performance monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
    
    // Expose performance data for debugging
    window.getPerformanceReport = () => window.performanceMonitor.getPerformanceReport();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}