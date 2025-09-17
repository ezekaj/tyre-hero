/**
 * Emergency Customer Journey E2E Tests
 * Testing complete customer experience from emergency to service completion
 */

import { test, expect } from '@playwright/test';

test.describe('Emergency Customer Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant necessary permissions
    await context.grantPermissions(['geolocation', 'notifications']);
    
    // Set geolocation to London
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
    
    // Navigate to emergency page
    await page.goto('/emergency-optimized.html');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Complete emergency service request flow', async ({ page }) => {
    // Step 1: Emergency page loads within SLA (3 seconds)
    const startTime = Date.now();
    await page.waitForSelector('#emergency-call-btn', { timeout: 3000 });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Step 2: Emergency call button is immediately responsive
    const callButton = page.locator('#emergency-call-btn');
    await expect(callButton).toBeVisible();
    
    const callStartTime = Date.now();
    await callButton.click();
    const callResponseTime = Date.now() - callStartTime;
    expect(callResponseTime).toBeLessThan(200); // 200ms SLA

    // Step 3: Fill emergency form
    await page.fill('#customer-name', 'John Emergency Test');
    await page.fill('#customer-phone', '+44123456789');
    await page.fill('#customer-email', 'john.test@emergency.com');
    
    // Vehicle details
    await page.selectOption('#vehicle-type', 'car');
    await page.fill('#vehicle-make', 'BMW');
    await page.fill('#vehicle-model', 'X5');
    await page.fill('#registration', 'EM3RG3NCY');

    // Emergency details
    await page.selectOption('#emergency-type', 'flat-tyre');
    await page.fill('#emergency-description', 'Front left tyre completely flat, cannot drive safely');
    
    // Location (should auto-populate)
    await expect(page.locator('#location-display')).toContainText('London');
    
    // Step 4: Submit emergency form within SLA
    const submitStartTime = Date.now();
    await page.click('#submit-emergency');
    
    // Wait for submission success
    await page.waitForSelector('.emergency-success', { timeout: 5000 });
    const submitTime = Date.now() - submitStartTime;
    expect(submitTime).toBeLessThan(1000); // 1 second SLA

    // Step 5: Verify emergency confirmation
    const emergencyId = await page.textContent('#emergency-id');
    expect(emergencyId).toMatch(/^EM-\d{6,}$/); // Emergency ID format

    const estimatedETA = await page.textContent('#estimated-eta');
    expect(estimatedETA).toContain('minutes');

    // Step 6: Test real-time tracking
    await page.click('#track-technician');
    await page.waitForSelector('#tracking-map', { timeout: 5000 });
    
    // Verify tracking elements
    await expect(page.locator('#technician-location')).toBeVisible();
    await expect(page.locator('#customer-location')).toBeVisible();
    await expect(page.locator('#route-path')).toBeVisible();

    // Step 7: Test SMS/notification integration
    const smsButton = page.locator('#send-sms-update');
    if (await smsButton.isVisible()) {
      await smsButton.click();
      await expect(page.locator('.sms-sent-confirmation')).toBeVisible();
    }

    // Step 8: Simulate technician arrival
    await page.evaluate(() => {
      window.simulateTechnicianArrival?.();
    });
    
    await page.waitForSelector('.technician-arrived', { timeout: 10000 });
    await expect(page.locator('.status-update')).toContainText('arrived');

    // Step 9: Test service completion flow
    await page.click('#confirm-service-start');
    await expect(page.locator('.service-in-progress')).toBeVisible();

    // Simulate service completion
    await page.evaluate(() => {
      window.simulateServiceCompletion?.();
    });

    await page.waitForSelector('.service-completed', { timeout: 10000 });
    
    // Step 10: Payment processing
    await page.click('#proceed-to-payment');
    await page.waitForSelector('#payment-form', { timeout: 5000 });

    // Fill payment details (using test card)
    await page.fill('#card-number', '4242424242424242');
    await page.fill('#expiry', '12/25');
    await page.fill('#cvc', '123');
    await page.fill('#cardholder-name', 'John Emergency Test');

    const paymentStartTime = Date.now();
    await page.click('#submit-payment');
    
    await page.waitForSelector('.payment-success', { timeout: 10000 });
    const paymentTime = Date.now() - paymentStartTime;
    expect(paymentTime).toBeLessThan(5000); // 5 second payment SLA

    // Step 11: Service completion and rating
    await page.waitForSelector('#service-rating', { timeout: 5000 });
    await page.click('#rating-5-stars');
    await page.fill('#feedback-text', 'Excellent emergency service, very professional');
    await page.click('#submit-feedback');

    // Step 12: Final confirmation and receipt
    await expect(page.locator('.service-complete')).toBeVisible();
    await expect(page.locator('#receipt-number')).toBeVisible();
    
    const receiptNumber = await page.textContent('#receipt-number');
    expect(receiptNumber).toMatch(/^RC-\d{6,}$/);
  });

  test('Emergency call button works offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    const callButton = page.locator('#emergency-call-btn');
    await expect(callButton).toBeVisible();
    
    // Emergency call should still work offline (direct tel: link)
    await callButton.click();
    
    // Verify offline emergency form appears
    await expect(page.locator('#offline-emergency-form')).toBeVisible();
    
    // Fill offline form
    await page.fill('#offline-name', 'Offline Emergency Test');
    await page.fill('#offline-phone', '+44987654321');
    await page.fill('#offline-emergency', 'Flat tyre on M25 motorway');
    
    await page.click('#save-offline-emergency');
    
    // Verify data saved to localStorage
    const offlineData = await page.evaluate(() => {
      return localStorage.getItem('emergencyOfflineQueue');
    });
    
    expect(offlineData).toBeTruthy();
    const parsedData = JSON.parse(offlineData);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0].phone).toBe('+44987654321');
  });

  test('Location services and emergency dispatch', async ({ page }) => {
    // Test location detection
    await page.click('#get-location');
    
    await page.waitForSelector('#location-display', { timeout: 10000 });
    const location = await page.textContent('#location-display');
    expect(location).toContain('London'); // Mocked location

    // Test emergency form with location
    await page.fill('#customer-phone', '+44123456789');
    await page.selectOption('#emergency-type', 'breakdown');
    
    await page.click('#submit-emergency');
    await page.waitForSelector('.emergency-success', { timeout: 5000 });

    // Verify technician assignment
    await page.waitForSelector('#assigned-technician', { timeout: 15000 });
    const technicianName = await page.textContent('#technician-name');
    expect(technicianName).toBeTruthy();

    const eta = await page.textContent('#technician-eta');
    expect(eta).toMatch(/\d+\s+minutes?/);
    
    // Verify ETA is within 90-minute SLA
    const etaMinutes = parseInt(eta.match(/\d+/)[0]);
    expect(etaMinutes).toBeLessThanOrEqual(90);
  });

  test('Mobile responsive emergency interface', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile-specific elements
    await expect(page.locator('.mobile-emergency-btn')).toBeVisible();
    await expect(page.locator('#mobile-call-btn')).toBeVisible();
    
    // Test swipe gestures for emergency call
    const emergencyBtn = page.locator('.mobile-emergency-btn');
    
    // Simulate swipe right to call
    await emergencyBtn.hover();
    await page.mouse.down();
    await page.mouse.move(300, 0); // Swipe right
    await page.mouse.up();
    
    // Should trigger emergency call
    await expect(page.locator('.call-initiated')).toBeVisible();
    
    // Test mobile form filling
    await page.tap('#customer-phone');
    await page.fill('#customer-phone', '07123456789');
    
    // Test mobile keyboard optimization
    const phoneInput = page.locator('#customer-phone');
    const inputType = await phoneInput.getAttribute('inputmode');
    expect(inputType).toBe('tel');
  });

  test('Emergency form validation and error handling', async ({ page }) => {
    // Test empty form submission
    await page.click('#submit-emergency');
    
    await expect(page.locator('.validation-errors')).toBeVisible();
    await expect(page.locator('#phone-error')).toContainText('required');
    
    // Test invalid phone number
    await page.fill('#customer-phone', '123');
    await page.click('#submit-emergency');
    
    await expect(page.locator('#phone-error')).toContainText('valid phone number');
    
    // Test valid phone formats
    const validNumbers = ['+44123456789', '07123456789', '+1234567890'];
    
    for (const number of validNumbers) {
      await page.fill('#customer-phone', number);
      await page.selectOption('#emergency-type', 'flat-tyre');
      
      const phoneError = page.locator('#phone-error');
      if (await phoneError.isVisible()) {
        expect(await phoneError.textContent()).not.toContain('valid phone number');
      }
    }
  });

  test('Real-time status updates and notifications', async ({ page }) => {
    // Complete emergency submission
    await page.fill('#customer-phone', '+44123456789');
    await page.selectOption('#emergency-type', 'breakdown');
    await page.click('#submit-emergency');
    
    await page.waitForSelector('.emergency-success');
    
    // Test WebSocket status updates
    await page.evaluate(() => {
      // Simulate WebSocket status updates
      window.mockWebSocketUpdate?.({
        type: 'technician_assigned',
        technicianName: 'John Smith',
        eta: 25
      });
    });
    
    await expect(page.locator('.status-update')).toContainText('technician assigned');
    
    // Test push notification simulation
    await page.evaluate(() => {
      window.mockPushNotification?.({
        title: 'Technician Update',
        body: 'Your technician is 5 minutes away',
        tag: 'technician-eta'
      });
    });
    
    await expect(page.locator('.notification-display')).toBeVisible();
  });

  test('Payment failure handling and recovery', async ({ page }) => {
    // Navigate to payment after emergency submission
    await page.fill('#customer-phone', '+44123456789');
    await page.selectOption('#emergency-type', 'flat-tyre');
    await page.click('#submit-emergency');
    await page.waitForSelector('.emergency-success');
    
    // Simulate service completion
    await page.evaluate(() => {
      window.simulateServiceCompletion?.();
    });
    
    await page.waitForSelector('#proceed-to-payment');
    await page.click('#proceed-to-payment');
    
    // Test declined card
    await page.fill('#card-number', '4000000000000002'); // Declined card
    await page.fill('#expiry', '12/25');
    await page.fill('#cvc', '123');
    
    await page.click('#submit-payment');
    
    await expect(page.locator('.payment-error')).toBeVisible();
    await expect(page.locator('.payment-error')).toContainText('declined');
    
    // Test retry with valid card
    await page.fill('#card-number', '4242424242424242');
    await page.click('#submit-payment');
    
    await page.waitForSelector('.payment-success', { timeout: 10000 });
    await expect(page.locator('.payment-success')).toBeVisible();
  });

  test('Accessibility compliance for emergency interface', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#emergency-call-btn')).toBeFocused();
    
    await page.keyboard.press('Enter');
    // Emergency call should be triggered
    
    // Test ARIA labels
    const callButton = page.locator('#emergency-call-btn');
    const ariaLabel = await callButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Emergency');
    
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(callButton).toBeVisible();
    
    // Test screen reader compatibility
    const emergencyHeading = page.locator('h1');
    const headingText = await emergencyHeading.textContent();
    expect(headingText).toContain('Emergency');
    
    // Test focus management
    await page.fill('#customer-phone', '+44123456789');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement.id);
    expect(['customer-email', 'vehicle-type']).toContain(focusedElement);
  });

  test('Emergency data persistence and recovery', async ({ page }) => {
    // Fill partial form
    await page.fill('#customer-name', 'Test User');
    await page.fill('#customer-phone', '+44123456789');
    await page.selectOption('#emergency-type', 'breakdown');
    
    // Reload page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if data is restored
    const name = await page.inputValue('#customer-name');
    const phone = await page.inputValue('#customer-phone');
    
    expect(name).toBe('Test User');
    expect(phone).toBe('+44123456789');
    
    // Test emergency session restoration
    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('emergencySession');
    });
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      expect(session.customerName).toBe('Test User');
    }
  });
});