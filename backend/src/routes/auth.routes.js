'use strict';

const { Router } = require('express');
const { login, logout } = require('../controllers/auth.controller');

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Public
 */
router.post('/logout', logout);

module.exports = router;
