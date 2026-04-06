const { ValidationError } = require('./errors');

const validators = {
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  },

  validatePassword: (password) => {
    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
  },

  validateFinanceRecord: (data) => {
    const { type, amount, category, date } = data;
    
    if (!type || !['income', 'expense'].includes(type)) {
      throw new ValidationError('Type must be either income or expense');
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }
    
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      throw new ValidationError('Category is required');
    }
    
    if (!date || isNaN(new Date(date).getTime())) {
      throw new ValidationError('Valid date is required');
    }
  },

  validateRole: (role) => {
    const validRoles = ['viewer', 'analyst', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
    }
  }
};

module.exports = validators;