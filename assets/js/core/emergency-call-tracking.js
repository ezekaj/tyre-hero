/**
 * Provide lightweight feedback and console tracking for telephone CTAs
 */
export function initEmergencyCallTracking() {
    const emergencyLinks = document.querySelectorAll('a[href^="tel:"]');
    if (!emergencyLinks.length) {
        return;
    }

    emergencyLinks.forEach((link) => {
        link.addEventListener('click', () => {
            console.log('Emergency call tracked:', link.href);
            link.classList.add('call-active');
            setTimeout(() => link.classList.remove('call-active'), 3000);
        });
    });

    appendEmergencyStyles();
}

function appendEmergencyStyles() {
    if (document.getElementById('tyrehero-call-feedback')) {
        return;
    }

    const rules = [
        '.call-active {',
        '    animation: tyrehero-call-pulse 1s infinite;',
        '}',
        '',
        '@keyframes tyrehero-call-pulse {',
        '    0% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.9); }',
        '    70% { box-shadow: 0 0 0 20px rgba(229, 57, 53, 0); }',
        '    100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); }',
        '}'
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'tyrehero-call-feedback';
    style.textContent = rules;
    document.head.appendChild(style);
}
