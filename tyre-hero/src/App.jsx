import React, { useState, useEffect, useRef } from 'react';

// Import service images
import tyreReplacementImg from '/images/tyre-replacement.jpg';
import punctureRepairImg from '/images/puncture-repair.jpg';
import tyreFittingImg from '/images/tyre-fitting-machine.jpg';
import emergencyCalloutImg from '/images/emergency-callout.jpeg';

// Enhanced Conversion Tracking for Google Ads & Analytics
const trackConversion = (conversionType, details = {}) => {
  try {
    // Google Ads Conversion Tracking
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
        'transaction_id': `${conversionType}_${Date.now()}`,
        'value': details.value || 0,
        'currency': 'GBP',
        'event_category': 'Emergency Service',
        'event_label': conversionType,
        'custom_parameter_1': details.location || 'Slough,Maidenhead,Windsor',
        'custom_parameter_2': 'Emergency Mobile Tyre Service'
      });
    }

    // Google Analytics Enhanced Event Tracking
    if (window.gtag) {
      window.gtag('event', conversionType, {
        'event_category': 'Emergency Service Conversion',
        'event_label': details.label || conversionType,
        'value': details.value || 0,
        'currency': 'GBP',
        'service_type': details.serviceType || 'Emergency Tyre Service',
        'location': details.location || 'Slough,Maidenhead,Windsor',
        'response_time_guarantee': '60 minutes'
      });
    }

    // Facebook Pixel Conversion Tracking
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: details.serviceName || 'Emergency Tyre Service',
        content_category: 'Automotive Emergency Services',
        value: details.value || 0,
        currency: 'GBP'
      });
    }

    console.log(`Conversion tracked: ${conversionType}`, details);
  } catch (error) {
    console.error('Conversion tracking error:', error);
  }
};

// Phone Call Conversion Tracking
const trackPhoneCall = (source = 'unknown') => {
  trackConversion('phone_call', {
    label: `Phone Call - ${source}`,
    serviceType: 'Emergency Call',
    value: 150, // Average call value
    source: source
  });
};

// Emergency Button Click Tracking
const trackEmergencyClick = (buttonType, location) => {
  trackConversion('emergency_click', {
    label: `Emergency Button - ${buttonType}`,
    serviceType: buttonType,
    location: location,
    value: 200 // High intent value
  });
};

