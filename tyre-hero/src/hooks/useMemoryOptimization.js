import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory optimization hooks to prevent leaks and improve performance
 */

/**
 * Cleanup manager for preventing memory leaks
 */
export const useCleanupManager = () => {
  const cleanupFunctionsRef = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctionsRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

/**
 * Optimized RAF hook that prevents memory leaks
 */
export const useOptimizedAnimationFrame = (callback, dependencies = []) => {
  const rafRef = useRef(null);
  const callbackRef = useRef(callback);
  const isActiveRef = useRef(true);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // RAF loop
  useEffect(() => {
    const animate = (timestamp) => {
      if (!isActiveRef.current) return;

      try {
        callbackRef.current(timestamp);
      } catch (error) {
        console.warn('Animation frame callback failed:', error);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      isActiveRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, dependencies);

  const stopAnimation = useCallback(() => {
    isActiveRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      const animate = (timestamp) => {
        if (!isActiveRef.current) return;
        callbackRef.current(timestamp);
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  return { stopAnimation, startAnimation };
};

/**
 * Throttled event listener hook
 */
export const useThrottledEventListener = (
  element,
  eventName,
  handler,
  throttleMs = 16,
  options = { passive: true }
) => {
  const handlerRef = useRef(handler);
  const lastExecuted = useRef(0);
  const timeoutRef = useRef(null);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current || element || window;
    if (!targetElement?.addEventListener) return;

    const throttledHandler = (event) => {
      const now = Date.now();

      if (now - lastExecuted.current >= throttleMs) {
        lastExecuted.current = now;
        handlerRef.current(event);
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          handlerRef.current(event);
        }, throttleMs - (now - lastExecuted.current));
      }
    };

    targetElement.addEventListener(eventName, throttledHandler, options);

    return () => {
      targetElement.removeEventListener(eventName, throttledHandler, options);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [element, eventName, throttleMs, options]);
};

/**
 * Debounced callback hook
 */
export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return [debouncedCallback, cancel];
};

/**
 * Memory usage monitor (development only)
 */
export const useMemoryMonitor = (enabled = process.env.NODE_ENV === 'development') => {
  useEffect(() => {
    if (!enabled || !performance.memory) return;

    const logMemoryUsage = () => {
      const memory = performance.memory;
      console.group('Memory Usage');
      console.log('Used:', (memory.usedJSHeapSize / 1048576).toFixed(2), 'MB');
      console.log('Total:', (memory.totalJSHeapSize / 1048576).toFixed(2), 'MB');
      console.log('Limit:', (memory.jsHeapSizeLimit / 1048576).toFixed(2), 'MB');
      console.groupEnd();
    };

    const interval = setInterval(logMemoryUsage, 10000);
    logMemoryUsage(); // Initial log

    return () => clearInterval(interval);
  }, [enabled]);
};

/**
 * Component mount/unmount logger (development only)
 */
export const useComponentLogger = (componentName, enabled = process.env.NODE_ENV === 'development') => {
  useEffect(() => {
    if (!enabled) return;

    console.log(`🟢 ${componentName} mounted`);
    return () => {
      console.log(`🔴 ${componentName} unmounted`);
    };
  }, [componentName, enabled]);
};