/**
 * Intersection observer powered scroll animations
 */
export function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .step, .testimonial-card, .emergency-feature');
    if (!animatedElements.length || !('IntersectionObserver' in window)) {
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach((element) => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });

    appendAnimationStyles();
}

function appendAnimationStyles() {
    if (document.getElementById('tyrehero-scroll-animations')) {
        return;
    }

    const rules = [
        '.animate-on-scroll {',
        '    opacity: 0;',
        '    transform: translateY(30px);',
        '    transition: opacity 0.6s ease, transform 0.6s ease;',
        '}',
        '',
        '.animate-on-scroll.animated {',
        '    opacity: 1;',
        '    transform: translateY(0);',
        '}',
        '',
        '.service-card.animate-on-scroll:nth-child(1) { transition-delay: 0.1s; }',
        '.service-card.animate-on-scroll:nth-child(2) { transition-delay: 0.2s; }',
        '.service-card.animate-on-scroll:nth-child(3) { transition-delay: 0.3s; }',
        '',
        '.emergency-feature.animate-on-scroll:nth-child(1) { transition-delay: 0.1s; }',
        '.emergency-feature.animate-on-scroll:nth-child(2) { transition-delay: 0.2s; }',
        '.emergency-feature.animate-on-scroll:nth-child(3) { transition-delay: 0.3s; }'
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'tyrehero-scroll-animations';
    style.textContent = rules;
    document.head.appendChild(style);
}
