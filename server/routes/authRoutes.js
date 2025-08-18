const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  generateVerificationToken,
  sendVerificationEmail
} = require('../services/emailService');

const router = express.Router();

// @route   GET api/auth/status
// @desc    Check API status
// @access  Public
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'API is working',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 8+ characters').isLength({ min: 8 })
  ],
  async (req, res) => {
    try {
      const { name, email, password, referralCode } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create verification token
      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        referralCode,
        verificationToken,
        verificationTokenExpires,
        isVerified: false
      });

      await newUser.save();
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({ 
        message: 'Registration successful! Please check your email to verify your account.'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.correctPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// @route   GET api/auth/verify-email
// @desc    Verify email
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).send('Invalid or expired verification token');
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    res.send('Email verified successfully! You can now log in.');
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Email verification failed');
  }
});

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    if (user.verificationTokenExpires < Date.now()) {
      user.verificationToken = generateVerificationToken();
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();
    }
    
    await sendVerificationEmail(email, user.verificationToken);
    
    res.json({ message: 'Verification email resent successfully' });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password -verificationToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// @route   PUT api/auth/update-profile
// @desc    Update profile
// @access  Private
router.put('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { name, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, phone },
      { new: true }
    ).select('-password -verificationToken');
    
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// @route   POST api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Password change failed' });
  }
});

module.exports = router;