import React, { useState, useEffect } from 'react';

const App = () => {
  const [isVisible, setIsVisible] = useState({});

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
      icon: "⚖"
    },
    {
      title: "Fleet & Commercial Service",
      description: "Comprehensive tyre service for commercial vehicles and fleets with competitive rates and priority response.",
      icon: "🚚"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-x-hidden">
      {/* Animated Background Elements - Red, Black, Grey Theme */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Dynamic particle background */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}

        {/* Subtle red grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-red-600"
              style={{ top: `${i * 2}%` }}
            ></div>
          ))}
          {[...Array(50)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-red-600"
              style={{ left: `${i * 2}%` }}
            ></div>
          ))}
        </div>

        {/* Moving dark smoke particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`smoke-${i}`}
            className="absolute w-4 h-4 bg-gray-700 rounded-full opacity-15 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-10 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          ></div>
        ))}

        {/* Road Pattern - Dark Grey with subtle red highlights */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800">
          <div className="h-full flex">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`w-1 mx-1 transition-all duration-2000 ${
                  i % 3 === 0 ? 'bg-red-600 opacity-40' : 'bg-gray-700 opacity-30'
                } animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${15 + Math.random() * 10}%`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-1200 ease-out transform ${
              isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
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
              <button className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:rotate-1 animate-pulse border-2 border-red-500">
                Call Now: 0800 000 0000
              </button>
              <button className="border-2 border-gray-600 text-gray-300 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-105">
                Book Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Emergency Tyre Services
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Professional mobile tyre fitting and roadside assistance across Slough, Maidenhead & Windsor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group cursor-pointer transform transition-all duration-800 ease-out ${
                  isVisible.services ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 transition-all duration-600 border border-gray-700 h-full flex flex-col items-center text-center hover:border-red-600">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 text-red-400">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  {/* Animated underline on hover - Red glow effect */}
                  <div className="mt-6 w-16 h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg shadow-red-600/30"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Banner - Red and Grey Theme */}
      <section className="relative z-10 py-12 px-6 bg-gradient-to-r from-red-900 via-red-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="w-14 h-14 bg-red-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold tracking-wide animate-pulse">
              60-Minute Response Guarantee
            </span>
            <div className="w-14 h-14 bg-red-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-200 text-xl font-light leading-relaxed">
            We promise to arrive at your location within 60 minutes or less, day or night. Your safety is our priority.
          </p>

          {/* Subtle pulsing red ring around text */}
          <div className="absolute -inset-4 border-2 border-red-600 rounded-2xl opacity-20 animate-pulse"></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-3xl shadow-2xl p-10 md:p-16 border border-gray-700">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Don't wait on the side of the road. Our expert technicians are ready to help you 24 hours a day, 7 days a week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-5 px-10 rounded-full text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse border-2 border-red-500">
                📞 Call Now: 0800 000 0000
              </button>
              <button className="border-2 border-gray-600 text-gray-300 font-bold py-5 px-10 rounded-full text-xl hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300 transform hover:scale-105">
                Book Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 bg-gray-900 text-center border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">
            © 2023 Tyre Hero. Professional mobile tyre fitting and emergency roadside assistance service.
            Serving Slough, Maidenhead & Windsor.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
            <span className="animate-pulse">24/7 Emergency Service</span>
            <span>•</span>
            <span className="animate-pulse">60-Minute Guarantee</span>
            <span>•</span>
            <span className="animate-pulse">Licensed & Insured</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - Red Glow Effect */}
      <button className="fixed bottom-8 right-8 bg-gradient-to-r from-red-600 to-red-800 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 animate-pulse border-2 border-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>

      {/* Red pulse overlay behind content */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800 rounded-full opacity-3 blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default App;