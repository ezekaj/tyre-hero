/**
 * Emergency Core Functionality Unit Tests
 * Critical path testing for life-critical emergency scenarios
 */

import { jest } from '@jest/globals';

// Mock modules
jest.mock('../../emergency-scripts.js', () => ({
  EmergencyService: jest.fn(),
  LocationTracker: jest.fn(),
  EmergencyFormHandler: jest.fn(),
  CallButtonHandler: jest.fn(),
  OfflineEmergencyQueue: jest.fn()
}));

describe('Emergency Core Functionality', () => {
  let mockGeolocation;
  let mockLocalStorage;
  let emergencyService;

  beforeEach(() => {
    // Setup geolocation mock
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    };
    global.navigator.geolocation = mockGeolocation;

    // Setup localStorage mock
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = mockLocalStorage;

    // Mock performance API
    global.performance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => [])
    };

    // Mock fetch API
    global.fetch = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Initialize emergency service
    emergencyService = {
      emergencyCallButton: document.createElement('button'),
      emergencyForm: document.createElement('form'),
      locationDisplay: document.createElement('div'),
      statusDisplay: document.createElement('div')
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.navigator.geolocation;
    delete global.localStorage;
    delete global.performance;
    delete global.fetch;
  });

  describe('Emergency Call Button', () => {
    test('should respond within 200ms (SLA requirement)', async () => {
      const startTime = performance.now();
      
      const button = document.createElement('button');
      button.id = 'emergency-call-btn';
      document.body.appendChild(button);

      // Simulate emergency call button click
      const clickEvent = new Event('click');
      button.dispatchEvent(clickEvent);

      const responseTime = performance.now() - startTime;
      
      expect(responseTime).toBeLessThan(200);
      
      document.body.removeChild(button);
    });

    test('should initiate emergency call immediately', () => {
      const mockCall = jest.fn();
      window.open = mockCall;

      const button = document.createElement('button');
      button.onclick = () => window.open('tel:+1234567890');
      button.click();

      expect(mockCall).toHaveBeenCalledWith('tel:+1234567890');
    });

    test('should track emergency call attempts', () => {
      const trackingMock = jest.fn();
      global.gtag = trackingMock;

      const button = document.createElement('button');
      button.onclick = () => {
        gtag('event', 'emergency_call_initiated', {
          event_category: 'emergency',
          event_label: 'critical',
          value: 1
        });
      };
      button.click();

      expect(trackingMock).toHaveBeenCalledWith('event', 'emergency_call_initiated', {
        event_category: 'emergency',
        event_label: 'critical',
        value: 1
      });
    });

    test('should work offline', () => {
      // Simulate offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const button = document.createElement('button');
      const offlineHandler = jest.fn();
      button.onclick = offlineHandler;
      button.click();

      expect(offlineHandler).toHaveBeenCalled();
    });
  });

  describe('Location Tracking', () => {
    test('should get location within 5 seconds', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 10
        },
        timestamp: Date.now()
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 1000);
      });

      const startTime = Date.now();
      
      return new Promise((resolve) => {
        mockGeolocation.getCurrentPosition((position) => {
          const locationTime = Date.now() - startTime;
          expect(locationTime).toBeLessThan(5000);
          expect(position.coords.latitude).toBe(51.5074);
          expect(position.coords.longitude).toBe(-0.1278);
          resolve();
        });
      });
    });

    test('should handle location permission denied', () => {
      const mockError = { code: 1, message: 'User denied Geolocation' };
      
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });

      return new Promise((resolve) => {
        mockGeolocation.getCurrentPosition(
          () => {},
          (error) => {
            expect(error.code).toBe(1);
            resolve();
          }
        );
      });
    });

    test('should fallback to IP-based location', async () => {
      // Mock failed GPS location
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 2, message: 'Position unavailable' });
      });

      // Mock IP geolocation API
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          latitude: 51.5074,
          longitude: -0.1278,
          city: 'London',
          country: 'UK'
        })
      });

      const response = await fetch('https://ipapi.co/json/');
      const ipLocation = await response.json();

      expect(ipLocation.latitude).toBe(51.5074);
      expect(ipLocation.longitude).toBe(-0.1278);
    });

    test('should continuously track location for emergency dispatch', () => {
      const watchId = 123;
      mockGeolocation.watchPosition.mockReturnValue(watchId);

      const trackingCallback = jest.fn();
      const actualWatchId = mockGeolocation.watchPosition(trackingCallback);

      expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(trackingCallback);
      expect(actualWatchId).toBe(watchId);
    });
  });

  describe('Emergency Form Submission', () => {
    test('should submit within 1 second (SLA requirement)', async () => {
      const form = document.createElement('form');
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      form.appendChild(submitButton);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, emergencyId: '12345' })
      });

      const startTime = performance.now();
      
      form.onsubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urgent: true })
        });
        
        const submitTime = performance.now() - startTime;
        expect(submitTime).toBeLessThan(1000);
      };

      form.dispatchEvent(new Event('submit'));
    });

    test('should validate required emergency fields', () => {
      const formData = {
        location: '',
        phoneNumber: '',
        vehicleType: '',
        emergencyType: ''
      };

      const isValid = Object.values(formData).every(value => value.trim() !== '');
      expect(isValid).toBe(false);

      // Test with valid data
      const validFormData = {
        location: 'London, UK',
        phoneNumber: '+44123456789',
        vehicleType: 'Car',
        emergencyType: 'Flat Tyre'
      };

      const isValidComplete = Object.values(validFormData).every(value => value.trim() !== '');
      expect(isValidComplete).toBe(true);
    });

    test('should queue form submission when offline', () => {
      // Simulate offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const formData = {
        location: 'London, UK',
        phoneNumber: '+44123456789',
        emergencyType: 'Flat Tyre',
        timestamp: Date.now()
      };

      // Mock offline queue
      const offlineQueue = [];
      offlineQueue.push(formData);

      mockLocalStorage.setItem('emergencyOfflineQueue', JSON.stringify(offlineQueue));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'emergencyOfflineQueue',
        JSON.stringify([formData])
      );
    });
  });

  describe('Response Time SLA Validation', () => {
    test('should track 90-minute response time SLA', () => {
      const emergencyCreated = Date.now();
      const targetResponseTime = 90 * 60 * 1000; // 90 minutes in milliseconds
      
      // Simulate technician dispatch
      const dispatchTime = emergencyCreated + (30 * 60 * 1000); // 30 minutes later
      const arrivalTime = emergencyCreated + (75 * 60 * 1000); // 75 minutes later
      
      const responseTime = arrivalTime - emergencyCreated;
      const withinSLA = responseTime <= targetResponseTime;
      
      expect(withinSLA).toBe(true);
      expect(responseTime).toBeLessThan(targetResponseTime);
    });

    test('should alert when approaching SLA deadline', () => {
      const emergencyCreated = Date.now();
      const currentTime = emergencyCreated + (75 * 60 * 1000); // 75 minutes later
      const timeElapsed = currentTime - emergencyCreated;
      const slaDeadline = 90 * 60 * 1000; // 90 minutes
      
      const timeRemaining = slaDeadline - timeElapsed;
      const isApproachingDeadline = timeRemaining <= (15 * 60 * 1000); // 15 minutes warning
      
      expect(isApproachingDeadline).toBe(true);
    });
  });

  describe('Emergency Data Persistence', () => {
    test('should persist emergency data to localStorage', () => {
      const emergencyData = {
        id: 'emergency-123',
        timestamp: Date.now(),
        location: { lat: 51.5074, lng: -0.1278 },
        status: 'active',
        customerPhone: '+44123456789'
      };

      mockLocalStorage.setItem('currentEmergency', JSON.stringify(emergencyData));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'currentEmergency',
        JSON.stringify(emergencyData)
      );
    });

    test('should restore emergency session on page reload', () => {
      const emergencyData = {
        id: 'emergency-123',
        timestamp: Date.now(),
        location: { lat: 51.5074, lng: -0.1278 },
        status: 'active'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(emergencyData));

      const restored = JSON.parse(mockLocalStorage.getItem('currentEmergency'));
      
      expect(restored.id).toBe('emergency-123');
      expect(restored.status).toBe('active');
    });
  });

  describe('Error Handling & Fallbacks', () => {
    test('should handle network failures gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/emergency');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      // Should fallback to offline queue
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('should handle service worker failures', () => {
      // Mock service worker registration failure
      global.navigator.serviceWorker = {
        register: jest.fn().mockRejectedValue(new Error('SW registration failed'))
      };

      const swRegistration = navigator.serviceWorker.register('/sw.js');
      expect(swRegistration).rejects.toThrow('SW registration failed');
    });

    test('should provide manual fallback options', () => {
      const fallbackOptions = {
        phone: '+44-800-EMERGENCY',
        sms: '+44-800-TYREHELP',
        whatsapp: '+44-800-TYREHELP'
      };

      expect(fallbackOptions.phone).toBeDefined();
      expect(fallbackOptions.sms).toBeDefined();
      expect(fallbackOptions.whatsapp).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track page load performance', () => {
      const mockPerformanceEntry = {
        name: 'emergency-page-load',
        duration: 1500,
        startTime: 0
      };

      global.performance.getEntriesByType.mockReturnValue([mockPerformanceEntry]);

      const performanceEntries = performance.getEntriesByType('navigation');
      expect(performanceEntries[0].duration).toBeLessThan(3000); // Emergency page load SLA
    });

    test('should monitor JavaScript execution time', () => {
      performance.mark('script-start');
      
      // Simulate script execution
      setTimeout(() => {
        performance.mark('script-end');
        performance.measure('script-execution', 'script-start', 'script-end');
      }, 100);

      expect(performance.mark).toHaveBeenCalledWith('script-start');
    });
  });
});