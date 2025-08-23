const User = require('../models/user');
const { logSecurityEvent } = require('../utils/securityLogger');
const emailService = require('../services/emailService');
const { generatePasswordResetToken } = require('../services/authService');

const sendEmail = emailService.sendEmail;

const userController = {
  // List all users (admin only)
  listUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      
      const filter = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter)
        .select('-tokens -securityQuestions -twoFactorSecret')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: {
          total: count,
          page: +page,
          limit: +limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // Create new user (admin only)
  createUser: async (req, res, next) => {
    try {
      const { email, password, role, ...rest } = req.body;
      
      // Check if email exists
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }

      const user = new User({
        email,
        password,
        role: role || 'student',
        ...rest
      });

      await user.save();

      // Send welcome email
      await sendEmail({
        to: user.email,
        subject: 'Your account has been created',
        template: 'welcome',
        context: {
          name: user.name,
          role: user.role
        }
      });

      res.status(201).json({
        success: true,
        data: user.toObject()
      });
    } catch (err) {
      next(err);
    }
  },

  // Get user details
  getUser: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('-tokens -securityQuestions -twoFactorSecret');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  },

  // Update user
  updateUser: async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'email', 'role', 'isActive'];
      const isValidOperation = updates.every(update => 
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({
          success: false,
          error: 'Invalid updates'
        });
      }

      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      updates.forEach(update => user[update] = req.body[update]);
      await user.save();

      res.json({
        success: true,
        data: user.toObject()
      });
    } catch (err) {
      next(err);
    }
  },

  // Delete user
  deleteUser: async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Log deletion
      logSecurityEvent('USER_DELETED', {
        deletedBy: req.user._id,
        deletedUser: user._id
      });

      res.json({
        success: true,
        data: { message: 'User deleted successfully' }
      });
    } catch (err) {
      next(err);
    }
  },

  // Reset password (admin-initiated)
  resetUserPassword: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const tempPassword = generateTempPassword();
      user.password = tempPassword;
      await user.save();

      // Send email with temp password
      await sendEmail({
        to: user.email,
        subject: 'Your password has been reset',
        template: 'password-reset',
        context: {
          name: user.name,
          tempPassword
        }
      });

      res.json({
        success: true,
        data: { message: 'Password reset email sent' }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;