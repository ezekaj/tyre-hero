import React, { memo, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const services = [
  {
    title: "Emergency Tyre Replacement",
    description: "Immediate roadside tyre replacement service. We come to you anywhere, anytime with high-quality tyres in stock.",
    icon: "🚗"
  },
  {
    title: "Professional Puncture Repair",
    description: "Expert puncture repair service using industry-standard techniques. Get back on the road quickly and safely.",
    icon: "🔧"
  },
  {
    title: "Wheel Balancing & Alignment",
    description: "Professional wheel balancing and alignment service to ensure smooth driving and extended tyre life.",
    icon: "⚖️"
  },
  {
    title: "Fleet & Commercial Service",
    description: "Comprehensive tyre service for commercial vehicles and fleets with competitive rates and priority response.",
    icon: "🚚"
  }
];

const ServiceCard = memo(({ service, index, isVisible }) => (
  <div
    className={`group cursor-pointer transform transition-all duration-800 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}
    style={{ transitionDelay: `${index * 200}ms` }}
  >
    <article className="bg-gray-900 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 transition-all duration-600 border border-gray-700 h-full flex flex-col items-center text-center hover:border-red-600 focus-within:border-red-600">
      <div
        className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 text-red-400"
        role="img"
        aria-label={`${service.title} icon`}
      >
        {service.icon}
      </div>

      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors duration-300">
        {service.title}
      </h3>

      <p className="text-gray-400 leading-relaxed flex-grow">
        {service.description}
      </p>

      {/* Animated underline on hover - Red glow effect */}
      <div className="mt-6 w-16 h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg shadow-red-600/30" />
    </article>
  </div>
));

ServiceCard.displayName = 'ServiceCard';

const Services = memo(() => {
  const { isVisible } = useAppContext();

  const memoizedServices = useMemo(() => services, []);

  return (
    <section
      id="services"
      className="relative z-10 py-16 px-6"
      aria-labelledby="services-heading"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h2
            id="services-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Emergency Tyre Services
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Professional mobile tyre fitting and roadside assistance across Slough, Maidenhead & Windsor
          </p>
        </header>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          role="list"
          aria-label="Available services"
        >
          {memoizedServices.map((service, index) => (
            <div key={index} role="listitem">
              <ServiceCard
                service={service}
                index={index}
                isVisible={isVisible.services}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Services.displayName = 'Services';

export default Services;