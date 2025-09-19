import React from 'react';

const LoadingSpinner = ({ message = "Dispatching rescue team..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Spinning rescue icon */}
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-black animate-spin shadow-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01l-1 4A2 2 0 0 0 4 10v6c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-6c0-.05-.01-.1-.02-.15l-1.06-3.84zM6.5 14C5.67 14 5 13.33 5 12.5S5.67 11 6.5 11 8 11.67 8 12.5 7.33 14 6.5 14zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-2.5-6H9l.5-2h5l.5 2z"/>
            </svg>
          </div>

          {/* Pulsing rings */}
          <div className="absolute inset-0 w-24 h-24 bg-red-500/20 rounded-full animate-ping mx-auto"></div>
          <div className="absolute inset-0 w-32 h-32 bg-red-500/10 rounded-full animate-ping animation-delay-1000 -m-4 mx-auto"></div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          {message}
        </h2>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-red-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        <p className="text-xl text-gray-300 mb-8">
          Please wait while we prepare your emergency assistance
        </p>

        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm rounded-full px-8 py-3 border border-red-500/50 inline-block">
          <span className="text-red-300 font-bold">60-MINUTE RESPONSE GUARANTEE</span>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;