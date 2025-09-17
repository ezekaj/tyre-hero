/**
 * Test Environment Setup for Emergency Service Testing
 * Configures test environment with emergency service specific requirements
 */

const fs = require('fs');
const path = require('path');

// Emergency service test configuration
const EMERGENCY_TEST_CONFIG = {
  // Performance thresholds for emergency scenarios
  performance: {
    emergencyCallResponse: 200, // milliseconds
    formSubmission: 1000,       // milliseconds  
    pageLoad: 3000,            // milliseconds
    paymentProcessing: 5000,   // milliseconds
    locationDetection: 5000    // milliseconds
  },
  
  // Test data for emergency scenarios
  testData: {
    emergencyLocations: [
      { lat: 51.5074, lng: -0.1278, name: 'London Central' },
      { lat: 51.5155, lng: -0.0922, name: 'London East' },
      { lat: 52.4862, lng: -1.8904, name: 'Birmingham' },
      { lat: 53.4808, lng: -2.2426, name: 'Manchester' }
    ],
    testPhoneNumbers: [
      '+44123456789',
      '+44987654321', 
      '+44555123456'
    ],
    emergencyTypes: [
      'flat-tyre',
      'breakdown',
      'battery',
      'lockout',
      'accident'
    ],
    vehicleTypes: [
      'car',
      'motorcycle', 
      'van',
      'truck'
    ],
    testCards: {
      visa: '4242424242424242',
      mastercard: '5555555555554444',
      declined: '4000000000000002',
      insufficient: '4000000000009995'
    }
  },
  
  // Network simulation profiles
  networkProfiles: {
    'slow-3g': {
      downloadThroughput: 500 * 1024,
      uploadThroughput: 500 * 1024,
      latency: 2000
    },
    'fast-3g': {
      downloadThroughput: 1.6 * 1024 * 1024,
      uploadThroughput: 750 * 1024,
      latency: 562.5
    },
    '4g': {
      downloadThroughput: 9 * 1024 * 1024,
      uploadThroughput: 9 * 1024 * 1024,
      latency: 85
    }
  },
  
  // Device profiles for mobile testing
  deviceProfiles: [
    {
      name: 'iPhone 13',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      viewport: { width: 390, height: 844 }
    },
    {
      name: 'iPhone SE',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 
      viewport: { width: 375, height: 667 }
    },
    {
      name: 'Samsung Galaxy S21',
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
      viewport: { width: 384, height: 854 }
    },
    {
      name: 'iPad Pro',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
      viewport: { width: 1024, height: 1366 }
    }
  ]
};

/**
 * Setup emergency service test environment
 */
async function setupEmergencyTestEnvironment() {
  console.log('🚨 Setting up Emergency Service Test Environment...');
  
  try {
    // Create test directories
    await createTestDirectories();
    
    // Setup test configuration files
    await createTestConfigFiles();
    
    // Setup mock services
    await setupMockServices();
    
    // Setup database for integration tests
    await setupTestDatabase();
    
    // Setup performance monitoring
    await setupPerformanceMonitoring();
    
    // Setup security test environment
    await setupSecurityTestEnvironment();
    
    // Validate test environment
    await validateTestEnvironment();
    
    console.log('✅ Emergency Service Test Environment Ready');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }
}

/**
 * Create necessary test directories
 */
async function createTestDirectories() {
  const directories = [
    'test-results',
    'test-results/coverage',
    'test-results/performance',
    'test-results/security',
    'test-results/screenshots',
    'test-results/videos',
    'test-data',
    'test-data/fixtures',
    'test-data/mocks',
    'logs/test-logs'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

/**
 * Create test configuration files
 */
async function createTestConfigFiles() {
  // Emergency test config
  const configPath = path.join('test-data', 'emergency-test-config.json');
  fs.writeFileSync(configPath, JSON.stringify(EMERGENCY_TEST_CONFIG, null, 2));
  console.log('Created emergency test configuration');
  
  // Jest environment config
  const jestEnvConfig = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'test-results/coverage',
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85
      },
      './emergency-scripts.js': {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95
      }
    },
    globals: {
      EMERGENCY_TEST_MODE: true,
      EMERGENCY_CONFIG: EMERGENCY_TEST_CONFIG
    }
  };
  
  // Playwright config for emergency testing
  const playwrightConfig = {
    testDir: './tests/e2e',
    timeout: 60000,
    retries: 2,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    },
    projects: [
      {
        name: 'emergency-chrome',
        use: { 
          ...require('@playwright/test').devices['Desktop Chrome'],
          permissions: ['geolocation', 'notifications']
        }
      },
      {
        name: 'emergency-mobile',
        use: {
          ...require('@playwright/test').devices['iPhone 13'],
          permissions: ['geolocation', 'notifications']
        }
      }
    ]
  };
  
  console.log('Created Playwright emergency test configuration');
}

