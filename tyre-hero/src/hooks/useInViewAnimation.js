import { useEffect, useRef, useState } from 'react';

/**
 * High-performance intersection observer for triggering animations
 * Only animates elements when they're visible, reducing CPU usage
 */
export const useInViewAnimation = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsInView(isVisible);

        // Trigger animation only once for better performance
        if (isVisible && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasTriggered, options]);

  return [elementRef, isInView, hasTriggered];
};

/**
 * Batch intersection observer for multiple elements
 * More efficient when observing many elements
 */
export const useBatchInViewAnimation = (elementIds = []) => {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const observerRef = useRef(null);

  useEffect(() => {
    if (elementIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleElements(prev => {
          const newSet = new Set(prev);
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              newSet.add(entry.target.id);
            }
          });
          return newSet;
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current = observer;

    // Observe all elements
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [elementIds]);

  return visibleElements;
};

/**
 * Performance-optimized animation classes
 */
export const AnimationClasses = {
  fadeInUp: 'transform transition-all duration-1000 ease-out',
  fadeInUpActive: 'translate-y-0 opacity-100',
  fadeInUpInactive: 'translate-y-8 opacity-0',

  scaleIn: 'transform transition-all duration-700 ease-out',
  scaleInActive: 'scale-100 opacity-100',
  scaleInInactive: 'scale-95 opacity-0',

  slideInLeft: 'transform transition-all duration-800 ease-out',
  slideInLeftActive: 'translate-x-0 opacity-100',
  slideInLeftInactive: '-translate-x-8 opacity-0'
};