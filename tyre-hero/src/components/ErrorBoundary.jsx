import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Emergency Service Error:', error, errorInfo);

    // Track error in analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-3xl rounded-4xl p-12 border border-red-500/50">
              <div className="text-red-500 text-8xl mb-8 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8">
                Emergency Service Alert
              </h1>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Our emergency response system encountered an issue. Don't worry - our rescue team is still available!
              </p>

              <div className="space-y-6 mb-12">
                <a
                  href="tel:0800-000-0000"
                  className="block bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-6 px-12 rounded-3xl text-2xl shadow-3xl hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-300 border-4 border-red-400/50"
                >
                  CALL EMERGENCY: 0800 000 0000
                </a>

                <button
                  onClick={() => window.location.reload()}
                  className="block w-full border-4 border-gray-600 text-gray-300 font-black py-6 px-12 rounded-3xl text-xl hover:bg-gray-800 hover:border-red-500 hover:text-red-400 transition-all duration-300"
                >
                  Reload Emergency Portal
                </button>
              </div>

              <div className="text-gray-400 text-lg">
                <p>24/7 Emergency Service • 60-Minute Response Guarantee</p>
                <p className="mt-2">Serving Slough, Maidenhead & Windsor</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;