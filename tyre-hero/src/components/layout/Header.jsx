import React, { memo } from 'react';
import { useAppContext } from '../../context/AppContext';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
];

const Logo = memo(() => (
  <div className="flex items-center space-x-2">
    <div className="text-red-500 font-bold text-2xl" aria-label="Tyre Hero Logo">T</div>
    <div className="text-white font-semibold">Tyre Hero</div>
  </div>
));

Logo.displayName = 'Logo';

const NavLink = memo(({ item, isActive, onClick }) => (
  <a
    href={`#${item.id}`}
    onClick={(e) => {
      e.preventDefault();
      onClick(item.id);
    }}
    className={`relative px-2 py-1 text-sm font-medium transition-colors duration-300 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded ${
      isActive ? 'text-red-400' : 'text-gray-300'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {item.label}
    {isActive && (
      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-full" />
    )}
  </a>
));

NavLink.displayName = 'NavLink';

const DesktopNavigation = memo(({ navItems, activeSection, onNavigate }) => (
  <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
    {navItems.map((item) => (
      <NavLink
        key={item.id}
        item={item}
        isActive={activeSection === item.id}
        onClick={onNavigate}
      />
    ))}
  </nav>
));

DesktopNavigation.displayName = 'DesktopNavigation';

const MobileMenuButton = memo(({ onClick, isOpen }) => (
  <div className="md:hidden">
    <button
      onClick={onClick}
      className="text-gray-300 hover:text-red-400 p-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  </div>
));

MobileMenuButton.displayName = 'MobileMenuButton';

const MobileNavigation = memo(({ navItems, activeSection, onNavigate, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div
      id="mobile-menu"
      className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-700/50 md:hidden"
    >
      <nav className="px-6 py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
            className={`block px-3 py-2 text-base font-medium transition-colors duration-300 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded ${
              activeSection === item.id ? 'text-red-400 bg-red-500/10' : 'text-gray-300'
            }`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
});

MobileNavigation.displayName = 'MobileNavigation';

const Header = memo(() => {
  const { activeSection, isMobileMenuOpen, navigateToSection, toggleMobileMenu } = useAppContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-gray-700/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <DesktopNavigation
          navItems={navItems}
          activeSection={activeSection}
          onNavigate={navigateToSection}
        />

        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
        />
      </div>

      <MobileNavigation
        navItems={navItems}
        activeSection={activeSection}
        onNavigate={navigateToSection}
        isOpen={isMobileMenuOpen}
      />
    </header>
  );
});

Header.displayName = 'Header';

export default Header;