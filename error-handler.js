/**
 * TyreHero Secure Error Handling
 * Production-safe error handling without information disclosure
 */

class SecureErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.maxErrors = 10;
        this.isProduction = this.detectProductionEnvironment();
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandling();
        this.setupNetworkErrorHandling();
        this.setupFormErrorHandling();
    }

    /**
     * Detect if we're in production environment
     */
    detectProductionEnvironment() {
        return (
            location.hostname !== 'localhost' &&
            location.hostname !== '127.0.0.1' &&
            !location.hostname.includes('dev') &&
            !location.hostname.includes('test')
        );
    }

    /**
     * Setup global JavaScript error handling
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineNumber: event.lineno,
                columnNumber: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Setup unhandled promise rejection handling
     */
    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                timestamp: new Date().toISOString()
            });

            // Prevent the default browser console error
            event.preventDefault();
        });
    }

    /**
     * Setup network error handling
     */
    setupNetworkErrorHandling() {
        // Override fetch to handle network errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                if (!response.ok) {
                    this.handleNetworkError(response, args[0]);
                }

                return response;
            } catch (error) {
                this.handleNetworkError(error, args[0]);
                throw error; // Re-throw for caller handling
            }
        };
    }

    /**
     * Setup form error handling
     */
    setupFormErrorHandling() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                // Validate critical fields before submission
                try {
                    this.validateFormSecurity(form);
                } catch (error) {
                    event.preventDefault();
                    this.showUserError('Form validation failed. Please check your input and try again.');
                    this.handleError({
                        type: 'form_validation',
                        message: 'Form security validation failed',
                        formId: form.id,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    /**
     * Validate form security
     */
    validateFormSecurity(form) {
        const formData = new FormData(form);

        // Check for CSRF token if security utils are loaded
        if (window.tyreHeroSecurity && !formData.get('csrf_token')) {
            throw new Error('CSRF token missing');
        }

        // Check for suspicious input patterns
        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                // Detect potential XSS attempts
                if (/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(value)) {
                    throw new Error(`Suspicious input detected in ${key}`);
                }

                // Detect SQL injection attempts
                if (/(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b).*(\bFROM\b|\bINTO\b|\bWHERE\b)/i.test(value)) {
                    throw new Error(`Potential SQL injection in ${key}`);
                }
            }
        }
    }

    /**
     * Handle network errors securely
     */
    handleNetworkError(errorOrResponse, url) {
        let errorInfo = {
            type: 'network',
            timestamp: new Date().toISOString()
        };

        if (errorOrResponse instanceof Response) {
            errorInfo.status = errorOrResponse.status;
            errorInfo.statusText = errorOrResponse.statusText;
            errorInfo.url = this.sanitizeUrl(url);
        } else {
            errorInfo.message = 'Network request failed';
            errorInfo.url = this.sanitizeUrl(url);
        }

        this.handleError(errorInfo);

        // Show user-friendly message based on error type
        if (errorOrResponse instanceof Response) {
            switch (errorOrResponse.status) {
                case 429:
                    this.showUserError('Too many requests. Please wait a moment before trying again.');
                    break;
                case 500:
                case 502:
                case 503:
                    this.showUserError('Service temporarily unavailable. Please try again later.');
                    break;
                case 404:
                    this.showUserError('Requested service not found. Please contact support if this continues.');
                    break;
                default:
                    this.showUserError('Unable to complete request. Please check your connection and try again.');
            }
        } else {
            this.showUserError('Connection error. Please check your internet connection.');
        }
    }

    /**
     * Main error handling function
     */
    handleError(errorInfo) {
        // Add to error queue
        this.errorQueue.push(errorInfo);

        // Keep only recent errors
        if (this.errorQueue.length > this.maxErrors) {
            this.errorQueue.shift();
        }

        // In production, only log critical errors
        if (this.isProduction) {
            this.logProductionError(errorInfo);
        } else {
            this.logDevelopmentError(errorInfo);
        }

        // Send to monitoring service in production
        if (this.isProduction) {
            this.sendErrorToMonitoring(errorInfo);
        }
    }

    /**
     * Log error for production (sanitized)
     */
    logProductionError(errorInfo) {
        const sanitizedError = {
            type: errorInfo.type,
            timestamp: errorInfo.timestamp,
            userAgent: navigator.userAgent,
            url: window.location.pathname,
            // Don't include sensitive information in production logs
            genericMessage: this.getGenericErrorMessage(errorInfo.type)
        };

        // Only log to a secure endpoint, never to console in production
        // console logging is disabled in production
    }

    /**
     * Log error for development (detailed)
     */
    logDevelopmentError(errorInfo) {
        console.group(`🚨 TyreHero Error - ${errorInfo.type}`);
        console.error('Error Details:', errorInfo);
        console.trace('Stack Trace');
        console.groupEnd();
    }

    /**
     * Get generic error message for production
     */
    getGenericErrorMessage(errorType) {
        const messages = {
            'javascript': 'Application error occurred',
            'promise_rejection': 'Async operation failed',
            'network': 'Network communication error',
            'form_validation': 'Form processing error',
            'security': 'Security validation failed'
        };

        return messages[errorType] || 'Unknown error occurred';
    }

    /**
     * Send error to monitoring service (production)
     */
    sendErrorToMonitoring(errorInfo) {
        // In a real implementation, this would send to your error monitoring service
        // Examples: Sentry, LogRocket, Bugsnag, etc.

        try {
            // Sanitize error for transmission
            const sanitizedError = {
                type: errorInfo.type,
                timestamp: errorInfo.timestamp,
                url: window.location.pathname,
                userAgent: navigator.userAgent.substring(0, 100), // Limit UA string
                sessionId: sessionStorage.getItem('tyrehero_session_id'),
                // Only include safe metadata
                metadata: {
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    online: navigator.onLine,
                    language: navigator.language
                }
            };

            // Send to error monitoring endpoint
            // fetch('/api/errors', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(sanitizedError)
            // }).catch(() => {
            //     // Silently fail - don't create error loops
            // });

        } catch (e) {
            // Silently fail - don't create error loops
        }
    }

    /**
     * Show user-friendly error message
     */
    showUserError(message, type = 'error') {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.user-error-message');
        existingErrors.forEach(error => error.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'user-error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.25rem;
            z-index: 10003;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        const icon = type === 'error' ? '⚠️' : 'ℹ️';
        errorDiv.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
            <button style="background: none; border: none; color: white; font-size: 1.2rem; margin-left: 1rem; cursor: pointer;" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    /**
     * Sanitize URL for logging (remove sensitive parameters)
     */
    sanitizeUrl(url) {
        if (!url) return 'unknown';

        try {
            const urlObj = new URL(url, window.location.origin);

            // Remove sensitive parameters
            const sensitiveParams = ['token', 'key', 'password', 'email', 'phone', 'lat', 'lng'];
            sensitiveParams.forEach(param => {
                if (urlObj.searchParams.has(param)) {
                    urlObj.searchParams.set(param, '[REDACTED]');
                }
            });

            return urlObj.toString();
        } catch (e) {
            return String(url).substring(0, 100) + '...';
        }
    }

    /**
     * Handle emergency service errors specifically
     */
    handleEmergencyError(error, context = {}) {
        this.handleError({
            type: 'emergency_service',
            message: 'Emergency service error',
            context: context,
            timestamp: new Date().toISOString(),
            priority: 'high'
        });

        // Show specific emergency error message
        this.showUserError(
            'Emergency service is experiencing issues. Please call 0800 123 4567 directly for immediate assistance.',
            'error'
        );
    }

    /**
     * Get error summary for debugging
     */
    getErrorSummary() {
        if (!this.isProduction) {
            return {
                totalErrors: this.errorQueue.length,
                recentErrors: this.errorQueue.slice(-5),
                errorTypes: this.errorQueue.reduce((acc, error) => {
                    acc[error.type] = (acc[error.type] || 0) + 1;
                    return acc;
                }, {})
            };
        }
        return { message: 'Error details not available in production' };
    }
}

// Global error handler instance
window.secureErrorHandler = new SecureErrorHandler();

// Global emergency error function
window.handleEmergencyError = (error, context) => {
    window.secureErrorHandler.handleEmergencyError(error, context);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureErrorHandler;
}