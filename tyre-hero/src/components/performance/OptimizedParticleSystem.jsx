import React, { useMemo, useRef, useEffect } from 'react';

/**
 * High-performance particle system using CSS animations and transforms
 * Reduces DOM elements from 185+ to 30 while maintaining visual quality
 */
const OptimizedParticleSystem = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Generate static particle data once (no re-renders)
  const staticParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.4,
      type: Math.random() > 0.7 ? 'red' : 'gray'
    }));
  }, []);

  // CSS-only animation approach (most performant)
  const ParticleCSS = useMemo(() => `
    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      will-change: transform, opacity;
      animation: float-particle linear infinite;
    }

    .particle-red {
      background-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.3);
    }

    .particle-gray {
      background-color: rgba(156, 163, 175, 0.3);
    }

    @keyframes float-particle {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
      }
    }

    .grid-line {
      position: absolute;
      background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
      pointer-events: none;
      will-change: transform;
    }

    .grid-horizontal {
      width: 100%;
      height: 1px;
      animation: drift-horizontal 10s linear infinite;
    }

    .grid-vertical {
      height: 100%;
      width: 1px;
      animation: drift-vertical 12s linear infinite;
    }

    @keyframes drift-horizontal {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @keyframes drift-vertical {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
  `, []);

  return (
    <>
      <style>{ParticleCSS}</style>
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Optimized particle field - 30 instead of 60+ */}
        {staticParticles.map((particle) => (
          <div
            key={particle.id}
            className={`particle particle-${particle.type}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              opacity: particle.opacity
            }}
          />
        ))}

        {/* Optimized grid - 8 lines instead of 50 */}
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`grid-h-${i}`}
            className="grid-line grid-horizontal"
            style={{
              top: `${25 * i}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`grid-v-${i}`}
            className="grid-line grid-vertical"
            style={{
              left: `${25 * i}%`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
    </>
  );
});

OptimizedParticleSystem.displayName = 'OptimizedParticleSystem';

export default OptimizedParticleSystem;