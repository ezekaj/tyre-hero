import React, { memo } from 'react';

const CheckIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
));

CheckIcon.displayName = 'CheckIcon';

const ClockIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

ClockIcon.displayName = 'ClockIcon';

const IconBadge = memo(({ children, ariaLabel }) => (
  <div
    className="w-14 h-14 bg-red-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-red-600"
    role="img"
    aria-label={ariaLabel}
  >
    {children}
  </div>
));

IconBadge.displayName = 'IconBadge';

const GuaranteeBanner = memo(() => (
  <section
    className="relative z-10 py-12 px-6 bg-gradient-to-r from-red-900 via-red-800 to-gray-900"
    aria-labelledby="guarantee-heading"
  >
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex items-center justify-center space-x-6 mb-6">
        <IconBadge ariaLabel="Quality guarantee check mark">
          <CheckIcon />
        </IconBadge>

        <h2
          id="guarantee-heading"
          className="text-white text-xl font-semibold tracking-wide animate-pulse"
        >
          60-Minute Response Guarantee
        </h2>

        <IconBadge ariaLabel="24/7 service clock">
          <ClockIcon />
        </IconBadge>
      </div>

      <p className="text-gray-200 text-xl font-light leading-relaxed">
        We promise to arrive at your location within 60 minutes or less, day or night. Your safety is our priority.
      </p>

      {/* Subtle pulsing red ring around text */}
      <div
        className="absolute -inset-4 border-2 border-red-600 rounded-2xl opacity-20 animate-pulse"
        aria-hidden="true"
      />
    </div>
  </section>
));

GuaranteeBanner.displayName = 'GuaranteeBanner';

export default GuaranteeBanner;