/**
 * TyreHero Secure Cookie and Session Management
 * GDPR-compliant cookie handling with security best practices
 */

class SecureCookieManager {
    constructor() {
        this.cookieConsent = false;
        this.init();
    }

    init() {
        this.checkCookieConsent();
        this.setupCookieBanner();
        this.initSecureSessionHandling();
    }

    /**
     * Check existing cookie consent
     */
    checkCookieConsent() {
        const consent = localStorage.getItem('tyrehero_cookie_consent');
        this.cookieConsent = consent === 'true';

        if (this.cookieConsent) {
            this.enableAnalyticsCookies();
        }
    }

    /**
     * Setup GDPR cookie consent banner
     */
    setupCookieBanner() {
        // Don't show banner if already consented or declined
        if (localStorage.getItem('tyrehero_cookie_consent')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <h4>🍪 Cookie Notice</h4>
                        <p>TyreHero uses essential cookies for emergency services and optional analytics cookies to improve our service. We respect your privacy and comply with GDPR.</p>
                    </div>
                    <div class="cookie-buttons">
                        <button id="cookie-essential" class="btn btn-outline btn-sm">Essential Only</button>
                        <button id="cookie-accept" class="btn btn-primary btn-sm">Accept All</button>
                        <button id="cookie-settings" class="btn btn-text btn-sm">Settings</button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                border-top: 3px solid var(--primary);
                box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                padding: 1rem;
                font-family: var(--body-font);
            }

            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 2rem;
            }

            .cookie-text h4 {
                margin: 0 0 0.5rem 0;
                color: var(--primary);
                font-size: 1.1rem;
            }

            .cookie-text p {
                margin: 0;
                color: var(--medium);
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .cookie-buttons {
                display: flex;
                gap: 0.75rem;
                flex-shrink: 0;
            }

            .btn-sm {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
            }

            .btn-text {
                background: none;
                border: none;
                color: var(--medium);
                text-decoration: underline;
                cursor: pointer;
            }

            @media (max-width: 768px) {
                .cookie-content {
                    flex-direction: column;
                    gap: 1rem;
                }

                .cookie-buttons {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('cookie-essential').addEventListener('click', () => {
            this.setEssentialCookiesOnly();
            banner.remove();
        });

        document.getElementById('cookie-accept').addEventListener('click', () => {
            this.setAllCookiesAccepted();
            banner.remove();
        });

        document.getElementById('cookie-settings').addEventListener('click', () => {
            this.showCookieSettings();
        });
    }

    /**
     * Set essential cookies only
     */
    setEssentialCookiesOnly() {
        localStorage.setItem('tyrehero_cookie_consent', 'essential');
        this.cookieConsent = false;

        // Clear any existing analytics cookies
        this.clearAnalyticsCookies();

        this.showConsentMessage('Essential cookies enabled. Analytics disabled.');
    }

    /**
     * Accept all cookies
     */
    setAllCookiesAccepted() {
        localStorage.setItem('tyrehero_cookie_consent', 'true');
        this.cookieConsent = true;

        this.enableAnalyticsCookies();
        this.showConsentMessage('All cookies enabled. Thank you!');
    }

    /**
     * Show cookie settings modal
     */
    showCookieSettings() {
        const modal = document.createElement('div');
        modal.id = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Cookie Settings</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="cookie-category">
                            <h4>Essential Cookies (Always Active)</h4>
                            <p>Required for emergency services, security, and basic website functionality. These cannot be disabled.</p>
                            <ul>
                                <li>Session management and CSRF protection</li>
                                <li>Emergency location services</li>
                                <li>Form security and validation</li>
                            </ul>
                        </div>

                        <div class="cookie-category">
                            <h4>Analytics Cookies (Optional)</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" id="analytics-toggle">
                                <span class="slider"></span>
                                Enable analytics cookies
                            </label>
                            <p>Help us improve our service by analyzing website usage. No personal data is shared with third parties.</p>
                            <ul>
                                <li>Page visits and user interactions</li>
                                <li>Performance monitoring</li>
                                <li>Service improvement insights</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-cookie-settings" class="btn btn-primary">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .modal-content {
                background: white;
                border-radius: 0.5rem;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #eee;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--medium);
            }

            .modal-body {
                padding: 1.5rem;
            }

            .cookie-category {
                margin-bottom: 2rem;
            }

            .cookie-category h4 {
                color: var(--primary);
                margin-bottom: 0.5rem;
            }

            .cookie-category ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
                color: var(--medium);
                font-size: 0.9rem;
            }

            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
                margin: 1rem 0;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                border-radius: 34px;
                transition: 0.4s;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: 0.4s;
            }

            input:checked + .slider {
                background-color: var(--primary);
            }

