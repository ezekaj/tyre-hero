/**
 * Jest Setup for Emergency Service Testing
 * Global setup and configuration for emergency service tests
 */

// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Emergency service test configuration
const EMERGENCY_CONFIG = {
  timeouts: {
    emergencyCall: 200,    // 200ms for emergency call response
    formSubmission: 1000,  // 1 second for form submission
    locationDetection: 5000, // 5 seconds for location
    paymentProcessing: 5000  // 5 seconds for payment
  },
  testData: {
    defaultLocation: { lat: 51.5074, lng: -0.1278 },
    testPhoneNumber: '+44123456789',
    testCardNumber: '4242424242424242'
  }
};

// Make config available globally
global.EMERGENCY_CONFIG = EMERGENCY_CONFIG;

// Setup global mocks for browser APIs
beforeAll(() => {
  console.log('🚨 Setting up Emergency Service Test Environment');
  
  // Mock geolocation API
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn((success, error, options) => {
      const position = {
        coords: {
          latitude: EMERGENCY_CONFIG.testData.defaultLocation.lat,
          longitude: EMERGENCY_CONFIG.testData.defaultLocation.lng,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      // Simulate realistic delay
      setTimeout(() => success(position), 100);
    }),
    
    watchPosition: jest.fn((success, error, options) => {
      const watchId = Math.floor(Math.random() * 1000);
      
      // Call success callback immediately with test location
      const position = {
        coords: {
          latitude: EMERGENCY_CONFIG.testData.defaultLocation.lat,
          longitude: EMERGENCY_CONFIG.testData.defaultLocation.lng,
          accuracy: 10
        },
        timestamp: Date.now()
      };
      
      setTimeout(() => success(position), 100);
      
      return watchId;
    }),
    
    clearWatch: jest.fn((watchId) => {
      // Mock clearing watch
      return true;
    })
  };
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn((key) => {
      return localStorageMock.store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      localStorageMock.store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete localStorageMock.store[key];
    }),
    clear: jest.fn(() => {
      localStorageMock.store = {};
    }),
    store: {}
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn((key) => {
      return sessionStorageMock.store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      sessionStorageMock.store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete sessionStorageMock.store[key];
    }),
    clear: jest.fn(() => {
      sessionStorageMock.store = {};
    }),
    store: {}
  };
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  });
  
  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn((markName) => {
      // Store performance marks for testing
      if (!global.performanceMarks) {
        global.performanceMarks = {};
      }
      global.performanceMarks[markName] = Date.now();
    }),
    measure: jest.fn((measureName, startMark, endMark) => {
      const startTime = global.performanceMarks?.[startMark] || 0;
      const endTime = global.performanceMarks?.[endMark] || Date.now();
      return {
        name: measureName,
        duration: endTime - startTime,
        startTime: startTime
      };
    }),
    getEntriesByType: jest.fn((type) => {
      // Return mock performance entries
      return [];
    })
  };
  
  // Mock Notification API
  global.Notification = {
    permission: 'granted',
    requestPermission: jest.fn(() => Promise.resolve('granted')),
    constructor: jest.fn(function(title, options) {
      this.title = title;
      this.body = options?.body;
      this.icon = options?.icon;
      this.tag = options?.tag;
      this.close = jest.fn();
      
      // Store notification for testing
      if (!global.mockNotifications) {
        global.mockNotifications = [];
      }
      global.mockNotifications.push(this);
    })
  };
  
  // Mock Service Worker
  global.navigator.serviceWorker = {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: {
        scriptURL: '/service-worker.js',
        state: 'activated'
      },
      addEventListener: jest.fn(),
      update: jest.fn(() => Promise.resolve()),
      unregister: jest.fn(() => Promise.resolve(true))
    })),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: {
        scriptURL: '/service-worker.js',
        state: 'activated'
      }
    }),
    addEventListener: jest.fn(),
    getRegistration: jest.fn(() => Promise.resolve({
      active: { scriptURL: '/service-worker.js' }
    }))
  };
  
  // Mock fetch API for emergency endpoints
  global.fetch = jest.fn((url, options) => {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body) : null;
    
    // Emergency API endpoint mocking
    if (url.includes('/api/emergency')) {
      if (method === 'POST') {
        // Mock emergency submission
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            emergencyId: `EM-${Date.now()}`,
            estimatedETA: 25,
            assignedTechnician: {
              id: 'tech-test-001',
              name: 'Test Technician',
              phone: '+44987654321',
              eta: 25
            }
          })
        });
      } else if (method === 'GET') {
        // Mock emergency status
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            emergencyId: url.split('/').pop(),
            status: 'technician_assigned',
            technician: {
              name: 'Test Technician',
              location: { lat: 51.5155, lng: -0.0922 },
              eta: 23
            }
          })
        });
      }
    }
    
    // Payment API mocking
    if (url.includes('/api/payment')) {
      if (method === 'POST') {
        // Check for test card numbers
        const isDeclinedCard = body?.cardNumber?.includes('0000000000000002');
        
        if (isDeclinedCard) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({
              success: false,
              error: 'Your card was declined',
              code: 'card_declined'
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            transactionId: `txn_${Date.now()}`,
            status: 'completed',
            amount: body?.amount || 8500
          })
        });
      }
    }
    
    // Default successful response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('Mock response')
    });
  });
  
  // Mock XMLHttpRequest for legacy code
  global.XMLHttpRequest = jest.fn(() => ({
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    addEventListener: jest.fn(),
    readyState: 4,
    status: 200,
    responseText: JSON.stringify({ success: true })
  }));
  
  // Mock emergency-specific globals
  global.emergencyCallInitiated = false;
  global.mockEmergencyCall = jest.fn(() => {
    global.emergencyCallInitiated = true;
    return true;
  });
  
  // Mock geolocation error scenarios
  global.mockGeolocationError = jest.fn((errorCode) => {
    const error = {
      code: errorCode,
      message: errorCode === 1 ? 'User denied Geolocation' : 
               errorCode === 2 ? 'Position unavailable' : 
               'Timeout occurred'
    };
    
    global.navigator.geolocation.getCurrentPosition = jest.fn((success, errorCallback) => {
      setTimeout(() => errorCallback(error), 100);
    });
  });
  
  // Mock offline/online state
  global.mockOfflineState = jest.fn((isOffline) => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: !isOffline
    });
    
    // Dispatch online/offline events
    const event = new Event(isOffline ? 'offline' : 'online');
    window.dispatchEvent(event);
  });
  
  console.log('✅ Emergency service mocks initialized');
});

