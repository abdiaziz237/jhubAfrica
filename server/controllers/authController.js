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
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  async register(req, res) {
    try {
      const { name, email, password, referralCode, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

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

      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referrer.points += 100;
          await referrer.save();
        }
      }

      await sendVerificationEmail(email, verificationToken);

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });

    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  },

  /**
   * @desc    Login user
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email first' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });

    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  },

  /**
   * @desc    Verify email
   * @route   GET /api/v1/auth/verify-email
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
        return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      res.json({ success: true, message: 'Email verified successfully' });

    } catch (err) {
      console.error('Email Verification Error:', err);
      res.status(500).json({ success: false, message: 'Email verification failed' });
    }
  },

  /**
   * @desc    Resend verification email
   * @route   POST /api/v1/auth/resend-verification
   * @access  Public
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

      if (!user.verificationToken || user.verificationTokenExpires < Date.now()) {
        user.verificationToken = generateVerificationToken();
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
      }

      await sendVerificationEmail(email, user.verificationToken);

      res.json({ success: true, message: 'Verification email resent successfully' });

    } catch (err) {
      console.error('Resend Verification Error:', err);
      res.status(500).json({ success: false, message: 'Failed to resend verification email' });
    }
  },

  /**
   * @desc    Get current user
   * @route   GET /api/v1/auth/me
   * @access  Private
   */
  async getMe(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password -verificationToken');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      res.json({ success: true, user });
    } catch (err) {
      console.error('Get User Error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user data' });
    }
  },

  /**
   * @desc    Update user profile
   * @route   PUT /api/v1/auth/update-profile
   * @access  Private
   */
  async updateProfile(req, res) {
    try {
      const { name, phone } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { name, phone },
        { new: true, runValidators: true }
      ).select('-password -verificationToken');

      res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
      console.error('Update Profile Error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  },

  /**
   * @desc    Change password
   * @route   POST /api/v1/auth/change-password
   * @access  Private
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId).select('+password');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      console.error('Change Password Error:', err);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }
};