            input:checked + .slider:before {
                transform: translateX(26px);
            }

            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #eee;
                text-align: right;
            }
        `;
        document.head.appendChild(modalStyle);

        document.body.appendChild(modal);

        // Set current state
        const analyticsToggle = document.getElementById('analytics-toggle');
        analyticsToggle.checked = this.cookieConsent;

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });

        document.getElementById('save-cookie-settings').addEventListener('click', () => {
            const analyticsEnabled = analyticsToggle.checked;

            if (analyticsEnabled) {
                this.setAllCookiesAccepted();
            } else {
                this.setEssentialCookiesOnly();
            }

            modal.remove();

            // Close cookie banner if still open
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.remove();
            }
        });
    }

    /**
     * Enable analytics cookies
     */
    enableAnalyticsCookies() {
        // In production, this would initialize analytics services
        // For now, we'll just set secure cookies for session management
        this.setSecureCookie('tyrehero_analytics', 'enabled', 30);
    }

    /**
     * Clear analytics cookies
     */
    clearAnalyticsCookies() {
        this.deleteCookie('tyrehero_analytics');
        // Clear any third-party analytics cookies here
    }

    /**
     * Set secure cookie with proper flags
     */
    setSecureCookie(name, value, days = 7) {
        if (!this.cookieConsent && name !== 'tyrehero_session') {
            return; // Don't set non-essential cookies without consent
        }

        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

        const cookieFlags = [
            `${name}=${encodeURIComponent(value)}`,
            `expires=${expires.toUTCString()}`,
            'path=/',
            'SameSite=Strict'
        ];

        // Add Secure flag for HTTPS
        if (location.protocol === 'https:') {
            cookieFlags.push('Secure');
        }

        // Add HttpOnly flag for session cookies (server-side only)
        if (name === 'tyrehero_session') {
            cookieFlags.push('HttpOnly');
        }

        document.cookie = cookieFlags.join('; ');
    }

    /**
     * Get cookie value
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    /**
     * Delete cookie
     */
    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    }

    /**
     * Show consent message
     */
    showConsentMessage(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.25rem;
            z-index: 10002;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Initialize secure session handling
     */
    initSecureSessionHandling() {
        // Generate session ID if not exists
        let sessionId = sessionStorage.getItem('tyrehero_session_id');
        if (!sessionId) {
            sessionId = this.generateSecureSessionId();
            sessionStorage.setItem('tyrehero_session_id', sessionId);
        }

        // Set session cookie (essential - always allowed)
        this.setSecureCookie('tyrehero_session', sessionId, 1); // 1 day expiry

        // Session timeout handling
        this.initSessionTimeout();

        // Track page visibility for session management
        this.initVisibilityTracking();
    }

    /**
     * Generate secure session ID
     */
    generateSecureSessionId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Initialize session timeout
     */
    initSessionTimeout() {
        const timeout = 30 * 60 * 1000; // 30 minutes
        let lastActivity = Date.now();

        const updateActivity = () => {
            lastActivity = Date.now();
            sessionStorage.setItem('tyrehero_last_activity', lastActivity.toString());
        };

        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        // Check for session timeout
        setInterval(() => {
            const now = Date.now();
            const lastActivityTime = parseInt(sessionStorage.getItem('tyrehero_last_activity') || lastActivity);

            if (now - lastActivityTime > timeout) {
                this.handleSessionTimeout();
            }
        }, 60000); // Check every minute
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        // Clear session data
        sessionStorage.clear();

        // Show timeout message (only for emergency/booking pages)
        if (window.location.pathname.includes('emergency') || window.location.pathname.includes('booking')) {
            alert('Your session has expired for security reasons. Please refresh the page to continue.');
            window.location.reload();
        }
    }

    /**
     * Initialize page visibility tracking for security
     */
    initVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - potentially secure sensitive data
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    // Auto-save form data to session storage for recovery
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());

                    // Only save non-sensitive data
                    delete data.password;
                    delete data.card_number;
                    delete data.cvv;

                    if (Object.keys(data).length > 0) {
                        sessionStorage.setItem(`form_backup_${form.id}`, JSON.stringify(data));
                    }
                });
            } else {
                // Page visible - restore form data if needed
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    const backupData = sessionStorage.getItem(`form_backup_${form.id}`);
                    if (backupData) {
                        try {
                            const data = JSON.parse(backupData);
                            Object.entries(data).forEach(([key, value]) => {
                                const input = form.querySelector(`[name="${key}"]`);
                                if (input && !input.value) {
                                    input.value = value;
                                }
                            });
                        } catch (e) {
                            // Invalid backup data, ignore
                        }
                    }
                });
            }
        });
    }
}

// Initialize secure cookie management
document.addEventListener('DOMContentLoaded', () => {
    window.secureCookieManager = new SecureCookieManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureCookieManager;
}