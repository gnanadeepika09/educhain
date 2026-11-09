// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateWallet } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/wallet', protect, authorize('donor'), updateWallet);

module.exports = router;