const App = () => {
  const [isVisible, setIsVisible] = useState({});
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [scrollY, setScrollY] = useState(0);
  const [, setCurrentTime] = useState(new Date());
  const [isNight, setIsNight] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const containerRef = useRef(null);
  const rafRef = useRef();

  // Enhanced scroll & mouse tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sections = ['home', 'services', 'about', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setIsNight(now.getHours() >= 18 || now.getHours() < 6);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timeInterval);
    };
  }, []);

  // Animation frame for performance-heavy effects
  useEffect(() => {
    const animate = () => {
      if (containerRef.current) {
        const intensity = Math.min(scrollY / 1000, 1);
        containerRef.current.style.setProperty('--scroll-intensity', intensity);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollY]);

  // Staggered entrance animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible({
        hero: true,
        services: true,
        about: true,
        testimonials: true,
        contact: true
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Emergency mode toggle (for dramatic effect)
  const toggleEmergencyMode = () => {
    setEmergencyMode(prev => !prev);
    if (!emergencyMode) {
      document.body.classList.add('emergency-mode');
      setTimeout(() => {
        document.body.classList.remove('emergency-mode');
      }, 5000);
    }
  };

  const services = [
    {
      title: "Emergency Tyre Replacement",
      description: "Immediate roadside tyre replacement service. We come to you anywhere, anytime with premium quality tyres in stock.",
      image: tyreReplacementImg,
      stats: "5000+ Served",
      color: "from-red-500 to-red-600",
      delay: 200,
      action: () => {
        trackPhoneCall('Service Card - Emergency Tyre Replacement');
        trackEmergencyClick('Emergency Tyre Replacement', 'Service Card');
        window.location.href = 'tel:08000000000';
      }
    },
    {
      title: "Professional Puncture Repair",
      description: "Expert puncture repair using industry-standard techniques. Get back on the road quickly and safely with our certified technicians.",
      image: punctureRepairImg,
      stats: "98% Success Rate",
      color: "from-blue-500 to-blue-600",
      delay: 400,
      action: () => {
        trackPhoneCall('Service Card - Professional Puncture Repair');
        trackEmergencyClick('Professional Puncture Repair', 'Service Card');
        window.location.href = 'tel:08000000000';
      }
    },
    {
      title: "Mobile Tyre Fitting",
      description: "Professional mobile tyre fitting service using state-of-the-art equipment. We bring the workshop to you.",
      image: tyreFittingImg,
      stats: "15+ Years Expertise",
      color: "from-purple-500 to-purple-600",
      delay: 600,
      action: () => {
        trackPhoneCall('Service Card - Mobile Tyre Fitting');
        trackEmergencyClick('Mobile Tyre Fitting', 'Service Card');
        window.location.href = 'tel:08000000000';
      }
    },
    {
      title: "24/7 Emergency Callout",
      description: "Round-the-clock emergency tyre service. No matter the time or location, we're here to help when you need us most.",
      image: emergencyCalloutImg,
      stats: "24/7 Available",
      color: "from-green-500 to-green-600",
      delay: 800,
      action: () => {
        trackPhoneCall('Service Card - 24/7 Emergency Callout');
        trackEmergencyClick('24/7 Emergency Callout', 'Service Card');
        window.location.href = 'tel:08000000000';
      }
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Slough",
      rating: 5,
      text: "Tyre Hero saved me when I had a flat at 2 AM! They arrived in 45 minutes and had me back on the road quickly and safely with our certified technicians.",
      avatar: "./images/customer-sarah.svg",
      delay: 300
    },
    {
      name: "Michael Chen",
      location: "Maidenhead",
      rating: 5,
      text: "Outstanding service! The technician was knowledgeable, efficient, and even gave me tips on tyre maintenance. Will definitely use them again.",
      avatar: "./images/customer-michael.svg",
      delay: 600
    },
    {
      name: "Emma Wilson",
      location: "Windsor",
      rating: 5,
      text: "I was skeptical about the 60-minute guarantee, but they exceeded my expectations. Arrived in 35 minutes and fixed my tyre perfectly. Highly recommend!",
      avatar: "./images/customer-emma.svg",
      delay: 900
    }
  ];

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'contact', label: 'Contact' }
  ];

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black overflow-x-hidden relative"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
        '--scroll-y': `${scrollY}px`
      }}
    >

      {/* Video Background System */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000000'/%3E%3C/svg%3E"
        >
          <source src="./videos/tire-showcase.mp4" type="video/mp4" />
          <source src="/videos/tire-showcase.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Dynamic ambient orb */}
        <div
          className="absolute w-[400px] h-[400px] bg-red-500 rounded-full opacity-10 blur-[120px] transition-all duration-1000 ease-out mix-blend-screen"
          style={{
            left: `calc(var(--mouse-x) - 200px)`,
            top: `calc(var(--mouse-y) - 200px)`,
            transform: 'translate3d(0, 0, 0)'
          }}
        ></div>
      </div>

      {/* Navigation Menu */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
        scrollY > 50
          ? 'bg-black/40 border-gray-700/50'
          : 'bg-transparent border-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => scrollToSection('home')}
            >
              <div className="flex items-center">
                <img
                  src="./images/tyrehero-logo-white.svg"
                  alt="Tyre Hero Logo"
                  className="h-12 w-auto mr-3"
                />
              </div>
            </div>

            {/* Mobile Phone Number centered between logo and hamburger menu */}
            <div className="md:hidden flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <a
                href="tel:08000000000"
                onClick={() => {
                  trackPhoneCall('Header Phone Number');
                  trackEmergencyClick('Phone Call', 'Header Phone Number');
                }}
                className="relative px-1.5 py-1 text-xs font-medium transition-all duration-300 rounded text-white bg-red-500/20 border border-red-500/50 shadow-lg hover:text-white hover:bg-red-500/30 group"
              >
                <span className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                  <span className="text-red-300 font-medium text-xs">0800 000 0000</span>
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                </span>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-500 rounded opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
              </a>
            </div>

            {/* Desktop Navigation with integrated phone number */}
            <div className="relative group">
              <nav className="hidden md:flex space-x-1 relative z-10">
                {/* Phone number as first nav item on desktop */}
                <a
                  href="tel:08000000000"
                  onClick={() => {
                    trackPhoneCall('Header Phone Number');
                    trackEmergencyClick('Phone Call', 'Header Phone Number');
                  }}
                  className="relative px-3 py-2 text-xs font-medium transition-all duration-300 rounded-lg text-white bg-red-500/20 border border-red-500/50 shadow-lg hover:text-white hover:bg-red-500/30 group mr-3"
                >
                  <span className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
                    <span className="text-red-300 font-medium text-xs">0800 000 0000</span>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
                  </span>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
                </a>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative px-5 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${
                      activeSection === item.id
                        ? 'text-white bg-red-500/20 border border-red-500/50 shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              {/* Animated background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-red-400 p-2 transition-colors duration-300"
              >
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700/50">
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-6 py-4 text-left text-sm font-medium transition-all duration-300 rounded-xl ${
                      activeSection === item.id
                        ? 'text-white bg-red-500/20 border border-red-500/50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section — Cinematic Experience */}
      <section id="home" className="relative z-10 pt-32 pb-24 px-6 text-center min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto relative">
          <div
            className={`transition-all duration-1500 ease-out transform ${
              isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            {/* Emergency badge - subtle */}
            <div className="mb-8 inline-block bg-gray-800/40 backdrop-blur-sm rounded-full px-6 py-2 border border-gray-600/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                <span className="text-gray-400 font-medium text-sm">60-MINUTE RESPONSE GUARANTEE</span>
                <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight">
              <span className="block">YOUR URGENT</span>
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 bg-clip-text text-transparent animate-pulse">
                TYRE RESCUE
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-gray-300 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Professional mobile tyre fitting and emergency roadside assistance with
              <span className="font-bold text-red-400 mx-2">guaranteed 60-minute response</span>.
              Serving Slough, Maidenhead & Windsor 24/7 — because tyre emergencies wait for no one.
            </p>


            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
              <button
                onClick={() => {
                  trackPhoneCall('Hero Section CTA');
                  trackEmergencyClick('Emergency Call', 'Hero CTA');
                  window.location.href = 'tel:08000000000';
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-3 px-6 sm:py-4 sm:px-8 md:py-6 md:px-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl md:text-2xl shadow-3xl hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-300 hover:rotate-2 animate-pulse border-2 sm:border-4 border-red-400/50 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  0800 000 0000
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 sm:border-4 border-gray-600 text-gray-300 font-black py-3 px-6 sm:py-4 sm:px-8 md:py-6 md:px-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl md:text-2xl hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-105 relative group backdrop-blur-sm"
              >
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  BOOK ONLINE NOW
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              </button>
            </div>

            {/* Trust indicators with icons */}
            <div className="flex flex-wrap justify-center gap-12 text-gray-400">
              {[
                { label: "Slough & Surroundings", delay: 0 },
                { label: "Maidenhead & Windsor", delay: 200 },
                { label: "Eton & Datchet", delay: 400 },
                { label: "Burnham & Taplow", delay: 600 }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center animate-fade-in"
                  style={{ animationDelay: `${item.delay}ms` }}
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  <span className="text-lg font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Services Section — Interactive Cards */}
      <section id="services" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-red-500/30 to-red-600/30 backdrop-blur-sm rounded-full px-8 py-3 border border-red-500/50 mb-8">
              <span className="text-red-300 font-bold text-lg">OUR RESCUE SERVICES</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 md:mb-8">
              Emergency Solutions
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light px-4">
              Professional mobile tyre fitting and roadside assistance designed for your safety and convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group cursor-pointer transform transition-all duration-1000 ease-out hover:z-20 ${
                  isVisible.services ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: `${service.delay}ms` }}
                onClick={service.action}
              >
                <div className="bg-gray-900/90 backdrop-blur-xl rounded-4xl p-4 sm:p-6 md:p-10 shadow-3xl hover:shadow-red-500/20 transform hover:-translate-y-6 transition-all duration-700 border border-gray-700/50 h-full flex flex-col hover:border-red-500/50 relative overflow-hidden hover:scale-105">
                  {/* Animated gradient border on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 rounded-4xl transition-opacity duration-700 blur-xl`}></div>


                  <div className="relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 mb-4 sm:mb-6 md:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden group-hover:scale-110 transition-transform duration-500 shadow-2xl border-2 border-red-500/30 group-hover:border-red-500/60">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-3 sm:mb-4 md:mb-6 group-hover:text-red-400 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg">
                      {service.description}
                    </p>

                    <div className="bg-black/40 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 inline-block mb-4 sm:mb-6 md:mb-8 border border-red-500/30">
                      <span className="text-red-400 font-black text-sm sm:text-base md:text-lg lg:text-xl">{service.stats}</span>
                    </div>

                    {/* Animated underline with glow */}
                    <div className={`w-full h-1.5 bg-gradient-to-r ${service.color} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform origin-left scale-x-0 group-hover:scale-x-100 shadow-lg shadow-red-500/30`}></div>
                  </div>

                  {/* Hover effect shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* About Section — Split Screen Experience */}
      <section id="about" className="relative z-10 py-24 px-6 bg-gradient-to-r from-gray-900/40 to-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-red-500/30 to-red-600/30 backdrop-blur-sm rounded-full px-8 py-3 border border-red-500/50 mb-8">
              <span className="text-red-300 font-bold text-lg">WHY CHOOSE US</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 md:mb-8">
              About Tyre Hero
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light px-4">
              Your trusted partner for professional tyre solutions in Slough, Maidenhead & Windsor
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-2xl rounded-2xl sm:rounded-3xl md:rounded-4xl p-4 sm:p-6 md:p-8 lg:p-12 border border-red-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-50"></div>

                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6 md:mb-8 flex items-center">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-red-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 md:mr-6">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                    Our Mission
                  </h3>
                  <p className="text-gray-300 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                    At Tyre Hero, we're dedicated to providing exceptional roadside assistance with a focus on safety, speed, and reliability. Our team of certified technicians is available 24/7 to get you back on the road quickly and safely.
                  </p>
                  <p className="text-gray-300 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                    With over 15 years of experience serving the local community, we've built our reputation on trust, quality service, and the use of premium tyres and equipment.
                  </p>

                  {/* Animated stats */}
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    {[
                      { number: "5000+", label: "Happy Customers", color: "red" },
                      { number: "24/7", label: "Emergency Service", color: "blue" },
                      { number: "60min", label: "Response Guarantee", color: "orange" },
                      { number: "15+", label: "Years Experience", color: "purple" }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-black/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 border border-gray-700/50 text-center hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-500 transform hover:scale-105"
                      >
                        <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-${stat.color}-400 mb-2 sm:mb-3`}>{stat.number}</div>
                        <div className="text-gray-300 font-medium text-xs sm:text-sm md:text-base">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-red-500/30 to-red-600/30 backdrop-blur-3xl rounded-2xl sm:rounded-3xl md:rounded-4xl p-4 sm:p-6 md:p-8 lg:p-12 h-full border border-red-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-30"></div>

                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mb-4 sm:mb-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6">Trusted by Local Drivers</h4>
                    <p className="text-gray-300 text-center text-sm sm:text-base md:text-lg lg:text-xl">
                      Over 5,000 satisfied customers across Slough, Maidenhead and Windsor have chosen us for their tyre needs.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { title: "Certified Technicians", desc: "All our technicians are fully certified and trained to the highest standards.", delay: 0 },
                      { title: "Premium Equipment", desc: "We use state-of-the-art equipment to ensure perfect tyre fitting every time.", delay: 300 },
                      { title: "Fully Insured", desc: "Complete peace of mind with our comprehensive insurance coverage.", delay: 600 }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 sm:p-4 md:p-6 bg-black/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-700/50 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-500 group transform hover:scale-105"
                        style={{ animationDelay: `${item.delay}ms` }}
                      >
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-400 rounded-full mr-3 sm:mr-4 md:mr-5 flex-shrink-0 mt-1 sm:mt-2"></div>
                        <div>
                          <h5 className="text-white font-black text-base sm:text-lg md:text-xl mb-2 sm:mb-3">{item.title}</h5>
                          <p className="text-gray-300 text-sm sm:text-base md:text-lg">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-black text-2xl animate-spin shadow-2xl" style={{ animationDuration: '20s' }}>
                    60
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section — Carousel Experience */}
      <section id="testimonials" className="relative z-10 py-24 px-6 bg-gradient-to-b from-black/40 to-gray-900/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-red-500/30 to-red-600/30 backdrop-blur-sm rounded-full px-8 py-3 border border-red-500/50 mb-8">
              <span className="text-red-300 font-bold text-lg">CUSTOMER REVIEWS</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 md:mb-8">
              What Our Heroes Say
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light px-4">
              Don't just take our word for it — hear from drivers we've rescued across Slough, Maidenhead & Windsor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-900/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl md:rounded-4xl p-4 sm:p-6 md:p-10 shadow-2xl border border-gray-700/50 hover:border-red-500/50 transform hover:-translate-y-4 transition-all duration-700 group hover:scale-105"
                style={{ transitionDelay: `${testimonial.delay}ms` }}
              >
                <div className="flex items-center mb-8">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 md:border-4 border-red-500/50 mr-3 sm:mr-4 md:mr-6 hover:scale-110 transition-transform duration-500"
                  />
                  <div>
                    <h4 className="text-white font-black text-lg sm:text-xl md:text-2xl">{testimonial.name}</h4>
                    <p className="text-red-400 text-sm sm:text-base md:text-lg">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                <div className="mt-8 w-16 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform origin-left scale-x-0 group-hover:scale-x-100"></div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button
              onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-3 sm:py-4 md:py-6 px-6 sm:px-8 md:px-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl md:text-2xl shadow-3xl hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-500 border-2 sm:border-3 md:border-4 border-red-400/50 group relative overflow-hidden"
            >
              <span className="relative z-10">Read More Hero Stories</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section — Split Form */}
      <section id="contact" className="relative z-10 py-24 px-6 bg-gradient-to-r from-gray-900/40 to-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-red-500/30 to-red-600/30 backdrop-blur-sm rounded-full px-8 py-3 border border-red-500/50 mb-8">
              <span className="text-red-300 font-bold text-lg">GET IN TOUCH</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 md:mb-8">
              Emergency Contact
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light px-4">
              Ready for immediate assistance? Our rescue team is standing by 24 hours a day, 7 days a week.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-red-500/30 to-red-600/30 backdrop-blur-3xl rounded-2xl sm:rounded-3xl md:rounded-4xl p-4 sm:p-6 md:p-8 lg:p-12 border border-red-500/50">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6 sm:mb-8 md:mb-10 text-center">Call for Immediate Rescue</h3>

                <div className="space-y-8">
                  {[
                    {
                      icon: "phone",
                      title: "EMERGENCY HOTLINE",
                      value: "0800 000 0000",
                      desc: "24/7 Response • 60-Minute Guarantee",
                      color: "red",
                      size: "4xl"
                    },
                    {
                      icon: "email",
                      title: "EMAIL SUPPORT",
                      value: "rescue@tyrehero.co.uk",
                      desc: "Response within 1 hour",
                      color: "blue",
                      size: "2xl"
                    },
                    {
                      icon: "location",
                      title: "SERVICE AREA",
                      value: "Slough, Maidenhead, Windsor",
                      desc: "And all surrounding areas",
                      color: "green",
                      size: "2xl"
                    }
                  ].map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-500 group transform hover:scale-105 hover:rotate-1 cursor-pointer"
                      onClick={() => {
                        if (contact.icon === 'phone') {
                          window.location.href = 'tel:08000000000';
                        } else if (contact.icon === 'email') {
                          window.location.href = 'mailto:rescue@tyrehero.co.uk';
                        } else {
                          // location - just scroll to top or show alert
                          window.scrollTo({top: 0, behavior: 'smooth'});
                        }
                      }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-3 sm:mr-4 md:mr-6 flex-shrink-0 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        {contact.icon === 'phone' ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        ) : contact.icon === 'email' ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-black text-base sm:text-lg md:text-xl mb-1 sm:mb-2">{contact.title}</h4>
                        <p className={`text-${contact.color}-400 font-black text-sm sm:text-base md:text-lg lg:text-${contact.size} mb-2 sm:mb-3`}>{contact.value}</p>
                        <p className="text-gray-300 text-sm sm:text-base">{contact.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 md:mt-10 p-4 sm:p-6 md:p-8 bg-red-500/20 rounded-2xl sm:rounded-3xl border border-red-500/50 backdrop-blur-xl">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/50 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-red-400 font-black text-lg sm:text-xl md:text-2xl">60-MINUTE GUARANTEE</h4>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl">
                    We promise to arrive at your location within 60 minutes or less, day or night. Your safety is our absolute priority.
                  </p>
                  <div className="mt-4 w-full h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Section — Heroic Call to Action */}
      <section className="relative z-10 py-24 px-6 text-center bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-3xl">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-3xl rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-4xl p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 border border-gray-700/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600 animate-pulse"></div>

            <div className="relative z-10">
              <div className="inline-block bg-red-500/40 rounded-full px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 mb-6 sm:mb-8 md:mb-10 border border-red-500/50 animate-pulse">
                <span className="text-red-300 font-black text-sm sm:text-base md:text-lg lg:text-2xl animate-pulse">FINAL EMERGENCY ALERT</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-8xl font-black text-white mb-6 sm:mb-8 md:mb-10 leading-tight">
                STRANDED?
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 bg-clip-text text-transparent">
                  WE'RE COMING.
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-8 sm:mb-10 md:mb-14 max-w-4xl mx-auto font-light px-4">
                Don't wait on the side of the road. Our expert rescue technicians are ready to help you 24 hours a day, 7 days a week with our ironclad 60-minute response guarantee.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-10 justify-center items-center mb-10 sm:mb-12 md:mb-14">
                <button
                  onClick={() => window.location.href = 'tel:08000000000'}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-4 sm:py-6 md:py-8 px-8 sm:px-12 md:px-16 rounded-2xl sm:rounded-3xl md:rounded-4xl text-lg sm:text-xl md:text-2xl lg:text-3xl shadow-4xl hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-500 hover:rotate-3 animate-pulse border-2 sm:border-3 md:border-4 border-red-400/50 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 mr-2 sm:mr-3 md:mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    0800 000 0000
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-4xl opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
                </button>
              </div>

              <div className="border-t border-gray-700/50 pt-6 sm:pt-8 md:pt-10">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 text-gray-400">
                  {[
                    { text: "60-Minute Response Guarantee" },
                    { text: "24/7 Availability • 365 Days" },
                    { text: "Fully Licensed & Insured" },
                    { text: "5-Star Rated Service" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 bg-gray-900 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center space-x-4 mb-8 md:mb-0">
              <img
                src="./images/tyrehero-logo-white.svg"
                alt="Tyre Hero Logo"
                className="h-16 w-auto"
              />
            </div>

            <div className="flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-500 font-black text-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-10 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-gray-400">
              <div className="text-center md:text-left">
                <h4 className="text-white font-black text-2xl mb-4">Emergency Contact</h4>
                <p className="text-lg sm:text-xl md:text-2xl font-black text-red-400 mb-2">0800 000 0000</p>
                <p className="text-base sm:text-lg md:text-xl">rescue@tyrehero.co.uk</p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-black text-2xl mb-4">Service Area</h4>
                <p className="text-lg sm:text-xl md:text-2xl font-black">Slough, Maidenhead, Windsor</p>
                <p className="text-base sm:text-lg md:text-xl">And all surrounding areas</p>
              </div>
              <div className="text-center md:text-right">
                <h4 className="text-white font-black text-2xl mb-4">Always Available</h4>
                <p className="text-lg sm:text-xl md:text-2xl font-black">24 hours a day</p>
                <p className="text-base sm:text-lg md:text-xl">7 days a week • 365 days a year</p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl mb-8">
            © 2025 Tyre Hero. Professional mobile tyre fitting and emergency roadside assistance service.
            Serving Slough, Maidenhead & Windsor. Developed by ELO Group.
          </p>

        </div>
      </footer>

      {/* Floating Emergency Button */}
      <button
        onClick={() => window.location.href = 'tel:08000000000'}
        className="fixed bottom-4 left-4 md:bottom-10 md:left-10 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-red-500/50 transform hover:scale-110 transition-all duration-300 z-50 border border-red-400/50 md:border-4 group"
        aria-label="Call emergency tyre service"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <div className="absolute left-full ml-2 md:ml-4 top-1/2 transform -translate-y-1/2 bg-white text-red-600 px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xs md:text-sm font-bold">
          Call Emergency!
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
      </button>


      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/448000000000?text=Hi! I need emergency tyre service. Can you help me?"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackConversion('whatsapp_contact', { source: 'floating_button', serviceType: 'Emergency Tyre Service' })}
        className="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-gradient-to-r from-green-500 to-green-600 text-white p-2 sm:p-3 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-110 transition-all duration-300 z-50 border border-green-400/50 md:border-4 group"
        aria-label="Contact via WhatsApp for emergency tyre service"
      >
        {/* WhatsApp Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6 md:h-10 md:w-10"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.51 3.488"/>
        </svg>


        {/* WhatsApp text on hover */}
        <div className="absolute right-full mr-2 md:mr-4 top-1/2 transform -translate-y-1/2 bg-white text-green-600 px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xs md:text-sm font-bold">
          WhatsApp Emergency!
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
      </a>
    </div>
  );
};

export default App;