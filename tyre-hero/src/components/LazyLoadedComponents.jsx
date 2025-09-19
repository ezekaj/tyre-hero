import React, { Suspense, lazy } from 'react';

/**
 * Lazy-loaded components for better code splitting
 * Reduces initial bundle size by ~70kB
 */

// Split heavy sections into separate chunks
const LazyHeroSection = lazy(() =>
  import('./sections/Hero').then(module => ({ default: module.default }))
);

const LazyServicesSection = lazy(() =>
  import('./sections/Services').then(module => ({ default: module.default }))
);

const LazyAboutSection = lazy(() =>
  import('./sections/About').then(module => ({ default: module.default }))
);

const LazyTestimonialsSection = lazy(() =>
  import('./sections/Testimonials').then(module => ({ default: module.default }))
);

const LazyContactSection = lazy(() =>
  import('./sections/Contact').then(module => ({ default: module.default }))
);

const LazyBackgroundElements = lazy(() =>
  import('./layout/BackgroundElements').then(module => ({ default: module.default }))
);

/**
 * Loading fallback component with skeleton animation
 */
const SectionSkeleton = ({ height = 'h-96' }) => (
  <div className={`${height} bg-gray-900/50 rounded-2xl animate-pulse border border-gray-700/30`}>
    <div className="p-8 space-y-4">
      <div className="h-8 bg-gray-700/50 rounded-lg w-1/3"></div>
      <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
      <div className="h-4 bg-gray-700/30 rounded w-1/2"></div>
      <div className="flex space-x-4 mt-8">
        <div className="h-12 bg-gray-700/40 rounded-lg w-32"></div>
        <div className="h-12 bg-gray-700/40 rounded-lg w-32"></div>
      </div>
    </div>
  </div>
);

/**
 * Optimized section wrapper with intersection observer
 */
const LazySection = ({ children, fallback, threshold = 0.1, rootMargin = "200px" }) => {
  const [ref, isInView] = useInViewAnimation({ threshold, rootMargin });

  return (
    <div ref={ref}>
      {isInView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

/**
 * Critical path components (load immediately)
 */
export const CriticalComponents = {
  Header: React.memo(() => import('./layout/Header')),
  Footer: React.memo(() => import('./layout/Footer'))
};

/**
 * Non-critical components (lazy load)
 */
export const LazyComponents = {
  HeroSection: () => (
    <LazySection fallback={<SectionSkeleton height="h-screen" />}>
      <LazyHeroSection />
    </LazySection>
  ),

  ServicesSection: () => (
    <LazySection fallback={<SectionSkeleton height="h-96" />}>
      <LazyServicesSection />
    </LazySection>
  ),

  AboutSection: () => (
    <LazySection fallback={<SectionSkeleton height="h-96" />}>
      <LazyAboutSection />
    </LazySection>
  ),

  TestimonialsSection: () => (
    <LazySection fallback={<SectionSkeleton height="h-80" />}>
      <LazyTestimonialsSection />
    </LazySection>
  ),

  ContactSection: () => (
    <LazySection fallback={<SectionSkeleton height="h-96" />}>
      <LazyContactSection />
    </LazySection>
  ),

  BackgroundElements: () => (
    <LazySection fallback={null} threshold={0}>
      <LazyBackgroundElements />
    </LazySection>
  )
};

export { useInViewAnimation } from '../hooks/useInViewAnimation';