// server/controllers/dashboardController.js
const User = require('../models/user');
const Course = require('../models/Course');

module.exports = {
  async getDashboardStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied' 
        });
      }

      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30*24*60*60*1000) } });
      const totalCourses = await Course.countDocuments();
      const newCourses = await Course.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } });

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalCourses,
          newCourses
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async getUserActivity(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied' 
        });
      }

      const users = await User.find()
        .sort({ lastLogin: -1 })
        .limit(10)
        .select('name email role lastLogin');

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
  }
};