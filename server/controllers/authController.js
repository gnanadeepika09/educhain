// controllers/authController.js
// Handles user registration, login, and profile retrieval
// Supports three roles: admin, student, donor

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Register a new user (student or donor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, college, course, year, rollNumber, organization, walletAddress } = req.body;

    // Validate role - admin cannot self-register
    if (!role || !['student', 'donor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either student or donor.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create the base user account
    const user = await User.create({ name, email, password, role, phone });

    // Create role-specific profile
    if (role === 'student') {
      if (!college || !course || !year) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'College, course, and year are required for students.' });
      }
      await Student.create({ userId: user._id, college, course, year, rollNumber });
    } else if (role === 'donor') {
      await Donor.create({ userId: user._id, organization, walletAddress });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user and explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    // Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch user profile.' });
  }
};

// @desc    Update wallet address for donor
// @route   PUT /api/auth/wallet
// @access  Private (Donor only)
const updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address is required.' });
    }

    const donor = await Donor.findOneAndUpdate(
      { userId: req.user._id },
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    res.json({ success: true, message: 'Wallet address updated successfully.', walletAddress: donor.walletAddress });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ success: false, message: 'Could not update wallet address.' });
  }
};

module.exports = { register, login, getMe, updateWallet };
