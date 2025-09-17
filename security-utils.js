/**
 * TyreHero Security Utilities
 * CSRF protection, input validation, and security functions
 */

class TyreHeroSecurity {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.init();
    }

    init() {
        this.addCSRFTokenToForms();
        this.setupInputValidation();
        this.setupRateLimiting();
        this.setupSecureEventListeners();
    }

    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Add CSRF tokens to all forms
     */
    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.querySelector('input[name="csrf_token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = this.csrfToken;
                form.appendChild(csrfInput);
            }
        });
    }

    /**
     * Input validation and sanitization
     */
    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') return '';

        // Remove dangerous characters
        let sanitized = input.replace(/[<>\"'&]/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entities[match];
        });

        // Specific validation based on type
        switch (type) {
            case 'email':
                // Basic email validation and sanitization
                sanitized = sanitized.toLowerCase().trim();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
                    throw new Error('Invalid email format');
                }
                break;

            case 'phone':
                // Phone number sanitization
                sanitized = sanitized.replace(/[^\d\+\-\(\)\s]/g, '');
                if (sanitized.length < 10 || sanitized.length > 15) {
                    throw new Error('Invalid phone number');
                }
                break;

            case 'name':
                // Name validation - only letters, spaces, hyphens, apostrophes
                sanitized = sanitized.replace(/[^a-zA-Z\s\-\'\.]/g, '');
                if (sanitized.length < 2 || sanitized.length > 50) {
                    throw new Error('Name must be between 2 and 50 characters');
                }
                break;

            case 'message':
                // Message validation - remove excessive whitespace
                sanitized = sanitized.trim().replace(/\s+/g, ' ');
                if (sanitized.length < 10 || sanitized.length > 1000) {
                    throw new Error('Message must be between 10 and 1000 characters');
                }
                break;

            default:
                // General text sanitization
                sanitized = sanitized.trim();
                if (sanitized.length > 255) {
                    throw new Error('Input too long');
                }
        }

        return sanitized;
    }

    /**
     * Validate form data
     */
    validateForm(formData) {
        const errors = [];

        try {
            // Validate CSRF token
            if (!formData.csrf_token || formData.csrf_token !== this.csrfToken) {
                errors.push('Security validation failed. Please reload the page.');
            }

            // Validate required fields
            if (formData.name) {
                formData.name = this.sanitizeInput(formData.name, 'name');
            } else {
                errors.push('Name is required');
            }

            if (formData.email) {
                formData.email = this.sanitizeInput(formData.email, 'email');
            } else {
                errors.push('Email is required');
            }

            if (formData.message) {
                formData.message = this.sanitizeInput(formData.message, 'message');
            } else {
                errors.push('Message is required');
            }

            // Optional fields
            if (formData.phone) {
                formData.phone = this.sanitizeInput(formData.phone, 'phone');
            }

            if (formData.subject) {
                formData.subject = this.sanitizeInput(formData.subject);
            }

        } catch (error) {
            errors.push(error.message);
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: formData
        };
    }

    /**
     * Setup input validation for real-time feedback
     */
    setupInputValidation() {
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateSingleInput(e.target);
            });

            // Prevent common XSS attempts in real-time
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (/<script|javascript:|data:|vbscript:|on\w+\s*=/.test(value)) {
                    e.target.value = value.replace(/<script|javascript:|data:|vbscript:|on\w+\s*=/gi, '');
                    this.showSecurityWarning('Potentially dangerous input detected and removed.');
                }
            });
        });
    }

    /**
     * Validate single input field
     */
    validateSingleInput(input) {
        const value = input.value;
        const type = input.type || input.name;
        let errorMessage = '';

        try {
            switch (type) {
                case 'email':
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                case 'phone':
                    if (value && !/^[\d\+\-\(\)\s]{10,15}$/.test(value)) {
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
                case 'text':
                case 'name':
                    if (value && (value.length < 2 || value.length > 50)) {
                        errorMessage = 'Must be between 2 and 50 characters';
                    }
                    break;
            }

            this.showInputError(input, errorMessage);
        } catch (error) {
            this.showInputError(input, 'Invalid input');
        }
    }

    /**
     * Show input validation error
     */
    showInputError(input, message) {
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }

        if (message) {
            input.classList.add('input-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'input-error';
            errorDiv.textContent = message;
            errorDiv.style.cssText = 'color: #e53935; font-size: 0.875rem; margin-top: 0.25rem;';
            input.parentNode.appendChild(errorDiv);
        } else {
            input.classList.remove('input-invalid');
        }
    }

    /**
     * Rate limiting for form submissions
     */
    setupRateLimiting() {
        this.submissionTimes = [];
        this.maxSubmissions = 3; // Max 3 submissions
        this.timeWindow = 60000; // Per minute
    }

    /**
     * Check rate limit
     */
    checkRateLimit() {
        const now = Date.now();

        // Remove old submissions outside time window
        this.submissionTimes = this.submissionTimes.filter(time =>
            now - time < this.timeWindow
        );

        if (this.submissionTimes.length >= this.maxSubmissions) {
            throw new Error('Too many requests. Please wait before submitting again.');
        }

        this.submissionTimes.push(now);
        return true;
    }

    /**
     * Secure form submission
     */
    async submitForm(form, endpoint = '/api/contact') {
        try {
            // Check rate limiting
            this.checkRateLimit();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Validate form data
            const validation = this.validateForm(data);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            // In a real implementation, this would submit to your secure backend
            // For now, we'll simulate the submission
            await this.simulateSubmission(validation.sanitizedData);

            // Show success message
            this.showSuccessMessage(form);

        } catch (error) {
            this.showErrorMessage(form, error.message);
        }
    }

    /**
     * Simulate form submission (replace with real API call)
     */
    async simulateSubmission(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Here you would send data to your secure backend
                // fetch(endpoint, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'X-CSRF-Token': this.csrfToken
                //     },
                //     body: JSON.stringify(data)
                // })
                resolve();
            }, 1000);
        });
    }

    /**
     * Show success message
     */
    showSuccessMessage(form) {
        form.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 2rem; background: #e8f5e8; border-radius: 0.5rem; border: 1px solid #4caf50;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" style="color: #4caf50; margin-bottom: 1rem;">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor"/>
                </svg>
                <h3 style="color: #2e7d32; margin-bottom: 0.5rem;">Message Sent Successfully</h3>
                <p style="color: #388e3c;">Thank you for contacting TyreHero. We've received your message securely and will respond as soon as possible.</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showErrorMessage(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = 'background: #ffebee; color: #c62828; padding: 1rem; border-radius: 0.25rem; margin-bottom: 1rem; border: 1px solid #e57373;';
        errorDiv.textContent = message;

        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        form.insertBefore(errorDiv, form.firstChild);

        // Re-enable submit button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }

    /**
     * Show security warning
     */
    showSecurityWarning(message) {
        // Create a temporary warning notification
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #ff9800; color: white; padding: 1rem; border-radius: 0.25rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: 500;
        `;
        warning.textContent = message;
        document.body.appendChild(warning);

        setTimeout(() => {
            warning.remove();
        }, 5000);
    }

    /**
     * Setup secure event listeners
     */
    setupSecureEventListeners() {
        // Prevent form submission without validation
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                e.preventDefault();
                this.submitForm(e.target);
            }
        });

        // Add input validation styles
        const style = document.createElement('style');
        style.textContent = `
            .input-invalid {
                border-color: #e53935 !important;
                box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Secure geolocation handling with user consent
     */
    async getSecureLocation() {
        return new Promise((resolve, reject) => {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            // Show user consent dialog
            const consent = confirm(
                'TyreHero would like to access your location to provide faster emergency service. ' +
                'Your location data will only be used for this service and will not be stored or shared. ' +
                'Do you consent to location access?'
            );

            if (!consent) {
                reject(new Error('Location access denied by user'));
                return;
            }

            // Get location with strict options
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Only return essential coordinates
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                    });
                },
                (error) => {
                    reject(new Error('Unable to retrieve location: ' + error.message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
}

// Initialize security on page load
document.addEventListener('DOMContentLoaded', () => {
    window.tyreHeroSecurity = new TyreHeroSecurity();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TyreHeroSecurity;
}