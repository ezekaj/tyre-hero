import React, { memo, useCallback } from 'react';
import { PHONE_NUMBER } from '../../types';

const CallButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse border-2 border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/50"
    aria-label={`Call now ${PHONE_NUMBER}`}
  >
    📞 Call Now: {PHONE_NUMBER}
  </button>
));

CallButton.displayName = 'CallButton';

const BookButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="border-2 border-gray-600 text-gray-300 font-bold py-5 px-10 rounded-full text-xl hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
    aria-label="Book service online"
  >
    Book Online
  </button>
));

BookButton.displayName = 'BookButton';

const CTA = memo(() => {
  const handleCallClick = useCallback(() => {
    window.location.href = `tel:${PHONE_NUMBER.replace(/\s/g, '')}`;
  }, []);

  const handleBookClick = useCallback(() => {
    // Navigate to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      className="relative z-10 py-16 px-6 text-center"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 rounded-3xl shadow-2xl p-10 md:p-16 border border-gray-700">
          <h2
            id="cta-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Need Immediate Assistance?
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            Don't wait on the side of the road. Our expert technicians are ready to help you 24 hours a day, 7 days a week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CallButton onClick={handleCallClick} />
            <BookButton onClick={handleBookClick} />
          </div>
        </div>
      </div>
    </section>
  );
});

CTA.displayName = 'CTA';

export default CTA;