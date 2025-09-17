const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = url.parse(req.url).pathname;

  // Default to index.html for root requests
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Remove leading slash and resolve relative to current directory
  const fullPath = path.join(__dirname, filePath.substring(1));

  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>404 - File Not Found</h1>
        <p>The file <code>${filePath}</code> was not found.</p>
        <p><a href="/">Go to Homepage</a></p>
      `);
      return;
    }

    // File exists, serve it
    fs.readFile(fullPath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      const mimeType = getMimeType(fullPath);
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache' // Disable caching for development
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 TyreHero Website Server Running!`);
  console.log(`📱 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Network:  http://127.0.0.1:${PORT}`);
  console.log(`📋 Pages Available:`);
  console.log(`   • Homepage:      http://localhost:${PORT}/`);
  console.log(`   • Emergency:     http://localhost:${PORT}/emergency.html`);
  console.log(`   • Services:      http://localhost:${PORT}/services.html`);
  console.log(`   • About:         http://localhost:${PORT}/about.html`);
  console.log(`   • Contact:       http://localhost:${PORT}/contact.html`);
  console.log(`   • Locations:     http://localhost:${PORT}/locations.html`);
  console.log(`   • Pricing:       http://localhost:${PORT}/pricing.html`);
  console.log(`🔧 Press Ctrl+C to stop the server`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.log('❌ Server error:', err);
  }
});