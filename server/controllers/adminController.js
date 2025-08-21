// server/controllers/adminController.js
const User = require('../models/user');
const Course = require('../models/Course');

module.exports = {
  // @route   GET /api/v1/admin/users
  // @desc    List all users
  // @access  Admin only
  async listUsers(req, res) {
    try {
      const users = await User.find({})
        .select('-password -tokens');
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/users
  // @desc    Create new user
  // @access  Admin only
  async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   GET /api/v1/admin/users/:userId
  // @desc    Get single user
  // @access  Admin only
  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.userId)
        .select('-password -tokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   PUT /api/v1/admin/users/:userId
  // @desc    Update user
  // @access  Admin only
  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      ).select('-password -tokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   DELETE /api/v1/admin/users/:userId
  // @desc    Delete user
  // @access  Admin only
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   GET /api/v1/admin/status
  // @desc    Get system status
  // @access  Admin only
  async getStatus(req, res) {
    try {
      const stats = {
        users: await User.countDocuments(),
        courses: await Course.countDocuments(),
        uptime: process.uptime()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // @route   POST /api/v1/admin/maintenance
  // @desc    Toggle maintenance mode
  // @access  Admin only
  async toggleMaintenance(req, res) {
    try {
      // Example maintenance mode toggle
      const { enabled } = req.body;
      // TODO: persist this setting somewhere (DB, config service, etc.)
      
      res.json({
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};
