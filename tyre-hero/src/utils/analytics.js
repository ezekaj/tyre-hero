// Analytics and Monitoring Configuration

class Analytics {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    this.sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    this.hotjarId = import.meta.env.VITE_HOTJAR_ID;
    this.clarityId = import.meta.env.VITE_CLARITY_ID;

    this.init();
  }

  init() {
    if (!this.isProduction) {
      console.log('Analytics disabled in development mode');
      return;
    }

    this.initSentry();
    this.initGoogleAnalytics();
    this.initHotjar();
    this.initClarity();
    this.initPerformanceMonitoring();
  }

  // Sentry Error Tracking
  initSentry() {
    if (!this.sentryDsn) return;

    import('@sentry/react').then(({ init, BrowserTracing }) => {
      init({
        dsn: this.sentryDsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
        integrations: [
          new BrowserTracing(),
        ],
        tracesSampleRate: 0.1,
        release: import.meta.env.VITE_APP_VERSION || '1.0.0',
        beforeSend(event) {
          // Filter out non-critical errors
          if (event.exception) {
            const error = event.exception.values[0];
            if (error.value && error.value.includes('ChunkLoadError')) {
              return null; // Don't send chunk load errors
            }
          }
          return event;
        }
      });
    });
  }

  // Google Analytics
  initGoogleAnalytics() {
    if (!this.gaId) return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  // Hotjar User Behavior Analytics
  initHotjar() {
    if (!this.hotjarId) return;

    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid: this.hotjarId, hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  }

  // Microsoft Clarity
  initClarity() {
    if (!this.clarityId) return;

    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", this.clarityId);
  }

  // Performance Monitoring
  initPerformanceMonitoring() {
    // Core Web Vitals monitoring
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.sendToAnalytics);
        getFID(this.sendToAnalytics);
        getFCP(this.sendToAnalytics);
        getLCP(this.sendToAnalytics);
        getTTFB(this.sendToAnalytics);
      });
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];

      this.trackEvent('page_load_timing', {
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load_complete: navigation.loadEventEnd - navigation.loadEventStart,
        total_load_time: navigation.loadEventEnd - navigation.navigationStart
      });
    });

    // Monitor unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', {
        reason: event.reason
      });
    });
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isProduction) {
      console.log('Analytics Event:', eventName, parameters);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    // Hotjar
    if (window.hj) {
      window.hj('event', eventName);
    }
  }

  // Track errors
  trackError(errorType, errorData) {
    if (!this.isProduction) {
      console.error('Analytics Error:', errorType, errorData);
      return;
    }

    this.trackEvent('error', {
      error_type: errorType,
      ...errorData
    });
  }

  // Track user interactions
  trackUserAction(action, category = 'engagement') {
    this.trackEvent('user_action', {
      event_category: category,
      event_label: action,
      value: 1
    });
  }

  // Track emergency calls
  trackEmergencyCall(phoneNumber) {
    this.trackEvent('emergency_call', {
      event_category: 'conversion',
      event_label: 'emergency_phone_click',
      phone_number: phoneNumber,
      value: 1
    });
  }

  // Track form submissions
  trackFormSubmission(formName) {
    this.trackEvent('form_submit', {
      event_category: 'conversion',
      event_label: formName,
      value: 1
    });
  }

  // Send Core Web Vitals to analytics
  sendToAnalytics = ({ name, delta, value, id }) => {
    this.trackEvent('web_vitals', {
      event_category: 'performance',
      event_label: name,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      metric_id: id,
      metric_value: value,
      metric_delta: delta
    });
  }
}

// Initialize analytics
export const analytics = new Analytics();

// Export tracking functions for use in components
export const {
  trackEvent,
  trackError,
  trackUserAction,
  trackEmergencyCall,
  trackFormSubmission
} = analytics;