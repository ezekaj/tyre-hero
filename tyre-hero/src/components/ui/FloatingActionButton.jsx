import React, { memo, useCallback } from 'react';
import { PHONE_NUMBER } from '../../types';

const PhoneIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
));

PhoneIcon.displayName = 'PhoneIcon';

const FloatingActionButton = memo(() => {
  const handleClick = useCallback(() => {
    window.location.href = `tel:${PHONE_NUMBER.replace(/\s/g, '')}`;
  }, []);

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-red-600 to-red-800 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 animate-pulse border-2 border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/50"
      aria-label={`Emergency call button - ${PHONE_NUMBER}`}
      title={`Call emergency service: ${PHONE_NUMBER}`}
    >
      <PhoneIcon />
    </button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;