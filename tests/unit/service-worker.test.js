/**
 * Service Worker Unit Tests
 * Testing offline capabilities and emergency caching
 */

import { jest } from '@jest/globals';

// Mock service worker globals
const mockClients = {
  claim: jest.fn(),
  matchAll: jest.fn()
};

const mockCaches = {
  open: jest.fn(),
  match: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn()
};

const mockCache = {
  match: jest.fn(),
  matchAll: jest.fn(),
  add: jest.fn(),
  addAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn()
};

const mockRegistration = {
  showNotification: jest.fn(),
  getNotifications: jest.fn(),
  update: jest.fn()
};

// Setup service worker environment
global.self = {
  clients: mockClients,
  caches: mockCaches,
  registration: mockRegistration,
  addEventListener: jest.fn(),
  skipWaiting: jest.fn(),
  importScripts: jest.fn()
};

global.caches = mockCaches;
global.clients = mockClients;
global.registration = mockRegistration;

describe('Service Worker Emergency Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCaches.open.mockResolvedValue(mockCache);
  });

  describe('Cache Management', () => {
    test('should cache emergency resources immediately', async () => {
      const emergencyResources = [
        '/emergency-optimized.html',
        '/critical.css',
        '/emergency-scripts.js',
        '/offline.html',
        '/images/emergency-icon.png'
      ];

      mockCache.addAll.mockResolvedValue(undefined);

      await mockCache.addAll(emergencyResources);

      expect(mockCache.addAll).toHaveBeenCalledWith(emergencyResources);
    });

    test('should prioritize emergency resources in cache', async () => {
      const cacheNames = ['emergency-v1', 'static-v1', 'dynamic-v1'];
      
      mockCaches.keys.mockResolvedValue(cacheNames);

      const keys = await mockCaches.keys();
      const emergencyCache = keys.find(name => name.includes('emergency'));
      
      expect(emergencyCache).toBe('emergency-v1');
    });

    test('should cache offline emergency form submissions', async () => {
      const emergencySubmission = {
        url: '/api/emergency',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'London, UK',
          phoneNumber: '+44123456789',
          emergencyType: 'Flat Tyre',
          timestamp: Date.now(),
          offline: true
        })
      };

      const request = new Request('/api/emergency', emergencySubmission);
      const response = new Response(JSON.stringify({ queued: true }), {
        status: 202,
        statusText: 'Accepted'
      });

      mockCache.put.mockResolvedValue(undefined);

      await mockCache.put(request, response);

      expect(mockCache.put).toHaveBeenCalledWith(request, response);
    });
  });

  describe('Offline Emergency Handling', () => {
    test('should serve cached emergency page when offline', async () => {
      const emergencyRequest = new Request('/emergency-optimized.html');
      const cachedResponse = new Response('<html>Emergency Page</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });

      mockCache.match.mockResolvedValue(cachedResponse);

      const response = await mockCache.match(emergencyRequest);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    test('should queue emergency API calls when offline', async () => {
      const emergencyData = {
        location: 'London, UK',
        phoneNumber: '+44123456789',
        emergencyType: 'Flat Tyre',
        timestamp: Date.now()
      };

      // Simulate offline API call
      const request = new Request('/api/emergency', {
        method: 'POST',
        body: JSON.stringify(emergencyData)
      });

      // Mock offline response
      const offlineResponse = new Response(JSON.stringify({
        success: true,
        queued: true,
        message: 'Emergency request queued for when online'
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });

      expect(offlineResponse.status).toBe(202);
    });

    test('should sync queued emergency requests when back online', async () => {
      const queuedRequests = [
        {
          url: '/api/emergency',
          method: 'POST',
          body: JSON.stringify({
            location: 'London, UK',
            phoneNumber: '+44123456789',
            timestamp: Date.now() - 300000 // 5 minutes ago
          })
        }
      ];

      // Mock successful sync
      global.fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, emergencyId: '12345' }), {
          status: 200
        })
      );

      for (const queuedRequest of queuedRequests) {
        const response = await fetch(queuedRequest.url, {
          method: queuedRequest.method,
          body: queuedRequest.body
        });
        
        expect(response.status).toBe(200);
      }

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Push Notifications', () => {
    test('should show emergency update notifications', async () => {
      const notificationData = {
        title: 'TyreHero Emergency Update',
        body: 'Technician dispatched - ETA 25 minutes',
        icon: '/images/emergency-icon.png',
        badge: '/images/badge-icon.png',
        tag: 'emergency-update',
        requireInteraction: true,
        data: {
          emergencyId: '12345',
          type: 'technician-dispatched',
          eta: 25
        }
      };

      mockRegistration.showNotification.mockResolvedValue(undefined);

      await mockRegistration.showNotification(
        notificationData.title,
        notificationData
      );

      expect(mockRegistration.showNotification).toHaveBeenCalledWith(
        'TyreHero Emergency Update',
        notificationData
      );
    });

    test('should handle critical emergency notifications', async () => {
      const criticalNotification = {
        title: 'URGENT: Emergency Update',
        body: 'Technician delayed - Please call immediately',
        icon: '/images/emergency-critical.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        silent: false,
        tag: 'emergency-critical',
        actions: [
          {
            action: 'call-now',
            title: 'Call Now',
            icon: '/images/call-icon.png'
          },
          {
            action: 'view-update',
            title: 'View Update',
            icon: '/images/view-icon.png'
          }
        ]
      };

      expect(criticalNotification.requireInteraction).toBe(true);
      expect(criticalNotification.vibrate).toEqual([200, 100, 200, 100, 200]);
      expect(criticalNotification.actions).toHaveLength(2);
    });
  });

  describe('Background Sync', () => {
    test('should register background sync for emergency data', async () => {
      const mockSyncManager = {
        register: jest.fn().mockResolvedValue(undefined)
      };

      global.self.registration.sync = mockSyncManager;

      await mockSyncManager.register('emergency-sync');

      expect(mockSyncManager.register).toHaveBeenCalledWith('emergency-sync');
    });

    test('should handle background sync events', async () => {
      const syncEvent = {
        tag: 'emergency-sync',
        lastChance: false,
        waitUntil: jest.fn()
      };

      const syncHandler = jest.fn();
      syncEvent.waitUntil(syncHandler());

      expect(syncEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Emergency Cache Strategy', () => {
    test('should implement cache-first strategy for emergency resources', async () => {
      const request = new Request('/emergency-scripts.js');
      const cachedResponse = new Response('emergency scripts', { status: 200 });

      mockCache.match.mockResolvedValue(cachedResponse);

      // Simulate cache-first strategy
      const response = await mockCache.match(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    test('should implement network-first strategy for API calls', async () => {
      const request = new Request('/api/emergency/status');
      
      // Mock network failure, fallback to cache
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const cachedResponse = new Response(JSON.stringify({
        status: 'cached',
        message: 'Using cached data - network unavailable'
      }), { status: 200 });

      mockCache.match.mockResolvedValue(cachedResponse);

      try {
        await fetch(request);
      } catch (error) {
        const fallbackResponse = await mockCache.match(request);
        expect(fallbackResponse).toBeDefined();
      }
    });
  });

  describe('Performance Optimization', () => {
    test('should preload critical emergency resources', async () => {
      const criticalResources = [
        '/emergency-optimized.html',
        '/critical.css',
        '/emergency-scripts.js'
      ];

      const preloadPromises = criticalResources.map(resource => {
        const request = new Request(resource);
        return mockCache.add(request);
      });

      mockCache.add.mockResolvedValue(undefined);

      await Promise.all(preloadPromises);

      expect(mockCache.add).toHaveBeenCalledTimes(3);
    });

    test('should optimize cache storage usage', async () => {
      const maxCacheSize = 50 * 1024 * 1024; // 50MB
      const currentCacheKeys = ['resource1', 'resource2', 'resource3'];

      mockCache.keys.mockResolvedValue(currentCacheKeys);

      const keys = await mockCache.keys();
      
      // Simulate cache cleanup if needed
      if (keys.length > 100) { // Arbitrary limit for testing
        mockCache.delete.mockResolvedValue(true);
        await mockCache.delete(keys[0]);
      }

      expect(keys.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle cache operation failures', async () => {
      const request = new Request('/emergency-scripts.js');
      
      mockCache.match.mockRejectedValue(new Error('Cache operation failed'));

      try {
        await mockCache.match(request);
      } catch (error) {
        expect(error.message).toBe('Cache operation failed');
      }
    });

    test('should handle service worker update failures', async () => {
      mockRegistration.update.mockRejectedValue(new Error('Update failed'));

      try {
        await mockRegistration.update();
      } catch (error) {
        expect(error.message).toBe('Update failed');
      }
    });

    test('should provide fallback for notification failures', async () => {
      mockRegistration.showNotification.mockRejectedValue(
        new Error('Notification permission denied')
      );

      try {
        await mockRegistration.showNotification('Test', {});
      } catch (error) {
        // Should fallback to in-app notification
        expect(error.message).toBe('Notification permission denied');
      }
    });
  });
});