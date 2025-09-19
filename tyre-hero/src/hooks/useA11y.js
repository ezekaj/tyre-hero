import { useEffect, useState, useCallback } from 'react';

// Accessibility utilities for emergency service website
export const useA11y = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [focusedElement, setFocusedElement] = useState(null);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Create live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, priority === 'assertive' ? 3000 : 1000);
  }, []);

  // Focus management for emergency scenarios
  const manageFocus = useCallback((element, options = {}) => {
    if (!element) return;

    const {
      skipFocusCheck = false,
      announcement = null,
      restoreFocus = true
    } = options;

    // Store current focus for restoration
    if (restoreFocus && document.activeElement) {
      setFocusedElement(document.activeElement);
    }

    // Focus the element
    if (element.focus) {
      element.focus();

      // Ensure focus is visible for keyboard users
      element.style.outline = '3px solid #DC2626';
      element.style.outlineOffset = '2px';

      if (announcement) {
        announce(announcement, 'assertive');
      }
    }
  }, [announce]);

  // Restore focus to previous element
  const restoreFocus = useCallback(() => {
    if (focusedElement && focusedElement.focus) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  }, [focusedElement]);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event) => {
    // Emergency escape key handling
    if (event.key === 'Escape') {
      announce('Navigation cancelled. Use Tab to navigate or call emergency number directly.', 'assertive');
    }

    // Emergency hotkey for calling
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      announce('Emergency hotkey activated. Focusing on emergency call button.', 'assertive');

      const emergencyButton = document.querySelector('[data-emergency="true"]');
      if (emergencyButton) {
        manageFocus(emergencyButton, {
          announcement: 'Emergency call button focused. Press Enter or Space to call.'
        });
      }
    }

    // Help hotkey
    if (event.ctrlKey && event.key === 'h') {
      event.preventDefault();
      announce('Help: Use Tab to navigate, Ctrl+E for emergency, Ctrl+H for help, Enter or Space to activate buttons.', 'assertive');
    }
  }, [announce, manageFocus]);

  // Skip link functionality
  const createSkipLink = useCallback((targetId, linkText = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = linkText;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #DC2626;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      font-weight: bold;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        manageFocus(target, {
          announcement: `Skipped to ${linkText.toLowerCase()}`
        });
      }
    });

    return skipLink;
  }, [manageFocus]);

  // Color contrast checker
  const checkColorContrast = useCallback(() => {
    const contrastIssues = [];

    // Check critical elements for sufficient contrast
    const criticalElements = document.querySelectorAll(
      'button, a, input, .emergency-button, .contact-info'
    );

    criticalElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Basic contrast check (simplified)
      if (color === backgroundColor) {
        contrastIssues.push({
          element,
          issue: 'Text and background colors are identical'
        });
      }
    });

    return contrastIssues;
  }, []);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Emergency accessibility features setup
  useEffect(() => {
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Add skip links
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent && !document.querySelector('.skip-link')) {
      const skipLink = createSkipLink('main-content', 'Skip to emergency services');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Add emergency announcement region
    if (!document.getElementById('emergency-announcements')) {
      const announcementRegion = document.createElement('div');
      announcementRegion.id = 'emergency-announcements';
      announcementRegion.setAttribute('aria-live', 'assertive');
      announcementRegion.setAttribute('aria-atomic', 'true');
      announcementRegion.className = 'sr-only';
      document.body.appendChild(announcementRegion);
    }

    // Announce page ready for screen readers
    setTimeout(() => {
      announce('Emergency tyre service portal loaded. Press Ctrl+E for immediate emergency assistance or Tab to navigate.', 'polite');
    }, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, [handleKeyboardNavigation, createSkipLink, announce]);

  // High contrast mode detection
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Create a test element to detect high contrast mode
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: absolute;
        top: -999px;
        width: 1px;
        height: 1px;
        background: ButtonText;
        border: 1px solid ButtonText;
      `;
      document.body.appendChild(testElement);

      const styles = window.getComputedStyle(testElement);
      const isHighContrastMode = styles.backgroundColor !== styles.borderColor;

      document.body.removeChild(testElement);
      setIsHighContrast(isHighContrastMode);
    };

    checkHighContrast();
    window.addEventListener('focus', checkHighContrast);

    return () => window.removeEventListener('focus', checkHighContrast);
  }, []);

  return {
    announce,
    manageFocus,
    restoreFocus,
    announcements,
    prefersReducedMotion,
    isHighContrast,
    checkColorContrast,
    createSkipLink
  };
};

// Screen reader only styles utility
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0'
};

// Accessible emergency button component
export const AccessibleEmergencyButton = ({ children, onClick, phoneNumber, ...props }) => {
  const { announce, manageFocus } = useA11y();

  const handleClick = (e) => {
    announce(`Initiating emergency call to ${phoneNumber}`, 'assertive');
    if (onClick) onClick(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-emergency="true"
      role="button"
      aria-label={`Emergency call button. Call ${phoneNumber} for immediate assistance. 24/7 service with 60-minute response guarantee.`}
      aria-describedby="emergency-description"
    >
      {children}
      <span id="emergency-description" style={srOnlyStyles}>
        This button will initiate an emergency call to our 24/7 tyre rescue service.
        We guarantee response within 60 minutes for Slough, Maidenhead, and Windsor areas.
      </span>
    </button>
  );
};