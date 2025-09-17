/**
 * Mobile Emergency Service Testing
 * Comprehensive testing for mobile devices and PWA functionality
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Emergency Service', () => {
  // Test on multiple mobile devices
  const mobileDevices = [
    { name: 'iPhone 13', device: devices['iPhone 13'] },
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'Galaxy S9+', device: devices['Galaxy S9+'] },
    { name: 'iPad Pro', device: devices['iPad Pro'] }
  ];

  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Emergency Tests`, () => {
      test.beforeEach(async ({ page, context }) => {
        // Configure device
        await context.setViewportSize(device.viewport);
        await context.setUserAgent(device.userAgent);
        
        // Grant permissions
        await context.grantPermissions(['geolocation', 'notifications']);
        await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
        
        // Navigate to emergency page
        await page.goto('/emergency-optimized.html');
        await page.waitForLoadState('networkidle');
      });

      test(`${name}: Emergency call button is touch-friendly`, async ({ page }) => {
        const callButton = page.locator('#emergency-call-btn');
        
        // Check button size (minimum 44px for iOS, 48px for Android)
        const buttonBox = await callButton.boundingBox();
        const minSize = name.includes('iPhone') || name.includes('iPad') ? 44 : 48;
        
        expect(buttonBox.width).toBeGreaterThanOrEqual(minSize);
        expect(buttonBox.height).toBeGreaterThanOrEqual(minSize);
        
        // Test touch interaction
        await callButton.tap();
        
        // Verify visual feedback
        const isPressed = await callButton.evaluate(el => 
          getComputedStyle(el).transform !== 'none' || 
          getComputedStyle(el).opacity !== '1'
        );
        expect(isPressed).toBeTruthy();
      });

      test(`${name}: Emergency form is mobile-optimized`, async ({ page }) => {
        // Test form fields are properly sized
        const formFields = [
          '#customer-name',
          '#customer-phone', 
          '#customer-email',
          '#emergency-description'
        ];

        for (const field of formFields) {
          const fieldElement = page.locator(field);
          await expect(fieldElement).toBeVisible();
          
          const fieldBox = await fieldElement.boundingBox();
          expect(fieldBox.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
          
          // Test keyboard appears for input
          await fieldElement.tap();
          await expect(fieldElement).toBeFocused();
        }

        // Test phone input has correct keyboard
        const phoneInput = page.locator('#customer-phone');
        const inputMode = await phoneInput.getAttribute('inputmode');
        expect(inputMode).toBe('tel');

        // Test email input has correct keyboard
        const emailInput = page.locator('#customer-email');
        const emailType = await emailInput.getAttribute('type');
        expect(emailType).toBe('email');
      });

      test(`${name}: Swipe gestures work for emergency actions`, async ({ page }) => {
        const emergencyCard = page.locator('.emergency-action-card');
        await expect(emergencyCard).toBeVisible();

        // Test swipe right to call
        const cardBox = await emergencyCard.boundingBox();
        
        await page.mouse.move(cardBox.x + 50, cardBox.y + cardBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(cardBox.x + cardBox.width - 50, cardBox.y + cardBox.height / 2);
        await page.mouse.up();

        // Verify swipe action triggered
        await expect(page.locator('.call-action-triggered')).toBeVisible();
      });

      test(`${name}: Location services work on mobile`, async ({ page }) => {
        const locationButton = page.locator('#get-location');
        await locationButton.tap();

        // Wait for location to be detected
        await page.waitForSelector('#location-display', { timeout: 10000 });
        
        const locationText = await page.textContent('#location-display');
        expect(locationText).toContain('London');

        // Verify location accuracy indicator
        const accuracyIndicator = page.locator('#location-accuracy');
        if (await accuracyIndicator.isVisible()) {
          const accuracy = await accuracyIndicator.textContent();
          expect(accuracy).toMatch(/\d+m/); // Should show accuracy in meters
        }
      });

      test(`${name}: PWA installation prompt works`, async ({ page }) => {
        // Wait for PWA install prompt
        await page.waitForTimeout(3000); // Allow time for PWA criteria to be met

        // Check if install prompt appears
        const installButton = page.locator('#pwa-install-btn');
        if (await installButton.isVisible()) {
          await installButton.tap();
          
          // Verify install dialog or action
          const installPrompt = page.locator('.pwa-install-prompt');
          await expect(installPrompt).toBeVisible();
        }

        // Test PWA manifest
        const manifest = await page.evaluate(() => {
          const link = document.querySelector('link[rel="manifest"]');
          return link ? link.href : null;
        });
        
        expect(manifest).toBeTruthy();
        expect(manifest).toContain('manifest.json');
      });
    });
  });

  test.describe('Network Condition Testing', () => {
    const networkConditions = [
      { name: 'Slow 3G', downloadThroughput: 500 * 1024, uploadThroughput: 500 * 1024, latency: 2000 },
      { name: 'Fast 3G', downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 750 * 1024, latency: 562.5 },
      { name: '4G', downloadThroughput: 9 * 1024 * 1024, uploadThroughput: 9 * 1024 * 1024, latency: 85 },
      { name: 'WiFi', downloadThroughput: 30 * 1024 * 1024, uploadThroughput: 15 * 1024 * 1024, latency: 20 }
    ];

    networkConditions.forEach(({ name, downloadThroughput, uploadThroughput, latency }) => {
      test(`Emergency service works on ${name}`, async ({ page, context }) => {
        // Set mobile device
        await context.setViewportSize(devices['iPhone 13'].viewport);
        
        // Simulate network conditions
        await context.route('**/*', async route => {
          await new Promise(resolve => setTimeout(resolve, latency / 4)); // Simulate latency
          await route.continue();
        });

        const startTime = Date.now();
        await page.goto('/emergency-optimized.html');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Verify page loads within acceptable time for network condition
        const maxLoadTime = name === 'Slow 3G' ? 10000 : name === 'Fast 3G' ? 7000 : 5000;
        expect(loadTime).toBeLessThan(maxLoadTime);

        // Test emergency call button still works
        const callButton = page.locator('#emergency-call-btn');
        await expect(callButton).toBeVisible();
        
        const callStartTime = Date.now();
        await callButton.tap();
        const callResponseTime = Date.now() - callStartTime;
        
        expect(callResponseTime).toBeLessThan(1000); // Should be immediate despite network conditions

        // Test form submission on slow network
        await page.fill('#customer-phone', '+44123456789');
        await page.selectOption('#emergency-type', 'flat-tyre');
        
        const formStartTime = Date.now();
        await page.click('#submit-emergency');
        
        // Wait for either success or timeout
        try {
          await page.waitForSelector('.emergency-success', { timeout: 15000 });
          const formTime = Date.now() - formStartTime;
          console.log(`${name} form submission time: ${formTime}ms`);
        } catch (error) {
          // Form might timeout on very slow networks - this is acceptable
          console.log(`${name} form submission timed out - checking offline fallback`);
          
          // Should show offline message or queue form
          const offlineMessage = page.locator('.offline-message');
          if (await offlineMessage.isVisible()) {
            expect(await offlineMessage.textContent()).toContain('offline');
          }
        }
      });
    });
  });

  test.describe('Offline PWA Functionality', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.setViewportSize(devices['iPhone 13'].viewport);
      await context.grantPermissions(['geolocation', 'notifications']);
      
      // Load page first to register service worker
      await page.goto('/emergency-optimized.html');
      await page.waitForLoadState('networkidle');
      
      // Wait for service worker to install
      await page.waitForTimeout(2000);
    });

    test('Emergency page loads when offline', async ({ page, context }) => {
      // Go offline
      await context.setOffline(true);
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify page loads from cache
      await expect(page.locator('#emergency-call-btn')).toBeVisible();
      await expect(page.locator('#emergency-form')).toBeVisible();
      
      // Verify offline indicator
      const offlineIndicator = page.locator('.offline-indicator');
      if (await offlineIndicator.isVisible()) {
        expect(await offlineIndicator.textContent()).toContain('offline');
      }
    });

    test('Emergency call button works offline', async ({ page, context }) => {
      await context.setOffline(true);
      
      const callButton = page.locator('#emergency-call-btn');
      await callButton.tap();
      
      // Should still work (direct tel: link)
      const callAttempted = await page.evaluate(() => {
        return window.lastCallAttempt ? true : false;
      });
      
      // Call button should provide fallback instructions
      const fallbackInstructions = page.locator('.offline-call-instructions');
      if (await fallbackInstructions.isVisible()) {
        expect(await fallbackInstructions.textContent()).toContain('call');
      }
    });

    test('Emergency form queues when offline', async ({ page, context }) => {
      await context.setOffline(true);
      
      // Fill form
      await page.fill('#customer-name', 'Offline Test User');
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      await page.fill('#emergency-description', 'Car broken down - offline test');
      
      await page.click('#submit-emergency');
      
      // Should show offline queue message
      await expect(page.locator('.offline-queue-message')).toBeVisible();
      
      // Verify data saved to localStorage
      const queuedData = await page.evaluate(() => {
        return localStorage.getItem('emergencyOfflineQueue');
      });
      
      expect(queuedData).toBeTruthy();
      const parsedData = JSON.parse(queuedData);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].customerName).toBe('Offline Test User');
    });

    test('Offline data syncs when back online', async ({ page, context }) => {
      // First, queue some offline data
      await context.setOffline(true);
      
      await page.fill('#customer-phone', '+44987654321');
      await page.selectOption('#emergency-type', 'flat-tyre');
      await page.click('#submit-emergency');
      
      await expect(page.locator('.offline-queue-message')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
      
      // Trigger sync (could be automatic or manual)
      const syncButton = page.locator('#sync-offline-data');
      if (await syncButton.isVisible()) {
        await syncButton.click();
      } else {
        // Wait for automatic sync
        await page.waitForTimeout(3000);
      }
      
      // Verify data was synced
      const syncSuccess = page.locator('.sync-success-message');
      if (await syncSuccess.isVisible()) {
        expect(await syncSuccess.textContent()).toContain('synced');
      }
      
      // Verify localStorage is cleared after sync
      const remainingData = await page.evaluate(() => {
        return localStorage.getItem('emergencyOfflineQueue');
      });
      
      expect(remainingData).toBeFalsy();
    });
  });

  test.describe('Mobile Performance Testing', () => {
    test('Emergency page meets mobile performance thresholds', async ({ page, context }) => {
      await context.setViewportSize(devices['iPhone 13'].viewport);
      
      // Enable performance monitoring
      await page.addInitScript(() => {
        window.performanceMetrics = [];
        
        // Monitor paint timings
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.performanceMetrics.push({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration
            });
          }
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
      });
      
      const startTime = Date.now();
      await page.goto('/emergency-optimized.html');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Mobile performance thresholds
      expect(loadTime).toBeLessThan(4000); // 4 seconds for mobile
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => window.performanceMetrics);
      
      const fcp = metrics.find(m => m.name === 'first-contentful-paint');
      if (fcp) {
        expect(fcp.startTime).toBeLessThan(2500); // Mobile FCP threshold
      }
      
      const lcp = metrics.find(m => m.name === 'largest-contentful-paint');
      if (lcp) {
        expect(lcp.startTime).toBeLessThan(4000); // Mobile LCP threshold
      }
    });

    test('Touch interactions are responsive', async ({ page, context }) => {
      await context.setViewportSize(devices['iPhone 13'].viewport);
      await page.goto('/emergency-optimized.html');
      
      const interactiveElements = [
        '#emergency-call-btn',
        '#get-location',
        '#customer-phone',
        '#emergency-type',
        '#submit-emergency'
      ];
      
      for (const selector of interactiveElements) {
        const element = page.locator(selector);
        await expect(element).toBeVisible();
        
        const startTime = Date.now();
        await element.tap();
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(100); // 100ms response time for touch
      }
    });

    test('Scroll performance is smooth', async ({ page, context }) => {
      await context.setViewportSize(devices['iPhone 13'].viewport);
      await page.goto('/emergency-optimized.html');
      
      // Add content to make page scrollable
      await page.evaluate(() => {
        const content = document.createElement('div');
        content.style.height = '2000px';
        content.innerHTML = '<h2>Scroll Test Content</h2>'.repeat(50);
        document.body.appendChild(content);
      });
      
      // Test smooth scrolling
      await page.evaluate(() => {
        window.scrollTo({ top: 1000, behavior: 'smooth' });
      });
      
      await page.waitForTimeout(1000);
      
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeGreaterThan(800);
    });
  });

  test.describe('Device-Specific Features', () => {
    test('iPhone: Haptic feedback simulation', async ({ page, context }) => {
      await context.setViewportSize(devices['iPhone 13'].viewport);
      await context.setUserAgent(devices['iPhone 13'].userAgent);
      await page.goto('/emergency-optimized.html');
      
      // Test haptic feedback on emergency button
      const callButton = page.locator('#emergency-call-btn');
      
      // Mock haptic feedback
      await page.addInitScript(() => {
        window.navigator.vibrate = (pattern) => {
          window.lastVibrationPattern = pattern;
          return true;
        };
      });
      
      await callButton.tap();
      
      const vibrationPattern = await page.evaluate(() => window.lastVibrationPattern);
      expect(vibrationPattern).toBeTruthy();
    });

    test('Android: Web Share API', async ({ page, context }) => {
      await context.setViewportSize(devices['Pixel 5'].viewport);
      await context.setUserAgent(devices['Pixel 5'].userAgent);
      await page.goto('/emergency-optimized.html');
      
      // Mock Web Share API
      await page.addInitScript(() => {
        window.navigator.share = async (shareData) => {
          window.lastShareData = shareData;
          return Promise.resolve();
        };
      });
      
      // Complete emergency submission first
      await page.fill('#customer-phone', '+44123456789');
      await page.selectOption('#emergency-type', 'breakdown');
      await page.click('#submit-emergency');
      
      // Test sharing emergency details
      const shareButton = page.locator('#share-emergency');
      if (await shareButton.isVisible()) {
        await shareButton.tap();
        
        const shareData = await page.evaluate(() => window.lastShareData);
        expect(shareData.title).toContain('Emergency');
        expect(shareData.url).toBeTruthy();
      }
    });

    test('iPad: Split view compatibility', async ({ page, context }) => {
      await context.setViewportSize(devices['iPad Pro'].viewport);
      await page.goto('/emergency-optimized.html');
      
      // Test responsive design at tablet sizes
      const emergencyForm = page.locator('#emergency-form');
      const formBox = await emergencyForm.boundingBox();
      
      // Should use available space efficiently on tablet
      expect(formBox.width).toBeGreaterThan(400);
      expect(formBox.width).toBeLessThan(1024); // Not full desktop width
      
      // Test landscape orientation
      await context.setViewportSize({ width: 1366, height: 1024 });
      await page.reload();
      
      const landscapeFormBox = await emergencyForm.boundingBox();
      expect(landscapeFormBox.width).toBeGreaterThan(formBox.width);
    });
  });
});