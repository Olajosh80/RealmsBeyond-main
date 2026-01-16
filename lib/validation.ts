// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;
const ZIP_REGEX = /^[A-Z0-9]{3,10}$/i;

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  return phone.trim().length >= 10 && PHONE_REGEX.test(phone);
};

/**
 * Validates zip code format
 */
export const validateZipCode = (zipCode: string): boolean => {
  if (!zipCode || typeof zipCode !== 'string') return false;
  return ZIP_REGEX.test(zipCode.trim());
};

/**
 * Validates password strength
 * Requirements: at least 8 characters
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates user signup data
 */
export const validateSignupData = (data: any) => {
  const errors: string[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  const passwordValidation = validatePasswordStrength(data.password || '');
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors);
  }

  if (data.password !== data.confirm_password) {
    errors.push('Passwords do not match');
  }

  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (data.full_name && data.full_name.trim().length > 255) {
    errors.push('Full name must be less than 255 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates shipping information
 */
export const validateShippingInfo = (shipping: any) => {
  const errors: string[] = [];

  if (!shipping.fullName || typeof shipping.fullName !== 'string' || shipping.fullName.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!shipping.email || !validateEmail(shipping.email)) {
    errors.push('Valid email address is required');
  }

  if (!shipping.phone || !validatePhone(shipping.phone)) {
    errors.push('Valid phone number is required');
  }

  if (!shipping.address || typeof shipping.address !== 'string' || shipping.address.trim().length === 0) {
    errors.push('Street address is required');
  }

  if (!shipping.city || typeof shipping.city !== 'string' || shipping.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!shipping.state || typeof shipping.state !== 'string' || shipping.state.trim().length === 0) {
    errors.push('State/Province is required');
  }

  if (!shipping.zipCode || !validateZipCode(shipping.zipCode)) {
    errors.push('Valid ZIP/postal code is required');
  }

  if (!shipping.country || typeof shipping.country !== 'string' || shipping.country.trim().length === 0) {
    errors.push('Country is required');
  }

  // Length checks
  if (shipping.fullName && shipping.fullName.length > 255) {
    errors.push('Full name is too long');
  }
  if (shipping.address && shipping.address.length > 500) {
    errors.push('Address is too long');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates order data
 */
export const validateOrderData = (data: any) => {
  const errors: string[] = [];

  // Validate items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must have at least one item');
  } else {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.id || !item.name || typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Item ${i + 1} has invalid data`);
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 1000) {
        errors.push(`Item ${i + 1} has invalid quantity`);
      }
    }
  }

  // Validate shipping
  if (!data.shipping) {
    errors.push('Shipping information is required');
  } else {
    const shippingValidation = validateShippingInfo(data.shipping);
    if (!shippingValidation.valid) {
      errors.push(...shippingValidation.errors);
    }
  }

  // Validate total
  if (typeof data.total !== 'number' || data.total <= 0 || data.total > 1000000) {
    errors.push('Invalid order total');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates product data
 */
export const validateProduct = (data: any) => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (data.name && data.name.length > 255) {
    errors.push('Product name must be less than 255 characters');
  }

  if (typeof data.price !== 'number' || data.price <= 0 || data.price > 1000000) {
    errors.push('Product price must be a positive number (max 1000000)');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Product description must be text');
  }

  if (data.description && data.description.length > 5000) {
    errors.push('Product description is too long');
  }

  if (data.compare_at_price !== undefined && data.compare_at_price !== null) {
    if (typeof data.compare_at_price !== 'number' || data.compare_at_price <= 0) {
      errors.push('Compare price must be a positive number');
    }
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required');
  }

  if (!data.weight || (typeof data.weight === 'string' && data.weight.trim().length === 0)) {
    errors.push('Product weight is required');
  }

  if (typeof data.in_stock !== 'boolean') {
    errors.push('Stock status must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates division data
 */
export const validateDivision = (data: any) => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Division name is required');
  }

  if (data.name && data.name.length > 255) {
    errors.push('Division name must be less than 255 characters');
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('Division slug is required');
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Division slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be text');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Sanitize object keys to prevent NoSQL injection
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const sanitizedKey = key.replace(/\$/g, '').replace(/\./g, '');
      sanitized[sanitizedKey] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};
