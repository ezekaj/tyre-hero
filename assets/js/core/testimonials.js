/**
 * Lightweight testimonial slider with dot navigation
 */
export function initTestimonialSlider() {
    const container = document.querySelector('.testimonials-container');
    const testimonials = container ? container.querySelectorAll('.testimonial-card') : [];

    if (!container || testimonials.length <= 1) {
        return;
    }

    const dots = buildNavigation(container, testimonials.length);
    let currentIndex = 0;

    const showTestimonial = (index) => {
        testimonials.forEach((testimonial, idx) => {
            const isActive = idx === index;
            testimonial.classList.toggle('active', isActive);
            testimonial.style.display = isActive ? 'block' : 'none';
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });

        currentIndex = index;
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showTestimonial(index));
    });

    appendSliderStyles();
    showTestimonial(0);

    setInterval(() => {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(nextIndex);
    }, 5000);
}

function buildNavigation(container, count) {
    const nav = document.createElement('div');
    nav.className = 'slider-nav';

    const dots = Array.from({ length: count }, (_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', 'Show testimonial ' + (index + 1));
        nav.appendChild(dot);
        return dot;
    });

    container.appendChild(nav);
    return dots;
}

function appendSliderStyles() {
    if (document.getElementById('tyrehero-testimonial-styles')) {
        return;
    }

    const rules = [
        '.testimonials-container {',
        '    position: relative;',
        '    padding-bottom: 50px;',
        '}',
        '',
        '.testimonial-card {',
        '    display: none;',
        '    animation: fadeIn 0.5s ease forwards;',
        '}',
        '',
        '.testimonial-card.active {',
        '    display: block;',
        '}',
        '',
        '.slider-nav {',
        '    display: flex;',
        '    justify-content: center;',
        '    gap: 10px;',
        '    margin-top: 20px;',
        '    position: absolute;',
        '    bottom: 0;',
        '    left: 0;',
        '    right: 0;',
        '}',
        '',
        '.slider-dot {',
        '    width: 12px;',
        '    height: 12px;',
        '    border-radius: 50%;',
        '    background-color: #ccc;',
        '    border: none;',
        '    padding: 0;',
        '    cursor: pointer;',
        '    transition: all 0.3s ease;',
        '}',
        '',
        '.slider-dot.active {',
        '    background-color: var(--primary);',
        '    transform: scale(1.2);',
        '}',
        '',
        '@keyframes fadeIn {',
        '    from { opacity: 0; transform: translateX(20px); }',
        '    to { opacity: 1; transform: translateX(0); }',
        '}'
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'tyrehero-testimonial-styles';
    style.textContent = rules;
    document.head.appendChild(style);
}