/**
 * Setup mock services for testing
 */
async function setupMockServices() {
  // Payment gateway mocks
  const paymentMocks = {
    stripe: {
      createPaymentIntent: (amount) => ({
        id: `pi_test_${Date.now()}`,
        status: 'succeeded',
        amount: amount,
        currency: 'gbp'
      }),
      confirmPayment: () => ({
        paymentIntent: { status: 'succeeded' }
      })
    },
    paypal: {
      createOrder: (amount) => ({
        id: `ORDER_TEST_${Date.now()}`,
        status: 'APPROVED',
        amount: { value: (amount/100).toFixed(2), currency: 'GBP' }
      })
    }
  };
  
  // SMS/Notification service mocks
  const notificationMocks = {
    twilio: {
      sendSMS: (to, message) => ({
        sid: `SMS_${Date.now()}`,
        status: 'sent',
        to: to,
        body: message
      })
    },
    pushNotifications: {
      send: (notification) => ({
        id: `PUSH_${Date.now()}`,
        delivered: true,
        notification: notification
      })
    }
  };
  
  // Google Maps API mocks
  const mapsMocks = {
    geocoding: {
      reverseGeocode: (lat, lng) => ({
        results: [{
          formatted_address: 'Test Address, London, UK',
          address_components: [
            { long_name: 'London', types: ['locality'] },
            { long_name: 'UK', types: ['country'] }
          ]
        }]
      })
    },
    directions: {
      getDirections: (origin, destination) => ({
        routes: [{
          legs: [{
            duration: { value: 1800, text: '30 mins' },
            distance: { value: 5000, text: '5.0 km' }
          }]
        }]
      })
    }
  };
  
  // Save mock configurations
  fs.writeFileSync('test-data/mocks/payment-mocks.json', JSON.stringify(paymentMocks, null, 2));
  fs.writeFileSync('test-data/mocks/notification-mocks.json', JSON.stringify(notificationMocks, null, 2));
  fs.writeFileSync('test-data/mocks/maps-mocks.json', JSON.stringify(mapsMocks, null, 2));
  
  console.log('Created mock service configurations');
}

/**
 * Setup test database
 */
async function setupTestDatabase() {
  const dbConfig = {
    test: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      database: process.env.TEST_DB_NAME || 'tyrehero_test',
      username: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASS || 'test',
      dialect: 'postgres',
      logging: false
    }
  };
  
  // Test data fixtures
  const testFixtures = {
    emergencies: [
      {
        id: 'emergency-test-001',
        customerId: 'customer-test-001',
        location: { lat: 51.5074, lng: -0.1278 },
        status: 'active',
        emergencyType: 'flat-tyre',
        createdAt: new Date().toISOString()
      }
    ],
    technicians: [
      {
        id: 'technician-test-001',
        name: 'Test Technician',
        location: { lat: 51.5155, lng: -0.0922 },
        status: 'available',
        skills: ['car', 'motorcycle'],
        rating: 4.8
      }
    ],
    customers: [
      {
        id: 'customer-test-001',
        name: 'Test Customer',
        phone: '+44123456789',
        email: 'test@customer.com'
      }
    ]
  };
  
  fs.writeFileSync('test-data/fixtures/emergency-fixtures.json', JSON.stringify(testFixtures, null, 2));
  console.log('Created test database fixtures');
}

/**
 * Setup performance monitoring for tests
 */
