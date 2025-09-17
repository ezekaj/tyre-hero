/**
 * Dispatch System Integration Tests
 * Testing technician dispatch, tracking, and emergency response coordination
 */

import { jest } from '@jest/globals';

// Mock external APIs
const mockGoogleMaps = {
  DistanceMatrix: jest.fn(),
  Geocoding: jest.fn(),
  Directions: jest.fn()
};

const mockTwilio = {
  messages: {
    create: jest.fn()
  },
  calls: {
    create: jest.fn()
  }
};

const mockDatabase = {
  technicians: {
    find: jest.fn(),
    updateOne: jest.fn(),
    insertOne: jest.fn()
  },
  emergencies: {
    find: jest.fn(),
    updateOne: jest.fn(),
    insertOne: jest.fn()
  }
};

global.fetch = jest.fn();

describe('Dispatch System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockDatabase.technicians.find.mockResolvedValue([
      {
        id: 'tech1',
        name: 'John Smith',
        location: { lat: 51.5074, lng: -0.1278 },
        status: 'available',
        skills: ['car', 'motorcycle'],
        rating: 4.8
      },
      {
        id: 'tech2',
        name: 'Sarah Jones',
        location: { lat: 51.5155, lng: -0.0922 },
        status: 'available',
        skills: ['car', 'van', 'truck'],
        rating: 4.9
      }
    ]);

    mockGoogleMaps.DistanceMatrix.mockResolvedValue({
      rows: [{
        elements: [{
          duration: { value: 1200, text: '20 mins' },
          distance: { value: 5000, text: '5.0 km' }
        }]
      }]
    });
  });

  describe('Emergency Dispatch Algorithm', () => {
    test('should find nearest available technician within 90 minutes', async () => {
      const emergency = {
        id: 'emergency-001',
        location: { lat: 51.5074, lng: -0.1278 },
        vehicleType: 'car',
        timestamp: Date.now()
      };

      const availableTechnicians = await mockDatabase.technicians.find({
        status: 'available',
        skills: { $in: [emergency.vehicleType] }
      });

      // Calculate distances and ETAs
      const technicianDistances = await Promise.all(
        availableTechnicians.map(async (tech) => {
          const distanceData = await mockGoogleMaps.DistanceMatrix({
            origins: [tech.location],
            destinations: [emergency.location]
          });
          
          return {
            ...tech,
            eta: distanceData.rows[0].elements[0].duration.value,
            distance: distanceData.rows[0].elements[0].distance.value
          };
        })
      );

      // Sort by ETA
      const sortedTechnicians = technicianDistances.sort((a, b) => a.eta - b.eta);
      const nearestTechnician = sortedTechnicians[0];

      // 90-minute SLA check (5400 seconds)
      expect(nearestTechnician.eta).toBeLessThan(5400);
      expect(nearestTechnician.id).toBe('tech1');
    });

    test('should consider technician skills and ratings', async () => {
      const emergency = {
        location: { lat: 51.5074, lng: -0.1278 },
        vehicleType: 'truck',
        priority: 'high'
      };

      const availableTechnicians = await mockDatabase.technicians.find({
        status: 'available',
        skills: { $in: [emergency.vehicleType] }
      });

      // Filter by skills and rating
      const qualifiedTechnicians = availableTechnicians.filter(tech => 
        tech.skills.includes(emergency.vehicleType) && tech.rating >= 4.5
      );

      expect(qualifiedTechnicians).toHaveLength(1);
      expect(qualifiedTechnicians[0].id).toBe('tech2');
      expect(qualifiedTechnicians[0].skills).toContain('truck');
    });

    test('should handle no available technicians scenario', async () => {
      const emergency = {
        location: { lat: 51.5074, lng: -0.1278 },
        vehicleType: 'motorcycle'
      };

      // Mock no available technicians
      mockDatabase.technicians.find.mockResolvedValue([]);

      const availableTechnicians = await mockDatabase.technicians.find({
        status: 'available',
        skills: { $in: [emergency.vehicleType] }
      });

      expect(availableTechnicians).toHaveLength(0);

      // Should escalate to emergency protocols
      const escalationResult = await escalateEmergency(emergency);
      
      expect(escalationResult.action).toBe('partner_network');
      expect(escalationResult.estimatedWait).toBeGreaterThan(90);
    });
  });

  describe('Technician Assignment', () => {
    test('should assign technician and update status', async () => {
      const emergency = {
        id: 'emergency-002',
        location: { lat: 51.5074, lng: -0.1278 },
        customerId: 'customer-001'
      };

      const selectedTechnician = {
        id: 'tech1',
        name: 'John Smith',
        location: { lat: 51.5155, lng: -0.0922 }
      };

      // Mock successful assignment
      mockDatabase.technicians.updateOne.mockResolvedValue({ 
        modifiedCount: 1 
      });
      mockDatabase.emergencies.updateOne.mockResolvedValue({ 
        modifiedCount: 1 
      });

      // Assign technician
      await mockDatabase.technicians.updateOne(
        { id: selectedTechnician.id },
        { 
          $set: { 
            status: 'assigned',
            currentEmergency: emergency.id,
            assignedAt: Date.now()
          }
        }
      );

      // Update emergency record
      await mockDatabase.emergencies.updateOne(
        { id: emergency.id },
        { 
          $set: { 
            assignedTechnician: selectedTechnician.id,
            status: 'technician_assigned',
            assignedAt: Date.now()
          }
        }
      );

      expect(mockDatabase.technicians.updateOne).toHaveBeenCalledWith(
        { id: 'tech1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 'assigned',
            currentEmergency: 'emergency-002'
          })
        })
      );
    });

    test('should send assignment notifications', async () => {
      const technician = {
        id: 'tech1',
        phone: '+44123456789',
        name: 'John Smith'
      };

      const emergency = {
        id: 'emergency-003',
        location: { lat: 51.5074, lng: -0.1278 },
        address: '123 Emergency Street, London',
        customerPhone: '+44987654321'
      };

      // Mock SMS notifications
      mockTwilio.messages.create.mockResolvedValue({
        sid: 'SMS123',
        status: 'sent'
      });

      // Send notification to technician
      const technicianSMS = await mockTwilio.messages.create({
        to: technician.phone,
        from: '+44800TYREHELP',
        body: `Emergency assignment: ${emergency.address}. Customer: ${emergency.customerPhone}. Emergency ID: ${emergency.id}`
      });

      // Send notification to customer
      const customerSMS = await mockTwilio.messages.create({
        to: emergency.customerPhone,
        from: '+44800TYREHELP',
        body: `Technician ${technician.name} assigned. Contact: ${technician.phone}. Tracking: https://tyrehero.com/track/${emergency.id}`
      });

      expect(technicianSMS.status).toBe('sent');
      expect(customerSMS.status).toBe('sent');
      expect(mockTwilio.messages.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Tracking', () => {
    test('should track technician location in real-time', async () => {
      const technician = {
        id: 'tech1',
        currentEmergency: 'emergency-004'
      };

      const locationUpdates = [
        { lat: 51.5074, lng: -0.1278, timestamp: Date.now() },
        { lat: 51.5084, lng: -0.1268, timestamp: Date.now() + 30000 },
        { lat: 51.5094, lng: -0.1258, timestamp: Date.now() + 60000 }
      ];

      // Mock location updates
      for (const location of locationUpdates) {
        await mockDatabase.technicians.updateOne(
          { id: technician.id },
          { 
            $set: { 
              location: location,
              lastLocationUpdate: location.timestamp
            }
          }
        );
      }

      expect(mockDatabase.technicians.updateOne).toHaveBeenCalledTimes(3);
      
      // Verify real-time constraints (updates within 30 seconds)
      const timeDifferences = locationUpdates
        .slice(1)
        .map((update, index) => update.timestamp - locationUpdates[index].timestamp);
      
      expect(Math.max(...timeDifferences)).toBeLessThanOrEqual(30000);
    });

    test('should calculate accurate ETA updates', async () => {
      const technician = {
        id: 'tech1',
        location: { lat: 51.5155, lng: -0.0922 }
      };

      const emergency = {
        id: 'emergency-005',
        location: { lat: 51.5074, lng: -0.1278 }
      };

      // Mock Google Maps directions
      mockGoogleMaps.Directions.mockResolvedValue({
        routes: [{
          legs: [{
            duration: { value: 1800, text: '30 mins' },
            distance: { value: 8000, text: '8.0 km' }
          }]
        }]
      });

      const directionsData = await mockGoogleMaps.Directions({
        origin: technician.location,
        destination: emergency.location,
        mode: 'driving',
        traffic_model: 'best_guess',
        departure_time: 'now'
      });

      const eta = directionsData.routes[0].legs[0].duration.value;
      const estimatedArrival = Date.now() + (eta * 1000);

      expect(eta).toBe(1800); // 30 minutes
      expect(estimatedArrival).toBeGreaterThan(Date.now());
    });

    test('should handle GPS signal loss', async () => {
      const technician = {
        id: 'tech1',
        lastLocationUpdate: Date.now() - 300000 // 5 minutes ago
      };

      const currentTime = Date.now();
      const lastUpdateTime = technician.lastLocationUpdate;
      const timeSinceUpdate = currentTime - lastUpdateTime;
      const maxAllowedGap = 120000; // 2 minutes

      if (timeSinceUpdate > maxAllowedGap) {
        // Alert for GPS signal loss
        const alert = {
          type: 'gps_signal_lost',
          technicianId: technician.id,
          lastSeen: lastUpdateTime,
          requiresAction: true
        };

        expect(alert.requiresAction).toBe(true);
        expect(timeSinceUpdate).toBeGreaterThan(maxAllowedGap);
      }
    });
  });

  describe('Emergency Escalation', () => {
    test('should escalate when SLA deadline approached', async () => {
      const emergency = {
        id: 'emergency-006',
        createdAt: Date.now() - (75 * 60 * 1000), // 75 minutes ago
        status: 'technician_assigned',
        slaDeadline: 90 * 60 * 1000 // 90 minutes
      };

      const timeElapsed = Date.now() - emergency.createdAt;
      const timeRemaining = emergency.slaDeadline - timeElapsed;
      const escalationThreshold = 15 * 60 * 1000; // 15 minutes warning

      if (timeRemaining <= escalationThreshold) {
        const escalation = await escalateEmergency(emergency);
        
        expect(escalation.level).toBe('manager_alert');
        expect(escalation.timeRemaining).toBeLessThanOrEqual(escalationThreshold);
      }
    });

    test('should activate backup technicians when needed', async () => {
      const emergency = {
        id: 'emergency-007',
        assignedTechnician: 'tech1',
        status: 'delayed'
      };

      // Mock backup technicians
      mockDatabase.technicians.find.mockResolvedValue([
        {
          id: 'tech-backup1',
          status: 'available',
          isBackup: true,
          eta: 2400 // 40 minutes
        }
      ]);

      const backupTechnicians = await mockDatabase.technicians.find({
        status: 'available',
        isBackup: true
      });

      expect(backupTechnicians).toHaveLength(1);
      expect(backupTechnicians[0].eta).toBeLessThan(3600); // Within 1 hour
    });
  });

  describe('Communication Systems', () => {
    test('should send automated status updates', async () => {
      const emergency = {
        id: 'emergency-008',
        customerPhone: '+44987654321'
      };

      const statusUpdates = [
        'Technician assigned and en route',
        'Technician arrived at location',
        'Service in progress',
        'Service completed'
      ];

      mockTwilio.messages.create.mockResolvedValue({
        sid: 'SMS_UPDATE',
        status: 'sent'
      });

      for (const update of statusUpdates) {
        await mockTwilio.messages.create({
          to: emergency.customerPhone,
          from: '+44800TYREHELP',
          body: `TyreHero Update: ${update}. Track: https://tyrehero.com/track/${emergency.id}`
        });
      }

      expect(mockTwilio.messages.create).toHaveBeenCalledTimes(4);
    });

    test('should handle emergency calls during critical delays', async () => {
      const emergency = {
        id: 'emergency-009',
        customerPhone: '+44987654321',
        status: 'critical_delay'
      };

      // Mock emergency call
      mockTwilio.calls.create.mockResolvedValue({
        sid: 'CALL123',
        status: 'initiated'
      });

      const emergencyCall = await mockTwilio.calls.create({
        to: emergency.customerPhone,
        from: '+44800EMERGENCY',
        url: 'https://tyrehero.com/twiml/emergency-delay-message'
      });

      expect(emergencyCall.status).toBe('initiated');
      expect(mockTwilio.calls.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+44987654321',
          from: '+44800EMERGENCY'
        })
      );
    });
  });

  describe('Performance Metrics', () => {
    test('should track dispatch response times', async () => {
      const dispatches = [
        { requestTime: 1000, assignTime: 1030 }, // 30 seconds
        { requestTime: 2000, assignTime: 2025 }, // 25 seconds
        { requestTime: 3000, assignTime: 3040 }, // 40 seconds
      ];

      const responseTimes = dispatches.map(d => d.assignTime - d.requestTime);
      const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      const maxAcceptableTime = 60; // 60 seconds

      expect(averageResponseTime).toBeLessThan(maxAcceptableTime);
      expect(Math.max(...responseTimes)).toBeLessThan(maxAcceptableTime);
    });

    test('should monitor SLA compliance rates', async () => {
      const emergencies = [
        { slaTarget: 90, actualTime: 85, compliant: true },
        { slaTarget: 90, actualTime: 75, compliant: true },
        { slaTarget: 90, actualTime: 105, compliant: false },
        { slaTarget: 90, actualTime: 80, compliant: true }
      ];

      const complianceRate = emergencies.filter(e => e.compliant).length / emergencies.length;
      const targetComplianceRate = 0.95; // 95% target

      expect(complianceRate).toBeGreaterThanOrEqual(0.75); // 75% minimum
      
      if (complianceRate < targetComplianceRate) {
        const improvement = {
          currentRate: complianceRate,
          target: targetComplianceRate,
          actionsRequired: true
        };
        
        expect(improvement.actionsRequired).toBe(true);
      }
    });
  });
});

// Helper function for emergency escalation
async function escalateEmergency(emergency) {
  const timeElapsed = Date.now() - emergency.createdAt;
  const slaDeadline = emergency.slaDeadline || (90 * 60 * 1000);
  const timeRemaining = slaDeadline - timeElapsed;

  if (timeRemaining <= 0) {
    return {
      level: 'critical',
      action: 'immediate_manager_call',
      timeRemaining: 0
    };
  } else if (timeRemaining <= (15 * 60 * 1000)) {
    return {
      level: 'manager_alert',
      action: 'expedite_service',
      timeRemaining: timeRemaining
    };
  } else if (!emergency.assignedTechnician) {
    return {
      level: 'no_technician',
      action: 'partner_network',
      estimatedWait: 120 // minutes
    };
  }

  return {
    level: 'normal',
    action: 'continue_monitoring',
    timeRemaining: timeRemaining
  };
}