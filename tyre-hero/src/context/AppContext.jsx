import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState({});
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize visibility animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible({
        hero: true,
        services: true,
        footer: true
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle navigation
  const navigateToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Handle scroll-based active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const value = {
    isVisible,
    activeSection,
    isMobileMenuOpen,
    navigateToSection,
    toggleMobileMenu,
    setIsVisible
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};