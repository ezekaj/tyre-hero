/**
 * TyreHero Image Optimization Script
 * Implements WebP support with fallbacks and lazy loading
 */

(function() {
    'use strict';
    
    // Configuration
    const IMAGE_CONFIG = {
        quality: {
            webp: 80,
            jpeg: 85,
            png: 90
        },
        sizes: {
            thumbnail: 150,
            small: 300,
            medium: 600,
            large: 1200,
            xlarge: 1800
        },
        lazyLoadOffset: 100, // pixels before viewport
        placeholderDataUri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
    };
    
    // WebP support detection
    const supportsWebP = checkWebPSupport();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageOptimization);
    } else {
        initImageOptimization();
    }
    
    function initImageOptimization() {
        setupLazyLoading();
        optimizeExistingImages();
        setupProgressiveImageLoading();
        console.log('TyreHero image optimization initialized. WebP support:', supportsWebP);
    }
    
    /**
     * Check if browser supports WebP
     */
    function checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        try {
            const dataUrl = canvas.toDataURL('image/webp');
            return dataUrl.indexOf('data:image/webp') === 0;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Set up lazy loading for images
     */
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadOptimizedImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${IMAGE_CONFIG.lazyLoadOffset}px`
            });
            
            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
            
            // Observe new images added dynamically
            const contentObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const images = node.tagName === 'IMG' ? [node] : 
                                          node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
                            images.forEach(img => imageObserver.observe(img));
                        }
                    });
                });
            });
            
            contentObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(loadOptimizedImage);
        }
    }
    
    /**
     * Load optimized image with WebP support
     */
    function loadOptimizedImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Set placeholder first
        if (!img.src || img.src === IMAGE_CONFIG.placeholderDataUri) {
            img.src = IMAGE_CONFIG.placeholderDataUri;
            img.classList.add('loading');
        }
        
        // Determine optimal format and size
        const optimizedSrc = getOptimizedImageUrl(src, img);
        
        // Preload the image
        const preloader = new Image();
        
        preloader.onload = function() {
            img.src = optimizedSrc;
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Trigger fade-in animation
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        };
        
        preloader.onerror = function() {
            // Fallback to original image
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('error');
        };
        
        preloader.src = optimizedSrc;
        
        // Remove data-src to prevent re-processing
        delete img.dataset.src;
    }
    
    /**
     * Get optimized image URL based on device and format support
     */
    function getOptimizedImageUrl(originalSrc, imgElement) {
        // Determine optimal size based on image dimensions and device
        const displayWidth = imgElement.offsetWidth || imgElement.width;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const targetWidth = displayWidth * devicePixelRatio;
        
        const optimalSize = getOptimalImageSize(targetWidth);
        
        // Generate optimized URL (this would typically point to your image optimization service)
        const basePath = originalSrc.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = supportsWebP ? 'webp' : getOriginalExtension(originalSrc);
        
        // Example URL structure - adapt to your image optimization service
        return `${basePath}-${optimalSize}.${extension}`;
    }
    
    /**
     * Get optimal image size based on display width
     */
    function getOptimalImageSize(width) {
        const sizes = IMAGE_CONFIG.sizes;
        
        if (width <= sizes.thumbnail) return 'thumbnail';
        if (width <= sizes.small) return 'small';
        if (width <= sizes.medium) return 'medium';
        if (width <= sizes.large) return 'large';
        return 'xlarge';
    }
    
    /**
     * Extract original file extension
     */
    function getOriginalExtension(src) {
        const match = src.match(/\.([^/.]+)$/);
        return match ? match[1] : 'jpg';
    }
    
    /**
     * Optimize existing images on the page
     */
    function optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src])');
        
        images.forEach(img => {
            // Skip if already optimized or is SVG
            if (img.classList.contains('optimized') || img.src.includes('.svg')) {
                return;
            }
            
            // Add loading placeholder
            addImagePlaceholder(img);
            
            // Mark as optimized
            img.classList.add('optimized');
        });
    }
    
    /**
     * Add loading placeholder for existing images
     */
    function addImagePlaceholder(img) {
        // Create a wrapper for the loading effect
        if (img.parentElement.classList.contains('image-wrapper')) {
            return; // Already wrapped
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            overflow: hidden;
            background: #f5f5f5;
        `;
        
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Add loading indicator
        const loader = document.createElement('div');
        loader.className = 'image-loader';
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top: 3px solid #e53935;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            z-index: 1;
        `;
        
        wrapper.appendChild(loader);
        
        // Remove loader when image loads
        img.addEventListener('load', function() {
            if (loader.parentNode) {
                loader.remove();
            }
        });
    }
    
    /**
     * Set up progressive image loading for critical images
     */
    function setupProgressiveImageLoading() {
        const criticalImages = document.querySelectorAll('.hero-image, .logo-image, .emergency-bg');
        
        criticalImages.forEach(img => {
            if (img.src && !img.complete) {
                loadProgressiveImage(img);
            }
        });
    }
    
    /**
     * Load image progressively (low quality first, then high quality)
     */
    function loadProgressiveImage(img) {
        const originalSrc = img.src;
        
        // Generate low-quality placeholder
        const lowQualitySrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '-lq.$1');
        
        // Load low quality first
        const lowQualityImg = new Image();
        lowQualityImg.onload = function() {
            img.src = lowQualitySrc;
            img.style.filter = 'blur(2px)';
            img.style.transition = 'filter 0.3s ease';
            
            // Then load high quality
            const highQualityImg = new Image();
            highQualityImg.onload = function() {
                img.src = originalSrc;
                img.style.filter = 'none';
            };
            highQualityImg.src = originalSrc;
        };
        lowQualityImg.src = lowQualitySrc;
    }
    
    /**
     * Generate picture element with multiple formats
     */
    function createResponsivePicture(imageSrc, alt, sizes = '100vw') {
        const picture = document.createElement('picture');
        
        // WebP source
        if (supportsWebP) {
            const webpSource = document.createElement('source');
            webpSource.srcset = generateSrcSet(imageSrc, 'webp');
            webpSource.sizes = sizes;
            webpSource.type = 'image/webp';
            picture.appendChild(webpSource);
        }
        
        // Fallback source
        const fallbackSource = document.createElement('source');
        fallbackSource.srcset = generateSrcSet(imageSrc, getOriginalExtension(imageSrc));
        fallbackSource.sizes = sizes;
        picture.appendChild(fallbackSource);
        
        // Fallback img
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = alt;
        img.loading = 'lazy';
        img.style.cssText = 'width: 100%; height: auto; opacity: 0; transition: opacity 0.3s ease;';
        
        picture.appendChild(img);
        
        return picture;
    }
    
    /**
     * Generate srcset for responsive images
     */
    function generateSrcSet(baseSrc, format) {
        const base = baseSrc.replace(/\.[^/.]+$/, '');
        const sizes = IMAGE_CONFIG.sizes;
        
        return [
            `${base}-${sizes.small}.${format} ${sizes.small}w`,
            `${base}-${sizes.medium}.${format} ${sizes.medium}w`,
            `${base}-${sizes.large}.${format} ${sizes.large}w`,
            `${base}-${sizes.xlarge}.${format} ${sizes.xlarge}w`
        ].join(', ');
    }
    
    /**
     * Convert existing img to picture element
     */
    function convertToPicture(img) {
        const picture = createResponsivePicture(img.src, img.alt, img.sizes || '100vw');
        const newImg = picture.querySelector('img');
        
        // Copy attributes
        Array.from(img.attributes).forEach(attr => {
            if (attr.name !== 'src' && attr.name !== 'srcset') {
                newImg.setAttribute(attr.name, attr.value);
            }
        });
        
        // Replace img with picture
        img.parentNode.replaceChild(picture, img);
        
        return newImg;
    }
    
    /**
     * Preload critical images
     */
    function preloadCriticalImages() {
        const criticalImages = [
            'images/tyrehero-logo.svg',
            'images/emergency-bg.webp',
            'images/emergency-bg.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            if (src.includes('.webp') && !supportsWebP) {
                return; // Skip WebP preload if not supported
            }
            document.head.appendChild(link);
        });
    }
    
    /**
     * Handle image errors gracefully
     */
    function setupImageErrorHandling() {
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                const img = e.target;
                
                // Try fallback formats
                if (img.src.includes('.webp') && !img.dataset.fallbackAttempted) {
                    img.dataset.fallbackAttempted = 'true';
                    img.src = img.src.replace('.webp', '.jpg');
                    return;
                }
                
                // Show placeholder
                img.src = IMAGE_CONFIG.placeholderDataUri;
                img.classList.add('error');
                
                console.warn('Image failed to load:', img.src);
            }
        }, true);
    }
    
    // Add CSS for image optimization
    function addImageOptimizationCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .image-wrapper {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            img.loading {
                opacity: 0.7;
            }
            
            img.loaded {
                opacity: 1;
                transition: opacity 0.3s ease;
            }
            
            img.error {
                opacity: 0.5;
                filter: grayscale(100%);
            }
            
            /* Responsive image behavior */
            img {
                max-width: 100%;
                height: auto;
            }
            
            /* Critical images should load immediately */
            .hero-image,
            .logo-image,
            .emergency-bg {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize error handling and CSS
    setupImageErrorHandling();
    addImageOptimizationCSS();
    
    // Preload critical images
    preloadCriticalImages();
    
    // Global utilities
    window.TyreHeroImageOptimization = {
        convertToPicture: convertToPicture,
        loadOptimizedImage: loadOptimizedImage,
        supportsWebP: supportsWebP,
        createResponsivePicture: createResponsivePicture
    };
    
})();