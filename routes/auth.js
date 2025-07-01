const express = require('express');
const router = express.Router();
const { login, register, verify, logout } = require('../controllers/authController');
const { auth, checkRole } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);

// Protected routes
router.get('/verify', auth, verify);

// Admin-specific routes
router.get('/admin/verify', [auth, checkRole(['admin'])], verify);

module.exports = router; 