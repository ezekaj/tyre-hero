/**
 * Penetration Testing Suite for TyreHero Emergency Service
 * Automated security testing using OWASP guidelines
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Security metrics
const securityVulnerabilities = new Counter('security_vulnerabilities');
const securityTestPassed = new Rate('security_test_passed');

export const options = {
  scenarios: {
    penetration_testing: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '10m',
    }
  },
  thresholds: {
    'security_vulnerabilities': ['count<5'], // Less than 5 vulnerabilities
    'security_test_passed': ['rate>0.8'],   // 80% of security tests must pass
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';
  
  group('Authentication Security Tests', () => {
    testAuthenticationBypass(baseUrl);
    testSessionManagement(baseUrl);
    testPasswordSecurity(baseUrl);
  });
  
  group('Input Validation Tests', () => {
    testSQLInjection(baseUrl);
    testXSSVulnerabilities(baseUrl);
    testCommandInjection(baseUrl);
  });
  
  group('Authorization Tests', () => {
    testAccessControl(baseUrl);
    testPrivilegeEscalation(baseUrl);
    testDirectObjectReferences(baseUrl);
  });
  
  group('Configuration Security Tests', () => {
    testSecurityHeaders(baseUrl);
    testSSLConfiguration(baseUrl);
    testServerInformation(baseUrl);
  });
  
  group('Business Logic Tests', () => {
    testPaymentFlowSecurity(baseUrl);
    testEmergencyDataAccess(baseUrl);
    testRateLimiting(baseUrl);
  });
}

function testAuthenticationBypass(baseUrl) {
  console.log('🔐 Testing Authentication Bypass...');
  
  // Test 1: Direct access to protected endpoints
  const protectedEndpoints = [
    '/api/admin/users',
    '/api/admin/emergencies',
    '/api/payment/admin',
    '/api/technician/private'
  ];
  
  protectedEndpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`);
    
    const isSecure = check(response, {
      [`${endpoint} requires authentication`]: (r) => r.status === 401 || r.status === 403,
      [`${endpoint} doesn't leak sensitive data`]: (r) => !r.body.includes('password') && !r.body.includes('secret')
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
      console.error(`⚠️ Authentication bypass vulnerability: ${endpoint}`);
    }
  });
  
  // Test 2: JWT token manipulation
  const maliciousTokens = [
    'null',
    'undefined',
    'Bearer null',
    'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.',
    'Bearer admin'
  ];
  
  maliciousTokens.forEach(token => {
    const response = http.get(`${baseUrl}/api/emergency/private`, {
      headers: { 'Authorization': token }
    });
    
    const isSecure = check(response, {
      [`Rejects malicious token: ${token}`]: (r) => r.status === 401 || r.status === 403
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
    }
  });
}

function testSessionManagement(baseUrl) {
  console.log('🍪 Testing Session Management...');
  
  // Test session cookie security
  const response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    username: 'test@example.com',
    password: 'testpassword'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  const cookies = response.headers['Set-Cookie'] || '';
  
  const sessionSecure = check(response, {
    'Session cookie has Secure flag': () => cookies.includes('Secure'),
    'Session cookie has HttpOnly flag': () => cookies.includes('HttpOnly'),
    'Session cookie has SameSite attribute': () => cookies.includes('SameSite'),
    'Session has proper expiration': () => cookies.includes('Max-Age') || cookies.includes('Expires')
  });
  
  securityTestPassed.add(sessionSecure);
  if (!sessionSecure) {
    securityVulnerabilities.add(1);
    console.error('⚠️ Insecure session management');
  }
}

function testPasswordSecurity(baseUrl) {
  console.log('🔑 Testing Password Security...');
  
  // Test weak password acceptance
  const weakPasswords = [
    'password',
    '123456',
    'admin',
    '111111',
    'qwerty'
  ];
  
  weakPasswords.forEach(password => {
    const response = http.post(`${baseUrl}/api/auth/register`, JSON.stringify({
      email: `test${Math.random()}@example.com`,
      password: password
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const rejectsWeak = check(response, {
      [`Rejects weak password: ${password}`]: (r) => r.status === 400 && r.body.includes('password')
    });
    
    securityTestPassed.add(rejectsWeak);
    if (!rejectsWeak) {
      securityVulnerabilities.add(1);
    }
  });
}

function testSQLInjection(baseUrl) {
  console.log('💉 Testing SQL Injection...');
  
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT password FROM users --",
    "admin'--",
    "' OR 1=1 --",
    "'; UPDATE payments SET amount=0; --"
  ];
  
  sqlPayloads.forEach(payload => {
    // Test emergency lookup endpoint
    const response = http.get(`${baseUrl}/api/emergency/${encodeURIComponent(payload)}`);
    
    const isSecure = check(response, {
      [`SQL injection blocked: ${payload}`]: (r) => {
        // Should return 400/404, not 500 (which might indicate SQL error)
        return r.status !== 500 && !r.body.includes('SQL') && !r.body.includes('mysql');
      }
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
      console.error(`⚠️ SQL injection vulnerability with payload: ${payload}`);
    }
  });
  
  // Test payment endpoint
  sqlPayloads.forEach(payload => {
    const response = http.post(`${baseUrl}/api/payment`, JSON.stringify({
      emergencyId: payload,
      amount: 8500
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const isSecure = check(response, {
      [`Payment SQL injection blocked: ${payload}`]: (r) => r.status !== 500
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
    }
  });
}

function testXSSVulnerabilities(baseUrl) {
  console.log('🎭 Testing XSS Vulnerabilities...');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '"><script>document.location="http://evil.com"</script>'
  ];
  
  xssPayloads.forEach(payload => {
    // Test emergency form submission
    const response = http.post(`${baseUrl}/api/emergency`, JSON.stringify({
      customerName: payload,
      emergencyDescription: payload,
      location: payload
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const isSecure = check(response, {
      [`XSS payload sanitized: ${payload.substring(0, 20)}...`]: (r) => {
        return !r.body.includes('<script>') && 
               !r.body.includes('javascript:') && 
               !r.body.includes('onerror=');
      }
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
      console.error(`⚠️ XSS vulnerability with payload: ${payload}`);
    }
  });
}

function testCommandInjection(baseUrl) {
  console.log('⚡ Testing Command Injection...');
  
  const commandPayloads = [
    '; ls -la',
    '| cat /etc/passwd',
    '&& whoami',
    '; rm -rf /',
    '`cat /etc/hosts`',
    '$(ls)'
  ];
  
  commandPayloads.forEach(payload => {
    const response = http.post(`${baseUrl}/api/utility/ping`, JSON.stringify({
      host: `google.com${payload}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const isSecure = check(response, {
      [`Command injection blocked: ${payload}`]: (r) => {
        return !r.body.includes('root:') && 
               !r.body.includes('/etc/') &&
               !r.body.includes('uid=');
      }
    });
    
    securityTestPassed.add(isSecure);
    if (!isSecure) {
      securityVulnerabilities.add(1);
    }
  });
}

function testAccessControl(baseUrl) {
  console.log('🚫 Testing Access Control...');
  
  // Test horizontal privilege escalation
  const userEmergencyIds = ['emergency-user1-001', 'emergency-user2-002'];
  
  userEmergencyIds.forEach((emergencyId, index) => {
    const otherUserToken = index === 0 ? 'user2-token' : 'user1-token';
    
    const response = http.get(`${baseUrl}/api/emergency/${emergencyId}`, {
      headers: { 'Authorization': `Bearer ${otherUserToken}` }
    });
    
    const accessDenied = check(response, {
      [`Cannot access other user's emergency: ${emergencyId}`]: (r) => r.status === 403 || r.status === 404
    });
    
    securityTestPassed.add(accessDenied);
    if (!accessDenied) {
      securityVulnerabilities.add(1);
    }
  });
}

function testPrivilegeEscalation(baseUrl) {
  console.log('⬆️ Testing Privilege Escalation...');
  
  // Test role manipulation
  const rolePayloads = [
    { role: 'admin' },
    { isAdmin: true },
    { permissions: ['admin', 'super_user'] },
    { userType: 'administrator' }
  ];
  
  rolePayloads.forEach(payload => {
    const response = http.post(`${baseUrl}/api/user/update`, JSON.stringify(payload), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer regular-user-token'
      }
    });
    
    const escalationBlocked = check(response, {
      [`Privilege escalation blocked: ${JSON.stringify(payload)}`]: (r) => r.status === 403 || r.status === 400
    });
    
    securityTestPassed.add(escalationBlocked);
    if (!escalationBlocked) {
      securityVulnerabilities.add(1);
    }
  });
}

function testDirectObjectReferences(baseUrl) {
  console.log('🎯 Testing Direct Object References...');
  
  // Test sequential ID enumeration
  const sequentialIds = ['1', '2', '3', '100', '999'];
  
  sequentialIds.forEach(id => {
    const response = http.get(`${baseUrl}/api/user/${id}`, {
      headers: { 'Authorization': 'Bearer user-token' }
    });
    
    const properAccess = check(response, {
      [`User ${id} access properly controlled`]: (r) => {
        return r.status === 403 || r.status === 404 || 
               (r.status === 200 && !r.body.includes('email') && !r.body.includes('phone'));
      }
    });
    
    securityTestPassed.add(properAccess);
    if (!properAccess) {
      securityVulnerabilities.add(1);
    }
  });
}

function testSecurityHeaders(baseUrl) {
  console.log('🛡️ Testing Security Headers...');
  
  const response = http.get(`${baseUrl}/emergency-optimized.html`);
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options', 
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy'
  ];
  
  requiredHeaders.forEach(header => {
    const hasHeader = check(response, {
      [`Has ${header} header`]: (r) => r.headers[header] !== undefined
    });
    
    securityTestPassed.add(hasHeader);
    if (!hasHeader) {
      securityVulnerabilities.add(1);
      console.error(`⚠️ Missing security header: ${header}`);
    }
  });
  
  // Test CSP policy
  const cspHeader = response.headers['Content-Security-Policy'];
  if (cspHeader) {
    const cspSecure = check(response, {
      'CSP blocks unsafe inline scripts': () => !cspHeader.includes("'unsafe-inline'"),
      'CSP blocks unsafe eval': () => !cspHeader.includes("'unsafe-eval'"),
    });
    
    securityTestPassed.add(cspSecure);
    if (!cspSecure) {
      securityVulnerabilities.add(1);
    }
  }
}

function testSSLConfiguration(baseUrl) {
  console.log('🔒 Testing SSL Configuration...');
  
  // Test HTTP to HTTPS redirect
  const httpResponse = http.get(baseUrl.replace('https://', 'http://'), {
    redirects: 0
  });
  
  const httpsRedirect = check(httpResponse, {
    'HTTP redirects to HTTPS': (r) => r.status >= 300 && r.status < 400 && 
                                     r.headers['Location']?.includes('https://')
  });
  
  securityTestPassed.add(httpsRedirect);
  if (!httpsRedirect && baseUrl.startsWith('http://')) {
    console.warn('⚠️ HTTP should redirect to HTTPS in production');
  }
}

function testServerInformation(baseUrl) {
  console.log('ℹ️ Testing Information Disclosure...');
  
  const response = http.get(`${baseUrl}/`);
  
  const informationSecure = check(response, {
    'Server header not disclosed': (r) => !r.headers['Server'] || !r.headers['Server'].includes('Apache'),
    'X-Powered-By header not disclosed': (r) => !r.headers['X-Powered-By'],
    'No error stack traces': (r) => !r.body.includes('at ') && !r.body.includes('stack trace'),
    'No database errors': (r) => !r.body.includes('ORA-') && !r.body.includes('MySQL')
  });
  
  securityTestPassed.add(informationSecure);
  if (!informationSecure) {
    securityVulnerabilities.add(1);
  }
}

function testPaymentFlowSecurity(baseUrl) {
  console.log('💳 Testing Payment Flow Security...');
  
  // Test payment amount manipulation
  const manipulationTests = [
    { amount: -8500, description: 'negative amount' },
    { amount: 0.01, description: 'minimal amount' },
    { amount: 999999999, description: 'excessive amount' },
    { amount: '8500; DROP TABLE payments;', description: 'SQL in amount' }
  ];
  
  manipulationTests.forEach(test => {
    const response = http.post(`${baseUrl}/api/payment`, JSON.stringify({
      amount: test.amount,
      emergencyId: 'test-emergency',
      paymentToken: 'tok_visa'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const manipulationBlocked = check(response, {
      [`Payment manipulation blocked: ${test.description}`]: (r) => r.status === 400 || r.status === 422
    });
    
    securityTestPassed.add(manipulationBlocked);
    if (!manipulationBlocked) {
      securityVulnerabilities.add(1);
    }
  });
}

function testEmergencyDataAccess(baseUrl) {
  console.log('🚨 Testing Emergency Data Access...');
  
  // Test emergency data enumeration
  const emergencyIds = Array.from({length: 10}, (_, i) => `EM-${2024000000 + i}`);
  
  emergencyIds.forEach(id => {
    const response = http.get(`${baseUrl}/api/emergency/${id}`);
    
    const dataProtected = check(response, {
      [`Emergency ${id} data properly protected`]: (r) => {
        return r.status === 404 || r.status === 403 || 
               (r.status === 200 && !r.body.includes('phone') && !r.body.includes('address'));
      }
    });
    
    securityTestPassed.add(dataProtected);
    if (!dataProtected) {
      securityVulnerabilities.add(1);
    }
  });
}

function testRateLimiting(baseUrl) {
  console.log('⏱️ Testing Rate Limiting...');
  
  // Test API rate limiting
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      http.post(`${baseUrl}/api/emergency`, JSON.stringify({
        customerName: `Rate Test ${i}`,
        emergencyType: 'test'
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }
  
  // Check that some requests are rate limited
  const responses = promises.map(p => p);
  const rateLimitedCount = responses.filter(r => r.status === 429).length;
  
  const rateLimitActive = check({}, {
    'Rate limiting is active': () => rateLimitedCount > 0
  });
  
  securityTestPassed.add(rateLimitActive);
  if (!rateLimitActive) {
    console.warn('⚠️ Rate limiting may not be configured');
  }
}

export function setup() {
  console.log('🔍 Starting Security Penetration Testing');
  console.log('🎯 Testing OWASP Top 10 vulnerabilities');
}

export function teardown(data) {
  console.log('✅ Security Penetration Testing Complete');
  console.log('📊 Review security metrics for vulnerabilities found');
}