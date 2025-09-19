import React, { memo } from 'react';
import { SERVICE_AREA } from '../../types';

const FooterContent = memo(() => (
  <p className="text-gray-400">
    © 2023 Tyre Hero. Professional mobile tyre fitting and emergency roadside assistance service.
    Serving {SERVICE_AREA}.
  </p>
));

FooterContent.displayName = 'FooterContent';

const ServiceHighlights = memo(() => (
  <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
    <span className="animate-pulse">24/7 Emergency Service</span>
    <span>•</span>
    <span className="animate-pulse">60-Minute Guarantee</span>
    <span>•</span>
    <span className="animate-pulse">Licensed & Insured</span>
  </div>
));

ServiceHighlights.displayName = 'ServiceHighlights';

const Footer = memo(() => (
  <footer
    className="relative z-10 py-8 px-6 bg-gray-900 text-center border-t border-gray-800"
    role="contentinfo"
  >
    <div className="max-w-4xl mx-auto">
      <FooterContent />
      <ServiceHighlights />
    </div>
  </footer>
));

Footer.displayName = 'Footer';

export default Footer;