import { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * Custom hook for managing section visibility animations
 * @param {number} delay - Animation delay in milliseconds
 * @returns {Object} Animation utilities
 */
export const useAnimations = (delay = 500) => {
  const { setIsVisible } = useAppContext();

  const triggerAnimation = useCallback((sections) => {
    const timer = setTimeout(() => {
      setIsVisible(prev => ({
        ...prev,
        ...sections
      }));
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, setIsVisible]);

  return {
    triggerAnimation
  };
};

/**
 * Hook for intersection observer based animations
 * @param {string} sectionId - Section identifier
 * @param {Object} options - Intersection observer options
 */
export const useIntersectionAnimation = (sectionId, options = {}) => {
  const { setIsVisible } = useAppContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [sectionId]: true
          }));
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [sectionId, setIsVisible, options]);
};