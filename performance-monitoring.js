/**
 * TyreHero Performance Monitoring
 * Advanced performance tracking and Core Web Vitals monitoring
 */

(function() {
    'use strict';
    
    // Performance monitoring configuration
    const PERF_CONFIG = {
        // Core Web Vitals thresholds (milliseconds)
        thresholds: {
            LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
            FID: { good: 100, poor: 300 },   // First Input Delay
            CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
            TTFB: { good: 800, poor: 1800 }, // Time to First Byte
            FCP: { good: 1800, poor: 3000 }  // First Contentful Paint
        },
        
        // Sampling rate (0-1)
        sampleRate: 1.0, // 100% for emergency service monitoring
        
        // Emergency page specific monitoring
        emergencyPageTracking: true,
        
        // Performance budget alerts
        budgetAlerts: {
            enabled: true,
            maxLoadTime: 3000, // 3 seconds for emergency pages
            maxBundleSize: 500000, // 500KB
            maxImageSize: 200000  // 200KB per image
        }
    };
    
    // Performance metrics storage
    const performanceMetrics = {
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null,
        FCP: null,
        resourceTimings: [],
        userTimings: [],
        emergencyMetrics: {}
    };
    
    // Initialize performance monitoring
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    } else {
        initPerformanceMonitoring();
    }
    
    function initPerformanceMonitoring() {
        setupCoreWebVitals();
        setupResourcePerformanceMonitoring();
        setupUserTimingAPI();
        setupMemoryMonitoring();
        setupNetworkMonitoring();
        setupEmergencySpecificTracking();
        setupPerformanceBudgetMonitoring();
        
        console.log('TyreHero Performance Monitoring initialized');
        
        // Send initial performance report
        setTimeout(sendPerformanceReport, 5000);
    }
    
    /**
     * Core Web Vitals monitoring
     */
    function setupCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                performanceMetrics.LCP = {
                    value: lastEntry.startTime,
                    element: lastEntry.element?.tagName || 'unknown',
                    url: lastEntry.url || '',
                    timestamp: Date.now(),
                    rating: getRating(lastEntry.startTime, PERF_CONFIG.thresholds.LCP)
                };
                
                console.log('LCP:', performanceMetrics.LCP);
                
                // Track poor LCP on emergency pages
                if (isEmergencyPage() && performanceMetrics.LCP.rating === 'poor') {
                    trackEvent('poor_lcp_emergency', {
                        value: lastEntry.startTime,
                        element: lastEntry.element?.tagName
                    });
                }
                
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const fidValue = entry.processingStart - entry.startTime;
                    
                    performanceMetrics.FID = {
                        value: fidValue,
                        name: entry.name,
                        timestamp: Date.now(),
                        rating: getRating(fidValue, PERF_CONFIG.thresholds.FID)
                    };
                    
                    console.log('FID:', performanceMetrics.FID);
                    
                    // Critical for emergency interactions
                    if (isEmergencyPage() && performanceMetrics.FID.rating === 'poor') {
                        trackEvent('poor_fid_emergency', {
                            value: fidValue,
                            interaction: entry.name
                        });
                    }
                }
            }).observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            let clsEntries = [];
            
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push({
                            value: entry.value,
                            sources: entry.sources?.map(source => ({
                                element: source.element?.tagName || 'unknown',
                                currentRect: source.currentRect,
                                previousRect: source.previousRect
                            })) || []
                        });
                    }
                }
                
                performanceMetrics.CLS = {
                    value: clsValue,
                    entries: clsEntries,
                    timestamp: Date.now(),
                    rating: getRating(clsValue, PERF_CONFIG.thresholds.CLS)
                };
                
                console.log('CLS:', performanceMetrics.CLS.value);
                
                // Layout shifts are critical for emergency forms
                if (isEmergencyPage() && clsValue > PERF_CONFIG.thresholds.CLS.poor) {
                    trackEvent('high_cls_emergency', {
                        value: clsValue,
                        entries: clsEntries.length
                    });
                }
                
            }).observe({ entryTypes: ['layout-shift'] });
            
            // First Contentful Paint (FCP)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        performanceMetrics.FCP = {
                            value: entry.startTime,
                            timestamp: Date.now(),
                            rating: getRating(entry.startTime, PERF_CONFIG.thresholds.FCP)
                        };
                        
                        console.log('FCP:', performanceMetrics.FCP);
                    }
                }
            }).observe({ entryTypes: ['paint'] });
        }
        
        // Time to First Byte (TTFB)
        if (window.performance && performance.timing) {
            window.addEventListener('load', () => {
                const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
                
                performanceMetrics.TTFB = {
                    value: ttfb,
                    timestamp: Date.now(),
                    rating: getRating(ttfb, PERF_CONFIG.thresholds.TTFB)
                };
                
                console.log('TTFB:', performanceMetrics.TTFB);
            });
        }
    }
    
    /**
     * Resource performance monitoring
     */
    function setupResourcePerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const resourceTiming = {
                        name: entry.name,
                        type: getResourceType(entry.name),
                        duration: entry.duration,
                        transferSize: entry.transferSize || 0,
                        encodedBodySize: entry.encodedBodySize || 0,
                        decodedBodySize: entry.decodedBodySize || 0,
                        startTime: entry.startTime,
                        timestamp: Date.now()
                    };
                    
                    performanceMetrics.resourceTimings.push(resourceTiming);
                    
                    // Monitor slow resources
                    if (entry.duration > 2000) {
                        trackEvent('slow_resource', {
                            name: entry.name,
                            duration: entry.duration,
                            type: resourceTiming.type
                        });
                    }
                    
                    // Monitor large resources
                    if (entry.transferSize > PERF_CONFIG.budgetAlerts.maxImageSize && 
                        resourceTiming.type === 'image') {
                        trackEvent('large_image', {
                            name: entry.name,
                            size: entry.transferSize
                        });
                    }
                }
            }).observe({ entryTypes: ['resource'] });
        }
    }
    
    /**
     * User Timing API monitoring
     */
    function setupUserTimingAPI() {
        // Add custom emergency timing marks
        if (isEmergencyPage()) {
            performance.mark('emergency-page-start');
            
            // Mark when emergency form is ready
            const form = document.getElementById('emergencyForm');
            if (form) {
                const observer = new MutationObserver(() => {
                    if (form.offsetHeight > 0) {
                        performance.mark('emergency-form-ready');
                        performance.measure('emergency-form-render', 'emergency-page-start', 'emergency-form-ready');
                        observer.disconnect();
                    }
                });
                observer.observe(form, { attributes: true, childList: true, subtree: true });
            }
            
            // Mark when emergency call button is visible
            const callButton = document.querySelector('.emergency-call-fixed');
            if (callButton) {
                const buttonObserver = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        performance.mark('emergency-call-visible');
                        performance.measure('emergency-call-render', 'emergency-page-start', 'emergency-call-visible');
                        buttonObserver.disconnect();
                    }
                });
                buttonObserver.observe(callButton);
            }
        }
        
        // Monitor user timing entries
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    performanceMetrics.userTimings.push({
                        name: entry.name,
                        entryType: entry.entryType,
                        startTime: entry.startTime,
                        duration: entry.duration,
                        timestamp: Date.now()
                    });
                }
            }).observe({ entryTypes: ['measure', 'mark'] });
        }
    }
    
    /**
     * Memory monitoring
     */
    function setupMemoryMonitoring() {
        if ('memory' in performance) {
            const checkMemory = () => {
                const memory = performance.memory;
                const memoryInfo = {
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                // Alert on high memory usage
                const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                if (memoryUsagePercent > 80) {
                    trackEvent('high_memory_usage', {
                        percentage: memoryUsagePercent,
                        used: memory.usedJSHeapSize,
                        limit: memory.jsHeapSizeLimit
                    });
                }
                
                return memoryInfo;
            };
            
            // Check memory every 30 seconds
            setInterval(() => {
                const memoryInfo = checkMemory();
                console.log('Memory usage:', memoryInfo);
            }, 30000);
        }
    }
    
    /**
     * Network monitoring
     */
    function setupNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
            console.log('Network info:', networkInfo);
            
            // Track slow connections on emergency pages
            if (isEmergencyPage() && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
                trackEvent('slow_connection_emergency', networkInfo);
            }
            
            // Monitor connection changes
            connection.addEventListener('change', () => {
                const newNetworkInfo = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                    timestamp: Date.now()
                };
                
                console.log('Network changed:', newNetworkInfo);
                trackEvent('network_change', newNetworkInfo);
            });
        }
    }
    
    /**
     * Emergency-specific performance tracking
     */
    function setupEmergencySpecificTracking() {
        if (!isEmergencyPage()) return;
        
        // Track emergency call button interactions
        const callButton = document.querySelector('.emergency-call-fixed a, a[href^="tel:"]');
        if (callButton) {
            let clickStartTime;
            
            callButton.addEventListener('mousedown', () => {
                clickStartTime = performance.now();
            });
            
            callButton.addEventListener('click', () => {
                if (clickStartTime) {
                    const clickDuration = performance.now() - clickStartTime;
                    
                    performanceMetrics.emergencyMetrics.callButtonResponse = {
                        duration: clickDuration,
                        timestamp: Date.now()
                    };
                    
                    trackEvent('emergency_call_response', { duration: clickDuration });
                    
                    // Alert if button response is slow
                    if (clickDuration > 200) {
                        trackEvent('slow_emergency_button', { duration: clickDuration });
                    }
                }
            });
        }
        
        // Track form submission performance
        const emergencyForm = document.getElementById('emergencyForm');
        if (emergencyForm) {
            emergencyForm.addEventListener('submit', () => {
                performance.mark('emergency-form-submit-start');
            });
            
            // Track location acquisition performance
            if (navigator.geolocation) {
                const locationStartTime = performance.now();
                
                navigator.geolocation.getCurrentPosition(
                    () => {
                        const locationDuration = performance.now() - locationStartTime;
                        performanceMetrics.emergencyMetrics.locationAcquisition = {
                            duration: locationDuration,
                            success: true,
                            timestamp: Date.now()
                        };
                        
                        trackEvent('location_acquisition', { 
                            duration: locationDuration, 
                            success: true 
                        });
                    },
                    () => {
                        const locationDuration = performance.now() - locationStartTime;
                        performanceMetrics.emergencyMetrics.locationAcquisition = {
                            duration: locationDuration,
                            success: false,
                            timestamp: Date.now()
                        };
                        
                        trackEvent('location_acquisition', { 
                            duration: locationDuration, 
                            success: false 
                        });
                    },
                    { timeout: 10000 }
                );
            }
        }
    }
    
    /**
     * Performance budget monitoring
     */
    function setupPerformanceBudgetMonitoring() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                
                // Check load time budget
                if (loadTime > PERF_CONFIG.budgetAlerts.maxLoadTime) {
                    trackEvent('performance_budget_exceeded', {
                        metric: 'load_time',
                        value: loadTime,
                        budget: PERF_CONFIG.budgetAlerts.maxLoadTime,
                        page: isEmergencyPage() ? 'emergency' : 'normal'
                    });
                }
                
                // Check bundle size
                const jsResources = performanceMetrics.resourceTimings.filter(r => r.type === 'script');
                const totalJSSize = jsResources.reduce((sum, resource) => sum + resource.transferSize, 0);
                
                if (totalJSSize > PERF_CONFIG.budgetAlerts.maxBundleSize) {
                    trackEvent('performance_budget_exceeded', {
                        metric: 'bundle_size',
                        value: totalJSSize,
                        budget: PERF_CONFIG.budgetAlerts.maxBundleSize
                    });
                }
                
            }, 1000);
        });
    }
    
    /**
     * Send performance report
     */
    function sendPerformanceReport() {
        const report = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            isEmergencyPage: isEmergencyPage(),
            metrics: performanceMetrics,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // Send to analytics endpoint (replace with actual endpoint)
        if (shouldSampleRequest()) {
            console.log('Performance Report:', report);
            
            // Example: Send to Google Analytics 4
            if (typeof gtag !== 'undefined') {
                // Send Core Web Vitals to GA4
                if (performanceMetrics.LCP) {
                    gtag('event', 'lcp', {
                        value: Math.round(performanceMetrics.LCP.value),
                        custom_parameter_1: performanceMetrics.LCP.rating
                    });
                }
                
                if (performanceMetrics.FID) {
                    gtag('event', 'fid', {
                        value: Math.round(performanceMetrics.FID.value),
                        custom_parameter_1: performanceMetrics.FID.rating
                    });
                }
                
                if (performanceMetrics.CLS) {
                    gtag('event', 'cls', {
                        value: Math.round(performanceMetrics.CLS.value * 1000), // Scale up for GA4
                        custom_parameter_1: performanceMetrics.CLS.rating
                    });
                }
            }
            
            // Send to custom analytics endpoint
            // fetch('/api/performance-metrics', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(report)
            // }).catch(console.error);
        }
    }
    
    /**
     * Utility functions
     */
    function getRating(value, thresholds) {
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.poor) return 'needs-improvement';
        return 'poor';
    }
    
    function getResourceType(url) {
        if (url.match(/\.(js|mjs)$/)) return 'script';
        if (url.match(/\.(css)$/)) return 'stylesheet';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        return 'other';
    }
    
    function isEmergencyPage() {
        return window.location.pathname.includes('emergency') || 
               window.location.pathname === '/' ||
               document.body.classList.contains('emergency-page');
    }
    
    function shouldSampleRequest() {
        return Math.random() < PERF_CONFIG.sampleRate;
    }
    
    function trackEvent(eventName, params = {}) {
        console.log('Performance Event:', eventName, params);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Performance',
                emergency_page: isEmergencyPage(),
                ...params
            });
        }
    }
    
    // Expose performance data for debugging
    window.TyreHeroPerformance = {
        metrics: performanceMetrics,
        config: PERF_CONFIG,
        sendReport: sendPerformanceReport,
        isEmergencyPage: isEmergencyPage
    };
    
    // Send performance report on page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendPerformanceReport();
        }
    });
    
    // Send report before page unload
    window.addEventListener('beforeunload', () => {
        sendPerformanceReport();
    });
    
})();