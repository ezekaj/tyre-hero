#!/usr/bin/env node

/**
 * TyreHero Emergency Tyre Service - Production Server
 * 
 * A secure, high-performance Node.js server for emergency tyre services
 * Handles static file serving, emergency bookings, and API endpoints
 * 
 * Features:
 * - 24/7 emergency booking system
 * - Security hardened with rate limiting
 * - GZIP compression and caching
 * - Progressive Web App support
 * - Health monitoring and graceful shutdown
 */

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult, sanitize } = require('express-validator');
const winston = require('winston');
const cluster = require('cluster');
const os = require('os');

// Environment configuration
const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    cluster: process.env.CLUSTER_MODE === 'true' && process.env.NODE_ENV === 'production',
    emergencyPhone: process.env.EMERGENCY_PHONE || '+447700900000',
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    dbConnectionString: process.env.DATABASE_URL || 'sqlite:./tyrehero.db'
};

// Logger configuration
const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'tyrehero-server' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (config.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Cluster management for production
if (config.cluster && cluster.isMaster) {
    const numCPUs = os.cpus().length;
    logger.info(`Master ${process.pid} is running. Forking ${numCPUs} workers.`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
        cluster.fork(); // Restart worker
    });

    return;
}

// Express app setup
const app = express();

// Trust proxy for HTTPS/load balancer environments
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://tyrehero.co.uk',
            'https://www.tyrehero.co.uk',
            ...(config.nodeEnv === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [])
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Compression middleware
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Body parsing middleware
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxFileSize }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            emergency: req.url.includes('/emergency')
        });
    });
    
    next();
});

// Rate limiting configurations
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.url.startsWith('/api/emergency') // Don't limit emergency calls
});

const emergencyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Allow 5 emergency calls per minute per IP
    message: {
        error: 'Emergency service rate limit exceeded. If this is a genuine emergency, please call directly.',
        phone: config.emergencyPhone
    },
    standardHeaders: true,
    legacyHeaders: false
});

const formLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit form submissions
    message: {
        error: 'Too many form submissions. Please wait before submitting again.'
    }
});

// Apply rate limiting
app.use('/api', generalLimiter);
app.use('/api/emergency-*', emergencyLimiter);
app.use(['/api/regular-booking', '/api/contact'], formLimiter);

// Input validation schemas
const emergencyBookingValidation = [
    body('name').notEmpty().trim().escape().isLength({ min: 2, max: 50 }),
    body('phone').isMobilePhone('en-GB').normalizeEmail(),
    body('location').notEmpty().trim().escape().isLength({ min: 5, max: 200 }),
    body('tyreSize').optional().trim().escape().isLength({ max: 20 }),
    body('vehicleType').isIn(['car', 'van', 'motorcycle', 'truck']),
    body('urgency').isIn(['immediate', 'within-hour', 'within-2hours']),
    body('description').optional().trim().escape().isLength({ max: 500 })
];

const regularBookingValidation = [
    body('name').notEmpty().trim().escape().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone('en-GB'),
    body('location').notEmpty().trim().escape().isLength({ min: 5, max: 200 }),
    body('tyreSize').notEmpty().trim().escape().isLength({ max: 20 }),
    body('quantity').isInt({ min: 1, max: 8 }),
    body('preferredDate').isISO8601().toDate(),
    body('preferredTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('vehicleType').isIn(['car', 'van', 'motorcycle', 'truck']),
    body('message').optional().trim().escape().isLength({ max: 500 })
];

const contactValidation = [
    body('name').notEmpty().trim().escape().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('subject').notEmpty().trim().escape().isLength({ min: 5, max: 100 }),
    body('message').notEmpty().trim().escape().isLength({ min: 10, max: 1000 })
];

// Static file serving with optimized caching
app.use(express.static('.', {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Different caching strategies for different file types
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
        } else if (path.includes('/images/') || path.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for assets
        } else if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for CSS/JS
        }
        
        // Security headers for all static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
    }
}));

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        version: process.version,
        environment: config.nodeEnv
    };
    
    res.json(healthData);
});

// Emergency booking endpoint
app.post('/api/emergency-booking', emergencyBookingValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Emergency booking validation failed', { errors: errors.array(), ip: req.ip });
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const bookingData = {
            id: generateBookingId('EMRG'),
            type: 'emergency',
            timestamp: new Date().toISOString(),
            customerInfo: {
                name: req.body.name,
                phone: req.body.phone,
                location: req.body.location
            },
            serviceDetails: {
                tyreSize: req.body.tyreSize,
                vehicleType: req.body.vehicleType,
                urgency: req.body.urgency,
                description: req.body.description
            },
            status: 'pending',
            priority: 'high',
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Store booking (in production, this would go to a database)
        await storeBooking(bookingData);
        
        // Send emergency notifications (SMS, email, etc.)
        await sendEmergencyNotifications(bookingData);

        logger.info('Emergency booking created', { 
            bookingId: bookingData.id, 
            location: bookingData.customerInfo.location,
            urgency: bookingData.serviceDetails.urgency
        });

        res.json({
            success: true,
            bookingId: bookingData.id,
            message: 'Emergency booking received. Our team will contact you within 5 minutes.',
            estimatedResponse: getEstimatedResponseTime(req.body.urgency),
            emergencyPhone: config.emergencyPhone
        });

    } catch (error) {
        logger.error('Emergency booking error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            error: 'Emergency booking system temporarily unavailable',
            message: 'Please call our emergency line directly',
            phone: config.emergencyPhone
        });
    }
});

