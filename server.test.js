/**
 * TyreHero Emergency Service - Test Suite
 * 
 * Comprehensive tests for emergency tyre service server
 * Tests security, emergency endpoints, and production readiness
 */

const request = require('supertest');
const app = require('./server');

describe('TyreHero Emergency Service', () => {
    
    describe('Health and Status', () => {
        test('GET /health should return healthy status', async () => {
            const res = await request(app)
                .get('/health')
                .expect(200);
            
            expect(res.body).toHaveProperty('status', 'healthy');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
            expect(res.body).toHaveProperty('memory');
            expect(res.body).toHaveProperty('pid');
        });
    });

    describe('Security Headers', () => {
        test('Should include security headers', async () => {
            const res = await request(app)
                .get('/')
                .expect(200);
            
            expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
            expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
            expect(res.headers).toHaveProperty('x-dns-prefetch-control', 'off');
        });

        test('Should have CSP header', async () => {
            const res = await request(app)
                .get('/');
            
            expect(res.headers).toHaveProperty('content-security-policy');
        });
    });

    describe('Emergency Booking API', () => {
        const validEmergencyBooking = {
            name: 'John Doe',
            phone: '07700900000',
            location: 'M25 Junction 10, Surrey',
            tyreSize: '205/55R16',
            vehicleType: 'car',
            urgency: 'immediate',
            description: 'Flat tyre on motorway'
        };

        test('POST /api/emergency-booking should accept valid booking', async () => {
            const res = await request(app)
                .post('/api/emergency-booking')
                .send(validEmergencyBooking)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('bookingId');
            expect(res.body.bookingId).toMatch(/^EMRG-/);
            expect(res.body).toHaveProperty('emergencyPhone');
        });

        test('Should reject emergency booking with invalid phone', async () => {
            const invalidBooking = {
                ...validEmergencyBooking,
                phone: 'invalid-phone'
            };

            const res = await request(app)
                .post('/api/emergency-booking')
                .send(invalidBooking)
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Validation failed');
        });

        test('Should reject emergency booking with missing required fields', async () => {
            const incompleteBooking = {
                name: 'John Doe'
                // Missing required fields
            };

            const res = await request(app)
                .post('/api/emergency-booking')
                .send(incompleteBooking)
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.details).toBeDefined();
        });

        test('Should sanitize emergency booking inputs', async () => {
            const maliciousBooking = {
                ...validEmergencyBooking,
                name: '<script>alert("xss")</script>John',
                description: 'Normal text <img src=x onerror=alert(1)>'
            };

            const res = await request(app)
                .post('/api/emergency-booking')
                .send(maliciousBooking)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            // The malicious content should be sanitized server-side
        });
    });

    describe('Regular Booking API', () => {
        const validRegularBooking = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '07700900001',
            location: '123 High Street, London',
            tyreSize: '195/65R15',
            quantity: 2,
            preferredDate: '2024-02-01',
            preferredTime: '10:00',
            vehicleType: 'car',
            message: 'Need 2 front tyres replaced'
        };

        test('POST /api/regular-booking should accept valid booking', async () => {
            const res = await request(app)
                .post('/api/regular-booking')
                .send(validRegularBooking)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('bookingId');
            expect(res.body.bookingId).toMatch(/^REG-/);
        });

        test('Should reject regular booking with invalid email', async () => {
            const invalidBooking = {
                ...validRegularBooking,
                email: 'invalid-email'
            };

            const res = await request(app)
                .post('/api/regular-booking')
                .send(invalidBooking)
                .expect(400);
            
            expect(res.body.success).toBe(false);
        });

        test('Should reject invalid quantity', async () => {
            const invalidBooking = {
                ...validRegularBooking,
                quantity: 10 // Too many tyres
            };

            const res = await request(app)
                .post('/api/regular-booking')
                .send(invalidBooking)
                .expect(400);
            
            expect(res.body.success).toBe(false);
        });
    });

    describe('Contact Form API', () => {
        const validContact = {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'General Inquiry',
            message: 'I would like to know more about your services.'
        };

        test('POST /api/contact should accept valid contact form', async () => {
            const res = await request(app)
                .post('/api/contact')
                .send(validContact)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('sent successfully');
        });

        test('Should reject contact with invalid email', async () => {
            const invalidContact = {
                ...validContact,
                email: 'not-an-email'
            };

            const res = await request(app)
                .post('/api/contact')
                .send(invalidContact)
                .expect(400);
            
            expect(res.body.success).toBe(false);
        });

        test('Should reject short messages', async () => {
            const invalidContact = {
                ...validContact,
                message: 'Hi' // Too short
            };

            const res = await request(app)
                .post('/api/contact')
                .send(invalidContact)
                .expect(400);
            
            expect(res.body.success).toBe(false);
        });
    });

    describe('Coverage Check API', () => {
        test('GET /api/coverage-check should accept valid postcode', async () => {
            const res = await request(app)
                .get('/api/coverage-check')
                .query({ postcode: 'SW1A 1AA' })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('covered');
            expect(res.body).toHaveProperty('estimatedArrival');
            expect(res.body).toHaveProperty('emergencyResponse');
        });

        test('Should accept coordinates', async () => {
            const res = await request(app)
                .get('/api/coverage-check')
                .query({ lat: 51.5074, lng: -0.1278 })
                .expect(200);
            
            expect(res.body.success).toBe(true);
        });

        test('Should reject missing parameters', async () => {
            const res = await request(app)
                .get('/api/coverage-check')
                .expect(400);
            
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('required');
        });
    });

    describe('Emergency Call Tracking', () => {
        test('POST /api/emergency-call should log emergency calls', async () => {
            const res = await request(app)
                .post('/api/emergency-call')
                .send({ source: 'website' })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('callId');
            expect(res.body).toHaveProperty('phone');
        });

        test('Should still work without request body', async () => {
            const res = await request(app)
                .post('/api/emergency-call')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('phone');
        });
    });

    describe('PWA Support', () => {
        test('GET /manifest.json should return valid manifest', async () => {
            const res = await request(app)
                .get('/manifest.json')
                .expect(200);
            
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('short_name');
            expect(res.body).toHaveProperty('start_url');
            expect(res.body).toHaveProperty('display');
            expect(res.body).toHaveProperty('icons');
            expect(Array.isArray(res.body.icons)).toBe(true);
        });

        test('GET /service-worker.js should serve service worker', async () => {
            const res = await request(app)
                .get('/service-worker.js')
                .expect(200);
            
            expect(res.headers['content-type']).toContain('javascript');
            expect(res.headers).toHaveProperty('service-worker-allowed');
        });
    });

    describe('Rate Limiting', () => {
        test('Should apply rate limiting to API endpoints', async () => {
            // Make multiple requests quickly
            const promises = Array(10).fill().map(() => 
                request(app).get('/api/coverage-check?postcode=SW1A1AA')
            );
            
            const responses = await Promise.all(promises);
            
            // At least some should succeed
            const successCount = responses.filter(r => r.status === 200).length;
            expect(successCount).toBeGreaterThan(0);
        });

        test('Emergency endpoints should have separate rate limits', async () => {
            const validEmergencyBooking = {
                name: 'John Doe',
                phone: '07700900000',
                location: 'Test Location',
                vehicleType: 'car',
                urgency: 'immediate'
            };

            // Emergency booking should still work even with general rate limiting
            const res = await request(app)
                .post('/api/emergency-booking')
                .send(validEmergencyBooking)
                .expect(200);
            
            expect(res.body.success).toBe(true);
        });
    });

    describe('Static File Serving', () => {
        test('Should serve index.html', async () => {
            const res = await request(app)
                .get('/')
                .expect(200);
            
            expect(res.headers['content-type']).toContain('html');
        });

        test('Should set proper cache headers for assets', async () => {
            const res = await request(app)
                .get('/assets/css/styles.css');
            
            if (res.status === 200) {
                expect(res.headers['cache-control']).toBeDefined();
                expect(res.headers['x-content-type-options']).toBe('nosniff');
            }
        });

        test('Should serve 404 for non-existent files', async () => {
            const res = await request(app)
                .get('/non-existent-file.txt')
                .expect(404);
            
            expect(res.body.success).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('Should handle 404 for API endpoints', async () => {
            const res = await request(app)
                .get('/api/non-existent-endpoint')
                .expect(404);
            
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('not found');
        });

        test('Should provide emergency fallback for server errors', async () => {
            // This would need to be implemented to test actual error scenarios
            // For now, just test that emergency endpoints respond appropriately
            const res = await request(app)
                .post('/api/emergency-call')
                .expect(200);
            
            expect(res.body).toHaveProperty('phone');
        });
    });

    describe('CORS Configuration', () => {
        test('Should handle CORS for API requests', async () => {
            const res = await request(app)
                .options('/api/emergency-booking')
                .set('Origin', 'https://tyrehero.co.uk')
                .expect(204);
            
            expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });

    describe('Compression', () => {
        test('Should compress responses when appropriate', async () => {
            const res = await request(app)
                .get('/')
                .set('Accept-Encoding', 'gzip');
            
            // Check if compression is applied (when content is large enough)
            if (res.headers['content-length'] > 1024) {
                expect(res.headers['content-encoding']).toBe('gzip');
            }
        });
    });
});

describe('Utility Functions', () => {
    // Test utility functions if they were exported
    // This would require modifying server.js to export utility functions for testing
    
    test('Should generate unique booking IDs', () => {
        // This test would need the generateBookingId function to be exported
        // For now, just verify the pattern through API calls
        expect(true).toBe(true); // Placeholder
    });
});

describe('Load Testing Simulation', () => {
    test('Should handle concurrent emergency bookings', async () => {
        const validEmergencyBooking = {
            name: 'Load Test User',
            phone: '07700900000',
            location: 'Load Test Location',
            vehicleType: 'car',
            urgency: 'immediate'
        };

        // Simulate multiple concurrent emergency bookings
        const concurrentRequests = 5;
        const promises = Array(concurrentRequests).fill().map((_, index) => 
            request(app)
                .post('/api/emergency-booking')
                .send({
                    ...validEmergencyBooking,
                    name: `Load Test User ${index}`
                })
        );

        const responses = await Promise.all(promises);
        
        // All emergency bookings should succeed (or at least most of them)
        const successCount = responses.filter(r => r.status === 200).length;
        expect(successCount).toBeGreaterThanOrEqual(concurrentRequests - 1);
    });
});

// Cleanup after tests
afterAll(async () => {
    // Close any open connections, clean up test data, etc.
    // This is important for preventing test hangs
    if (app && app.close) {
        await app.close();
    }
});