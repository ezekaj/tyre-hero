import React, { useState, useRef, useEffect } from 'react';

/**
 * High-performance image component with lazy loading and WebP support
 * Implements intersection observer and responsive images
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'blur',
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState('');

  // Intersection Observer for lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, []);

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc;

    const breakpoints = [640, 768, 1024, 1280, 1536];
    return breakpoints
      .map(w => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  // WebP support detection
  const getOptimizedSrc = (baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc;

    // Check WebP support
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    if (supportsWebP && !baseSrc.includes('.webp')) {
      return `${baseSrc}?format=webp&q=${quality}`;
    }

    return `${baseSrc}?q=${quality}`;
  };

  // Load image when in view
  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(getOptimizedSrc(src));
    }
  }, [isInView, src, quality]);

  // Placeholder blur data URL
  const blurDataURL = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="50%" cy="50%" r="20" fill="#6b7280" opacity="0.5"/>
    </svg>
  `)}`;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image */}
      {isInView && currentSrc && (
        <img
          src={currentSrc}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Optimized avatar component for testimonials
 */
export const OptimizedAvatar = ({ src, alt, size = 80, className = '' }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={`rounded-full ${className}`}
    loading="lazy"
    quality={85}
  />
);

/**
 * Background image component with better performance
 */
export const OptimizedBackgroundImage = ({ src, children, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse" />
      )}
      {children}
    </div>
  );
};

export default OptimizedImage;