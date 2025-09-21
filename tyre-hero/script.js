// Global State Management
let isMenuOpen = false;
let activeSection = 'home';
let scrollY = 0;
let mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Conversion Tracking System
const trackingRateLimit = new Map();

// Data sanitization function
const sanitizeTrackingData = (data) => {
  if (typeof data !== 'object' || data === null) return {};

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/[<>"'&]/g, '').substring(0, 100);
    } else if (typeof value === 'number' && value >= 0 && value <= 999999) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Rate limiting check
const isRateLimited = (conversionType) => {
  const now = Date.now();
  const key = conversionType;
  const calls = trackingRateLimit.get(key) || [];

  const recentCalls = calls.filter(time => now - time < 60000);

  if (recentCalls.length >= 10) {
    return true;
  }

  recentCalls.push(now);
  trackingRateLimit.set(key, recentCalls);
  return false;
};

// Conversion tracking function
const trackConversion = (conversionType, details = {}) => {
  try {
    if (!conversionType || typeof conversionType !== 'string') {
      console.warn('Invalid conversion type provided');
      return;
    }

    if (isRateLimited(conversionType)) {
      console.warn(`Rate limit exceeded for conversion type: ${conversionType}`);
      return;
    }

    const sanitizedDetails = sanitizeTrackingData(details);

    // Google Ads Conversion Tracking
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
        'transaction_id': `${conversionType}_${Date.now()}`,
        'value': sanitizedDetails.value || 0,
        'currency': 'GBP',
        'event_category': 'Emergency Service',
        'event_label': conversionType,
        'custom_parameter_1': sanitizedDetails.location || 'Slough,Maidenhead,Windsor',
        'custom_parameter_2': 'Emergency Mobile Tyre Service'
      });
    }

    // Google Analytics Enhanced Event Tracking
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', conversionType, {
        'event_category': 'Emergency Service Conversion',
        'event_label': sanitizedDetails.label || conversionType,
        'value': sanitizedDetails.value || 0,
        'currency': 'GBP',
        'service_type': sanitizedDetails.serviceType || 'Emergency Tyre Service',
        'location': sanitizedDetails.location || 'Slough,Maidenhead,Windsor',
        'response_time_guarantee': '60 minutes'
      });
    }

    // Facebook Pixel Conversion Tracking
    if (window.fbq && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: sanitizedDetails.serviceName || 'Emergency Tyre Service',
        content_category: 'Automotive Emergency Services',
        value: sanitizedDetails.value || 0,
        currency: 'GBP'
      });
    }

    console.log(`Conversion tracked: ${conversionType}`, sanitizedDetails);
  } catch (error) {
    console.error('Conversion tracking error:', error);
  }
};

// Phone Call Conversion Tracking
const trackPhoneCall = (source = 'unknown') => {
  trackConversion('phone_call', {
    label: `Phone Call - ${source}`,
    serviceType: 'Emergency Call',
    value: 150,
    source: source
  });
};

// Emergency Button Click Tracking
const trackEmergencyClick = (buttonType, location) => {
  trackConversion('emergency_click', {
    label: `Emergency Button - ${buttonType}`,
    serviceType: buttonType,
    location: location,
    value: 200
  });
};

// Call emergency function
const callEmergency = (source) => {
  trackPhoneCall(source);
  trackEmergencyClick('Emergency Call', source);
  window.location.href = 'tel:08000000000';
};

// Call service number function
const callServiceNumber = (service) => {
  trackPhoneCall(`Service Card - ${service}`);
  trackEmergencyClick(service, 'Service Card');
  window.location.href = 'tel:08000000000';
};

// Mobile menu toggle
const toggleMobileMenu = () => {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const close = document.getElementById('close');

  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    mobileMenu.classList.remove('hidden');
    hamburger.classList.add('hidden');
    close.classList.remove('hidden');
  } else {
    mobileMenu.classList.add('hidden');
    hamburger.classList.remove('hidden');
    close.classList.add('hidden');
  }
};

// Smooth scroll to section
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }

  // Close mobile menu if open
  if (isMenuOpen) {
    toggleMobileMenu();
  }
};

// Update active nav item
const updateActiveNav = () => {
  const sections = ['home', 'services', 'about', 'testimonials', 'contact'];
  const scrollPosition = window.scrollY + 100;

  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const { offsetTop, offsetHeight } = element;
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        if (activeSection !== section) {
          activeSection = section;

          // Update desktop nav
          document.querySelectorAll('.nav-item').forEach(item => {
            const itemSection = item.getAttribute('data-section');
            if (itemSection === section) {
              item.className = 'nav-item relative px-5 py-3 text-sm font-medium transition-all duration-300 rounded-xl text-white bg-red-500/20 border border-red-500/50 shadow-lg';
            } else {
              item.className = 'nav-item relative px-5 py-3 text-sm font-medium transition-all duration-300 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50';
            }
          });

          // Update mobile nav
          document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const itemSection = item.getAttribute('data-section');
            if (itemSection === section) {
              item.className = 'mobile-nav-item px-6 py-4 text-left text-sm font-medium transition-all duration-300 rounded-xl text-white bg-red-500/20 border border-red-500/50';
            } else {
              item.className = 'mobile-nav-item px-6 py-4 text-left text-sm font-medium transition-all duration-300 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50';
            }
          });
        }
        break;
      }
    }
  }
};

// Update navbar background on scroll
const updateNavbar = () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.className = 'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 bg-black/40 border-gray-700/50';
  } else {
    navbar.className = 'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 bg-transparent border-transparent';
  }
};

// Update ambient orb position
const updateAmbientOrb = (e) => {
  const orb = document.getElementById('ambientOrb');
  if (orb) {
    orb.style.left = `calc(${e.clientX}px - 200px)`;
    orb.style.top = `calc(${e.clientY}px - 200px)`;
  }
};

// Scroll handler
const handleScroll = () => {
  scrollY = window.scrollY;
  updateActiveNav();
  updateNavbar();
};

// Mouse move handler
const handleMouseMove = (e) => {
  mousePosition = { x: e.clientX, y: e.clientY };
  updateAmbientOrb(e);
};

// Time update function
const updateTime = () => {
  const now = new Date();
  const isNight = now.getHours() >= 18 || now.getHours() < 6;
  // Could be used for theme adjustments if needed
};

// Initialize the page
const initializePage = () => {
  // Set up event listeners
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('mousemove', handleMouseMove);

  // Update time periodically
  updateTime();
  setInterval(updateTime, 60000);

  // Initial setup
  updateActiveNav();
  updateNavbar();

  // Animate in content
  setTimeout(() => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.classList.add('animate-fade-in');
    }

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
      }, index * 200);
    });
  }, 300);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

// Export functions for global access
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToSection = scrollToSection;
window.callEmergency = callEmergency;
window.callServiceNumber = callServiceNumber;
window.trackPhoneCall = trackPhoneCall;
window.trackConversion = trackConversion;