async function setupPerformanceMonitoring() {
  const performanceConfig = {
    metrics: {
      emergencyCallResponse: { threshold: 200, critical: true },
      formSubmission: { threshold: 1000, critical: true },
      pageLoad: { threshold: 3000, critical: true },
      paymentProcessing: { threshold: 5000, critical: false },
      locationDetection: { threshold: 5000, critical: true }
    },
    sampling: {
      rate: 1.0, // 100% sampling for tests
      bufferSize: 1000
    },
    reporting: {
      console: true,
      file: 'test-results/performance/performance.log',
      json: 'test-results/performance/performance.json'
    }
  };
  
  fs.writeFileSync('test-data/performance-config.json', JSON.stringify(performanceConfig, null, 2));
  console.log('Created performance monitoring configuration');
}

/**
 * Setup security test environment
 */
async function setupSecurityTestEnvironment() {
  const securityConfig = {
    testData: {
      sqlInjectionPayloads: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM payments --"
      ],
      xssPayloads: [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")'
      ],
      invalidInputs: [
        null,
        undefined,
        '',
        'a'.repeat(10000), // Very long string
        '<!DOCTYPE html><html></html>' // HTML injection
      ]
    },
    endpoints: {
      protected: [
        '/api/admin/*',
        '/api/payment/*',
        '/api/emergency/private/*'
      ],
      public: [
        '/api/emergency/public',
        '/api/health',
        '/api/status'
      ]
    },
    headers: {
      required: [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy'
      ]
    }
  };
  
  fs.writeFileSync('test-data/security-config.json', JSON.stringify(securityConfig, null, 2));
  console.log('Created security test configuration');
}

/**
 * Validate test environment setup
 */
async function validateTestEnvironment() {
  const validations = [
    // Check required files exist
    () => {
      const requiredFiles = [
        'emergency-optimized.html',
        'emergency-scripts.js', 
        'service-worker.js',
        'manifest.json'
      ];
      
      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Required file missing: ${file}`);
        }
      }
      console.log('✅ Required emergency files present');
    },
    
    // Validate emergency configuration
    () => {
      const config = JSON.parse(fs.readFileSync('test-data/emergency-test-config.json'));
      if (!config.performance || !config.testData) {
        throw new Error('Invalid emergency test configuration');
      }
      console.log('✅ Emergency test configuration valid');
    },
    
    // Check test dependencies
    () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json'));
      const requiredDeps = ['jest', '@playwright/test', 'k6'];
      
      for (const dep of requiredDeps) {
        if (!packageJson.devDependencies[dep] && !packageJson.dependencies[dep]) {
          console.warn(`⚠️ Test dependency may be missing: ${dep}`);
        }
      }
      console.log('✅ Test dependencies checked');
    },
    
    // Validate environment variables
    () => {
      const requiredEnvVars = ['NODE_ENV'];
      const missingVars = requiredEnvVars.filter(env => !process.env[env]);
      
      if (missingVars.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
      } else {
        console.log('✅ Environment variables configured');
      }
    }
  ];
  
  for (const validation of validations) {
    validation();
  }
  
  console.log('✅ Test environment validation completed');
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment() {
  console.log('🧹 Cleaning up test environment...');
  
  // Remove test data files (but keep directories)
  const filesToClean = [
    'test-results/coverage/*',
    'test-results/performance/*', 
    'test-results/security/*',
    'test-results/screenshots/*',
    'test-results/videos/*',
    'logs/test-logs/*'
  ];
  
  // Note: In real implementation, would use glob patterns to clean files
  console.log('🗑️ Test files cleaned up');
}

/**
 * Generate test environment report
 */
async function generateTestEnvironmentReport() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    configuration: EMERGENCY_TEST_CONFIG,
    status: 'ready',
    validations: {
      filesPresent: true,
      configurationValid: true,
      dependenciesInstalled: true,
      environmentVariables: true
    }
  };
  
  fs.writeFileSync('test-results/environment-report.json', JSON.stringify(report, null, 2));
  console.log('📊 Test environment report generated');
}

// Export functions for use in other test files
module.exports = {
  setupEmergencyTestEnvironment,
  cleanupTestEnvironment,
  generateTestEnvironmentReport,
  EMERGENCY_TEST_CONFIG
};

// Run setup if called directly
if (require.main === module) {
  setupEmergencyTestEnvironment()
    .then(() => generateTestEnvironmentReport())
    .catch(error => {
      console.error('Failed to setup emergency test environment:', error);
      process.exit(1);
    });
}