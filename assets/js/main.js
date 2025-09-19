/**
 * TyreHero - Emergency Tyre Service
 * Main JavaScript functionality
 * Mobile-first, accessibility-compliant, performance-optimized
 */

class TyreHero {
  constructor() {
    this.isEmergencyMode = false;
    this.isFormSubmitting = false;
    this.currentLocation = null;
    this.emergencyCallCount = 0;
    
    // Initialize core functionality
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.initMobileNavigation();
    this.initModeToggle();
    this.initFormHandling();
    this.initEmergencyFeatures();
    this.initSmoothScrolling();
    this.initContactMethods();
    this.init3DModelContainer();
    this.initLocationServices();
    this.initPhoneFormatting();
    this.initAccessibility();
    this.initAnalytics();
    
    console.log('TyreHero initialized successfully');
  }

  /**
   * Mobile Navigation Toggle
   */
  initMobileNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.main-navigation');
    const overlay = document.querySelector('.nav-overlay');

    if (!mobileToggle || !navigation) return;

    // Create overlay if it doesn't exist
    if (!overlay) {
      const navOverlay = document.createElement('div');
      navOverlay.className = 'nav-overlay';
      document.body.appendChild(navOverlay);
    }

    const toggleNav = () => {
      const isOpen = navigation.classList.contains('active');
      
      navigation.classList.toggle('active');
      mobileToggle.classList.toggle('active');
      document.body.classList.toggle('nav-open');
      
      // Update ARIA attributes
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      
      // Focus management
      if (!isOpen) {
        const firstLink = navigation.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    };

    // Toggle button handler
    mobileToggle.addEventListener('click', toggleNav);

    // Close on overlay click
    const overlayEl = document.querySelector('.nav-overlay');
    if (overlayEl) {
      overlayEl.addEventListener('click', toggleNav);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navigation.classList.contains('active')) {
        toggleNav();
        mobileToggle.focus();
      }
    });

    // Close navigation when clicking nav links
    navigation.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        setTimeout(toggleNav, 100);
      }
    });
  }

  /**
   * Emergency/Regular Mode Toggle
   */
  initModeToggle() {
    const emergencyToggle = document.querySelector('.emergency-toggle');
    const regularToggle = document.querySelector('.regular-toggle');
    const emergencyForm = document.querySelector('.emergency-form');
    const regularForm = document.querySelector('.regular-form');
    const emergencyBanner = document.querySelector('.emergency-banner');

    if (!emergencyToggle || !regularToggle) return;

    const setEmergencyMode = (isEmergency) => {
      this.isEmergencyMode = isEmergency;

      // Update toggle buttons
      emergencyToggle.classList.toggle('active', isEmergency);
      regularToggle.classList.toggle('active', !isEmergency);

      // Show/hide forms
      if (emergencyForm) {
        emergencyForm.style.display = isEmergency ? 'block' : 'none';
        emergencyForm.setAttribute('aria-hidden', !isEmergency);
      }
      
      if (regularForm) {
        regularForm.style.display = !isEmergency ? 'block' : 'none';
        regularForm.setAttribute('aria-hidden', isEmergency);
      }

      // Show/hide emergency banner
      if (emergencyBanner) {
        emergencyBanner.classList.toggle('active', isEmergency);
      }

      // Update body class for styling
      document.body.classList.toggle('emergency-mode', isEmergency);

      // Focus management
      const activeForm = isEmergency ? emergencyForm : regularForm;
      if (activeForm) {
        const firstInput = activeForm.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      }

      // Track mode change
      this.trackEvent('mode_change', {
        mode: isEmergency ? 'emergency' : 'regular'
      });
    };

    // Mode toggle handlers
    emergencyToggle.addEventListener('click', () => setEmergencyMode(true));
    regularToggle.addEventListener('click', () => setEmergencyMode(false));

    // Keyboard support
    [emergencyToggle, regularToggle].forEach(toggle => {
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    });

    // Initialize with emergency mode if URL parameter present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('emergency') === 'true') {
      setEmergencyMode(true);
    }
  }

  /**
   * Form Validation and Submission
   */
  initFormHandling() {
    const forms = document.querySelectorAll('.booking-form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
      
      // Real-time validation
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (isRequired && !value) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(field)} is required`;
    }
    
    // Field-specific validation
    if (value && fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    if (value && fieldType === 'tel') {
      const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }
    
    if (field.name === 'postcode' && value) {
      const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid UK postcode';
      }
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, errorMessage) {
    const fieldContainer = field.closest('.form-group') || field.parentElement;
    const existingError = fieldContainer.querySelector('.field-error');
    
    // Remove existing error
    if (existingError) {
      existingError.remove();
    }
    
    // Update field state
    field.classList.toggle('error', !isValid);
    field.setAttribute('aria-invalid', !isValid);
    
    // Show error message
    if (!isValid && errorMessage) {
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = errorMessage;
      errorElement.setAttribute('role', 'alert');
      
      fieldContainer.appendChild(errorElement);
      
      // Associate error with field for screen readers
      errorElement.id = `${field.id || field.name}-error`;
      field.setAttribute('aria-describedby', errorElement.id);
    }
  }

  clearFieldError(field) {
    const fieldContainer = field.closest('.form-group') || field.parentElement;
    const existingError = fieldContainer.querySelector('.field-error');
    
    if (existingError) {
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
      existingError.remove();
    }
  }

  getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent.replace('*', '').trim();
    
    const placeholder = field.getAttribute('placeholder');
    if (placeholder) return placeholder;
    
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (this.isFormSubmitting) return;
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let allValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        allValid = false;
      }
    });
    
    if (!allValid) {
      // Focus first invalid field
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Show loading state
    this.isFormSubmitting = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    form.classList.add('submitting');
    
    try {
      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Add metadata
      data.submission_time = new Date().toISOString();
      data.is_emergency = this.isEmergencyMode;
      data.user_location = this.currentLocation;
      data.user_agent = navigator.userAgent;
      
      // Submit form
      const response = await this.submitForm(data);
      
      if (response.success) {
        this.showSuccessMessage(form, response.message);
        form.reset();
        
        // Track successful submission
        this.trackEvent('form_submission_success', {
          form_type: this.isEmergencyMode ? 'emergency' : 'regular',
          submission_id: response.id
        });
        
        // Redirect if provided
        if (response.redirect_url) {
          setTimeout(() => {
            window.location.href = response.redirect_url;
          }, 2000);
        }
      } else {
        throw new Error(response.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage(form, error.message || 'Failed to submit form. Please try again.');
      
      // Track submission error
      this.trackEvent('form_submission_error', {
        form_type: this.isEmergencyMode ? 'emergency' : 'regular',
        error_message: error.message
      });
    } finally {
      // Reset loading state
      this.isFormSubmitting = false;
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      form.classList.remove('submitting');
    }
  }

  async submitForm(data) {
    // Simulate API call - replace with actual endpoint
    const endpoint = this.isEmergencyMode 
      ? '/api/emergency-booking' 
      : '/api/regular-booking';
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  showSuccessMessage(form, message = 'Form submitted successfully!') {
    const successElement = document.createElement('div');
    successElement.className = 'form-message success';
    successElement.innerHTML = `
      <div class="message-icon">✓</div>
      <div class="message-text">${message}</div>
    `;
    successElement.setAttribute('role', 'alert');
    
    form.prepend(successElement);
    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.remove();
      }
    }, 5000);
  }

  showErrorMessage(form, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-message error';
    errorElement.innerHTML = `
      <div class="message-icon">⚠</div>
      <div class="message-text">${message}</div>
    `;
    errorElement.setAttribute('role', 'alert');
    
    form.prepend(errorElement);
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove after 8 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 8000);
  }

  /**
   * Emergency Features
   */
  initEmergencyFeatures() {
    const emergencyCallButton = document.querySelector('.emergency-call-btn');
    const emergencyBanner = document.querySelector('.emergency-banner');
    
    if (emergencyCallButton) {
      emergencyCallButton.addEventListener('click', (e) => {
        this.handleEmergencyCall(e);
      });
    }
    
    // Emergency banner auto-show logic
    if (this.shouldShowEmergencyBanner()) {
      this.showEmergencyBanner();
    }
  }

  handleEmergencyCall(e) {
    e.preventDefault();
    
    this.emergencyCallCount++;
    
    // Track emergency call attempt
    this.trackEvent('emergency_call_attempted', {
      call_count: this.emergencyCallCount,
      timestamp: new Date().toISOString()
    });
    
    // Show confirmation dialog for analytics
    const confirmed = confirm('You are about to call our emergency tyre service. Continue?');
    
    if (confirmed) {
      // Initiate call
      window.location.href = 'tel:+441234567890';
      
      this.trackEvent('emergency_call_initiated', {
        call_count: this.emergencyCallCount
      });
    }
  }

  shouldShowEmergencyBanner() {
    const currentHour = new Date().getHours();
    // Show emergency banner during nighttime hours or weekends
    const isNightTime = currentHour < 8 || currentHour > 18;
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    return isNightTime || isWeekend;
  }

  showEmergencyBanner() {
    const banner = document.querySelector('.emergency-banner');
    if (banner) {
      banner.classList.add('show');
    }
  }

  /**
   * Smooth Scrolling Navigation
   */
  initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without triggering scroll
        history.pushState(null, null, targetId);
        
        // Focus target for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
      });
    });
  }

  /**
   * Contact Methods Tracking
   */
  initContactMethods() {
    // Track phone number clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('contact_phone_clicked', {
          phone_number: link.href.replace('tel:', ''),
          context: this.getElementContext(link)
        });
      });
    });
    
    // Track email clicks
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('contact_email_clicked', {
          email: link.href.replace('mailto:', ''),
          context: this.getElementContext(link)
        });
      });
    });
    
    // Track WhatsApp clicks
    const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"]');
    whatsappLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('contact_whatsapp_clicked', {
          context: this.getElementContext(link)
        });
      });
    });
  }

  getElementContext(element) {
    const section = element.closest('section');
    return section?.id || section?.className || 'unknown';
  }

  /**
   * 3D Model Container Preparation
   */
  init3DModelContainer() {
    const modelContainer = document.querySelector('.model-3d-container');
    if (!modelContainer) return;
    
    // Add loading state
    modelContainer.classList.add('loading');
    modelContainer.innerHTML = `
      <div class="model-loader">
        <div class="loader-spinner"></div>
        <div class="loader-text">Loading 3D Model...</div>
      </div>
    `;
    
    // Prepare for 3D model integration
    modelContainer.setAttribute('data-model-ready', 'false');
    
    // Add resize observer for responsive 3D model
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // Trigger 3D model resize event
          window.dispatchEvent(new CustomEvent('modelContainerResize', {
            detail: {
              width: entry.contentRect.width,
              height: entry.contentRect.height
            }
          }));
        }
      });
      
      resizeObserver.observe(modelContainer);
    }
  }

  /**
   * Location Services Integration
   */
  initLocationServices() {
    const locationButtons = document.querySelectorAll('.get-location-btn');
    
    locationButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.getCurrentLocation();
      });
    });
    
    // Auto-get location for emergency mode
    if (this.isEmergencyMode) {
      this.getCurrentLocation();
    }
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showLocationError('Geolocation is not supported by this browser');
      return;
    }
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
      
      this.currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };
      
      // Reverse geocode to get address
      await this.reverseGeocode(this.currentLocation);
      
      this.trackEvent('location_obtained', {
        accuracy: position.coords.accuracy,
        method: 'gps'
      });
      
    } catch (error) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Unable to get your location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      this.showLocationError(errorMessage);
      
      this.trackEvent('location_error', {
        error_code: error.code,
        error_message: error.message
      });
    }
  }

  async reverseGeocode(location) {
    try {
      // Using a public geocoding service - replace with your preferred service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Fill location fields if available
        const postcodeField = document.querySelector('input[name="postcode"]');
        const addressField = document.querySelector('input[name="address"]');
        
        if (postcodeField && data.postcode) {
          postcodeField.value = data.postcode;
        }
        
        if (addressField && data.locality) {
          addressField.value = `${data.locality}, ${data.city || data.principalSubdivision}`;
        }
        
        this.currentLocation.address = {
          postcode: data.postcode,
          locality: data.locality,
          city: data.city,
          country: data.countryName
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  }

  showLocationError(message) {
    // Show user-friendly location error
    const errorElement = document.createElement('div');
    errorElement.className = 'location-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    const locationButtons = document.querySelectorAll('.get-location-btn');
    locationButtons.forEach(button => {
      button.parentElement.appendChild(errorElement);
    });
    
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  /**
   * Phone Number Formatting
   */
  initPhoneFormatting() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.formatPhoneNumber(e.target);
      });
      
      input.addEventListener('keydown', (e) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
          return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
        }
      });
    });
  }

  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    // UK phone number formatting
    if (value.startsWith('44')) {
      // International format
      value = value.substring(0, 13);
      if (value.length > 2) {
        value = '+44 ' + value.substring(2);
      }
      if (value.length > 7) {
        value = value.substring(0, 7) + ' ' + value.substring(7);
      }
      if (value.length > 12) {
        value = value.substring(0, 12) + ' ' + value.substring(12);
      }
    } else if (value.startsWith('0')) {
      // National format
      value = value.substring(0, 11);
      if (value.length > 5) {
        value = value.substring(0, 5) + ' ' + value.substring(5);
      }
      if (value.length > 9) {
        value = value.substring(0, 9) + ' ' + value.substring(9);
      }
    }
    
    input.value = value;
  }

  /**
   * Accessibility Features
   */
  initAccessibility() {
    // Skip to content link
    this.createSkipLink();
    
    // Focus management for modals and forms
    this.initFocusManagement();
    
    // Keyboard navigation for custom components
    this.initKeyboardNavigation();
    
    // Screen reader announcements
    this.initScreenReaderSupport();
  }

  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('accesskey', 's');
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  initFocusManagement() {
    // Trap focus in modal dialogs
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
          this.trapFocus(e, modal);
        }
      }
    });
  }

  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  initKeyboardNavigation() {
    // Arrow key navigation for toggle buttons
    const toggleGroups = document.querySelectorAll('.toggle-group');
    
    toggleGroups.forEach(group => {
      const buttons = group.querySelectorAll('button');
      
      buttons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
          let targetIndex = index;
          
          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              targetIndex = index > 0 ? index - 1 : buttons.length - 1;
              break;
            case 'ArrowRight':
            case 'ArrowDown':
              targetIndex = index < buttons.length - 1 ? index + 1 : 0;
              break;
            default:
              return;
          }
          
          e.preventDefault();
          buttons[targetIndex].focus();
        });
      });
    });
  }

  initScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    
    document.body.appendChild(liveRegion);
  }

  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  /**
   * Analytics and Event Tracking
   */
  initAnalytics() {
    // Track page view
    this.trackEvent('page_view', {
      page: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    // Track scroll depth
    this.initScrollTracking();
    
    // Track time on page
    this.startTimeTracking();
  }

  trackEvent(eventName, data = {}) {
    // Console logging for development
    console.log('Analytics Event:', eventName, data);
    
    // Google Analytics 4 (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }
    
    // Custom analytics endpoint
    if (this.analyticsEndpoint) {
      fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          data: data,
          timestamp: new Date().toISOString(),
          session_id: this.getSessionId()
        })
      }).catch(error => {
        console.error('Analytics tracking failed:', error);
      });
    }
  }

  initScrollTracking() {
    let maxScroll = 0;
    const trackingPoints = [25, 50, 75, 90];
    const trackedPoints = new Set();
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      trackingPoints.forEach(point => {
        if (scrollPercent >= point && !trackedPoints.has(point)) {
          trackedPoints.add(point);
          this.trackEvent('scroll_depth', {
            depth_percent: point
          });
        }
      });
    });
    
    // Track max scroll on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('max_scroll_depth', {
        depth_percent: maxScroll
      });
    });
  }

  startTimeTracking() {
    this.pageStartTime = Date.now();
    
    // Track time on page when leaving
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
      this.trackEvent('time_on_page', {
        duration_seconds: timeOnPage
      });
    });
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('tyrrhero_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('tyrrhero_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Utility Methods
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize TyreHero when DOM is ready
const tyreHero = new TyreHero();

// Expose to global scope for external integrations
window.TyreHero = tyreHero;

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TyreHero;
}