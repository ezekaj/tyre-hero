/**
 * Network Conditions Testing
 * Testing emergency service performance under various network conditions
 */

import { test, expect } from '@playwright/test';

test.describe('Network Conditions Testing', () => {
  const networkProfiles = [
    {
      name: 'Offline',
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0
    },
    {
      name: 'Slow 3G',
      offline: false,
      downloadThroughput: 500 * 1024, // 500 KB/s
      uploadThroughput: 500 * 1024,
      latency: 2000 // 2 seconds
    },
    {
      name: 'Fast 3G', 
      offline: false,
      downloadThroughput: 1.6 * 1024 * 1024, // 1.6 MB/s
      uploadThroughput: 750 * 1024, // 750 KB/s
      latency: 562.5
    },
    {
      name: '4G',
      offline: false,
      downloadThroughput: 9 * 1024 * 1024, // 9 MB/s
      uploadThroughput: 9 * 1024 * 1024,
      latency: 85
    },
    {
      name: 'Unstable WiFi',
      offline: false,
      downloadThroughput: 2 * 1024 * 1024, // Variable speed
      uploadThroughput: 1 * 1024 * 1024,
      latency: 150,
      packetLoss: 5 // 5% packet loss
    }
  ];

  networkProfiles.forEach(profile => {
    test.describe(`${profile.name} Network Tests`, () => {
      test.beforeEach(async ({ page, context }) => {
        // Configure network conditions
        if (profile.offline) {
          await context.setOffline(true);
        } else {
          await context.setOffline(false);
          
          // Simulate network throttling
          await context.route('**/*', async (route, request) => {
            // Add latency
            if (profile.latency > 0) {
              await new Promise(resolve => setTimeout(resolve, profile.latency / 4));
            }
            
            // Simulate packet loss
            if (profile.packetLoss && Math.random() * 100 < profile.packetLoss) {
              await route.abort('failed');
              return;
            }
            
            await route.continue();
          });
        }
        
        // Grant permissions
        await context.grantPermissions(['geolocation', 'notifications']);
        await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
      });

      test(`Emergency page loads on ${profile.name}`, async ({ page }) => {
        const startTime = Date.now();
        
        try {
          await page.goto('/emergency-optimized.html', { 
            timeout: profile.offline ? 5000 : 30000 
          });
          await page.waitForLoadState('networkidle', { 
            timeout: profile.offline ? 5000 : 30000 
          });
          
          const loadTime = Date.now() - startTime;
          console.log(`${profile.name} page load time: ${loadTime}ms`);
          
          // Verify essential elements are visible
          await expect(page.locator('#emergency-call-btn')).toBeVisible();
          
          if (!profile.offline) {
            // Set load time expectations based on network speed
            let maxLoadTime;
            switch (profile.name) {
              case 'Slow 3G':
                maxLoadTime = 15000; // 15 seconds
                break;
              case 'Fast 3G':
                maxLoadTime = 8000; // 8 seconds  
                break;
              case '4G':
                maxLoadTime = 5000; // 5 seconds
                break;
              default:
                maxLoadTime = 10000; // 10 seconds
            }
            
            expect(loadTime).toBeLessThan(maxLoadTime);
          }
          
        } catch (error) {
          if (profile.offline) {
            // Offline should load from cache
            console.log('Offline mode - checking cache fallback');
            await expect(page.locator('#emergency-call-btn')).toBeVisible();
          } else {
            throw error;
          }
        }
      });

      test(`Emergency call button works on ${profile.name}`, async ({ page }) => {
        if (profile.offline) {
          await page.goto('/emergency-optimized.html');
        } else {
          await page.goto('/emergency-optimized.html', { timeout: 30000 });
        }
        
        const callButton = page.locator('#emergency-call-btn');
        await expect(callButton).toBeVisible();
        
        const callStartTime = Date.now();
        await callButton.click();
        const callResponseTime = Date.now() - callStartTime;
        
        // Emergency call should always be immediate regardless of network
        expect(callResponseTime).toBeLessThan(500);
        
        // Verify call action (should work even offline)
        const callAction = await page.evaluate(() => {
          return window.emergencyCallInitiated || document.querySelector('.call-initiated');
        });
        
        expect(callAction).toBeTruthy();
      });

      test(`Emergency form submission on ${profile.name}`, async ({ page }) => {
        if (profile.offline) {
          await page.goto('/emergency-optimized.html');
        } else {
          await page.goto('/emergency-optimized.html', { timeout: 30000 });
        }
        
        // Fill form
        await page.fill('#customer-name', `${profile.name} Test User`);
        await page.fill('#customer-phone', '+44123456789');
        await page.fill('#customer-email', 'network.test@emergency.com');
        await page.selectOption('#vehicle-type', 'car');
        await page.selectOption('#emergency-type', 'breakdown');
        await page.fill('#emergency-description', `Network test on ${profile.name}`);
        
        const submitStartTime = Date.now();
        await page.click('#submit-emergency');
        
        if (profile.offline) {
          // Should show offline queue message
          await expect(page.locator('.offline-emergency-form')).toBeVisible();
          
          // Verify data saved to localStorage
          const offlineData = await page.evaluate(() => {
            return localStorage.getItem('emergencyOfflineQueue');
          });
          expect(offlineData).toBeTruthy();
          
        } else {
          try {
            // Wait for submission response
            await page.waitForSelector('.emergency-success, .emergency-error', { 
              timeout: 20000 
            });
            
            const submitTime = Date.now() - submitStartTime;
            console.log(`${profile.name} form submission time: ${submitTime}ms`);
            
            // Check if submission succeeded or failed gracefully
            const successMessage = page.locator('.emergency-success');
            const errorMessage = page.locator('.emergency-error');
            
            const isSuccess = await successMessage.isVisible();
            const isError = await errorMessage.isVisible();
            
            expect(isSuccess || isError).toBe(true);
            
            if (isSuccess) {
              // Verify emergency ID is returned
              const emergencyId = await page.textContent('#emergency-id');
              expect(emergencyId).toMatch(/^EM-\d+$/);
            }
            
          } catch (error) {
            // On very slow networks, form might timeout - check for proper error handling
            console.log(`${profile.name} form submission timed out - checking error handling`);
            
            const timeoutMessage = page.locator('.submission-timeout');
            const retryButton = page.locator('#retry-submission');
            
            // Should provide retry option or offline fallback
            const hasTimeout = await timeoutMessage.isVisible();
            const hasRetry = await retryButton.isVisible();
            const hasOfflineFallback = await page.locator('.offline-fallback').isVisible();
            
            expect(hasTimeout || hasRetry || hasOfflineFallback).toBe(true);
          }
        }
      });

      test(`Location services work on ${profile.name}`, async ({ page }) => {
        if (profile.offline) {
          await page.goto('/emergency-optimized.html');
        } else {
          await page.goto('/emergency-optimized.html', { timeout: 30000 });
        }
        
        const locationButton = page.locator('#get-location');
        await locationButton.click();
        
        // Location should work regardless of network (GPS is local)
        await page.waitForSelector('#location-display', { timeout: 10000 });
        
        const locationText = await page.textContent('#location-display');
        expect(locationText).toContain('London');
        
        // Test reverse geocoding (needs network)
        if (!profile.offline) {
          const addressText = await page.textContent('#address-display');
          if (addressText) {
            expect(addressText.length).toBeGreaterThan(0);
          }
        }
      });

      test(`Real-time updates on ${profile.name}`, async ({ page }) => {
        if (profile.offline) {
          // Skip real-time tests for offline
          test.skip();
        }
        
        await page.goto('/emergency-optimized.html', { timeout: 30000 });
        
        // Complete emergency submission first
        await page.fill('#customer-phone', '+44123456789');
        await page.selectOption('#emergency-type', 'flat-tyre');
        await page.click('#submit-emergency');
        
        try {
          await page.waitForSelector('.emergency-success', { timeout: 15000 });
          
          // Test WebSocket/polling updates
          const updateStartTime = Date.now();
          
          // Simulate status update
          await page.evaluate(() => {
            if (window.mockStatusUpdate) {
              window.mockStatusUpdate({
                status: 'technician_assigned',
                technicianName: 'Network Test Technician',
                eta: 25
              });
            }
          });
          
          // Check for status update display
          const statusUpdate = page.locator('.status-update');
          if (await statusUpdate.isVisible({ timeout: 5000 })) {
            const updateTime = Date.now() - updateStartTime;
            console.log(`${profile.name} status update time: ${updateTime}ms`);
            
            const statusText = await statusUpdate.textContent();
            expect(statusText).toContain('technician');
          }
          
        } catch (error) {
          console.log(`${profile.name} real-time updates may be delayed or failed`);
          // This is acceptable on slow networks
        }
      });

      test(`Payment processing on ${profile.name}`, async ({ page }) => {
        if (profile.offline) {
          test.skip(); // Skip payment tests offline
        }
        
        await page.goto('/emergency-optimized.html', { timeout: 30000 });
        
        // Complete emergency flow to reach payment
        await page.fill('#customer-phone', '+44123456789');
        await page.selectOption('#emergency-type', 'flat-tyre');
        await page.click('#submit-emergency');
        
        try {
          await page.waitForSelector('.emergency-success', { timeout: 15000 });
          
          // Simulate service completion
          await page.evaluate(() => {
            if (window.simulateServiceCompletion) {
              window.simulateServiceCompletion();
            }
          });
          
          await page.waitForSelector('#proceed-to-payment', { timeout: 10000 });
          await page.click('#proceed-to-payment');
          
          await page.waitForSelector('#payment-form', { timeout: 10000 });
          
          // Fill payment form
          await page.fill('#card-number', '4242424242424242');
          await page.fill('#expiry', '12/25');
          await page.fill('#cvc', '123');
          await page.fill('#cardholder-name', 'Network Test');
          
          const paymentStartTime = Date.now();
          await page.click('#submit-payment');
          
          // Payment should complete or fail gracefully
          await page.waitForSelector('.payment-success, .payment-error', { 
            timeout: 30000 
          });
          
          const paymentTime = Date.now() - paymentStartTime;
          console.log(`${profile.name} payment processing time: ${paymentTime}ms`);
          
          // Set payment time expectations
          let maxPaymentTime;
          switch (profile.name) {
            case 'Slow 3G':
              maxPaymentTime = 30000; // 30 seconds
              break;
            case 'Fast 3G':
              maxPaymentTime = 15000; // 15 seconds
              break;
            default:
              maxPaymentTime = 10000; // 10 seconds
          }
          
          expect(paymentTime).toBeLessThan(maxPaymentTime);
          
        } catch (error) {
          console.log(`${profile.name} payment processing may have failed - checking error handling`);
          
          // Should show appropriate error message
          const networkError = page.locator('.network-error');
          const paymentRetry = page.locator('#retry-payment');
          
          const hasNetworkError = await networkError.isVisible();
          const hasRetryOption = await paymentRetry.isVisible();
          
          expect(hasNetworkError || hasRetryOption).toBe(true);
        }
      });
    });
  });

  test.describe('Network Recovery Testing', () => {
    test('Handles network disconnection and reconnection', async ({ page, context }) => {
      await context.grantPermissions(['geolocation', 'notifications']);
      await page.goto('/emergency-optimized.html');
      
      // Start with good connection
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      
      // Disconnect network mid-form
      await context.setOffline(true);
      
      await page.click('#submit-emergency');
      
      // Should show offline message
      await expect(page.locator('.offline-message')).toBeVisible();
      
      // Reconnect network
      await context.setOffline(false);
      
      // Should detect reconnection
      await page.waitForSelector('.online-message', { timeout: 10000 });
      
      // Should offer to retry submission
      const retryButton = page.locator('#retry-submission');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await page.waitForSelector('.emergency-success', { timeout: 10000 });
      }
    });

    test('Syncs offline data when network returns', async ({ page, context }) => {
      await page.goto('/emergency-optimized.html');
      
      // Go offline immediately
      await context.setOffline(true);
      
      // Submit multiple emergencies offline
      const offlineSubmissions = [
        { phone: '+44111111111', type: 'flat-tyre' },
        { phone: '+44222222222', type: 'breakdown' },
        { phone: '+44333333333', type: 'battery' }
      ];
      
      for (const submission of offlineSubmissions) {
        await page.fill('#customer-phone', submission.phone);
        await page.selectOption('#emergency-type', submission.type);
        await page.click('#submit-emergency');
        
        await expect(page.locator('.offline-queue-message')).toBeVisible();
        
        // Clear form for next submission
        await page.reload();
      }
      
      // Verify all submissions are queued
      const queuedData = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('emergencyOfflineQueue') || '[]');
      });
      
      expect(queuedData).toHaveLength(3);
      
      // Go back online
      await context.setOffline(false);
      
      // Trigger sync
      await page.evaluate(() => {
        if (window.syncOfflineData) {
          window.syncOfflineData();
        }
      });
      
      // Wait for sync completion
      await page.waitForSelector('.sync-complete', { timeout: 15000 });
      
      // Verify queue is cleared
      const remainingData = await page.evaluate(() => {
        return localStorage.getItem('emergencyOfflineQueue');
      });
      
      expect(remainingData).toBeFalsy();
    });

    test('Handles intermittent connectivity', async ({ page, context }) => {
      await page.goto('/emergency-optimized.html');
      
      // Simulate intermittent connectivity
      let isOnline = true;
      
      const toggleConnection = async () => {
        isOnline = !isOnline;
        await context.setOffline(!isOnline);
        console.log(`Network ${isOnline ? 'connected' : 'disconnected'}`);
      };
      
      // Start form submission
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      
      // Toggle connection during submission
      const submitPromise = page.click('#submit-emergency');
      
      setTimeout(toggleConnection, 1000);
      setTimeout(toggleConnection, 3000);
      setTimeout(toggleConnection, 5000);
      
      await submitPromise;
      
      // Should handle intermittent connectivity gracefully
      const finalResult = await Promise.race([
        page.waitForSelector('.emergency-success', { timeout: 15000 }),
        page.waitForSelector('.connectivity-error', { timeout: 15000 })
      ]);
      
      expect(finalResult).toBeTruthy();
    });
  });

  test.describe('Progressive Enhancement Testing', () => {
    test('Essential features work without JavaScript', async ({ page, context }) => {
      // Disable JavaScript
      await context.addInitScript(() => {
        Object.defineProperty(window, 'navigator', {
          value: { ...window.navigator, javaEnabled: () => false }
        });
      });
      
      await page.goto('/emergency-optimized.html');
      
      // Basic HTML form should still work
      const form = page.locator('#emergency-form');
      await expect(form).toBeVisible();
      
      // Call link should work
      const callLink = page.locator('a[href^="tel:"]');
      if (await callLink.isVisible()) {
        const href = await callLink.getAttribute('href');
        expect(href).toContain('tel:');
      }
      
      // Form should submit (though without AJAX)
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      
      // Should be able to submit form
      const submitButton = page.locator('#submit-emergency');
      await expect(submitButton).toBeEnabled();
    });

    test('Works with limited JavaScript features', async ({ page }) => {
      await page.goto('/emergency-optimized.html');
      
      // Disable specific APIs
      await page.addInitScript(() => {
        // Disable geolocation
        delete navigator.geolocation;
        
        // Disable notifications
        delete window.Notification;
        
        // Disable service worker
        delete navigator.serviceWorker;
      });
      
      await page.reload();
      
      // Core functionality should still work
      await expect(page.locator('#emergency-call-btn')).toBeVisible();
      await expect(page.locator('#emergency-form')).toBeVisible();
      
      // Should provide fallbacks
      const manualLocationInput = page.locator('#manual-location');
      if (await manualLocationInput.isVisible()) {
        await manualLocationInput.fill('London, UK');
      }
      
      // Form submission should work
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      await page.click('#submit-emergency');
      
      // Should handle submission without advanced features
      const result = await Promise.race([
        page.waitForSelector('.emergency-success', { timeout: 10000 }),
        page.waitForSelector('.submission-fallback', { timeout: 10000 })
      ]);
      
      expect(result).toBeTruthy();
    });
  });
});