// Regular booking endpoint
app.post('/api/regular-booking', regularBookingValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const bookingData = {
            id: generateBookingId('REG'),
            type: 'regular',
            timestamp: new Date().toISOString(),
            customerInfo: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                location: req.body.location
            },
            serviceDetails: {
                tyreSize: req.body.tyreSize,
                quantity: req.body.quantity,
                vehicleType: req.body.vehicleType,
                preferredDate: req.body.preferredDate,
                preferredTime: req.body.preferredTime,
                message: req.body.message
            },
            status: 'pending',
            priority: 'normal',
            ip: req.ip
        };

        await storeBooking(bookingData);
        await sendBookingConfirmation(bookingData);

        logger.info('Regular booking created', { bookingId: bookingData.id });

        res.json({
            success: true,
            bookingId: bookingData.id,
            message: 'Booking received successfully. We will contact you within 24 hours to confirm.',
            estimatedResponse: '24 hours'
        });

    } catch (error) {
        logger.error('Regular booking error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Booking system temporarily unavailable. Please try again later.'
        });
    }
});

// Contact form endpoint
app.post('/api/contact', contactValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const contactData = {
            id: generateContactId(),
            timestamp: new Date().toISOString(),
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,
            ip: req.ip
        };

        await storeContact(contactData);
        await sendContactNotification(contactData);

        logger.info('Contact form submitted', { contactId: contactData.id });

        res.json({
            success: true,
            message: 'Message sent successfully. We will respond within 24 hours.'
        });

    } catch (error) {
        logger.error('Contact form error', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Message could not be sent. Please try again later.'
        });
    }
});

// Coverage area check
app.get('/api/coverage-check', (req, res) => {
    const { postcode, lat, lng } = req.query;
    
    if (!postcode && (!lat || !lng)) {
        return res.status(400).json({
            success: false,
            error: 'Postcode or coordinates required'
        });
    }

    // In production, this would check against a coverage database
    const coverage = checkCoverageArea(postcode, lat, lng);
    
    res.json({
        success: true,
        covered: coverage.covered,
        estimatedArrival: coverage.estimatedArrival,
        emergencyResponse: coverage.emergencyResponse,
        message: coverage.message
    });
});

// Emergency call tracking
app.post('/api/emergency-call', async (req, res) => {
    try {
        const callData = {
            id: generateCallId(),
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            source: req.body.source || 'website'
        };

        await storeEmergencyCall(callData);
        
        logger.info('Emergency call initiated', { callId: callData.id });

        res.json({
            success: true,
            callId: callData.id,
            phone: config.emergencyPhone,
            message: 'Emergency call logged. Redirecting to phone...'
        });

    } catch (error) {
        logger.error('Emergency call tracking error', { error: error.message });
        res.json({
            success: true, // Don't block emergency calls
            phone: config.emergencyPhone
        });
    }
});

// Service Worker support
app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Web App Manifest
app.get('/manifest.json', (req, res) => {
    const manifest = {
        name: 'TyreHero - Emergency Tyre Service',
        short_name: 'TyreHero',
        description: '24/7 Emergency Mobile Tyre Service',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a73e8',
        icons: [
            {
                src: '/images/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: '/images/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
            }
        ]
    };
    
    res.json(manifest);
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { 
        error: err.message, 
        stack: err.stack, 
        url: req.url, 
        method: req.method 
    });

    if (req.url.includes('/emergency')) {
        // For emergency endpoints, provide fallback contact info
        res.status(500).json({
            success: false,
            error: 'Service temporarily unavailable',
            emergency: {
                phone: config.emergencyPhone,
                message: 'Please call directly for immediate assistance'
            }
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    } else {
        // Serve index.html for SPA routes
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Utility functions

function generateBookingId(prefix = 'BOOK') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

function generateContactId() {
    return generateBookingId('CONT');
}

function generateCallId() {
    return generateBookingId('CALL');
}

function getEstimatedResponseTime(urgency) {
    const times = {
        'immediate': '5-10 minutes',
        'within-hour': '30-60 minutes',
        'within-2hours': '1-2 hours'
    };
    return times[urgency] || '30 minutes';
}

function checkCoverageArea(postcode, lat, lng) {
    // Simplified coverage check - in production, use proper geolocation service
    return {
        covered: true,
        estimatedArrival: '45 minutes',
        emergencyResponse: '15 minutes',
        message: 'We cover your area with 24/7 emergency service'
    };
}

// Mock database functions (replace with real database in production)
async function storeBooking(bookingData) {
    // In production: INSERT INTO bookings...
    logger.info('Booking stored', { id: bookingData.id, type: bookingData.type });
}

async function storeContact(contactData) {
    // In production: INSERT INTO contacts...
    logger.info('Contact stored', { id: contactData.id });
}

async function storeEmergencyCall(callData) {
    // In production: INSERT INTO emergency_calls...
    logger.info('Emergency call stored', { id: callData.id });
}

async function sendEmergencyNotifications(bookingData) {
    // In production: Send SMS/email/webhook notifications to dispatch team
    logger.info('Emergency notifications sent', { bookingId: bookingData.id });
}

async function sendBookingConfirmation(bookingData) {
    // In production: Send confirmation email
    logger.info('Booking confirmation sent', { bookingId: bookingData.id });
}

async function sendContactNotification(contactData) {
    // In production: Send notification to support team
    logger.info('Contact notification sent', { contactId: contactData.id });
}

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    logger.info(`Received ${signal}, shutting down gracefully`);
    
    const server = app.listen(config.port, config.host);
    
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
}

// Start server
const server = app.listen(config.port, config.host, () => {
    logger.info(`TyreHero server running on ${config.host}:${config.port}`, {
        environment: config.nodeEnv,
        processId: process.pid,
        nodeVersion: process.version
    });
});

// Server error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
        process.exit(1);
    } else {
        logger.error('Server error', { error: err.message });
    }
});

module.exports = app;