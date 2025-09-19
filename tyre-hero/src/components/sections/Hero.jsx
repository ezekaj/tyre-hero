import React, { memo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PHONE_NUMBER } from '../../types';

const CallButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:rotate-1 animate-pulse border-2 border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/50"
    aria-label={`Call now ${PHONE_NUMBER}`}
  >
    Call Now: {PHONE_NUMBER}
  </button>
));

CallButton.displayName = 'CallButton';

const BookServiceButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="border-2 border-gray-600 text-gray-300 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
    aria-label="Book service online"
  >
    Book Service
  </button>
));

BookServiceButton.displayName = 'BookServiceButton';

const Hero = memo(() => {
  const { isVisible } = useAppContext();

  const handleCallClick = useCallback(() => {
    window.location.href = `tel:${PHONE_NUMBER.replace(/\s/g, '')}`;
  }, []);

  const handleBookServiceClick = useCallback(() => {
    // Scroll to contact section or open booking modal
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      id="home"
      className="relative z-10 pt-24 pb-16 px-6 text-center"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`transition-all duration-1200 ease-out transform ${
            isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            <span className="block">Your Trusted</span>
            <span className="bg-gradient-to-r from-red-600 via-red-800 to-gray-800 bg-clip-text text-transparent animate-pulse">
              Roadside Hero
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional mobile tyre fitting and emergency roadside assistance service with
            <span className="font-bold text-red-400 mx-2">60-minute response guarantee</span>.
            Available 24/7 in Slough, Maidenhead & Windsor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CallButton onClick={handleCallClick} />
            <BookServiceButton onClick={handleBookServiceClick} />
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;