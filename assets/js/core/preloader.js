/**
 * Fade out the preloader once content is ready
 */
export function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) {
        return;
    }

    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1000);
}
