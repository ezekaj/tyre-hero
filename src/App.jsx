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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #111827, #1f2937, #000000)',
      overflowX: 'hidden',
      position: 'relative',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '5rem',
        paddingBottom: '4rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div
            style={{
              transition: 'all 1.2s ease-out',
              transform: isVisible.hero ? 'translateY(0)' : 'translateY(10px)',
              opacity: isVisible.hero ? 1 : 0
            }}
          >
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.25'
            }}>
              <span style={{ display: 'block' }}>Your Trusted</span>
              <span style={{
                background: 'linear-gradient(to right, #dc2626, #991b1b, #1f2937)',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}>
                Roadside Hero
              </span>
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: '#d1d5db',
              marginBottom: '2rem',
              maxWidth: '768px',
              margin: '0 auto 2rem',
              lineHeight: '1.625'
            }}>
              Professional mobile tyre fitting and emergency roadside assistance service with
              <span style={{ fontWeight: 'bold', color: '#f87171', margin: '0 0.5rem' }}>60-minute response guarantee</span>.
              Available 24/7 in Slough, Maidenhead & Windsor.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button style={{
                background: 'linear-gradient(to right, #dc2626, #991b1b)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.125rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transform: 'scale(1)',
                transition: 'all 0.3s',
                border: '2px solid #ef4444',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                e.target.style.transform = 'scale(1.05) rotate(1deg)';
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                e.target.style.transform = 'scale(1)';
              }}>
                Call Now: 0800 000 0000
              </button>
              <button style={{
                border: '2px solid #4b5563',
                color: '#d1d5db',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.125rem',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1f2937';
                e.target.style.borderColor = '#ef4444';
                e.target.style.color = '#f87171';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#4b5563';
                e.target.style.color = '#d1d5db';
                e.target.style.transform = 'scale(1)';
              }}>
                Book Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '4rem',
        paddingBottom: '4rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Emergency Tyre Services
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#9ca3af',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              Professional mobile tyre fitting and roadside assistance across Slough, Maidenhead & Windsor
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.8s ease-out',
                  opacity: isVisible.services ? 1 : 0,
                  transform: isVisible.services ? 'translateY(0)' : 'translateY(10px)'
                }}
              >
                <div style={{
                  backgroundColor: '#111827',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  border: '1px solid #374151',
                  transition: 'all 0.6s'
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = '0 35px 60px -15px rgba(0, 0, 0, 0.3)';
                  e.target.style.transform = 'translateY(-0.75rem)';
                  e.target.style.borderColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.borderColor = '#374151';
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1.5rem',
                    color: '#f87171',
                    transition: 'transform 0.5s'
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '1rem',
                    transition: 'color 0.3s'
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    color: '#9ca3af',
                    lineHeight: '1.625',
                    flex: '1'
                  }}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '3rem',
        paddingBottom: '3rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        background: 'linear-gradient(to right, #7f1d1d, #991b1b, #111827)'
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            gap: '1.5rem'
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              backgroundColor: 'rgba(127, 29, 29, 0.5)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #dc2626'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.75rem', width: '1.75rem', color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span style={{
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: 'wide',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              60-Minute Response Guarantee
            </span>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              backgroundColor: 'rgba(127, 29, 29, 0.5)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #dc2626'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.75rem', width: '1.75rem', color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p style={{
            color: '#e5e7eb',
            fontSize: '1.25rem',
            fontWeight: '300',
            lineHeight: '1.625'
          }}>
            We promise to arrive at your location within 60 minutes or less, day or night. Your safety is our priority.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '4rem',
        paddingBottom: '4rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2.5rem',
            border: '1px solid #374151'
          }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Need Immediate Assistance?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#d1d5db',
              marginBottom: '2rem'
            }}>
              Don't wait on the side of the road. Our expert technicians are ready to help you 24 hours a day, 7 days a week.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button style={{
                background: 'linear-gradient(to right, #dc2626, #991b1b)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 2.5rem',
                borderRadius: '9999px',
                fontSize: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transform: 'scale(1)',
                transition: 'all 0.3s',
                border: '2px solid #ef4444',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0 35px 60px -15px rgba(0, 0, 0, 0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                e.target.style.transform = 'scale(1)';
              }}>
                📞 Call Now: 0800 000 0000
              </button>
              <button style={{
                border: '2px solid #4b5563',
                color: '#d1d5db',
                fontWeight: 'bold',
                padding: '1.25rem 2.5rem',
                borderRadius: '9999px',
                fontSize: '1.25rem',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1f2937';
                e.target.style.borderColor = '#ef4444';
                e.target.style.color = '#f87171';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#4b5563';
                e.target.style.color = '#d1d5db';
                e.target.style.transform = 'scale(1)';
              }}>
                Book Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '2rem',
        paddingBottom: '2rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        backgroundColor: '#111827',
        textAlign: 'center',
        borderTop: '1px solid #1f2937'
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <p style={{ color: '#9ca3af' }}>
            © 2023 Tyre Hero. Professional mobile tyre fitting and emergency roadside assistance service.
            Serving Slough, Maidenhead & Windsor.
          </p>
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>24/7 Emergency Service</span>
            <span>•</span>
            <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>60-Minute Guarantee</span>
            <span>•</span>
            <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Licensed & Insured</span>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;