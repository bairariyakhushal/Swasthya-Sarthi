// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUpperCase: !hasUpperCase ? 'Password must contain uppercase letter' : null,
      hasLowerCase: !hasLowerCase ? 'Password must contain lowercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain a number' : null,
    },
  };
};

// Name validation
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// Pincode validation (Indian)
export const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Generic required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Price validation
export const validatePrice = (price) => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum > 0;
};

// Quantity validation
export const validateQuantity = (quantity) => {
  const quantityNum = parseInt(quantity);
  return !isNaN(quantityNum) && quantityNum > 0;
};
