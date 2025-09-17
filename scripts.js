/**
 * TyreHero - Main JavaScript
 * Modern interactions and animations for enhanced user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initPreloader();
    initMobileMenu();
    initStickyHeader();
    initScrollAnimations();
    initTestimonialSlider();
    initLocationDetection();
    initEmergencyCallTracking();
});

/**
 * Preloader animation and fade out
 */
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        // Add slight delay to ensure smooth transition
        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            // Remove preloader from DOM after animation completes
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

/**
 * Mobile menu toggle functionality
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('menu-open');
            document.body.classList.toggle('menu-open');
            
            // Accessibility
            const isExpanded = this.classList.contains('menu-open');
            this.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && document.body.classList.contains('menu-open')) {
                menuToggle.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', false);
            }
        });
        
        // Close menu when pressing Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
                menuToggle.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', false);
            }
        });
    }
}

/**
 * Sticky header on scroll
 */
function initStickyHeader() {
    const header = document.querySelector('.site-header');
    let lastScrollTop = 0;
    
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class when page is scrolled
            if (scrollTop > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            
            // Hide/show header on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

/**
 * Scroll animations for elements
 */
function initScrollAnimations() {
    // Get all elements that should be animated on scroll
    const animatedElements = document.querySelectorAll('.service-card, .step, .testimonial-card, .emergency-feature');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe each element
    animatedElements.forEach(element => {
        observer.observe(element);
        // Add base class for animations
        element.classList.add('animate-on-scroll');
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .service-card.animate-on-scroll:nth-child(1) { transition-delay: 0.1s; }
        .service-card.animate-on-scroll:nth-child(2) { transition-delay: 0.2s; }
        .service-card.animate-on-scroll:nth-child(3) { transition-delay: 0.3s; }
        
        .emergency-feature.animate-on-scroll:nth-child(1) { transition-delay: 0.1s; }
        .emergency-feature.animate-on-scroll:nth-child(2) { transition-delay: 0.2s; }
        .emergency-feature.animate-on-scroll:nth-child(3) { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
}

/**
 * Simple testimonial slider
 */
function initTestimonialSlider() {
    const testimonialContainer = document.querySelector('.testimonials-container');
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    if (testimonialContainer && testimonials.length > 1) {
        // Create slider navigation
        const sliderNav = document.createElement('div');
        sliderNav.className = 'slider-nav';
        
        // Create dots for each testimonial
        testimonials.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('aria-label', `Testimonial ${index + 1}`);
            
            if (index === 0) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
            
            sliderNav.appendChild(dot);
        });
        
        testimonialContainer.appendChild(sliderNav);
        
        // Add CSS for slider
        const style = document.createElement('style');
        style.textContent = `
            .testimonials-container {
                position: relative;
                padding-bottom: 50px;
            }
            
            .testimonial-card {
                display: none;
                animation: fadeIn 0.5s ease forwards;
            }
            
            .testimonial-card.active {
                display: block;
            }
            
            .slider-nav {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
            }
            
            .slider-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #ccc;
                border: none;
                padding: 0;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .slider-dot.active {
                background-color: var(--primary);
                transform: scale(1.2);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        
        // Show first testimonial
        showTestimonial(0);
        
        // Auto rotate testimonials
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
        
        function showTestimonial(index) {
            // Hide all testimonials
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active');
            });
            
            // Show selected testimonial
            testimonials[index].classList.add('active');
            
            // Update dots
            const dots = document.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }
}

/**
 * GDPR-compliant location detection for emergency services
 */
function initLocationDetection() {
    const emergencyButtons = document.querySelectorAll('.btn-primary[href="emergency.html"]');
    
    if (emergencyButtons.length > 0) {
        emergencyButtons.forEach(button => {
            button.addEventListener('click', async function(event) {
                // Only intercept if geolocation is available and security utils loaded
                if (navigator.geolocation && window.tyreHeroSecurity) {
                    event.preventDefault();
                    
                    try {
                        // Show loading state
                        const originalText = this.innerHTML;
                        this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="animation: spin 1s linear infinite;"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill="currentColor"/></svg> Requesting location...';
                        
                        // Use secure geolocation with GDPR compliance
                        const location = await window.tyreHeroSecurity.getSecureLocation();
                        
                        // Success - redirect with coordinates
                        window.location.href = `emergency.html?lat=${location.latitude}&lng=${location.longitude}`;
                        
                    } catch (error) {
                        // Error or user denied - redirect without coordinates
                        this.innerHTML = originalText;
                        window.location.href = 'emergency.html';
                    }
                } else {
                    // Fallback for when security utils not loaded or geolocation unavailable
                    // Proceed to emergency page without location
                }
            });
        });
    }
}

/**
 * Track emergency call button clicks
 */
function initEmergencyCallTracking() {
    const emergencyCallButtons = document.querySelectorAll('a[href^="tel:"]');
    
    if (emergencyCallButtons.length > 0) {
        emergencyCallButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Track emergency call (analytics would be implemented here in production)
                // Emergency call initiated
                
                // Add visual feedback
                this.classList.add('call-active');
                setTimeout(() => {
                    this.classList.remove('call-active');
                }, 3000);
            });
        });
        
        // Add CSS for call button feedback
        const style = document.createElement('style');
        style.textContent = `
            .call-active {
                animation: pulse-strong 1s infinite;
            }
            
            @keyframes pulse-strong {
                0% {
                    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.9);
                }
                70% {
                    box-shadow: 0 0 0 20px rgba(229, 57, 53, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Calculate and display estimated arrival time based on user location
 * This is a placeholder function that would be implemented with actual
 * location data and service coverage in production
 */
function calculateEstimatedArrival() {
    // This would use the user's location and the nearest technician's location
    // For demo purposes, we'll just show a random time between 30-90 minutes
    const minTime = 30;
    const maxTime = 90;
    const estimatedMinutes = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    // Format arrival time
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + estimatedMinutes * 60000);
    const formattedTime = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
        minutes: estimatedMinutes,
        time: formattedTime
    };
}

/**
 * Detect dark mode preference and apply appropriate styles
 */
function detectColorScheme() {
    // Check if user has a preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
    
    // Listen for changes in preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}