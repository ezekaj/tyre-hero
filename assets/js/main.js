import { initPreloader } from './core/preloader.js';
import { initMobileMenu } from './core/navigation.js';
import { initStickyHeader } from './core/sticky-header.js';
import { initScrollAnimations } from './core/scroll-animations.js';
import { initTestimonialSlider } from './core/testimonials.js';
import { initLocationDetection } from './core/location-detection.js';
import { initEmergencyCallTracking } from './core/emergency-call-tracking.js';
import { detectColorScheme } from './core/color-scheme.js';
import { initTyreHeroEnhanced, registerTyreHeroGlobals } from './features/tyrehero-enhanced.js';
import { initTyreHeroARScanner, registerARScannerGlobals } from './features/ar-scanner.js';
import { initTyreHeroLiveStats, registerLiveStatsGlobals } from './features/live-stats.js';
import { initTyreHeroBackground } from './features/premium-hero-background.js';
import { calculateEstimatedArrival } from './utils/emergency.js';

function shouldEnableTyreHeroEnhanced() {
    return document.body.classList.contains('enhanced-homepage') ||
        document.querySelector('[data-tyrehero-enhanced]');
}

function shouldEnableARScanner() {
    return document.querySelector('.btn-ar, [data-action="start-ar"], [data-ar-scanner]');
}

function shouldEnableLiveStats() {
    return document.querySelector('[data-live-stats], #avg-response, .stat-item');
}

function shouldEnableBackground() {
    return Boolean(document.getElementById('hero-background'));
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculateEstimatedArrival = calculateEstimatedArrival;
    initPreloader();
    initMobileMenu();
    initStickyHeader();
    initScrollAnimations();
    initTestimonialSlider();
    initLocationDetection();
    initEmergencyCallTracking();
    detectColorScheme();

    if (shouldEnableTyreHeroEnhanced()) {
        const enhanced = initTyreHeroEnhanced();
        if (enhanced) {
            registerTyreHeroGlobals();
        }
    }

    if (shouldEnableARScanner()) {
        const scanner = initTyreHeroARScanner();
        if (scanner) {
            registerARScannerGlobals();
        }
    }

    if (shouldEnableLiveStats()) {
        const stats = initTyreHeroLiveStats();
        if (stats) {
            registerLiveStatsGlobals();
        }
    }

    if (shouldEnableBackground()) {
        initTyreHeroBackground({
            containerId: 'hero-background',
            emergencyMode: true
        });
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('emergency-service-worker.js')
            .catch((error) => console.warn('Service worker registration failed', error));
    });
}

