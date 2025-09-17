/**
 * Emergency Traffic Surge Performance Test
 * Testing system behavior during emergency traffic spikes
 * Using k6 for load testing emergency scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for emergency scenarios
const emergencyCallResponseTime = new Trend('emergency_call_response_time');
const emergencyFormSubmissionTime = new Trend('emergency_form_submission_time');
const emergencySuccessRate = new Rate('emergency_success_rate');
const emergencyFailures = new Counter('emergency_failures');
const paymentProcessingTime = new Trend('payment_processing_time');
const dispatchResponseTime = new Trend('dispatch_response_time');

// Emergency surge test configuration
export const options = {
  scenarios: {
    // Scenario 1: Gradual emergency surge (simulating weather emergency)
    gradual_emergency_surge: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },   // Normal traffic
        { duration: '5m', target: 200 },  // Weather alert issued
        { duration: '10m', target: 500 }, // Emergency conditions
        { duration: '5m', target: 1000 }, // Peak emergency traffic
        { duration: '10m', target: 1000 }, // Sustained emergency traffic
        { duration: '5m', target: 200 },  // Conditions improving
        { duration: '2m', target: 10 },   // Return to normal
      ],
      gracefulRampDown: '30s',
    },
    
    // Scenario 2: Sudden emergency spike (major incident)
    sudden_emergency_spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 2000,
      stages: [
        { duration: '1m', target: 20 },   // Normal rate
        { duration: '30s', target: 500 }, // Sudden major incident
        { duration: '2m', target: 1000 }, // Peak incident response
        { duration: '30s', target: 100 }, // Rapid decline
      ],
      gracefulRampDown: '30s',
    },
    
    // Scenario 3: Constant emergency load (ongoing situation)
    constant_emergency_load: {
      executor: 'constant-vus',
      vus: 300,
      duration: '10m',
    },
    
    // Scenario 4: Emergency payment processing stress test
    payment_stress_test: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 100,
      maxDuration: '10m',
    }
  },
  
  // Performance thresholds for emergency services
  thresholds: {
    // Emergency call button response - CRITICAL
    'emergency_call_response_time': ['p(95)<200'],
    
    // Emergency form submission - CRITICAL  
    'emergency_form_submission_time': ['p(95)<1000'],
    
    // Overall HTTP request duration
    'http_req_duration': ['p(95)<5000'],
    
    // HTTP failure rate must be below 1%
    'http_req_failed': ['rate<0.01'],
    
    // Emergency success rate must be above 99%
    'emergency_success_rate': ['rate>0.99'],
    
    // Payment processing time
    'payment_processing_time': ['p(95)<5000'],
    
    // Dispatch response time (technician assignment)
    'dispatch_response_time': ['p(95)<10000'],
    
    // Checks must pass 99% of the time
    'checks': ['rate>0.99'],
  },
};

// Test data generators
function generateEmergencyData() {
  const emergencyTypes = ['flat-tyre', 'breakdown', 'accident', 'battery', 'lockout'];
  const vehicleTypes = ['car', 'motorcycle', 'van', 'truck'];
  const locations = [
    { lat: 51.5074, lng: -0.1278, name: 'London Central' },
    { lat: 51.5155, lng: -0.0922, name: 'London East' },
    { lat: 51.4994, lng: -0.1746, name: 'London West' },
    { lat: 51.5287, lng: -0.1015, name: 'London North' }
  ];
  
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  return {
    customerName: `Emergency User ${Math.floor(Math.random() * 10000)}`,
    customerPhone: `+4412345${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    customerEmail: `user${Math.floor(Math.random() * 10000)}@emergency.test`,
    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    vehicleMake: 'BMW',
    vehicleModel: 'X5',
    registration: `EM${Math.floor(Math.random() * 100)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    emergencyType: emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)],
    emergencyDescription: 'Emergency service required - performance test',
    location: location,
    timestamp: Date.now(),
    priority: Math.random() > 0.8 ? 'high' : 'normal'
  };
}

function generatePaymentData() {
  return {
    amount: 8500 + Math.floor(Math.random() * 5000), // £85-£135
    currency: 'gbp',
    cardNumber: '4242424242424242', // Test card
    expiryMonth: '12',
    expiryYear: '2025',
    cvc: '123',
    cardholderName: 'Emergency Test User'
  };
}

// Main test function
export default function () {
  const baseUrl = 'http://localhost:3000';
  
  // Choose test scenario based on probability
  const scenario = chooseScenario();
  
  switch (scenario) {
    case 'emergency_submission':
      testEmergencySubmission(baseUrl);
      break;
    case 'emergency_call':
      testEmergencyCall(baseUrl);
      break;
    case 'payment_processing':
      testPaymentProcessing(baseUrl);
      break;
    case 'technician_dispatch':
      testTechnicianDispatch(baseUrl);
      break;
    case 'real_time_tracking':
      testRealTimeTracking(baseUrl);
      break;
    default:
      testEmergencySubmission(baseUrl);
  }
  
  // Realistic user wait time between actions
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

function chooseScenario() {
  const rand = Math.random();
  if (rand < 0.4) return 'emergency_submission';      // 40%
  if (rand < 0.6) return 'emergency_call';           // 20%
  if (rand < 0.75) return 'payment_processing';      // 15%
  if (rand < 0.9) return 'technician_dispatch';      // 15%
  return 'real_time_tracking';                       // 10%
}

function testEmergencySubmission(baseUrl) {
  const emergencyData = generateEmergencyData();
  
  // Step 1: Load emergency page
  const pageLoadStart = Date.now();
  const pageResponse = http.get(`${baseUrl}/emergency-optimized.html`);
  const pageLoadTime = Date.now() - pageLoadStart;
  
  check(pageResponse, {
    'emergency page loads successfully': (r) => r.status === 200,
    'emergency page loads within 3 seconds': () => pageLoadTime < 3000,
    'emergency page contains call button': (r) => r.body.includes('emergency-call-btn'),
  });
  
  // Step 2: Submit emergency form
  const formSubmissionStart = Date.now();
  const submissionResponse = http.post(`${baseUrl}/api/emergency`, JSON.stringify(emergencyData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const formSubmissionTime = Date.now() - formSubmissionStart;
  
  const submissionSuccess = check(submissionResponse, {
    'emergency submission successful': (r) => r.status === 200,
    'emergency submission returns ID': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.emergencyId && json.emergencyId.startsWith('EM-');
      } catch (e) {
        return false;
      }
    },
    'emergency submission within 1 second': () => formSubmissionTime < 1000,
    'technician assigned within response': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.assignedTechnician && json.estimatedETA;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record metrics
  emergencyFormSubmissionTime.add(formSubmissionTime);
  emergencySuccessRate.add(submissionSuccess);
  
  if (!submissionSuccess) {
    emergencyFailures.add(1);
  }
  
  // Step 3: Get emergency status (real-time updates simulation)
  if (submissionResponse.status === 200) {
    try {
      const emergencyResponse = JSON.parse(submissionResponse.body);
      const emergencyId = emergencyResponse.emergencyId;
      
      const statusResponse = http.get(`${baseUrl}/api/emergency/${emergencyId}/status`);
      check(statusResponse, {
        'emergency status retrieval successful': (r) => r.status === 200,
        'emergency status contains tracking info': (r) => {
          try {
            const json = JSON.parse(r.body);
            return json.status && json.technician;
          } catch (e) {
            return false;
          }
        }
      });
    } catch (e) {
      console.error('Error parsing emergency response:', e);
    }
  }
}

function testEmergencyCall(baseUrl) {
  // Simulate emergency call button interaction
  const callStart = Date.now();
  
  // Test emergency call endpoint (analytics tracking)
  const callResponse = http.post(`${baseUrl}/api/emergency-call`, JSON.stringify({
    type: 'emergency_call_initiated',
    timestamp: Date.now(),
    userAgent: 'k6-performance-test'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const callResponseTime = Date.now() - callStart;
  
  const callSuccess = check(callResponse, {
    'emergency call tracking successful': (r) => r.status === 200,
    'emergency call response within 200ms': () => callResponseTime < 200,
  });
  
  emergencyCallResponseTime.add(callResponseTime);
  emergencySuccessRate.add(callSuccess);
}

function testPaymentProcessing(baseUrl) {
  const paymentData = generatePaymentData();
  const emergencyId = `EM-${Date.now()}`;
  
  // Add emergency context to payment
  paymentData.emergencyId = emergencyId;
  paymentData.priority = 'emergency';
  
  const paymentStart = Date.now();
  const paymentResponse = http.post(`${baseUrl}/api/payment`, JSON.stringify(paymentData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const paymentTime = Date.now() - paymentStart;
  
  const paymentSuccess = check(paymentResponse, {
    'payment processing successful': (r) => r.status === 200,
    'payment processing within 5 seconds': () => paymentTime < 5000,
    'payment returns transaction ID': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.transactionId && json.status === 'completed';
      } catch (e) {
        return false;
      }
    }
  });
  
  paymentProcessingTime.add(paymentTime);
  emergencySuccessRate.add(paymentSuccess);
}

function testTechnicianDispatch(baseUrl) {
  const dispatchData = {
    emergencyId: `EM-${Date.now()}`,
    location: { lat: 51.5074, lng: -0.1278 },
    vehicleType: 'car',
    priority: 'high',
    customerPhone: '+44123456789'
  };
  
  const dispatchStart = Date.now();
  const dispatchResponse = http.post(`${baseUrl}/api/dispatch`, JSON.stringify(dispatchData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const dispatchTime = Date.now() - dispatchStart;
  
  const dispatchSuccess = check(dispatchResponse, {
    'technician dispatch successful': (r) => r.status === 200,
    'technician assigned within 10 seconds': () => dispatchTime < 10000,
    'technician within 90-minute SLA': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.estimatedETA && json.estimatedETA <= 90;
      } catch (e) {
        return false;
      }
    }
  });
  
  dispatchResponseTime.add(dispatchTime);
  emergencySuccessRate.add(dispatchSuccess);
}

function testRealTimeTracking(baseUrl) {
  const emergencyId = `EM-${Date.now()}`;
  
  // Test WebSocket connection for real-time tracking
  const trackingResponse = http.get(`${baseUrl}/api/track/${emergencyId}`);
  
  check(trackingResponse, {
    'tracking endpoint accessible': (r) => r.status === 200,
    'tracking data available': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.technician && json.customer && json.route;
      } catch (e) {
        return false;
      }
    }
  });
}

// Test setup and teardown
export function setup() {
  console.log('🚨 Starting Emergency Traffic Surge Performance Test');
  console.log('📊 Testing emergency service resilience under high load');
  
  // Warm up the application
  const baseUrl = 'http://localhost:3000';
  const warmupResponse = http.get(`${baseUrl}/emergency-optimized.html`);
  
  if (warmupResponse.status !== 200) {
    throw new Error(`Application not available at ${baseUrl}`);
  }
  
  return { baseUrl };
}

export function teardown(data) {
  console.log('✅ Emergency Traffic Surge Performance Test Complete');
  console.log('📈 Check k6 metrics for emergency service performance analysis');
}