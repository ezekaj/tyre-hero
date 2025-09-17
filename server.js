const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
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
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    let parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html for root path
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Serve files from the website directory
    let filePath = path.join(__dirname, 'website', pathname);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist, return 404
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>The requested resource was not found.</p>');
            return;
        }

        // Get file extension and corresponding MIME type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1><p>Error reading file.</p>');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('🚀 TyreHero Website Server Running!');
    console.log(`📱 Local:    http://localhost:${PORT}`);
    console.log(`🌐 Network:  http://127.0.0.1:${PORT}`);
    console.log('📋 Pages Available:');
    console.log(`   • Homepage:      http://localhost:${PORT}/`);
    console.log(`   • Emergency:     http://localhost:${PORT}/emergency.html`);
    console.log(`   • Services:      http://localhost:${PORT}/services.html`);
    console.log(`   • About:         http://localhost:${PORT}/about.html`);
    console.log(`   • Contact:       http://localhost:${PORT}/contact.html`);
    console.log(`   • Locations:     http://localhost:${PORT}/locations.html`);
    console.log(`   • Pricing:       http://localhost:${PORT}/pricing.html`);
    console.log('🔧 Press Ctrl+C to stop the server');
});