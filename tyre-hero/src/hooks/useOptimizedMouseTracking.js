import { useRef, useCallback, useEffect } from 'react';

/**
 * High-performance mouse tracking with throttling and RAF optimization
 * Reduces mousemove events from 60fps to ~15fps for better performance
 */
export const useOptimizedMouseTracking = (throttleMs = 66) => { // ~15fps
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);
  const animationFrameRef = useRef(null);
  const callbackRef = useRef(null);

  const updateMousePosition = useCallback((x, y) => {
    mousePositionRef.current = { x, y };

    // Update CSS custom properties directly (no re-renders)
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);

    // Trigger callback if provided
    if (callbackRef.current) {
      callbackRef.current(x, y);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    const now = performance.now();

    // Throttle updates
    if (now - lastUpdateRef.current < throttleMs) {
      return;
    }

    lastUpdateRef.current = now;

    // Use RAF for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      updateMousePosition(e.clientX, e.clientY);
    });
  }, [throttleMs, updateMousePosition]);

  useEffect(() => {
    // Initialize position
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    updateMousePosition(centerX, centerY);

    // Add passive listener for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleMouseMove, updateMousePosition]);

  // Return getter function to access current position without re-renders
  const getMousePosition = useCallback(() => mousePositionRef.current, []);

  // Allow subscribing to mouse updates
  const subscribe = useCallback((callback) => {
    callbackRef.current = callback;
    return () => {
      callbackRef.current = null;
    };
  }, []);

  return { getMousePosition, subscribe };
};

/**
 * CSS-only mouse following effect (no JavaScript needed)
 */
export const MouseFollowCSS = `
  .mouse-follow {
    transform: translate(
      calc(var(--mouse-x) - 50%),
      calc(var(--mouse-y) - 50%)
    );
    transition: transform 0.1s ease-out;
  }

  .mouse-follow-slow {
    transform: translate(
      calc(var(--mouse-x) * 0.1),
      calc(var(--mouse-y) * 0.1)
    );
    transition: transform 0.3s ease-out;
  }
`;