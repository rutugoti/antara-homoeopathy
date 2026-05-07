'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Generate a JWT token for a user
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

/**
 * Login user by verifying email and password
 */
const login = async (email, password) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. If user not found OR inactive, deny login
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 4. Generate token and return user info
  const token = generateToken(user.id);

  // Exclude password from output
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

module.exports = {
  login,
};
