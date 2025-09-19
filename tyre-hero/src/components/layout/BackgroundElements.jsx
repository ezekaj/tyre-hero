import React, { memo } from 'react';

const ParticleField = memo(() => (
  <>
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
      />
    ))}
  </>
));

ParticleField.displayName = 'ParticleField';

const GridPattern = memo(() => (
  <div className="absolute inset-0 opacity-10">
    {[...Array(50)].map((_, i) => (
      <div
        key={`h-${i}`}
        className="absolute w-full border-t border-red-600"
        style={{ top: `${i * 2}%` }}
      />
    ))}
    {[...Array(50)].map((_, i) => (
      <div
        key={`v-${i}`}
        className="absolute h-full border-l border-red-600"
        style={{ left: `${i * 2}%` }}
      />
    ))}
  </div>
));

GridPattern.displayName = 'GridPattern';

const SmokeParticles = memo(() => (
  <>
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
      />
    ))}
  </>
));

SmokeParticles.displayName = 'SmokeParticles';

const RoadPattern = memo(() => (
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
        />
      ))}
    </div>
  </div>
));

RoadPattern.displayName = 'RoadPattern';

const RedPulseOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800 rounded-full opacity-3 blur-3xl animate-pulse delay-1000" />
  </div>
));

RedPulseOverlay.displayName = 'RedPulseOverlay';

const BackgroundElements = memo(() => (
  <>
    {/* Animated Background Elements - Red, Black, Grey Theme */}
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Dynamic particle background */}
      <ParticleField />

      {/* Subtle red grid pattern */}
      <GridPattern />

      {/* Moving dark smoke particles */}
      <SmokeParticles />

      {/* Road Pattern - Dark Grey with subtle red highlights */}
      <RoadPattern />
    </div>

    {/* Red pulse overlay behind content */}
    <RedPulseOverlay />
  </>
));

BackgroundElements.displayName = 'BackgroundElements';

export default BackgroundElements;