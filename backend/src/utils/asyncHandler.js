'use strict';

/**
 * Wraps an async Express route handler so that any rejected promise or thrown
 * error is automatically forwarded to the next() error-handling middleware,
 * eliminating repetitive try/catch blocks in controllers.
 *
 * @param  {Function} fn - Async express handler (req, res, next)
 * @returns {Function}   - Standard Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
