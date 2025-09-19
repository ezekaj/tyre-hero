/**
 * Web Core Vitals monitoring and optimization utilities
 * Measures and reports performance metrics for optimization
 */

// Web Vitals thresholds (Google recommended)
export const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
};

/**
 * Performance observer for Core Web Vitals
 */
class WebVitalsMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.initialized = true;
  }

  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.set('LCP', {
        value: lastEntry.startTime,
        rating: this.getRating(lastEntry.startTime, THRESHOLDS.LCP),
        element: lastEntry.element,
        timestamp: Date.now()
      });

      this.reportMetric('LCP', lastEntry.startTime);
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        this.metrics.set('FID', {
          value: entry.processingStart - entry.startTime,
          rating: this.getRating(entry.processingStart - entry.startTime, THRESHOLDS.FID),
          timestamp: Date.now()
        });

        this.reportMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.metrics.set('CLS', {
              value: clsValue,
              rating: this.getRating(clsValue, THRESHOLDS.CLS),
              timestamp: Date.now()
            });

            this.reportMetric('CLS', clsValue);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.set('FCP', {
            value: entry.startTime,
            rating: this.getRating(entry.startTime, THRESHOLDS.FCP),
            timestamp: Date.now()
          });

          this.reportMetric('FCP', entry.startTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    } catch (e) {
      console.warn('FCP observation not supported');
    }
  }

  observeTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart;

        this.metrics.set('TTFB', {
          value: ttfb,
          rating: this.getRating(ttfb, THRESHOLDS.TTFB),
          timestamp: Date.now()
        });

        this.reportMetric('TTFB', ttfb);
      }
    } catch (e) {
      console.warn('TTFB measurement not supported');
    }
  }

  getRating(value, thresholds) {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  reportMetric(name, value) {
    // Report to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c${name}: ${Math.round(value)}ms`, `color: ${this.getColor(name, value)}`);
    }
  }

  getColor(name, value) {
    const rating = this.getRating(value, THRESHOLDS[name]);
    switch (rating) {
      case 'good': return 'green';
      case 'needs-improvement': return 'orange';
      case 'poor': return 'red';
      default: return 'blue';
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

/**
 * React hook for Web Vitals monitoring
 */
export const useWebVitals = (callback) => {
  useEffect(() => {
    webVitalsMonitor.init();

    if (callback) {
      const interval = setInterval(() => {
        callback(webVitalsMonitor.getMetrics());
      }, 5000);

      return () => clearInterval(interval);
    }

    return () => {
      webVitalsMonitor.disconnect();
    };
  }, [callback]);

  return webVitalsMonitor.getMetrics();
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  // Preload critical resources
  preloadResource: (href, as = 'script', crossorigin = null) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  },

  // Prefetch non-critical resources
  prefetchResource: (href) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Critical resource hints
  addResourceHints: () => {
    // DNS prefetch for external domains
    const domains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical origins
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  },

  // Measure custom metrics
  measureCustomMetric: (name, startMark, endMark) => {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
      return 0;
    }
  },

  // Mark performance points
  mark: (name) => {
    try {
      performance.mark(name);
    } catch (e) {
      console.warn(`Failed to mark ${name}:`, e);
    }
  }
};

// Auto-initialize for production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  webVitalsMonitor.init();
  performanceUtils.addResourceHints();
}