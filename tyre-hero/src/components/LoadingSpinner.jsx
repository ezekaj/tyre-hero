import React from 'react';

const LoadingSpinner = ({ message = "Dispatching rescue team..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Spinning rescue icon */}
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-black animate-spin shadow-2xl mx-auto">
            🚗
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
          <span className="text-red-300 font-bold">⚡ 60-MINUTE RESPONSE GUARANTEE</span>
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