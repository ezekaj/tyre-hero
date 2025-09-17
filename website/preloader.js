/**
 * TyreHero - Preloader Script
 * Handles the preloader animation and fade out for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize preloader
    initPreloader();
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