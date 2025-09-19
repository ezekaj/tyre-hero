// Type definitions for Tyre Hero components

/**
 * @typedef {Object} Service
 * @property {string} title - Service title
 * @property {string} description - Service description
 * @property {string} icon - Service icon (emoji)
 */

/**
 * @typedef {Object} NavItem
 * @property {string} id - Navigation item ID
 * @property {string} label - Navigation item label
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} phone - Phone number
 * @property {string} email - Email address
 * @property {string} serviceArea - Service area description
 */

/**
 * @typedef {Object} FormData
 * @property {string} name - Contact form name
 * @property {string} email - Contact form email
 * @property {string} phone - Contact form phone
 * @property {string} message - Contact form message
 */

/**
 * @typedef {Object} VisibilityState
 * @property {boolean} hero - Hero section visibility
 * @property {boolean} services - Services section visibility
 * @property {boolean} footer - Footer visibility
 */

export const ANIMATION_DELAYS = {
  INITIAL: 500,
  STAGGER: 200
};

export const PHONE_NUMBER = "0800 000 0000";
export const EMAIL = "info@tyrehero.co.uk";
export const SERVICE_AREA = "Slough, Maidenhead & Windsor";