// Setup for each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage
  if (global.localStorage) {
    global.localStorage.clear();
  }
  
  // Reset sessionStorage
  if (global.sessionStorage) {
    global.sessionStorage.clear();
  }
  
  // Reset performance marks
  global.performanceMarks = {};
  
  // Reset mock notifications
  global.mockNotifications = [];
  
  // Reset emergency call state
  global.emergencyCallInitiated = false;
  
  // Reset online state
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  });
  
  // Reset geolocation to default mock
  global.navigator.geolocation.getCurrentPosition = jest.fn((success) => {
    const position = {
      coords: {
        latitude: EMERGENCY_CONFIG.testData.defaultLocation.lat,
        longitude: EMERGENCY_CONFIG.testData.defaultLocation.lng,
        accuracy: 10
      },
      timestamp: Date.now()
    };
    setTimeout(() => success(position), 100);
  });
});

// Cleanup after each test
afterEach(() => {
  // Clean up any timers
  jest.clearAllTimers();
  
  // Clean up DOM if needed
  if (document.body) {
    document.body.innerHTML = '';
  }
});

// Global cleanup
afterAll(() => {
  console.log('🧹 Emergency service test environment cleaned up');
});

// Custom Jest matchers for emergency service testing
expect.extend({
  toRespondWithin(received, expectedTime) {
    const responseTime = typeof received === 'number' ? received : 0;
    const pass = responseTime <= expectedTime;
    
    if (pass) {
      return {
        message: () => 
          `Expected response time ${responseTime}ms to be greater than ${expectedTime}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => 
          `Expected response time ${responseTime}ms to be within ${expectedTime}ms`,
        pass: false,
      };
    }
  },
  
  toBeValidEmergencyId(received) {
    const emergencyIdPattern = /^EM-\d{6,}$/;
    const pass = emergencyIdPattern.test(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid emergency ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid emergency ID (format: EM-XXXXXX)`,
        pass: false,
      };
    }
  },
  
  toBeValidPhoneNumber(received) {
    const phonePattern = /^\+44\d{10}$|^07\d{9}$/;
    const pass = phonePattern.test(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid UK phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid UK phone number`,
        pass: false,
      };
    }
  },
  
  toBeWithinSLA(received, slaType) {
    const slaLimits = {
      emergencyCall: 200,
      formSubmission: 1000,
      locationDetection: 5000,
      paymentProcessing: 5000
    };
    
    const limit = slaLimits[slaType];
    if (!limit) {
      return {
        message: () => `Unknown SLA type: ${slaType}`,
        pass: false,
      };
    }
    
    const responseTime = typeof received === 'number' ? received : 0;
    const pass = responseTime <= limit;
    
    if (pass) {
      return {
        message: () => 
          `Expected ${slaType} response time ${responseTime}ms to exceed SLA limit ${limit}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => 
          `Expected ${slaType} response time ${responseTime}ms to be within SLA limit ${limit}ms`,
        pass: false,
      };
    }
  }
});

// Performance tracking utilities
global.trackPerformance = (metricName, startTime) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Store for test verification
  if (!global.performanceMetrics) {
    global.performanceMetrics = {};
  }
  global.performanceMetrics[metricName] = duration;
  
  return duration;
};

// Emergency test utilities
global.emergencyTestUtils = {
  // Generate test emergency data
  generateEmergencyData: () => ({
    customerName: 'Test Emergency User',
    customerPhone: EMERGENCY_CONFIG.testData.testPhoneNumber,
    customerEmail: 'test@emergency.com',
    vehicleType: 'car',
    vehicleMake: 'BMW',
    vehicleModel: 'X5',
    registration: 'TEST123',
    emergencyType: 'flat-tyre',
    emergencyDescription: 'Test emergency scenario',
    location: EMERGENCY_CONFIG.testData.defaultLocation,
    timestamp: Date.now()
  }),
  
  // Simulate emergency call
  simulateEmergencyCall: () => {
    global.emergencyCallInitiated = true;
    return true;
  },
  
  // Simulate geolocation permission denied
  simulateLocationDenied: () => {
    global.mockGeolocationError(1);
  },
  
  // Simulate offline state
  simulateOffline: () => {
    global.mockOfflineState(true);
  },
  
  // Simulate online state
  simulateOnline: () => {
    global.mockOfflineState(false);
  }
};

console.log('🚨 Emergency Service Jest Setup Completed');
console.log('🧪 Available test utilities: emergencyTestUtils, trackPerformance');
console.log('🎯 Emergency SLA thresholds configured:', EMERGENCY_CONFIG.timeouts);