import React, { memo } from 'react';

const CheckIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
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
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

ClockIcon.displayName = 'ClockIcon';

const FeatureItem = memo(({ icon, text }) => (
  <div className="flex items-center text-gray-400 mb-2">
    {icon}
    <span>{text}</span>
  </div>
));

FeatureItem.displayName = 'FeatureItem';

const TrustBadge = memo(() => (
  <div className="md:w-1/2 relative">
    <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl p-8 h-full flex flex-col items-center justify-center border border-red-500/30">
      <div className="text-6xl mb-4" role="img" aria-label="Tools icon">🛠️</div>
      <h4 className="text-xl font-bold text-white mb-2">Trusted by Local Drivers</h4>
      <p className="text-gray-300 text-center">
        Over 5,000 satisfied customers across Slough, Maidenhead and Windsor have chosen us for their tyre needs.
      </p>
    </div>
  </div>
));

TrustBadge.displayName = 'TrustBadge';

const MissionContent = memo(() => (
  <div className="md:w-1/2">
    <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>

    <p className="text-gray-300 mb-6 leading-relaxed">
      At Tyre Hero, we're dedicated to providing exceptional roadside assistance with a focus on safety, speed, and reliability. Our team of certified technicians is available 24/7 to get you back on the road quickly and safely.
    </p>

    <p className="text-gray-300 mb-6 leading-relaxed">
      With over 15 years of experience serving the local community, we've built our reputation on trust, quality service, and the use of premium tyres and equipment. We understand that a flat tyre can happen at any time, which is why we offer our 60-minute response guarantee.
    </p>

    <div className="space-y-2">
      <FeatureItem
        icon={<CheckIcon />}
        text="60-minute response guarantee"
      />
      <FeatureItem
        icon={<ClockIcon />}
        text="24/7 emergency service"
      />
    </div>
  </div>
));

MissionContent.displayName = 'MissionContent';

const About = memo(() => (
  <section
    id="about"
    className="relative z-10 py-16 px-6 bg-gradient-to-r from-gray-900/50 to-black/50"
    aria-labelledby="about-heading"
  >
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-16">
        <h2
          id="about-heading"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          About Tyre Hero
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Your trusted partner for professional tyre solutions in Slough, Maidenhead & Windsor
        </p>
      </header>

      <div className="bg-gray-900/70 backdrop-filter backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <MissionContent />
          <TrustBadge />
        </div>
      </div>
    </div>
  </section>
));

About.displayName = 'About';

export default About;