/**
 * Comprehensive Load Testing for TyreHero Emergency Service
 * Testing normal operations and baseline performance
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const pageLoadTime = new Trend('page_load_time');
const apiResponseTime = new Trend('api_response_time');
const errorRate = new Rate('error_rate');
const activeUsers = new Gauge('active_users');
const emergencyRequestsPerSecond = new Rate('emergency_requests_per_second');

// Load test configuration
export const options = {
  scenarios: {
    // Normal load testing
    normal_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
    },
    
    // Stress testing - gradually increase load
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '3m', target: 150 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 }, // Sustained load
        { duration: '2m', target: 0 },
      ],
    },
    
    // Spike testing - sudden traffic increases
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: 100 }, // Sudden spike
        { duration: '1m', target: 100 },
        { duration: '30s', target: 10 }, // Quick drop
        { duration: '1m', target: 10 },
      ],
    },
    
    // Soak testing - extended duration
    soak_test: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30m',
    },
  },
  
  thresholds: {
    // Page load times
    'page_load_time': ['p(95)<3000'], // 95% under 3 seconds
    
    // API response times
    'api_response_time': ['p(95)<2000'], // 95% under 2 seconds
    
    // Error rates
    'http_req_failed': ['rate<0.1'], // Less than 10% errors
    'error_rate': ['rate<0.05'], // Less than 5% application errors
    
    // Overall performance
    'http_req_duration': ['p(95)<5000'], // 95% under 5 seconds
    'http_req_receiving': ['p(95)<1000'], // Network receiving time
    'http_req_sending': ['p(95)<1000'], // Network sending time
    
    // Throughput
    'emergency_requests_per_second': ['rate>0.5'], // At least 0.5 emergency requests per second
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';
  
  // Track active users
  activeUsers.add(1);
  
  group('Emergency Page Performance', () => {
    testEmergencyPageLoad(baseUrl);
  });
  
  group('Emergency API Performance', () => {
    testEmergencyAPI(baseUrl);
  });
  
  group('Static Assets Performance', () => {
    testStaticAssets(baseUrl);
  });
  
  group('Service Worker Performance', () => {
    testServiceWorker(baseUrl);
  });
  
  // Random think time
  sleep(Math.random() * 2 + 1);
}

function testEmergencyPageLoad(baseUrl) {
  const loadStart = Date.now();
  
  const response = http.get(`${baseUrl}/emergency-optimized.html`);
  
  const loadTime = Date.now() - loadStart;
  pageLoadTime.add(loadTime);
  
  const success = check(response, {
    'emergency page status is 200': (r) => r.status === 200,
    'emergency page loads quickly': () => loadTime < 3000,
    'emergency page has emergency call button': (r) => r.body.includes('emergency-call-btn'),
    'emergency page has emergency form': (r) => r.body.includes('emergency-form'),
    'emergency page has location services': (r) => r.body.includes('get-location'),
    'emergency page is properly compressed': (r) => {
      const contentEncoding = r.headers['Content-Encoding'];
      return contentEncoding === 'gzip' || contentEncoding === 'br';
    },
  });
  
  if (!success) {
    errorRate.add(1);
  }
}

function testEmergencyAPI(baseUrl) {
  const emergencyData = {
    customerName: `Load Test User ${Math.floor(Math.random() * 10000)}`,
    customerPhone: `+4412345${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    customerEmail: `loadtest${Math.floor(Math.random() * 10000)}@test.com`,
    vehicleType: 'car',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    registration: `LT${Math.floor(Math.random() * 1000)}`,
    emergencyType: 'flat-tyre',
    emergencyDescription: 'Load testing emergency submission',
    location: { lat: 51.5074, lng: -0.1278 },
    timestamp: Date.now()
  };
  
  const apiStart = Date.now();
  
  const response = http.post(`${baseUrl}/api/emergency`, JSON.stringify(emergencyData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const apiTime = Date.now() - apiStart;
  apiResponseTime.add(apiTime);
  
  const success = check(response, {
    'emergency API status is 200': (r) => r.status === 200,
    'emergency API responds quickly': () => apiTime < 2000,
    'emergency API returns valid response': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.success && json.emergencyId;
      } catch (e) {
        return false;
      }
    },
    'emergency ID format is correct': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.emergencyId && json.emergencyId.startsWith('EM-');
      } catch (e) {
        return false;
      }
    },
  });
  
  if (success) {
    emergencyRequestsPerSecond.add(1);
  } else {
    errorRate.add(1);
  }
  
  // Test emergency status endpoint
  if (response.status === 200) {
    try {
      const emergencyResponse = JSON.parse(response.body);
      const emergencyId = emergencyResponse.emergencyId;
      
      sleep(0.5); // Brief pause before status check
      
      const statusResponse = http.get(`${baseUrl}/api/emergency/${emergencyId}/status`);
      check(statusResponse, {
        'emergency status API accessible': (r) => r.status === 200,
        'emergency status returns tracking data': (r) => {
          try {
            const json = JSON.parse(r.body);
            return json.status && json.timestamp;
          } catch (e) {
            return false;
          }
        }
      });
    } catch (e) {
      errorRate.add(1);
    }
  }
}

function testStaticAssets(baseUrl) {
  const assets = [
    '/critical.css',
    '/emergency-scripts.js',
    '/images/logo.png',
    '/manifest.json',
    '/service-worker.js'
  ];
  
  assets.forEach(asset => {
    const assetStart = Date.now();
    const response = http.get(`${baseUrl}${asset}`);
    const assetTime = Date.now() - assetStart;
    
    check(response, {
      [`${asset} loads successfully`]: (r) => r.status === 200,
      [`${asset} loads quickly`]: () => assetTime < 1000,
      [`${asset} has cache headers`]: (r) => {
        return r.headers['Cache-Control'] || r.headers['ETag'];
      },
    }, { asset });
  });
}

function testServiceWorker(baseUrl) {
  const swResponse = http.get(`${baseUrl}/service-worker.js`);
  
  check(swResponse, {
    'service worker available': (r) => r.status === 200,
    'service worker has emergency cache logic': (r) => {
      return r.body.includes('emergency') && r.body.includes('cache');
    },
    'service worker has proper MIME type': (r) => {
      return r.headers['Content-Type'] && r.headers['Content-Type'].includes('javascript');
    },
  });
}

// Test different user behaviors
export function emergencyUserBehavior() {
  const baseUrl = 'http://localhost:3000';
  
  // Simulate a user filling out emergency form step by step
  const steps = [
    () => http.get(`${baseUrl}/emergency-optimized.html`),
    () => http.post(`${baseUrl}/api/geolocation`, JSON.stringify({
      lat: 51.5074 + (Math.random() - 0.5) * 0.01,
      lng: -0.1278 + (Math.random() - 0.5) * 0.01
    })),
    () => sleep(5), // User fills form for 5 seconds
    () => http.post(`${baseUrl}/api/emergency`, JSON.stringify({
      customerName: 'Behavior Test User',
      customerPhone: '+44123456789',
      emergencyType: 'breakdown',
      location: { lat: 51.5074, lng: -0.1278 }
    })),
    () => sleep(2), // User waits for response
    () => http.get(`${baseUrl}/api/emergency/status`), // Check status
  ];
  
  steps.forEach((step, index) => {
    try {
      step();
    } catch (e) {
      console.error(`Step ${index + 1} failed:`, e);
      errorRate.add(1);
    }
  });
}

// Simulate mobile users
export function mobileUserBehavior() {
  const baseUrl = 'http://localhost:3000';
  
  // Mobile-specific headers
  const mobileHeaders = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
  };
  
  const response = http.get(`${baseUrl}/emergency-optimized.html`, {
    headers: mobileHeaders
  });
  
  check(response, {
    'mobile page loads': (r) => r.status === 200,
    'mobile page has viewport meta': (r) => r.body.includes('viewport'),
    'mobile page has touch-friendly elements': (r) => r.body.includes('mobile-emergency-btn'),
  });
}

// API stress testing
export function apiStressTest() {
  const baseUrl = 'http://localhost:3000';
  
  // Rapid-fire API requests
  for (let i = 0; i < 10; i++) {
    const response = http.post(`${baseUrl}/api/emergency`, JSON.stringify({
      customerName: `Stress Test ${i}`,
      customerPhone: `+44${Math.floor(Math.random() * 1000000000)}`,
      emergencyType: 'flat-tyre',
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    check(response, {
      'rapid API request succeeds': (r) => r.status === 200,
    });
  }
}

export function setup() {
  console.log('🚀 Starting TyreHero Emergency Service Load Test');
  
  // Warm up the application
  const baseUrl = 'http://localhost:3000';
  const warmupResponse = http.get(`${baseUrl}/emergency-optimized.html`);
  
  if (warmupResponse.status !== 200) {
    throw new Error(`Application not available at ${baseUrl}`);
  }
  
  console.log('✅ Application warmup successful');
  
  return { baseUrl };
}

export function teardown(data) {
  console.log('📊 Load Test Complete');
  console.log('Results available in k6 output');
}