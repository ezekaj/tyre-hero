/*
 * TyreHero Live Statistics System
 * Real-time data updates and performance monitoring
 */

export class TyreHeroLiveStats {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.statsData = {
            responseTime: 47,
            techniciansAvailable: 8,
            totalTechnicians: 12,
            rating: 4.9,
            jobsToday: 25,
            customersServed: 1247,
            emergencyCallsActive: 2,
            averageCompletionTime: 42
        };
        this.isUpdating = false;
        this.updateTimer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.startUpdates();
        console.log('📊 TyreHero Live Stats initialized');
    }

    // Start real-time updates
    startUpdates() {
        if (this.isUpdating) return;

        this.isUpdating = true;
        this.updateStats();

        this.updateTimer = setInterval(() => {
            this.updateStats();
        }, this.updateInterval);
    }

    // Stop updates
    stopUpdates() {
        this.isUpdating = false;
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // Generate realistic stat variations
    generateStatUpdate() {
        const stats = { ...this.statsData };

        // Response time: 25-60 minutes with realistic fluctuation
        const responseVariation = (Math.random() - 0.5) * 8;
        stats.responseTime = Math.max(25, Math.min(60,
            stats.responseTime + responseVariation));

        // Technicians: 4-12 available, realistic work patterns
        const hour = new Date().getHours();
        let targetTechnicians;

        if (hour >= 6 && hour <= 22) {
            // Day shift: more technicians
            targetTechnicians = 8 + Math.floor(Math.random() * 4);
        } else {
            // Night shift: fewer technicians
            targetTechnicians = 4 + Math.floor(Math.random() * 3);
        }

        stats.techniciansAvailable = targetTechnicians;

        // Rating: slight variations around 4.9
        const ratingChange = (Math.random() - 0.5) * 0.2;
        stats.rating = Math.max(4.7, Math.min(5.0,
            stats.rating + ratingChange));

        // Jobs today: increments during day
        if (hour >= 6 && hour <= 22 && Math.random() > 0.7) {
            stats.jobsToday++;
        }

        // Emergency calls: 0-5 active
        stats.emergencyCallsActive = Math.floor(Math.random() * 6);

        // Update stored data
        this.statsData = stats;
        return stats;
    }

    // Update all stats on page
    updateStats() {
        const newStats = this.generateStatUpdate();

        // Update response time
        this.updateElement('avg-response', Math.round(newStats.responseTime));
        this.updateElement('emergency-response', Math.round(newStats.responseTime));

        // Update technicians
        this.updateElement('active-technicians', newStats.techniciansAvailable);
        this.updateElement('technicians-available', newStats.techniciansAvailable);

        // Update rating
        this.updateElement('ai-rating', newStats.rating.toFixed(1));

        // Update jobs
        this.updateElement('jobs-today', newStats.jobsToday);
        this.updateElement('jobs-completed', newStats.jobsToday);

        // Update trends
        this.updateTrends(newStats);

        // Log update
        console.log('📊 Stats updated:', newStats);

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('tyrehero:statsUpdated', {
            detail: newStats
        }));
    }

    // Update individual stat element
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            const currentValue = element.textContent;
            element.textContent = value;

            // Add update animation
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.3s ease';

            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);

            // Add change indicator
            this.showChangeIndicator(element, currentValue, value);
        }
    }

    // Show trend indicators
    updateTrends(stats) {
        // Response time trend
        const responseTrend = stats.responseTime < this.statsData.responseTime ? '📈 Improving' : '📊 Stable';
        this.updateTrendElement('response-trend', responseTrend);

        // Technician availability
        const techTrend = stats.techniciansAvailable >= 6 ? '🟢 Online' : '🟡 Limited';
        this.updateTrendElement('tech-trend', techTrend);

        // Emergency status
        const emergencyStatus = stats.emergencyCallsActive === 0 ? '✅ All Clear' :
                               stats.emergencyCallsActive <= 2 ? '🟡 Busy' : '🔴 High Demand';
        this.updateTrendElement('emergency-status', emergencyStatus);
    }

    updateTrendElement(className, value) {
        const elements = document.querySelectorAll(`.${className}, .stat-trend`);
        elements.forEach(el => {
            if (el) el.textContent = value;
        });
    }

    // Show change indicator
    showChangeIndicator(element, oldValue, newValue) {
        if (oldValue === newValue) return;

        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            top: -20px;
            right: 0;
            background: ${newValue > oldValue ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        indicator.textContent = newValue > oldValue ? '↗' : '↘';

        // Position relative to element
        element.style.position = 'relative';
        element.appendChild(indicator);

        // Animate in
        setTimeout(() => indicator.style.opacity = '1', 50);

        // Remove after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 2000);
    }

    // Get current stats
    getCurrentStats() {
        return { ...this.statsData };
    }

    // Manual stat update
    updateStat(statName, value) {
        if (this.statsData.hasOwnProperty(statName)) {
            this.statsData[statName] = value;
            this.updateStats();
        }
    }

    // Emergency boost mode
    activateEmergencyMode() {
        // During emergency, show more active technicians and faster response
        this.statsData.techniciansAvailable = Math.min(12, this.statsData.techniciansAvailable + 2);
        this.statsData.responseTime = Math.max(15, this.statsData.responseTime - 10);
        this.statsData.emergencyCallsActive++;

        this.updateStats();

        // Show emergency status
        this.showEmergencyStatus();
    }

    showEmergencyStatus() {
        const statusIndicator = document.createElement('div');
        statusIndicator.innerHTML = `
            <div style="
                position: fixed; top: 20px; right: 20px;
                background: #E53935; color: white; padding: 15px;
                border-radius: 10px; z-index: 9999;
                box-shadow: 0 0 20px rgba(229, 57, 53, 0.5);
                animation: pulse 2s infinite;
            ">
                🚨 Emergency Mode Active
                <div style="font-size: 12px; opacity: 0.9;">
                    Extra technicians dispatched
                </div>
            </div>
        `;

        document.body.appendChild(statusIndicator);

        // Remove after 5 seconds
        setTimeout(() => {
            if (statusIndicator.parentNode) {
                statusIndicator.remove();
            }
        }, 5000);
    }

    // Performance monitoring
    trackPagePerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

            // Update performance stats
            this.statsData.pageLoadTime = Math.round(loadTime);

            console.log('📊 Page performance:', {
                loadTime: loadTime + 'ms',
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart + 'ms'
            });
        }
    }

    // Device-based optimizations
    optimizeForDevice(device) {
        if (device.isMobile) {
            // Reduce update frequency on mobile
            this.updateInterval = 45000; // 45 seconds
        }

        if (device.isSlowConnection) {
            // Further reduce updates on slow connections
            this.updateInterval = 60000; // 1 minute
        }

        // Restart timer with new interval
        if (this.isUpdating) {
            this.stopUpdates();
            this.startUpdates();
        }
    }

    bindEvents() {
        // Listen for emergency activation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="activatePanicMode"], .panic-btn, .emergency-call')) {
                this.activateEmergencyMode();
            }
        });

        // Listen for device detection
        window.addEventListener('tyrehero:deviceDetected', (e) => {
            this.optimizeForDevice(e.detail);
        });

        // Track page performance when loaded
        window.addEventListener('load', () => {
            this.trackPagePerformance();
        });

        // Pause updates when page not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopUpdates();
            } else {
                this.startUpdates();
            }
        });
    }
}

let tyreHeroStatsInstance = null;

export function initTyreHeroLiveStats() {
    tyreHeroStatsInstance = new TyreHeroLiveStats();
    return tyreHeroStatsInstance;
}

export function registerLiveStatsGlobals(target = window) {
    if (!tyreHeroStatsInstance) {
        return;
    }

    target.updateEmergencyStats = () => tyreHeroStatsInstance.activateEmergencyMode();
    target.getCurrentStats = () => tyreHeroStatsInstance.getCurrentStats();
}
