import React, { memo, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const services = [
  {
    title: "Emergency Tyre Replacement",
    description: "Immediate roadside tyre replacement service. We come to you anywhere, anytime with high-quality tyres in stock.",
    icon: "car"
  },
  {
    title: "Professional Puncture Repair",
    description: "Expert puncture repair service using industry-standard techniques. Get back on the road quickly and safely.",
    icon: "tool"
  },
  {
    title: "Wheel Balancing & Alignment",
    description: "Professional wheel balancing and alignment service to ensure smooth driving and extended tyre life.",
    icon: "balance"
  },
  {
    title: "Fleet & Commercial Service",
    description: "Comprehensive tyre service for commercial vehicles and fleets with competitive rates and priority response.",
    icon: "truck"
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
        className="text-red-400 mb-6 group-hover:scale-110 transition-transform duration-500"
        role="img"
        aria-label={`${service.title} icon`}
      >
        {service.icon === 'car' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01l-1 4A2 2 0 0 0 4 10v6c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-6c0-.05-.01-.1-.02-.15l-1.06-3.84zM6.5 14C5.67 14 5 13.33 5 12.5S5.67 11 6.5 11 8 11.67 8 12.5 7.33 14 6.5 14zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        )}
        {service.icon === 'tool' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.7 19L13.6 9.9c.9-2.2.4-4.8-1.5-6.7C10.7 1.8 8.6 1.3 6.7 2l3.8 3.8-2.8 2.8L3.9 4.8c-.7 1.9-.2 4 1.2 5.4 1.9 1.9 4.5 2.4 6.7 1.5l9.1 9.1c.4.4 1 .4 1.4 0l.4-.4c.4-.4.4-1 0-1.4z"/>
          </svg>
        )}
        {service.icon === 'balance' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.27 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
          </svg>
        )}
        {service.icon === 'truck' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        )}
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