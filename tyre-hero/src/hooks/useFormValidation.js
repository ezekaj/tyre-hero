import { useState, useCallback } from 'react';

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim()
    .slice(0, 500); // Limit length
};

// Validation rules
const validators = {
  name: (value) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Name is required for emergency contact';
    if (sanitized.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) return 'Name contains invalid characters';
    return '';
  },

  phone: (value) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Phone number is required for emergency dispatch';
    // UK phone number patterns
    const ukPhoneRegex = /^(\+44|0)(7\d{9}|[1-9]\d{8,9})$/;
    const cleanPhone = sanitized.replace(/[\s-()]/g, '');
    if (!ukPhoneRegex.test(cleanPhone)) return 'Please enter a valid UK phone number';
    return '';
  },

  email: (value) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Email is required for service confirmation';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) return 'Please enter a valid email address';
    return '';
  },

  location: (value) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Location is required for emergency dispatch';
    if (sanitized.length < 5) return 'Please provide a more detailed location';
    return '';
  },

  message: (value) => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return 'Emergency details are required';
    if (sanitized.length < 10) return 'Please describe your emergency in more detail';
    return '';
  }
};

export const useFormValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes with real-time validation
  const handleChange = useCallback((field, value) => {
    const sanitizedValue = sanitizeInput(value);

    setValues(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Handle field blur (validation)
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    if (validators[field]) {
      const error = validators[field](values[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [values]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const error = validators[field](values[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validators).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {}));

    return isValid;
  }, [values]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);

    try {
      const isValid = validateAll();

      if (!isValid) {
        throw new Error('Please fix the form errors before submitting your emergency request');
      }

      // Additional security: double-sanitize before submission
      const sanitizedValues = Object.keys(values).reduce((acc, key) => ({
        ...acc,
        [key]: sanitizeInput(values[key])
      }), {});

      await onSubmit(sanitizedValues);

      // Reset form on success
      setValues(initialValues);
      setErrors({});
      setTouched({});

    } catch (error) {
      console.error('Form submission error:', error);

      // Track form errors in analytics
      if (window.gtag) {
        window.gtag('event', 'form_error', {
          error_message: error.message,
          form_type: 'emergency_contact'
        });
      }

      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, initialValues]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props for easy binding
  const getFieldProps = useCallback((field) => ({
    value: values[field] || '',
    onChange: (e) => handleChange(field, e.target.value),
    onBlur: () => handleBlur(field),
    'aria-invalid': !!(touched[field] && errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined
  }), [values, handleChange, handleBlur, touched, errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};