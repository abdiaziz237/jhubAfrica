const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const { 
  generateVerificationToken, 
  sendVerificationEmail 
} = require('../services/emailService');

module.exports = {
  /**
   * @desc    Register a new user
   * @route   POST /api/auth/register
   * @access  Public
   */
  async register(req, res) {
    try {
      const { name, email, password, referralCode, role } = req.body;
      
      // Validate existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        referredBy: referralCode,
        verificationToken,
        verificationTokenExpires,
        isVerified: false
      });

      await user.save();

      // Handle referral
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referrer.points += 100;
          await referrer.save();
        }
      }

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      // Generate token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
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
      console.error('Registration Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  /**
   * @desc    Login user
   * @route   POST /api/auth/login
   * @access  Public
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check email verification
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

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
      console.error('Login Error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  /**
   * @desc    Verify email
   * @route   GET /api/auth/verify-email
   * @access  Public
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      
      const user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }
      
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
      
    } catch (err) {
      console.error('Email Verification Error:', err);
      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  },

  /**
   * @desc    Resend verification email
   * @route   POST /api/auth/resend-verification
   * @access  Public
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }
      
      // Generate new token if expired
      if (user.verificationTokenExpires < Date.now()) {
        user.verificationToken = generateVerificationToken();
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
      }
      
      await sendVerificationEmail(email, user.verificationToken);
      
      res.status(200).json({
        success: true,
        message: 'Verification email resent successfully'
      });
      
    } catch (err) {
      console.error('Resend Verification Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email'
      });
    }
  },

  /**
   * @desc    Get current user
   * @route   GET /api/auth/me
   * @access  Private
   */
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password -verificationToken');
      res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      console.error('Get User Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user data'
      });
    }
  },

  /**
   * @desc    Update user profile
   * @route   PUT /api/auth/update-profile
   * @access  Private
   */
  async updateProfile(req, res) {
    try {
      const { name, phone } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone },
        { new: true, runValidators: true }
      ).select('-password -verificationToken');
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (err) {
      console.error('Update Profile Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  /**
   * @desc    Change password
   * @route   POST /api/auth/change-password
   * @access  Private
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user.id).select('+password');
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      console.error('Change Password Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  },

  /**
   * @desc    Logout user (single device)
   * @route   POST /api/auth/logout
   * @access  Private
   */
  async logout(req, res) {
    try {
      req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
      await req.user.save();
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Logout failed' 
      });
    }
  },

  /**
   * @desc    Logout user from all devices
   * @route   POST /api/auth/logout-all
   * @access  Private
   */
  async logoutAll(req, res) {
    try {
      req.user.tokens = [];
      await req.user.save();
      res.json({ 
        success: true, 
        message: 'Logged out from all devices' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Logout failed' 
      });
    }
  }
};