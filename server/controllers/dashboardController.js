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
        totalUsers: await User.countDocuments(),
        totalCourses: await Course.countDocuments(),
        totalEnrollments: 0, // Will be implemented when Enrollment model is ready
        totalRevenue: 0, // Will be implemented when payment system is ready
        activeUsers: await User.countDocuments({ isActive: true }),
        pendingCourses: await Course.countDocuments({ status: 'pending' })
      };

      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics
   * @desc    Get comprehensive analytics data
   * @access  Admin only
   */
  async getAnalytics(req, res, next) {
    try {
      const { period = '12months' } = req.query;
      
      // Get user growth data
      const userGrowth = await getUserGrowthData(period);
      
      // Get course performance data
      const coursePerformance = await getCoursePerformanceData();
      
      // Get revenue data (if you have payment tracking)
      const revenueData = await getRevenueData();
      
      // Get geographic data
      const geographicData = await getGeographicData();
      
      // Get real-time stats
      const realTimeStats = await getRealTimeStats();

      res.json({
        success: true,
        data: {
          userGrowth,
          coursePerformance,
          revenueData,
          geographicData,
          realTimeStats
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/user-growth
   * @desc    Get user growth analytics
   * @access  Admin only
   */
  async getUserGrowth(req, res, next) {
    try {
      const { period = '12months' } = req.query;
      const userGrowth = await getUserGrowthData(period);
      
      res.json({ success: true, data: userGrowth });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/course-performance
   * @desc    Get course performance analytics
   * @access  Admin only
   */
  async getCoursePerformance(req, res, next) {
    try {
      const coursePerformance = await getCoursePerformanceData();
      
      res.json({ success: true, data: coursePerformance });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/revenue
   * @desc    Get revenue analytics
   * @access  Admin only
   */
  async getRevenue(req, res, next) {
    try {
      const revenueData = await getRevenueData();
      
      res.json({ success: true, data: revenueData });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/geographic
   * @desc    Get geographic analytics
   * @access  Admin only
   */
  async getGeographic(req, res, next) {
    try {
      const geographicData = await getGeographicData();
      
      res.json({ success: true, data: geographicData });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/real-time
   * @desc    Get real-time system stats
   * @access  Admin only
   */
  async getRealTimeStats(req, res, next) {
    try {
      const realTimeStats = await getRealTimeStats();
      
      res.json({ success: true, data: realTimeStats });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/dashboard/user/activity
   * @desc    Get user-specific activity and progress
   * @access  Private
   */
  async getUserActivity(req, res, next) {
    try {
      const userId = req.user.id;
      const Enrollment = require('../models/Enrollment');
      
      // Get user's enrolled courses from Enrollment model
      const enrollments = await Enrollment.find({
        student: userId,
        status: { $in: ['active', 'completed'] }
      }).populate('course', 'title createdAt');
      
      const activities = [];
      
      // Add course enrollment activities
      if (enrollments && enrollments.length > 0) {
        enrollments.forEach(enrollment => {
          activities.push({
            id: `course_${enrollment.course._id}`,
            title: 'Course Enrolled',
            description: `Successfully enrolled in ${enrollment.course.title}`,
            points: 100,
            time: enrollment.enrollmentDate,
            icon: 'fas fa-book-open',
            color: '#2563eb',
            category: 'Progress',
            courseId: enrollment.course._id,
            progress: enrollment.progress,
            status: enrollment.status
          });
        });
      }

      // Add welcome activity for new users
      if (enrollments.length === 0) {
        activities.push({
          id: 'welcome',
          title: 'Welcome to JHUB!',
          description: 'Ready to start your learning journey? Browse our courses and get started!',
          points: 50,
          time: new Date(),
          icon: 'fas fa-star',
          color: '#f59e0b',
          category: 'Welcome'
        });
      }

      // Add profile completion activity if profile is complete
      const user = await User.findById(userId);
      if (user.profileComplete) {
        activities.push({
          id: 'profile_complete',
          title: 'Profile Complete',
          description: 'Your profile has been completed successfully',
          points: 25,
          time: user.updatedAt,
          icon: 'fas fa-user-check',
          color: '#10b981',
          category: 'Profile'
        });
      }

      // Sort activities by time (most recent first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      res.json({
        success: true,
        data: activities
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/v1/admin/recent-activity
   * @desc    Get recent system activity
   * @access  Admin only
   */
  async getRecentActivity(req, res, next) {
    try {
      // Get recent user registrations
      const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

      // Get recent course creations
      const recentCourses = await Course.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category createdAt');

      // Format activity data
      const activities = [];

      // Add user activities
      recentUsers.forEach(user => {
        activities.push({
          icon: '👤',
          text: `New ${user.role} registered: ${user.name}`,
          time: user.createdAt.toLocaleDateString()
        });
      });

      // Add course activities
      recentCourses.forEach(course => {
        activities.push({
          icon: '📚',
          text: `New course created: ${course.title}`,
          time: course.createdAt.toLocaleDateString()
        });
      });

      // Sort by creation date (most recent first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      res.json(activities);
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

// Helper functions for analytics data
async function getUserGrowthData(period = '12months') {
  try {
    const months = period === '12months' ? 12 : 6;
    const userGrowth = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const totalUsers = await User.countDocuments({ createdAt: { $lte: endOfMonth } });
      const newUsers = await User.countDocuments({ 
        createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
      });
      
      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: totalUsers,
        newUsers: newUsers
      });
    }
    
    return userGrowth;
  } catch (error) {
    console.error('Error getting user growth data:', error);
    return [];
  }
}

async function getCoursePerformanceData() {
  try {
    const courses = await Course.find({}).select('title enrollments completionRate rating');
    
    return courses.map(course => ({
      name: course.title,
      enrollments: course.enrollments || 0,
      completion: course.completionRate || 0,
      rating: course.rating || 0
    }));
  } catch (error) {
    console.error('Error getting course performance data:', error);
    return [];
  }
}

async function getRevenueData() {
  try {
    // This would need to be implemented based on your payment system
    // For now, returning empty data structure
    return [];
  } catch (error) {
    console.error('Error getting revenue data:', error);
    return [];
  }
}

async function getGeographicData() {
  try {
    // This would need to be implemented based on your user location tracking
    // For now, returning empty data structure
    return [];
  } catch (error) {
    console.error('Error getting geographic data:', error);
    return [];
  }
}

async function getRealTimeStats() {
  try {
    const onlineUsers = await User.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } });
    const totalUsers = await User.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'active' });
    
    return {
      onlineUsers,
      totalUsers,
      activeCourses,
      systemLoad: process.cpuUsage().user / 1000000, // CPU usage in seconds
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // Memory usage in MB
      uptime: process.uptime(),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    return {
      onlineUsers: 0,
      totalUsers: 0,
      activeCourses: 0,
      systemLoad: 0,
      memoryUsage: 0,
      uptime: process.uptime(),
      lastUpdated: new Date()
    };
  }
}

module.exports = dashboardController;
