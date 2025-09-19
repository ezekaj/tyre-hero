// Performance Monitoring Utilities

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isSupported = 'PerformanceObserver' in window;

    if (this.isSupported) {
      this.init();
    }
  }

  init() {
    this.observeResourceLoading();
    this.observeLongTasks();
    this.observeLayoutShifts();
    this.observeFirstInput();
    this.observeLargestContentfulPaint();
  }

  // Monitor resource loading performance
  observeResourceLoading() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Resources taking more than 1 second
          this.logSlowResource(entry);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  // Monitor long tasks that block main thread
  observeLongTasks() {
    if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logLongTask(entry);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    }
  }

  // Monitor layout shifts (CLS)
  observeLayoutShifts() {
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }

      // Log if CLS is getting high
      if (clsValue > 0.1) {
        this.logHighCLS(clsValue, clsEntries);
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('layout-shift', observer);
  }

  // Monitor first input delay
  observeFirstInput() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.logFirstInputDelay(entry);
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('first-input', observer);
  }

  // Monitor largest contentful paint
  observeLargestContentfulPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.logLCP(lastEntry);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', observer);
  }

  // Logging methods
  logSlowResource(entry) {
    console.warn('Slow resource detected:', {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType
    });

    this.metrics.set('slow_resource', {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: Date.now()
    });
  }

  logLongTask(entry) {
    console.warn('Long task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution
    });

    this.metrics.set('long_task', {
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    });
  }

  logHighCLS(value, entries) {
    console.warn('High Cumulative Layout Shift:', {
      cls: value,
      shifts: entries.length
    });

    this.metrics.set('high_cls', {
      value,
      shifts: entries.length,
      timestamp: Date.now()
    });
  }

  logFirstInputDelay(entry) {
    const fid = entry.processingStart - entry.startTime;

    if (fid > 100) { // FID > 100ms is poor
      console.warn('High First Input Delay:', {
        fid,
        eventType: entry.name,
        startTime: entry.startTime
      });
    }

    this.metrics.set('first_input_delay', {
      fid,
      eventType: entry.name,
      timestamp: Date.now()
    });
  }

  logLCP(entry) {
    const lcp = entry.startTime;

    if (lcp > 2500) { // LCP > 2.5s is poor
      console.warn('Slow Largest Contentful Paint:', {
        lcp,
        element: entry.element,
        url: entry.url
      });
    }

    this.metrics.set('lcp', {
      value: lcp,
      element: entry.element?.tagName || 'unknown',
      timestamp: Date.now()
    });
  }

  // Memory monitoring
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const memoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };

      if (memoryInfo.used > 50) { // More than 50MB
        console.warn('High memory usage:', memoryInfo);
      }

      return memoryInfo;
    }
    return null;
  }

  // Network information
  getNetworkInfo() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  // Generate performance report
  getPerformanceReport() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      navigation: {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        connection: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
        totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
      },
      paint: {
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        fp: paint.find(entry => entry.name === 'first-paint')?.startTime || 0
      },
      memory: this.monitorMemoryUsage(),
      network: this.getNetworkInfo(),
      metrics: Object.fromEntries(this.metrics),
      timestamp: Date.now()
    };
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [performanceData, setPerformanceData] = React.useState(null);

  React.useEffect(() => {
    // Generate report after component mount
    const timer = setTimeout(() => {
      setPerformanceData(performanceMonitor.getPerformanceReport());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return performanceData;
}