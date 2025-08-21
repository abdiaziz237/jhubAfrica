// controllers/dashboardController.js
const User = require('../models/user');
const Course = require('../models/Course');
// const ActivityLog = require('../models/ActivityLog'); // if you track user/course activity logs

const dashboardController = {
  /**
   * @route   GET /api/v1/admin/dashboard/stats
   * @desc    Get high-level system stats
   * @access  Admin only
   */
  async getStats(req, res, next) {
    try {
      const stats = {
        users: await User.countDocuments(),
        courses: await Course.countDocuments(),
        activeCourses: await Course.countDocuments({ status: 'active' }),
        uptime: process.uptime()
      };

      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/activity
   * @desc    Get recent system activity (audit trail, logins, course updates, etc.)
   * @access  Admin only
   */
  async getActivity(req, res, next) {
    try {
      const { page = 1, limit = 20, type, userId } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (userId) filter.user = userId;

      // Assuming you have an ActivityLog model (adjust if you store logs differently)
      const activities = await ActivityLog.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((page - 1) * Number(limit));

      const count = await ActivityLog.countDocuments(filter);

      res.json({
        success: true,
        data: activities,
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
  }
};

module.exports = dashboardController;
