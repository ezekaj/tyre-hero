import React, { memo, useState, useCallback } from 'react';
import { PHONE_NUMBER, EMAIL, SERVICE_AREA } from '../../types';

const PhoneIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
));

PhoneIcon.displayName = 'PhoneIcon';

const EmailIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
));

EmailIcon.displayName = 'EmailIcon';

const LocationIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
));

LocationIcon.displayName = 'LocationIcon';

const ContactItem = memo(({ icon, title, primary, secondary }) => (
  <div className="flex items-start">
    <div className="bg-red-600/20 rounded-full p-3 mr-4 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-gray-300">{primary}</p>
      <p className="text-gray-400 text-sm mt-1">{secondary}</p>
    </div>
  </div>
));

ContactItem.displayName = 'ContactItem';

const FormField = memo(({ label, type = "text", id, placeholder, rows, value, onChange, required = false }) => {
  const InputComponent = rows ? 'textarea' : 'input';

  return (
    <div>
      <label htmlFor={id} className="block text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <InputComponent
        type={type}
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
        placeholder={placeholder}
        required={required}
        aria-required={required}
      />
    </div>
  );
});

FormField.displayName = 'FormField';

const ContactForm = memo(() => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });

      // Show success message (could be replaced with toast notification)
      alert('Thank you for your message! We will get back to you within 1 hour.');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error sending your message. Please try calling us directly.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <div className="bg-gray-900/70 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
      <h3 className="text-2xl font-bold text-white mb-6">Send Us a Message</h3>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          label="Name"
          id="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange('name')}
          required
        />

        <FormField
          label="Email"
          type="email"
          id="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />

        <FormField
          label="Phone"
          type="tel"
          id="phone"
          placeholder="+44 123 456 7890"
          value={formData.phone}
          onChange={handleChange('phone')}
        />

        <FormField
          label="Message"
          id="message"
          placeholder="Tell us about your tyre issue..."
          rows={4}
          value={formData.message}
          onChange={handleChange('message')}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-red-500/50"
          aria-label={isSubmitting ? "Sending message..." : "Send message"}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
});

ContactForm.displayName = 'ContactForm';

const ContactInfo = memo(() => (
  <div className="bg-gray-900/70 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
    <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>

    <div className="space-y-6">
      <ContactItem
        icon={<PhoneIcon />}
        title="Call Now"
        primary={PHONE_NUMBER}
        secondary="24/7 Emergency Service"
      />

      <ContactItem
        icon={<EmailIcon />}
        title="Email Us"
        primary={EMAIL}
        secondary="Response within 1 hour"
      />

      <ContactItem
        icon={<LocationIcon />}
        title="Service Area"
        primary={SERVICE_AREA}
        secondary="We cover all surrounding areas"
      />
    </div>

    <div className="mt-8 p-4 bg-red-600/10 rounded-xl border border-red-500/30">
      <p className="text-red-300 text-sm">
        <strong>60-Minute Guarantee:</strong> We promise to arrive at your location within 60 minutes or less, day or night.
      </p>
    </div>
  </div>
));

ContactInfo.displayName = 'ContactInfo';

const Contact = memo(() => (
  <section
    id="contact"
    className="relative z-10 py-16 px-6"
    aria-labelledby="contact-heading"
  >
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-16">
        <h2
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Contact Us
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Ready for immediate assistance? Our team is standing by 24 hours a day, 7 days a week.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  </section>
));

Contact.displayName = 'Contact';

export default Contact;