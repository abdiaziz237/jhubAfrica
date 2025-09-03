// controllers/dashboardController.js
const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const CourseInterest = require('../models/CourseInterest');

const dashboardController = {
  /**
   * @route   GET /api/v1/dashboard/user/courses
   * @desc    Get user's enrolled courses and approved interests
   * @access  Private
   */
  async getUserCourses(req, res) {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      // Get enrolled courses
      const enrollments = await Enrollment.find({
        student: userId
      }).populate({
        path: 'course',
        select: 'title description category image points duration status'
      });
      
      const enrolledCourses = enrollments
        .filter(enrollment => enrollment.course && enrollment.course._id)
        .map(enrollment => ({
          ...enrollment.course.toObject(),
          enrollmentId: enrollment._id,
          enrollmentStatus: enrollment.status,
          progress: enrollment.progress || 0,
          enrollmentDate: enrollment.enrollmentDate,
          lastAccessed: enrollment.lastAccessed,
          approvedOnly: false
        }));

      // Get approved course interests
      let approvedInterests = [];
      
      if (req.user.email) {
        try {
          approvedInterests = await CourseInterest.find({
            email: req.user.email,
            status: 'approved'
          }).populate('courseId', 'title description category image points duration status');
        } catch (interestError) {
          console.error('Error fetching approved interests:', interestError);
          approvedInterests = [];
        }
      }

      const approvedCourses = (approvedInterests || [])
        .filter(interest => interest.courseId && interest.courseId._id)
        .map(interest => ({
          ...interest.courseId.toObject(),
          enrollmentId: null,
          progress: 0,
          enrollmentDate: interest.responseDate || interest.updatedAt || interest.createdAt,
          lastAccessed: interest.updatedAt || interest.createdAt,
          approvedOnly: true,
          approvedInterestId: interest._id
        }));

      // Combine enrolled and approved (dedupe by course _id)
      const byCourseId = new Map();
      [...enrolledCourses, ...approvedCourses].forEach(c => {
        const key = (c._id || c.id || '').toString();
        if (!byCourseId.has(key)) byCourseId.set(key, c);
      });

      const myCourses = Array.from(byCourseId.values());
      
      console.log('🔍 Dashboard: Returning courses:', myCourses.length);
      console.log('🔍 Dashboard: Course titles:', myCourses.map(c => c.title));

      res.json({
        success: true,
        data: myCourses || []
      });
    } catch (err) {
      console.error('Error in getUserCourses:', err);
      res.status(500).json({
        success: false,
        message: 'Error fetching user courses',
        error: err.message
      });
    }
  },

  /**
   * @route   GET /api/v1/dashboard/user/activity
   * @desc    Get user-specific activity and progress
   * @access  Private
   */
  async getUserActivity(req, res) {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      console.log('🔍 Dashboard: Getting activity for user:', userId, req.user.email);
      
      // Get user's enrolled courses from Enrollment model
      const enrollments = await Enrollment.find({
        student: userId,
        status: { $in: ['active', 'completed'] }
      }).populate('course', 'title createdAt points');
      
      console.log('🔍 Dashboard: Found enrollments for activity:', enrollments.length);
      
      const activities = [];
      
      // Add course enrollment activities
      if (enrollments && enrollments.length > 0) {
        enrollments.forEach(enrollment => {
          if (enrollment.course && enrollment.course._id) {
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
          }
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

      console.log('✅ User activity retrieved successfully:', activities.length, 'activities');
      
      res.json({
        success: true,
        data: activities
      });
    } catch (err) {
      console.error('❌ Error getting user activity:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get user activity',
        error: err.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/stats
   * @desc    Get admin dashboard statistics
   * @access  Private (Admin only)
   */
  async getStats(req, res) {
    try {
      console.log('📊 Admin: Getting dashboard statistics');
      
      // Get total users
      const totalUsers = await User.countDocuments();
      
      // Get total courses
      const totalCourses = await Course.countDocuments();
      
      // Get total enrollments
      const totalEnrollments = await Enrollment.countDocuments();
      
      // Get active users (users with recent activity - fallback to all users if no lastLogin field)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await User.countDocuments({
        $or: [
          { lastLogin: { $gte: thirtyDaysAgo } },
          { lastLogin: { $exists: false } } // Include users without lastLogin field
        ]
      });
      
      // Get pending courses (courses with status 'draft' or 'pending')
      const pendingCourses = await Course.countDocuments({
        status: { $in: ['draft', 'pending'] }
      });
      
      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth }
      });
      
      // Calculate course completion rate
      const completedEnrollments = await Enrollment.countDocuments({
        status: 'completed'
      });
      const courseCompletionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100) 
        : 0;
      
      // Calculate total revenue (placeholder - you can implement actual revenue calculation)
      const totalRevenue = 0; // This would be calculated from actual payments
      
      // Get enrollment status breakdown
      const activeEnrollments = await Enrollment.countDocuments({
        status: 'active'
      });
      const completedEnrollmentsCount = await Enrollment.countDocuments({
        status: 'completed'
      });
      
      const stats = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        activeUsers,
        pendingCourses,
        newUsersThisMonth,
        courseCompletionRate,
        activeEnrollments,
        completedEnrollments: completedEnrollmentsCount,
        enrollmentStatus: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollmentsCount,
          message: totalEnrollments > 0 ? `${activeEnrollments} active, ${completedEnrollmentsCount} completed` : 'No enrollments yet'
        }
      };
      
      console.log('📊 Admin: Stats calculated:', stats);
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get admin statistics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/recent-activity
   * @desc    Get recent activity for admin dashboard
   * @access  Private (Admin only)
   */
  async getRecentActivity(req, res) {
    try {
      console.log('📊 Admin: Getting recent activity');
      
      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt role');
      
      // Get recent course enrollments
      const recentEnrollments = await Enrollment.find()
        .populate('student', 'name email')
        .populate('course', 'title')
        .sort({ enrollmentDate: -1 })
        .limit(5);
      
      // Get recent course interests
      const recentInterests = await CourseInterest.find()
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(5);
      
      const activity = [
        ...recentUsers.map(user => ({
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.name} (${user.email}) registered`,
          timestamp: user.createdAt,
          formattedDate: new Date(user.createdAt).toLocaleDateString(),
          formattedTime: new Date(user.createdAt).toLocaleTimeString(),
          user: user.name,
          icon: 'fas fa-user-plus',
          color: '#10b981'
        })),
        ...recentEnrollments.map(enrollment => ({
          type: 'course_enrollment',
          title: 'Course Enrollment',
          description: `${enrollment.student?.name} enrolled in ${enrollment.course?.title}`,
          timestamp: enrollment.enrollmentDate || enrollment.createdAt,
          formattedDate: new Date(enrollment.enrollmentDate || enrollment.createdAt).toLocaleDateString(),
          formattedTime: new Date(enrollment.enrollmentDate || enrollment.createdAt).toLocaleTimeString(),
          user: enrollment.student?.name,
          course: enrollment.course?.title,
          icon: 'fas fa-graduation-cap',
          color: '#3b82f6'
        })),
        ...recentInterests.map(interest => ({
          type: 'course_interest',
          title: 'Course Interest Submitted',
          description: `${interest.email} expressed interest in ${interest.courseId?.title}`,
          timestamp: interest.createdAt,
          formattedDate: new Date(interest.createdAt).toLocaleDateString(),
          formattedTime: new Date(interest.createdAt).toLocaleTimeString(),
          user: interest.email,
          course: interest.courseId?.title,
          status: interest.status,
          icon: 'fas fa-heart',
          color: '#f59e0b'
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
      
      console.log('📊 Admin: Recent activity calculated:', activity.length, 'items');
      
      res.json({
        success: true,
        data: activity
      });
      
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent activity',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics
   * @desc    Get comprehensive analytics for admin dashboard
   * @access  Private (Admin only)
   */
  async getAnalytics(req, res) {
    try {
      console.log('📊 Admin: Getting comprehensive analytics');
      
      // Get user role distribution
      const userRoles = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      // Get course category distribution
      const courseStats = await Course.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      // Get enrollment status distribution
      const enrollmentStats = await Enrollment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      const analytics = {
        userRoles,
        courseStats,
        enrollmentStats,
        totalUsers: await User.countDocuments(),
        totalCourses: await Course.countDocuments(),
        totalEnrollments: await Enrollment.countDocuments(),
        totalCourseInterests: await CourseInterest.countDocuments(),
        timestamp: new Date()
      };
      
      res.json({
        success: true,
        data: analytics
      });
      
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/user-growth
   * @desc    Get user growth analytics
   * @access  Private (Admin only)
   */
  async getUserGrowth(req, res) {
    try {
      console.log('📊 Admin: Getting user growth analytics');
      
      const { period = '30days' } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '12months':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get user growth data by grouping users by creation date
      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        },
        {
          $project: {
            period: {
              $dateToString: {
                format: period === '12months' ? '%Y-%m' : '%m-%d',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day'
                  }
                }
              }
            },
            count: 1
          }
        }
      ]);
      
      // Return empty array if no data - no mock data
      
      res.json({
        success: true,
        data: userGrowth
      });
      
    } catch (error) {
      console.error('Error getting user growth:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user growth analytics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/course-performance
   * @desc    Get course performance analytics
   * @access  Private (Admin only)
   */
  async getCoursePerformance(req, res) {
    try {
      console.log('📊 Admin: Getting course performance analytics');
      
      // Get course performance data with enrollment counts and completion rates
      const coursePerformance = await Course.aggregate([
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'course',
            as: 'enrollments'
          }
        },
        {
          $project: {
            title: 1,
            category: 1,
            points: 1,
            duration: 1,
            status: 1,
            totalEnrollments: { $size: '$enrollments' },
            activeEnrollments: {
              $size: {
                $filter: {
                  input: '$enrollments',
                  cond: { $eq: ['$$this.status', 'active'] }
                }
              }
            },
            completedEnrollments: {
              $size: {
                $filter: {
                  input: '$enrollments',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            },
            averageProgress: {
              $avg: {
                $map: {
                  input: '$enrollments',
                  as: 'enrollment',
                  in: '$$enrollment.progress'
                }
              }
            }
          }
        },
        {
          $addFields: {
            enrollmentRate: {
              $cond: {
                if: { $gt: ['$totalEnrollments', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$completedEnrollments', '$totalEnrollments'] },
                        100
                      ]
                    },
                    1
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $sort: { totalEnrollments: -1 }
        }
      ]);
      
      // Return real data only - no mock data
      
      res.json({
        success: true,
        data: coursePerformance
      });
      
    } catch (error) {
      console.error('Error getting course performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course performance analytics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/revenue
   * @desc    Get revenue analytics
   * @access  Private (Admin only)
   */
  async getRevenue(req, res) {
    try {
      console.log('📊 Admin: Getting revenue analytics');
      
      const { period = '30days' } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '12months':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get revenue data based on enrollments (since we don't have payment data yet)
      const revenueData = await Enrollment.aggregate([
        {
          $match: {
            enrollmentDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'courseData'
          }
        },
        {
          $unwind: '$courseData'
        },
        {
          $group: {
            _id: {
              year: { $year: '$enrollmentDate' },
              month: { $month: '$enrollmentDate' },
              day: { $dayOfMonth: '$enrollmentDate' }
            },
            totalEnrollments: { $sum: 1 },
            estimatedRevenue: { $sum: { $multiply: ['$courseData.points', 10] } } // Estimate 10 KES per point
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        },
        {
          $project: {
            period: {
              $dateToString: {
                format: period === '12months' ? '%Y-%m' : '%m-%d',
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day'
                  }
                }
              }
            },
            totalEnrollments: 1,
            estimatedRevenue: 1
          }
        }
      ]);
      
      // Return real data only - no mock data
      
      res.json({
        success: true,
        data: revenueData
      });
      
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get revenue analytics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/geographic
   * @desc    Get geographic analytics
   * @access  Private (Admin only)
   */
  async getGeographic(req, res) {
    try {
      console.log('📊 Admin: Getting geographic analytics');
      
      // Get geographic data based on user locations
      const geographic = await User.aggregate([
        {
          $match: {
            location: { $exists: true, $ne: null, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$location',
            userCount: { $sum: 1 },
            enrollmentCount: { $sum: '$enrolledCourses' }
          }
        },
        {
          $sort: { userCount: -1 }
        },
        {
          $limit: 10
        }
      ]);
      
      // Return real data only - no mock data
      
      res.json({
        success: true,
        data: geographic
      });
      
    } catch (error) {
      console.error('Error getting geographic analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get geographic analytics',
        error: error.message
      });
    }
  },

  /**
   * @route   GET /api/v1/admin/dashboard/analytics/real-time
   * @desc    Get real-time statistics
   * @access  Private (Admin only)
   */
  async getRealTimeStats(req, res) {
    try {
      console.log('📊 Admin: Getting real-time stats');
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Get real-time statistics
      const realTimeStats = {
        onlineUsers: await User.countDocuments({
          lastLogin: { $gte: oneHourAgo }
        }),
        newUsersToday: await User.countDocuments({
          createdAt: { $gte: oneDayAgo }
        }),
        newEnrollmentsToday: await Enrollment.countDocuments({
          enrollmentDate: { $gte: oneDayAgo }
        }),
        activeEnrollments: await Enrollment.countDocuments({
          status: 'active',
          lastAccessed: { $gte: oneDayAgo }
        }),
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: now
      };
      
      res.json({
        success: true,
        data: realTimeStats
      });
      
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get real-time statistics',
        error: error.message
      });
    }
  }
};

module.exports = dashboardController;
