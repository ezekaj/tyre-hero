const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Rate limiting storage
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// MIME types for allowed file extensions only
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// Security: Whitelist of allowed files
const allowedFiles = [
    'index.html', 'emergency.html', 'contact.html', 'about.html',
    'services.html', 'locations.html', 'pricing.html', 'booking.html',
    'careers.html', 'mobile-fitting.html', 'puncture-repair.html',
    'privacy.html', 'terms.html', 'sitemap.html',
    'emergency-service-worker.js'
];

// Rate limiting function
function checkRateLimit(clientIP) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    if (!rateLimiter.has(clientIP)) {
        rateLimiter.set(clientIP, []);
    }

    const requests = rateLimiter.get(clientIP);
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false; // Rate limit exceeded
    }

    recentRequests.push(now);
    rateLimiter.set(clientIP, recentRequests);
    return true;
}

// Generate nonce for CSP
function generateNonce() {
    return crypto.randomBytes(16).toString('base64');
}

const server = http.createServer((req, res) => {
    const clientIP = req.connection.remoteAddress || req.socket.remoteAddress;

    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
        res.writeHead(429, { 'Content-Type': 'text/plain' });
        res.end('Too Many Requests');
        return;
    }

    // Generate CSP nonce
    const nonce = generateNonce();

    // Security Headers - ALWAYS SET FIRST
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // Strict Content Security Policy
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', csp);

    // HSTS for production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');

    // Environment-based CORS
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://tyrehero.com', 'https://www.tyrehero.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only allow GET and POST
    if (!['GET', 'POST'].includes(req.method)) {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Logging for security monitoring
    console.log(`${new Date().toISOString()} - ${clientIP} - ${req.method} ${pathname} - ${req.headers['user-agent']}`);

    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Remove leading slash and normalize
    const requestedFile = pathname.substring(1);
    const normalizedPath = path.posix.normalize(requestedFile);

    // Security checks
    if (normalizedPath.includes('..') ||
        path.isAbsolute(normalizedPath) ||
        normalizedPath.includes('\\') ||
        normalizedPath.startsWith('.') ||
        normalizedPath.includes('//')) {

        console.warn(`Security violation: Path traversal attempt from ${clientIP}: ${pathname}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if file is in whitelist
    const fileName = path.basename(normalizedPath);
    const isAssetFile = normalizedPath.startsWith('assets/') || normalizedPath.startsWith('images/');

    if (!allowedFiles.includes(fileName) && !isAssetFile) {
        console.warn(`Security violation: Unauthorized file access from ${clientIP}: ${normalizedPath}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    // Validate file extension
    const ext = path.extname(normalizedPath).toLowerCase();
    if (ext && !mimeTypes[ext]) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('File type not allowed');
        return;
    }

    // Build safe file path
    const filePath = path.join(__dirname, normalizedPath);

    // Final check: ensure file is within project directory
    if (!filePath.startsWith(__dirname)) {
        console.error(`Security violation: Directory traversal blocked for ${clientIP}: ${filePath}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Log 404 attempts for monitoring
            console.log(`404 - File not found: ${normalizedPath} from ${clientIP}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<!DOCTYPE html><html><body><h1>404 Not Found</h1><p>Page not found.</p></body></html>');
            return;
        }

        // Get MIME type
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Additional security for HTML files - inject CSP nonce
        if (ext === '.html') {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${filePath}:`, err.message);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<!DOCTYPE html><html><body><h1>Server Error</h1></body></html>');
                    return;
                }

                // Inject nonce into any inline scripts
                const htmlWithNonce = data.replace(
                    /<script(?![^>]*src)/g,
                    `<script nonce="${nonce}"`
                );

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(htmlWithNonce);
            });
        } else {
            // Serve non-HTML files
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error(`Error reading file ${filePath}:`, err.message);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error');
                    return;
                }

                // Set appropriate cache headers for static assets
                const cacheControl = ext === '.js' || ext === '.css'
                    ? 'public, max-age=3600'
                    : 'public, max-age=86400';

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': cacheControl,
                    'ETag': crypto.createHash('md5').update(data).digest('hex')
                });
                res.end(data);
            });
        }
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '127.0.0.1', () => { // Bind to localhost only
    console.log('🔒 TyreHero Secure Server Running!');
    console.log(`📱 Local:    http://localhost:${PORT}`);
    console.log('🛡️  Security features enabled');
    console.log('🔧 Press Ctrl+C to stop');
});