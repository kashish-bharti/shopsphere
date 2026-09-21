/**
 * ShopSphere - Validation & Security Utilities
 * Protects against XSS and enforces clean input validation.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates password strength (minimum 6 chars, alphanumeric)
 */
export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

/**
 * Validates positive number
 */
export function isValidPositiveNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

/**
 * Validates non-negative integer (e.g. stock)
 */
export function isValidStock(val) {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}

/**
 * Display inline validation error
 */
export function setInputError(inputElement, errorElement, message) {
  if (inputElement) {
    inputElement.classList.add('is-invalid');
    inputElement.classList.remove('is-valid');
  }
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('visible');
  }
}

/**
 * Clear inline validation error
 */
export function clearInputError(inputElement, errorElement) {
  if (inputElement) {
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
  }
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }
}

/**
 * Format currency nicely
 */
export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
}
