const User = require('../models/user');
const { ValidationError, NotFoundError } = require('../utils/errors');
const validators = require('../utils/validators');

class UserService {
  async getAllUsers() {
    return await User.findAll();
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUserRole(id, role) {
    validators.validateRole(role);
    
    const user = await this.getUserById(id);
    
    // Prevent changing own role (safety measure)
    if (user.id === id) {
      throw new ValidationError('Cannot change your own role');
    }

    await User.updateRole(id, role);
    return await User.findById(id);
  }
}

module.exports = new UserService();