const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const { ValidationError, UnauthorizedError } = require('../utils/errors');
const validators = require('../utils/validators');

class AuthService {
  async register({ email, password, name, role = 'viewer' }) {
    // Keep input checks together before any DB work.
    validators.validateEmail(email);
    validators.validatePassword(password);
    validators.validateRole(role);
    
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }
}

module.exports = new AuthService();
