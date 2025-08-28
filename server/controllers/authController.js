const crypto = require("crypto");
const path = require("path");
const User = require(path.join(__dirname, "../models/user"));
const {
  generateVerificationToken,
  generatePasswordResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} = require("../services/emailService");

module.exports = {
  /**
   * @desc    Register a new user
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  async register(req, res) {
    console.log('REGISTER BODY:', req.body);
    try {
      const { name, email, password, passwordConfirm, referralCode, role } = req.body;

      // Password match check (controller-level, not schema)
      if (password !== passwordConfirm) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }

      // Generate verification token
      const emailVerificationToken = generateVerificationToken();

      // Handle referral
      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = referrer._id;
          referrer.points += 100;
          await referrer.save();
        }
      }

      const user = new User({
        name,
        email,
        password,
        passwordConfirm,
        role: role || "student",
        referredBy,
        emailVerificationToken,
        emailVerified: false,
        status: 'pending',
        verificationStatus: 'pending'
      });

      await user.save();

      // Send verification email
      await sendVerificationEmail(email, emailVerificationToken);

      // Generate auth token using schema method
      const token = await user.generateAuthToken();

      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Registration Error:", err);
      // Show Mongoose validation error messages if available
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: messages.join(", ") });
      }
      
      // Handle duplicate key errors (email already exists)
      if (err.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already in use. Please use a different email address." 
        });
      }
      
      res
        .status(500)
        .json({ success: false, message: "Server error during registration" });
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

      // Use schema static method
      const user = await User.findByCredentials(email, password);

      // Check if user account is verified by admin
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: "Your account is pending verification by an administrator. Please wait for approval.",
        });
      }

      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: "Your account verification was rejected. Please contact support for assistance.",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email first",
        });
      }

      const token = await user.generateAuthToken();

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      res
        .status(401)
        .json({ success: false, message: err.message || "Login failed" });
    }
  },

  /**
   * @desc    Admin login
   * @route   POST /api/v1/auth/admin/login
   * @access  Public
   */
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Use schema static method
      const user = await User.findByCredentials(email, password);

      // Check if user account is verified by admin
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: "Your account is pending verification by an administrator. Please wait for approval.",
        });
      }

      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: "Your account verification was rejected. Please contact support for assistance.",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email first",
        });
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Administrator privileges required.",
        });
      }

      const token = await user.generateAuthToken();

      res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Admin Login Error:", err);
      res
        .status(401)
        .json({ success: false, message: err.message || "Admin login failed" });
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

      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.json({ success: true, message: "Email verified successfully" });
    } catch (err) {
      console.error("Email Verification Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Email verification failed" });
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
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      if (user.emailVerified)
        return res
          .status(400)
          .json({ success: false, message: "Email already verified" });

      if (!user.emailVerificationToken) {
        user.emailVerificationToken = generateVerificationToken();
        await user.save();
      }

      await sendVerificationEmail(email, user.emailVerificationToken);

      res.json({
        success: true,
        message: "Verification email resent successfully",
      });
    } catch (err) {
      console.error("Resend Verification Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to resend verification email",
      });
    }
  },

  /**
   * @desc    Get current user
   * @route   GET /api/v1/auth/me
   * @access  Private
   */
  async getMe(req, res) {
    try {
      console.log('🔍 getMe called with req.user:', req.user);
      
      // Check if user exists and has required fields
      if (!req.user || !req.user._id) {
        console.log('🔍 No user found in request');
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated"
        });
      }
      
      // Return user data directly without any transformation
      const userData = {
        _id: req.user._id,
        name: req.user.name || 'Unknown User',
        email: req.user.email || '',
        role: req.user.role || 'student',
        points: req.user.points || 0,
        emailVerified: req.user.emailVerified || false,
        profileComplete: req.user.profileComplete || false,
        referralCode: req.user.referralCode || '',
        createdAt: req.user.createdAt || new Date(),
        updatedAt: req.user.updatedAt || new Date()
      };
      
      console.log('🔍 Returning user data:', userData);
      
      res.json({ 
        success: true, 
        user: userData
      });
      
    } catch (err) {
      console.error("🔍 Get User Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch user data",
        error: err.message
      });
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
        req.user._id,
        { name, phone },
        { new: true, runValidators: true }
      ).select("-password -emailVerificationToken");

      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      console.error("Update Profile Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to update profile" });
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
      const user = await User.findById(req.user._id).select("+password");

      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const isMatch = await user.correctPassword(currentPassword);
      if (!isMatch)
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });

      user.password = newPassword; // hashed by pre-save hook
      user.passwordConfirm = newPassword;
      await user.save();

      res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
      console.error("Change Password Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to change password" });
    }
  },

  /**
   * @desc    Forgot password - send reset link
   * @route   POST /api/v1/auth/forgot-password
   * @access  Public
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate raw token and hash it
      const resetToken = generatePasswordResetToken();
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Send reset email with plain token
      await sendPasswordResetEmail(user.email, resetToken);

      res.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (err) {
      console.error("Forgot Password Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to process request" });
    }
  },

  /**
   * @desc    Reset password
   * @route   POST /api/v1/auth/reset-password
   * @access  Public
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match" });
      }

      // Hash token to match DB
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
      }

      // Update password (pre-save hook will hash it)
      user.password = newPassword;
      user.passwordConfirm = confirmPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // ✅ Send success email
      await sendPasswordResetSuccessEmail(user.email);

      // Optionally log in immediately
      const tokenJWT = await user.generateAuthToken();

      res.json({
        success: true,
        message: "Password has been reset",
        token: tokenJWT,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("Reset Password Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to reset password" });
    }
  },
};