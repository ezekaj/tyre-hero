/**
 * Align UI with the user's colour scheme preference
 */
export function detectColorScheme() {
    if (!window.matchMedia) {
        return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyPreference = (event) => {
        const prefersDark = event.matches;
        document.body.classList.toggle('dark-mode', prefersDark);
    };

    applyPreference(mediaQuery);
    mediaQuery.addEventListener('change', applyPreference);
}
