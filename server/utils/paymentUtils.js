const crypto = require('crypto');

// Generate a unique payment reference
const generatePaymentReference = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `PAY-${timestamp}-${random}`;
};

// Format amount to currency
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

// Validate payment method
const validatePaymentMethod = (method) => {
  const validMethods = ['card', 'bank', 'crypto'];
  return validMethods.includes(method);
};

// Validate payment type
const validatePaymentType = (type) => {
  const validTypes = ['wallet', 'investment'];
  return validTypes.includes(type);
};

module.exports = {
  generatePaymentReference,
  formatAmount,
  validatePaymentMethod,
  validatePaymentType
}; 