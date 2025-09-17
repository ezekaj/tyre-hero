/**
 * Playwright Configuration for TyreHero Emergency Service E2E Testing
 * Comprehensive configuration for emergency scenarios and multi-device testing
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'results.xml' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for all actions */
    actionTimeout: 10000,
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Emergency service specific timeouts */
    expect: {
      timeout: 5000,
    }
  },

  /* Emergency service global timeout (critical for life-safety scenarios) */
  timeout: 60000,
  
  /* Configure projects for major browsers and emergency scenarios */
  projects: [
    // Emergency scenarios with Chrome (primary)
    {
      name: 'emergency-scenarios',
      use: { 
        ...devices['Desktop Chrome'],
        geolocation: { latitude: 51.5074, longitude: -0.1278 }, // London
        permissions: ['geolocation', 'notifications'],
        viewport: { width: 1280, height: 720 }
      },
      testMatch: /emergency.*\.spec\.js/,
      retries: 1, // Emergency scenarios should be stable
      timeout: 45000, // Reduced timeout for emergency paths
    },
    
    // Mobile emergency testing
    {
      name: 'mobile-emergency',
      use: { 
        ...devices['iPhone 13'],
        geolocation: { latitude: 51.5074, longitude: -0.1278 },
        permissions: ['geolocation', 'notifications']
      },
      testMatch: /mobile.*\.spec\.js/,
    },
    
    // Tablet emergency testing
    {
      name: 'tablet-emergency',
      use: { 
        ...devices['iPad Pro'],
        geolocation: { latitude: 51.5074, longitude: -0.1278 },
        permissions: ['geolocation', 'notifications']
      },
      testMatch: /tablet.*\.spec\.js/,
    },
    
    // Network condition testing
    {
      name: 'slow-network',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--allow-running-insecure-content']
        }
      },
      testMatch: /network.*\.spec\.js/,
    },
    
    // Offline emergency testing
    {
      name: 'offline-emergency',
      use: { 
        ...devices['Desktop Chrome'],
        offline: true,
        geolocation: { latitude: 51.5074, longitude: -0.1278 },
        permissions: ['geolocation', 'notifications']
      },
      testMatch: /offline.*\.spec\.js/,
    },
    
    // Cross-browser emergency testing
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        geolocation: { latitude: 51.5074, longitude: -0.1278 },
        permissions: ['geolocation', 'notifications']
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        geolocation: { latitude: 51.5074, longitude: -0.1278 },
        permissions: ['geolocation', 'notifications']
      },
    },
    
    // Performance testing
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        trace: 'on',
        video: 'on'
      },
      testMatch: /performance.*\.spec\.js/,
    },
    
    // Security testing
    {
      name: 'security',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Security-Test': 'true'
        }
      },
      testMatch: /security.*\.spec\.js/,
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start server
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),
  
  /* Test-specific settings */
  expect: {
    // Emergency service performance thresholds
    toHaveScreenshot: { 
      threshold: 0.2,
      mode: 'auto'
    },
    toMatchSnapshot: { 
      threshold: 0.2 
    }
  },
  
  /* Metadata for test reporting */
  metadata: {
    testType: 'emergency-service-e2e',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    slaRequirements: {
      emergencyCallResponse: '200ms',
      formSubmission: '1000ms',
      technicianDispatch: '90 minutes',
      pageLoad: '3000ms'
    }
  }
});