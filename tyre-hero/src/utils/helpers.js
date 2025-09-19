/**
 * Utility functions for the Tyre Hero application
 */

/**
 * Formats phone number for tel: links
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneForTel = (phoneNumber) => {
  return phoneNumber.replace(/\s/g, '');
};

/**
 * Scrolls to a section smoothly
 * @param {string} sectionId - ID of the section to scroll to
 */
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates UK phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone number is valid
 */
export const isValidUKPhone = (phone) => {
  const ukPhoneRegex = /^(\+44|0)?[1-9]\d{8,9}$/;
  return ukPhoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generates random particle positions for animations
 * @param {number} count - Number of particles
 * @returns {Array} Array of position objects
 */
export const generateParticlePositions = (count) => {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  }));
};

/**
 * Checks if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};