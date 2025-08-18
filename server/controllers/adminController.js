// server/controllers/adminController.js
const User = require('../models/user');
const Course = require('../models/Course');

module.exports = {
  // User Management
  async listUsers(req, res) {
    try {
      const users = await User.find({}).select('-password -tokens');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.userId).select('-password -tokens');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      ).select('-password -tokens');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // System Management
  async getStatus(req, res) {
    try {
      const stats = {
        users: await User.countDocuments(),
        courses: await Course.countDocuments(),
        uptime: process.uptime()
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async toggleMaintenance(req, res) {
    try {
      // Implement your maintenance mode logic here
      res.json({ message: 'Maintenance mode updated' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};