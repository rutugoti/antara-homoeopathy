'use strict';

/**
 * Standard API response wrapper.
 * success is automatically derived from the HTTP status code (< 400 = success).
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable message
   * @param {*}      data       - Response payload (default null)
   */
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

/**
 * Standard API error.
 * Extends the native Error so it can be thrown and caught naturally.
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode - HTTP status code
   * @param {string}   message    - Human-readable error message
   * @param {Array}    errors     - Optional array of validation / field errors
   * @param {string}   stack      - Optional custom stack trace
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = { ApiResponse, ApiError };
