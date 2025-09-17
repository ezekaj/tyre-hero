/**
 * Global Setup for E2E Emergency Service Tests
 * Configures test environment and emergency simulation services
 */

async function globalSetup(config) {
  console.log('🚨 Setting up Emergency Service E2E Test Environment...');
  
  // Setup test database
  await setupTestDatabase();
  
  // Configure mock services
  await configureMockServices();
  
  // Setup emergency simulation endpoints
  await setupEmergencySimulation();
  
  // Initialize performance monitoring
  await initializePerformanceMonitoring();
  
  console.log('✅ Emergency Service E2E Environment Ready');
}

async function setupTestDatabase() {
  console.log('📊 Setting up test database...');
  
  // Mock emergency database with test data
  const testEmergencies = [
    {
      id: 'emergency-test-001',
      customerId: 'customer-001',
      location: { lat: 51.5074, lng: -0.1278 },
      status: 'active',
      emergencyType: 'flat-tyre',
      createdAt: Date.now()
    }
  ];
  
  const testTechnicians = [
    {
      id: 'technician-001',
      name: 'John Test Technician',
      location: { lat: 51.5155, lng: -0.0922 },
      status: 'available',
      skills: ['car', 'motorcycle'],
      rating: 4.8
    }
  ];
  
  // Store in global test state
  global.testData = {
    emergencies: testEmergencies,
    technicians: testTechnicians
  };
}

async function configureMockServices() {
  console.log('🛠️ Configuring mock external services...');
  
  // Mock payment gateway responses
  global.mockPaymentGateway = {
    stripe: {
      createPaymentIntent: () => ({
        id: 'pi_test_success',
        status: 'succeeded',
        amount: 8500
      }),
      confirmPayment: () => ({
        paymentIntent: { status: 'succeeded' }
      })
    },
    paypal: {
      createOrder: () => ({
        id: 'ORDER_TEST_SUCCESS',
        status: 'APPROVED'
      })
    }
  };
  
  // Mock SMS/notification services
  global.mockNotificationService = {
    sendSMS: (to, message) => ({
      success: true,
      messageId: `sms_${Date.now()}`,
      to: to,
      status: 'sent'
    }),
    sendPushNotification: (notification) => ({
      success: true,
      notificationId: `push_${Date.now()}`,
      delivered: true
    })
  };
  
  // Mock geolocation services
  global.mockGeolocationService = {
    getCurrentPosition: () => ({
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10
      },
      timestamp: Date.now()
    }),
    reverseGeocode: (lat, lng) => ({
      address: '123 Test Street, London, UK',
      city: 'London',
      country: 'UK',
      postcode: 'E1 6AN'
    })
  };
}

async function setupEmergencySimulation() {
  console.log('🚨 Setting up emergency simulation endpoints...');
  
  // Create test server for emergency simulations
  const { createServer } = require('http');
  
  const testServer = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Emergency submission endpoint
    if (url.pathname === '/api/emergency' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const emergencyData = JSON.parse(body);
        
        const response = {
          success: true,
          emergencyId: `EM-${Date.now()}`,
          estimatedETA: 25,
          assignedTechnician: {
            id: 'technician-001',
            name: 'John Test Technician',
            phone: '+44123456789',
            eta: 25
          },
          trackingUrl: `https://tyrehero.com/track/EM-${Date.now()}`
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      });
      return;
    }
    
    // Payment processing endpoint
    if (url.pathname === '/api/payment' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const paymentData = JSON.parse(body);
        
        // Simulate payment processing
        const isSuccessful = !paymentData.cardNumber?.includes('0000000000000002');
        
        const response = isSuccessful ? {
          success: true,
          transactionId: `txn_${Date.now()}`,
          status: 'completed',
          amount: paymentData.amount
        } : {
          success: false,
          error: 'Your card was declined',
          code: 'card_declined'
        };
        
        res.writeHead(isSuccessful ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      });
      return;
    }
    
    // Technician tracking endpoint
    if (url.pathname.startsWith('/api/track/') && req.method === 'GET') {
      const emergencyId = url.pathname.split('/').pop();
      
      const response = {
        emergencyId: emergencyId,
        status: 'technician_assigned',
        technician: {
          name: 'John Test Technician',
          location: { lat: 51.5155, lng: -0.0922 },
          eta: 23
        },
        customer: {
          location: { lat: 51.5074, lng: -0.1278 }
        },
        route: [
          { lat: 51.5155, lng: -0.0922 },
          { lat: 51.5120, lng: -0.1100 },
          { lat: 51.5074, lng: -0.1278 }
        ]
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }
    
    // WebSocket simulation endpoint
    if (url.pathname === '/api/websocket-simulation' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const wsData = JSON.parse(body);
        
        // Simulate WebSocket message
        global.mockWebSocketMessage = wsData;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, simulated: true }));
      });
      return;
    }
    
    // Default 404
    res.writeHead(404);
    res.end('Not Found');
  });
  
  // Start test server on port 3001
  const port = 3001;
  testServer.listen(port, () => {
    console.log(`🌐 Emergency simulation server running on port ${port}`);
  });
  
  global.testServer = testServer;
}

async function initializePerformanceMonitoring() {
  console.log('📊 Initializing performance monitoring for emergency scenarios...');
  
  // Track emergency response times
  global.performanceMetrics = {
    emergencyCallResponse: [],
    formSubmissionTimes: [],
    pageLoadTimes: [],
    paymentProcessingTimes: []
  };
  
  // Setup performance thresholds
  global.performanceThresholds = {
    emergencyCallResponse: 200, // 200ms
    formSubmission: 1000, // 1 second
    pageLoad: 3000, // 3 seconds
    paymentProcessing: 5000 // 5 seconds
  };
  
  // Performance violation handler
  global.trackPerformanceViolation = (metric, actualTime, threshold) => {
    if (actualTime > threshold) {
      console.warn(`⚠️ Performance violation: ${metric} took ${actualTime}ms (threshold: ${threshold}ms)`);
      
      // Store violation for reporting
      if (!global.performanceViolations) {
        global.performanceViolations = [];
      }
      
      global.performanceViolations.push({
        metric,
        actualTime,
        threshold,
        timestamp: Date.now(),
        severity: actualTime > (threshold * 2) ? 'critical' : 'warning'
      });
    }
  };
}

module.exports = globalSetup;