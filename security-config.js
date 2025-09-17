/**
 * TyreHero Security Configuration
 * Critical security headers and CSP policies for production deployment
 */

// Content Security Policy configuration for TyreHero
const CSP_POLICY = {
    // Default source - self only for maximum security
    "default-src": ["'self'"],

    // Scripts - only from self and specific trusted CDNs
    "script-src": [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts - minimize usage
        "https://fonts.googleapis.com",
        "https://www.google-analytics.com", // If using analytics
        "https://www.googletagmanager.com"  // If using GTM
    ],

    // Styles - self and Google Fonts
    "style-src": [
        "'self'",
        "'unsafe-inline'", // Required for inline styles
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
    ],

    // Images - self and data URIs for inline images
    "img-src": [
        "'self'",
        "data:",
        "https://www.google-analytics.com" // Analytics tracking pixel
    ],

    // Fonts - self and Google Fonts
    "font-src": [
        "'self'",
        "https://fonts.gstatic.com"
    ],

    // Connect sources - for AJAX requests
    "connect-src": [
        "'self'",
        "https://api.tyrehero.com", // Your API endpoint
        "https://www.google-analytics.com"
    ],

    // Media sources
    "media-src": ["'self'"],

    // Object sources - none for security
    "object-src": ["'none'"],

    // Base URI - self only
    "base-uri": ["'self'"],

    // Form actions - self only
    "form-action": ["'self'"],

    // Frame ancestors - prevent clickjacking
    "frame-ancestors": ["'none'"],

    // Upgrade insecure requests
    "upgrade-insecure-requests": []
};

// Security Headers Configuration
const SECURITY_HEADERS = {
    // Strict Transport Security - Force HTTPS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS Protection
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy (formerly Feature Policy)
    "Permissions-Policy": [
        "geolocation=(self)", // Required for emergency location
        "camera=(), microphone=(), payment=(), usb=()"
    ].join(", "),

    // Cache Control for security-sensitive pages
    "Cache-Control": "no-cache, no-store, must-revalidate, private",

    // Pragma for HTTP/1.0 compatibility
    "Pragma": "no-cache",

    // Cross-Origin policies
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin"
};

// Generate CSP header string
function generateCSPHeader() {
    const policies = [];
    for (const [directive, sources] of Object.entries(CSP_POLICY)) {
        if (sources.length > 0) {
            policies.push(`${directive} ${sources.join(' ')}`);
        } else {
            policies.push(directive);
        }
    }
    return policies.join('; ');
}

// Apache .htaccess configuration
const APACHE_HTACCESS = `
# TyreHero Security Headers Configuration
# Add this to your .htaccess file

<IfModule mod_headers.c>
    # Content Security Policy
    Header always set Content-Security-Policy "${generateCSPHeader()}"

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(self), camera=(), microphone=(), payment=(), usb=()"

    # Remove server information
    Header always unset Server
    Header always unset X-Powered-By
</IfModule>

# Prevent access to sensitive files
<FilesMatch "\\.(env|log|config|bak|sql|git)$">
    Require all denied
</FilesMatch>

# Force HTTPS redirect
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
`;

// Nginx configuration
const NGINX_CONFIG = `
# TyreHero Security Headers Configuration
# Add this to your Nginx server block

# Security Headers
add_header Content-Security-Policy "${generateCSPHeader()}" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), camera=(), microphone=(), payment=(), usb=()" always;

# Remove server tokens
server_tokens off;
more_clear_headers Server;

# Force HTTPS
if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
}
`;

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CSP_POLICY,
        SECURITY_HEADERS,
        generateCSPHeader,
        APACHE_HTACCESS,
        NGINX_CONFIG
    };
}

console.log('TyreHero Security Configuration Loaded');
console.log('CSP Header:', generateCSPHeader());