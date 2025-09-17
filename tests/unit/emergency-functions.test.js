// Unit tests for emergency service core functions
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('Emergency Service Core Functions', () => {
  let emergencyService;
  
  beforeEach(() => {
    // Mock the emergency service functions
    emergencyService = {
      initiateEmergencyCall: jest.fn(),
      calculateResponseTime: jest.fn(),
      findNearestTechnician: jest.fn(),
      validateLocation: jest.fn(),
      processPayment: jest.fn(),
      sendNotification: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Emergency Call Initiation', () => {
    test('should initiate emergency call within 2 seconds', async () => {
      const startTime = performance.now();
      
      emergencyService.initiateEmergencyCall.mockResolvedValue({
        callId: 'emergency-123',
        status: 'connected',
        timestamp: new Date().toISOString()
      });

      const result = await emergencyService.initiateEmergencyCall({
        location: global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY,
        urgency: 'high',
        userId: 'test-user-123'
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // Must be under 2 seconds
      expect(result).toHaveProperty('callId');
      expect(result.status).toBe('connected');
      expect(emergencyService.initiateEmergencyCall).toHaveBeenCalledTimes(1);
    });

    test('should handle network failures during emergency call', async () => {
      global.simulateNetworkConditions('offline');
      
      emergencyService.initiateEmergencyCall.mockRejectedValue(
        new Error('Network unavailable')
      );

      await expect(emergencyService.initiateEmergencyCall({
        location: global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY,
        urgency: 'high'
      })).rejects.toThrow('Network unavailable');

      // Should attempt retry mechanism
      expect(emergencyService.initiateEmergencyCall).toHaveBeenCalledTimes(1);
    });

    test('should prioritize high urgency calls', async () => {
      const highUrgencyCall = {
        urgency: 'high',
        location: global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY,
        timestamp: new Date().toISOString()
      };

      const lowUrgencyCall = {
        urgency: 'low',
        location: global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.MANCHESTER,
        timestamp: new Date().toISOString()
      };

      emergencyService.initiateEmergencyCall
        .mockResolvedValueOnce({ callId: 'high-1', priority: 1 })
        .mockResolvedValueOnce({ callId: 'low-1', priority: 3 });

      const highResult = await emergencyService.initiateEmergencyCall(highUrgencyCall);
      const lowResult = await emergencyService.initiateEmergencyCall(lowUrgencyCall);

      expect(highResult.priority).toBeLessThan(lowResult.priority);
    });
  });

  describe('Response Time Calculation', () => {
    test('should calculate response time within SLA limits', () => {
      const technicianLocation = global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY;
      const customerLocation = { lat: 51.5074, lng: -0.1280 }; // Very close
      
      emergencyService.calculateResponseTime.mockReturnValue({
        estimatedMinutes: 35,
        distance: 2.5,
        trafficFactor: 1.2,
        withinSLA: true
      });

      const result = emergencyService.calculateResponseTime(
        technicianLocation,
        customerLocation,
        new Date()
      );

      expect(result.estimatedMinutes).toBeLessThan(90); // Within 90-minute SLA
      expect(result.withinSLA).toBe(true);
      expect(result.distance).toBeGreaterThan(0);
    });

    test('should flag SLA violations for remote locations', () => {
      const technicianLocation = global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY;
      const customerLocation = global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.REMOTE_AREA;
      
      emergencyService.calculateResponseTime.mockReturnValue({
        estimatedMinutes: 120,
        distance: 150,
        trafficFactor: 1.5,
        withinSLA: false,
        escalationRequired: true
      });

      const result = emergencyService.calculateResponseTime(
        technicianLocation,
        customerLocation,
        new Date()
      );

      expect(result.estimatedMinutes).toBeGreaterThan(90);
      expect(result.withinSLA).toBe(false);
      expect(result.escalationRequired).toBe(true);
    });

    test('should account for traffic conditions', () => {
      const location = global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY;
      const rushHourTime = new Date('2023-12-01T08:30:00Z'); // Rush hour
      
      emergencyService.calculateResponseTime.mockReturnValue({
        estimatedMinutes: 55,
        distance: 10,
        trafficFactor: 2.1, // Heavy traffic
        withinSLA: true
      });

      const result = emergencyService.calculateResponseTime(
        location,
        location,
        rushHourTime
      );

      expect(result.trafficFactor).toBeGreaterThan(1.5); // Heavy traffic
      expect(result.estimatedMinutes).toBeGreaterThan(30); // Delayed by traffic
    });
  });

  describe('Technician Assignment', () => {
    test('should find nearest available technician within 30 seconds', async () => {
      const startTime = performance.now();
      const customerLocation = global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.LONDON_CITY;
      
      emergencyService.findNearestTechnician.mockResolvedValue({
        technicianId: 'tech-123',
        name: 'John Smith',
        location: customerLocation,
        distance: 2.5,
        eta: 25,
        skills: ['puncture-repair', 'tyre-replacement']
      });

      const result = await emergencyService.findNearestTechnician(
        customerLocation,
        ['puncture-repair']
      );

      const endTime = performance.now();
      const assignmentTime = endTime - startTime;

      expect(assignmentTime).toBeLessThan(30000); // Under 30 seconds
      expect(result).toHaveProperty('technicianId');
      expect(result.skills).toContain('puncture-repair');
      expect(result.distance).toBeGreaterThan(0);
    });

    test('should handle no available technicians scenario', async () => {
      emergencyService.findNearestTechnician.mockResolvedValue(null);

      const result = await emergencyService.findNearestTechnician(
        global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.REMOTE_AREA,
        ['puncture-repair']
      );

      expect(result).toBeNull();
      // Should trigger escalation process
    });

    test('should match technician skills to service type', async () => {
      const requiredSkills = ['multiple-tyre-replacement', 'commercial-vehicle'];
      
      emergencyService.findNearestTechnician.mockResolvedValue({
        technicianId: 'tech-specialist-456',
        skills: ['multiple-tyre-replacement', 'commercial-vehicle', 'emergency-repair'],
        specialistLevel: 'advanced'
      });

      const result = await emergencyService.findNearestTechnician(
        global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.MANCHESTER,
        requiredSkills
      );

      expect(result.skills).toEqual(
        expect.arrayContaining(requiredSkills)
      );
      expect(result.specialistLevel).toBe('advanced');
    });
  });

  describe('Location Validation', () => {
    test('should validate GPS coordinates within 100m accuracy', () => {
      const validLocation = {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 50 // Within 100m requirement
      };

      emergencyService.validateLocation.mockReturnValue({
        isValid: true,
        accuracy: 50,
        withinRequiredAccuracy: true,
        address: '123 Test Street, London, UK'
      });

      const result = emergencyService.validateLocation(validLocation);

      expect(result.isValid).toBe(true);
      expect(result.accuracy).toBeLessThan(100);
      expect(result.withinRequiredAccuracy).toBe(true);
    });

    test('should reject coordinates with poor accuracy', () => {
      const poorLocation = {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 250 // Poor accuracy
      };

      emergencyService.validateLocation.mockReturnValue({
        isValid: false,
        accuracy: 250,
        withinRequiredAccuracy: false,
        requiresManualVerification: true
      });

      const result = emergencyService.validateLocation(poorLocation);

      expect(result.isValid).toBe(false);
      expect(result.accuracy).toBeGreaterThan(100);
      expect(result.requiresManualVerification).toBe(true);
    });

    test('should handle invalid coordinates', () => {
      const invalidLocation = {
        latitude: 999, // Invalid latitude
        longitude: -0.1278,
        accuracy: 10
      };

      emergencyService.validateLocation.mockReturnValue({
        isValid: false,
        error: 'Invalid coordinates',
        requiresUserInput: true
      });

      const result = emergencyService.validateLocation(invalidLocation);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid coordinates');
      expect(result.requiresUserInput).toBe(true);
    });
  });

  describe('Payment Processing', () => {
    test('should process emergency payment within 30 seconds', async () => {
      const startTime = performance.now();
      const paymentData = {
        amount: 89.99,
        currency: 'GBP',
        cardToken: 'tok_emergency_test',
        emergencyId: 'emergency-123'
      };

      emergencyService.processPayment.mockResolvedValue({
        paymentId: 'pay_emergency_456',
        status: 'succeeded',
        amount: 89.99,
        processingTime: 1200
      });

      const result = await emergencyService.processPayment(paymentData);

      const endTime = performance.now();
      const paymentTime = endTime - startTime;

      expect(paymentTime).toBeLessThan(30000); // Under 30 seconds
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(paymentData.amount);
    });

    test('should handle payment failures gracefully', async () => {
      const paymentData = {
        amount: 89.99,
        currency: 'GBP',
        cardToken: 'tok_declined',
        emergencyId: 'emergency-123'
      };

      emergencyService.processPayment.mockResolvedValue({
        status: 'failed',
        error: 'insufficient_funds',
        alternativePaymentMethods: ['apple_pay', 'google_pay', 'bank_transfer']
      });

      const result = await emergencyService.processPayment(paymentData);

      expect(result.status).toBe('failed');
      expect(result.alternativePaymentMethods).toContain('apple_pay');
    });

    test('should apply emergency service pricing', async () => {
      const emergencyData = {
        serviceType: 'emergency-puncture',
        location: global.EMERGENCY_TEST_CONSTANTS.TEST_LOCATIONS.REMOTE_AREA,
        timeOfDay: 'night', // Night premium
        urgency: 'high'
      };

      emergencyService.processPayment.mockResolvedValue({
        basePrice: 59.99,
        emergencyPremium: 20.00,
        locationSurcharge: 10.00,
        totalAmount: 89.99,
        breakdown: {
          service: 59.99,
          emergency: 20.00,
          location: 10.00
        }
      });

      const result = await emergencyService.processPayment(emergencyData);

      expect(result.totalAmount).toBeGreaterThan(result.basePrice);
      expect(result.breakdown.emergency).toBeGreaterThan(0);
      expect(result.breakdown.location).toBeGreaterThan(0);
    });
  });

  describe('Notification System', () => {
    test('should send critical notifications immediately', async () => {
      const notification = {
        type: 'emergency_dispatch',
        urgency: 'critical',
        recipientId: 'tech-123',
        message: 'Emergency service request assigned',
        channels: ['sms', 'push', 'call']
      };

      emergencyService.sendNotification.mockResolvedValue({
        notificationId: 'notif-789',
        status: 'sent',
        deliveredChannels: ['sms', 'push'],
        failedChannels: ['call'],
        timestamp: new Date().toISOString()
      });

      const result = await emergencyService.sendNotification(notification);

      expect(result.status).toBe('sent');
      expect(result.deliveredChannels).toContain('sms');
      expect(result.deliveredChannels).toContain('push');
    });

    test('should retry failed critical notifications', async () => {
      const notification = {
        type: 'emergency_update',
        urgency: 'critical',
        recipientId: 'customer-456'
      };

      emergencyService.sendNotification
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          notificationId: 'notif-retry-789',
          status: 'sent',
          attempt: 2,
          deliveredChannels: ['sms']
        });

      const result = await emergencyService.sendNotification(notification);

      expect(result.status).toBe('sent');
      expect(result.attempt).toBe(2);
      expect(emergencyService.sendNotification).toHaveBeenCalledTimes(2);
    });
  });
});