/**
 * Mobile navigation handling
 */
export function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!menuToggle || !navMenu) {
        return;
    }

    const toggleMenu = () => {
        menuToggle.classList.toggle('menu-open');
        document.body.classList.toggle('menu-open');

        const isExpanded = menuToggle.classList.contains('menu-open');
        menuToggle.setAttribute('aria-expanded', String(isExpanded));
    };

    const closeMenu = () => {
        if (!document.body.classList.contains('menu-open')) {
            return;
        }
        menuToggle.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.main-nav')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}
