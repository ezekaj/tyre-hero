/**
 * Enhance emergency CTAs with optional geolocation capture
 */
export function initLocationDetection() {
    const emergencyButtons = document.querySelectorAll('.btn-primary[href="emergency.html"], a[href="emergency.html"].btn-primary');

    if (!emergencyButtons.length || !navigator.geolocation) {
        return;
    }

    appendLoadingStyles();

    emergencyButtons.forEach((button) => {
        button.addEventListener('click', (event) => handleEmergencyClick(event, button));
    });
}

function handleEmergencyClick(event, button) {
    if (!navigator.geolocation) {
        return;
    }

    event.preventDefault();

    const original = button.innerHTML;
    button.innerHTML = '<span class="tyrehero-loading-spinner" aria-hidden="true"></span> Detecting location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            window.location.href = 'emergency.html?lat=' + latitude + '&lng=' + longitude;
        },
        () => {
            button.innerHTML = original;
            window.location.href = 'emergency.html';
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

function appendLoadingStyles() {
    if (document.getElementById('tyrehero-location-spinner')) {
        return;
    }

    const rules = [
        '.tyrehero-loading-spinner {',
        '    display: inline-block;',
        '    width: 1rem;',
        '    height: 1rem;',
        '    margin-right: 0.5rem;',
        '    border: 2px solid rgba(255, 255, 255, 0.4);',
        '    border-top-color: rgba(255, 255, 255, 0.9);',
        '    border-radius: 50%;',
        '    animation: tyrehero-spin 0.8s linear infinite;',
        '    vertical-align: text-bottom;',
        '}',
        '',
        '@keyframes tyrehero-spin {',
        '    0% { transform: rotate(0deg); }',
        '    100% { transform: rotate(360deg); }',
        '}'
    ].join('\n');

    const style = document.createElement('style');
    style.id = 'tyrehero-location-spinner';
    style.textContent = rules;
    document.head.appendChild(style);
}
