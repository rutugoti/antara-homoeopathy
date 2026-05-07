'use strict';

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to protect routes — verifies JWT from cookie or Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from cookie or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'none') {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');

    // 3. Find user and attach to request
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User no longer exists or is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

module.exports = {
  protect,
};
