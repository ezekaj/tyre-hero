const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Security configuration
const SECURITY_CONFIG = {
    maxRequestSize: 50 * 1024 * 1024, // 50MB max request
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 1000, // requests per window
    emergencyRateLimit: 10, // emergency calls per minute
    allowedOrigins: [
        'https://tyrehero.com',
        'https://www.tyrehero.com',
        'https://ezekaj.github.io',
        'http://localhost:3000' // Development only
    ]
};

// Rate limiting storage
const rateLimitStore = new Map();
const emergencyCallStore = new Map();

// MIME types for secure file serving
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
};

// Security headers for all responses
function setSecurityHeaders(res, origin) {
    // Content Security Policy
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.whatsapp.com; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self';"
    );

    // CORS - restrictive for production
    if (SECURITY_CONFIG.allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', crypto.randomBytes(16).toString('hex'));
}

// Rate limiting middleware
function checkRateLimit(req, res) {
    const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.rateLimitWindow;

    // Clean old entries
    for (const [ip, requests] of rateLimitStore.entries()) {
        rateLimitStore.set(ip, requests.filter(time => time > windowStart));
        if (rateLimitStore.get(ip).length === 0) {
            rateLimitStore.delete(ip);
        }
    }

    // Check current IP
    if (!rateLimitStore.has(clientIP)) {
        rateLimitStore.set(clientIP, []);
    }

    const requests = rateLimitStore.get(clientIP);
    if (requests.length >= SECURITY_CONFIG.rateLimitMax) {
        res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes
        });
        res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: 900
        }));
        return false;
    }

    requests.push(now);
    return true;
}

// Emergency call rate limiting
function checkEmergencyRateLimit(req, res) {
    const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    const key = `${clientIP}:${minute}`;
    const calls = emergencyCallStore.get(key) || 0;

    if (calls >= SECURITY_CONFIG.emergencyRateLimit) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Emergency rate limit exceeded',
            message: 'Too many emergency calls. If this is a genuine emergency, please call 999.',
            emergencyNumber: '999'
        }));
        return false;
    }

    emergencyCallStore.set(key, calls + 1);

    // Clean old entries
    const currentMinute = Math.floor(Date.now() / 60000);
    for (const [key] of emergencyCallStore.entries()) {
        const keyMinute = parseInt(key.split(':')[1]);
        if (keyMinute < currentMinute - 1) {
            emergencyCallStore.delete(key);
        }
    }

    return true;
}

// Secure path validation
function isValidPath(pathname) {
    // Prevent path traversal attacks
    const normalizedPath = path.normalize(pathname);

    // Block dangerous patterns
    const dangerousPatterns = [
        /\.\./,
        /\/\/+/,  // Multiple forward slashes
        /\\\\/,
        /\0/,
        /%2e%2e/i,
        /%252e%252e/i,
        /\.\.\//,
        /\.\.\\/
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(normalizedPath) || pattern.test(pathname)) {
            return false;
        }
    }

    // Handle Windows path normalization - use original pathname for root check
    if (pathname === '/' || pathname === '/index.html' || normalizedPath === '/' || normalizedPath === '/index.html') {
        return true;
    }

    // Only allow specific file extensions
    const allowedExtensions = Object.keys(mimeTypes);
    const ext = path.extname(normalizedPath).toLowerCase();

    return allowedExtensions.includes(ext);
}

// Health check endpoint
function handleHealthCheck(req, res) {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
}

// Emergency API endpoint
function handleEmergencyCall(req, res) {
    if (!checkEmergencyRateLimit(req, res)) {
        return;
    }

    console.log(`🚨 EMERGENCY CALL: ${new Date().toISOString()} from ${req.connection.remoteAddress}`);

    const response = {
        status: 'received',
        emergencyNumber: '0800 123 4567',
        estimatedResponse: '45 minutes',
        reference: crypto.randomBytes(8).toString('hex').toUpperCase(),
        timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// Create secure server
const server = http.createServer((req, res) => {
    const startTime = Date.now();
    const origin = req.headers.origin;

    // Set security headers for all responses
    setSecurityHeaders(res, origin);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Rate limiting
    if (!checkRateLimit(req, res)) {
        return;
    }

    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Handle special endpoints
    if (pathname === '/health') {
        handleHealthCheck(req, res);
        return;
    }

    if (pathname === '/api/emergency' && req.method === 'POST') {
        handleEmergencyCall(req, res);
        return;
    }

    // Security validation
    if (!isValidPath(pathname)) {
        console.warn(`🚨 SECURITY: Blocked suspicious path: ${pathname} from ${req.connection.remoteAddress}`);
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Forbidden',
            message: 'Access denied'
        }));
        return;
    }

    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Safe file path construction - allow assets and images subdirectories
    const filePath = path.join(__dirname, pathname);
    const normalizedFilePath = path.normalize(filePath);

    // Security check - ensure file is within allowed directories
    const allowedPaths = [
        __dirname,
        path.join(__dirname, 'assets'),
        path.join(__dirname, 'images')
    ];

    const isAllowedPath = allowedPaths.some(allowedPath =>
        normalizedFilePath.startsWith(path.normalize(allowedPath))
    );

    if (!isAllowedPath) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Forbidden',
            message: 'Access denied'
        }));
        return;
    }

    // Serve file
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>TyreHero - Page Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .emergency { background: #dc2626; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .emergency a { color: white; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Page Not Found</h1>
    <p>The requested page could not be found.</p>
    <div class="emergency">
        <h2>🚨 Emergency Service Available 24/7</h2>
        <p>If you need immediate tyre assistance:</p>
        <a href="tel:08001234567">📞 Call 0800 123 4567</a>
    </div>
    <p><a href="/">← Return to Homepage</a></p>
</body>
</html>
            `);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>TyreHero - Service Temporarily Unavailable</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .emergency { background: #dc2626; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .emergency a { color: white; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Service Temporarily Unavailable</h1>
    <p>We're experiencing technical difficulties. Please try again in a moment.</p>
    <div class="emergency">
        <h2>🚨 Emergency Service Still Available</h2>
        <p>Our emergency response team is always ready:</p>
        <a href="tel:08001234567">📞 Call 0800 123 4567</a>
    </div>
</body>
</html>
                `);
                return;
            }

            // Set appropriate cache headers based on file type
            if (ext === '.html') {
                res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            } else if (['.css', '.js'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
            } else if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
                res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);

            // Log response time for monitoring
            const responseTime = Date.now() - startTime;
            if (responseTime > 1000) {
                console.warn(`⚠️ Slow response: ${pathname} took ${responseTime}ms`);
            }
        });
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received. Graceful shutdown...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received. Graceful shutdown...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log('🚀 TyreHero Secure Server Running!');
    console.log(`📱 Local:    http://localhost:${PORT}`);
    console.log(`🌐 Network:  http://${HOST}:${PORT}`);
    console.log('🔒 Security Features Enabled:');
    console.log('   ✅ Path traversal protection');
    console.log('   ✅ Rate limiting');
    console.log('   ✅ Emergency call rate limiting');
    console.log('   ✅ Content Security Policy');
    console.log('   ✅ Security headers');
    console.log('   ✅ CORS protection');
    console.log('   ✅ Error handling');
    console.log('   ✅ Health checks: /health');
    console.log('   ✅ Emergency API: /api/emergency');
    console.log('🔧 Press Ctrl+C for graceful shutdown');
});