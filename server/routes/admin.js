// server/routes/admin.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  userController,
  courseController,
  dashboardController,
  adminController
} = require('../controllers');

// Middlewares
const { authenticate, authorizeAdmin, validateJoi } = require('../middlewares');

// Validation schemas
const { 
  registerUser, 
  updateUser,
  listUsersSchema,
  getUserSchema,
  deleteUserSchema
} = require('../validations/userValidations');

const {
  createCourse,
  updateCourse,
  listCoursesSchema,
  getCourseSchema,
  deleteCourseSchema
} = require('../validations/courseValidations');

const {
  maintenanceSchema
} = require('../validations/systemValidations');

const {
  activityQuerySchema
} = require('../validations/dashboardValidations');

// Clear all enrollments for testing (no auth required for testing)
router.delete('/clear-enrollments', async (req, res) => {
  try {
    console.log('🗑️ Admin: Clearing all enrollments for testing');
    
    const Enrollment = require('../models/Enrollment');
    
    // Count existing enrollments
    const existingCount = await Enrollment.countDocuments();
    console.log(`📊 Found ${existingCount} existing enrollments`);
    
    if (existingCount === 0) {
      return res.json({
        success: true,
        message: 'No enrollments to delete',
        deletedCount: 0
      });
    }
    
    // Delete all enrollments
    const result = await Enrollment.deleteMany({});
    
    console.log(`🗑️ Deleted ${result.deletedCount} enrollments`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} enrollments`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error clearing enrollments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear enrollments',
      message: error.message
    });
  }
});

// Protect all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

// No more pending verifications - system is purely email-based

/**
 * USER MANAGEMENT ROUTES
 */
router.route('/users')
  .get((req, res, next) => adminController.listUsers(req, res, next))
  .post((req, res, next) => adminController.createUser(req, res, next));

// No more pending verifications - system is purely email-based

router.route('/users/:userId')
  .get((req, res, next) => adminController.getUser(req, res, next))
  .put((req, res, next) => adminController.updateUser(req, res, next))
  .delete((req, res, next) => adminController.deleteUser(req, res, next));

// User status and role management
router.patch('/users/:userId/status', (req, res, next) => adminController.updateUserStatus(req, res, next));
router.patch('/users/:userId/role', (req, res, next) => adminController.updateUserRole(req, res, next));

// No more verification routes - system is purely email-based

/**
 * COURSE MANAGEMENT ROUTES
 */
router.route('/courses')
  .get((req, res, next) => adminController.listCourses(req, res, next))
  .post((req, res, next) => adminController.createCourse(req, res, next));

router.route('/courses/:courseId')
  .get((req, res, next) => adminController.getCourse(req, res, next))
  .put((req, res, next) => adminController.updateCourse(req, res, next))
  .delete((req, res, next) => adminController.deleteCourse(req, res, next));

// Cohort and Waitlist Management
router.get('/courses/:courseId/waitlist', adminController.getCourseWaitlist);
router.post('/courses/:courseId/start-cohort', adminController.startCohort);
router.post('/courses/:courseId/complete-cohort', adminController.completeCohort);
router.post('/courses/:courseId/open-cohort', adminController.openNewCohort);
router.put('/courses/:courseId/cohort-settings', adminController.updateCohortSettings);

/**
 * DASHBOARD ROUTES
 */
router.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next));
router.get('/recent-activity', (req, res, next) => dashboardController.getRecentActivity(req, res, next));

// Analytics routes
router.get('/dashboard/analytics', (req, res, next) => dashboardController.getAnalytics(req, res, next));
router.get('/dashboard/analytics/user-growth', (req, res, next) => dashboardController.getUserGrowth(req, res, next));
router.get('/dashboard/analytics/course-performance', (req, res, next) => dashboardController.getCoursePerformance(req, res, next));
router.get('/dashboard/analytics/revenue', (req, res, next) => dashboardController.getRevenue(req, res, next));
router.get('/dashboard/analytics/geographic', (req, res, next) => dashboardController.getGeographic(req, res, next));
router.get('/dashboard/analytics/real-time', (req, res, next) => dashboardController.getRealTimeStats(req, res, next));

// Commented out until ActivityLog model is implemented
// router.get('/dashboard/activity',
//   validate(activityQuerySchema),
//   (req, res, next) => dashboardController.getActivity(req, res, next)
// );

/**
 * COURSE INTEREST MANAGEMENT ROUTES
 */
router.route('/course-interests')
  .get((req, res, next) => adminController.getCourseInterests(req, res, next));

router.route('/course-interests/:id')
  .put((req, res, next) => adminController.updateCourseInterest(req, res, next))
  .delete((req, res, next) => adminController.deleteCourseInterest(req, res, next));

// Add route for updating course interest status
router.patch('/course-interests/:id/status', (req, res, next) => adminController.updateCourseInterestStatus(req, res, next));

/**
 * SYSTEM MANAGEMENT ROUTES
 */
router.get('/system/status', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
    
    // Check API status (if we're here, API is online)
    const apiStatus = 'online';
    
    // Check if maintenance mode is active (you can implement this based on your needs)
    const maintenanceMode = false; // This could come from environment variables or database
    
    res.json({
      success: true,
      database: dbStatus,
      api: apiStatus,
      maintenance: maintenanceMode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System status check error:', error);
    res.status(500).json({
      success: false,
      database: 'offline',
      api: 'offline',
      maintenance: false,
      error: error.message
    });
  }
});

router.post('/system/maintenance', async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    // Here you would typically update a database setting or environment variable
    // For now, we'll just return success
    res.json({
      success: true,
      maintenance: enabled,
      message: message || 'Maintenance mode updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Maintenance mode toggle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle maintenance mode'
    });
  }
});

router.get('/system/logs', async (req, res) => {
  try {
    // This would typically fetch logs from your logging system
    // For now, return a placeholder
    res.json({
      success: true,
      logs: [],
      message: 'Log system not implemented yet'
    });
  } catch (error) {
    console.error('System logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system logs'
    });
  }
});

router.get('/system/backup', async (req, res) => {
  try {
    // This would typically trigger a backup process
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Backup system not implemented yet'
    });
  } catch (error) {
    console.error('System backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger backup'
    });
  }
});

/**
 * CONTENT MANAGEMENT ROUTES
 */
router.get('/content/pages', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Content management system not implemented yet',
      data: []
    });
  } catch (error) {
    console.error('Content pages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content pages'
    });
  }
});

router.get('/content/media', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Media library not implemented yet',
      data: []
    });
  } catch (error) {
    console.error('Media library error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media library'
    });
  }
});

router.get('/content/blogs', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Blog system not implemented yet',
      data: []
    });
  } catch (error) {
    console.error('Blog system error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
});

router.get('/content/announcements', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Announcement system not implemented yet',
      data: []
    });
  } catch (error) {
    console.error('Announcement system error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements'
    });
  }
});

/**
 * ENROLLMENT MANAGEMENT ROUTES
 */
router.get('/enrollments', async (req, res) => {
  try {
    const { filter, page = 1, limit = 10, search } = req.query;
    console.log('📊 Admin: Fetching enrollments with filter:', filter);
    
    const Enrollment = require('../models/Enrollment');
    const User = require('../models/user');
    const Course = require('../models/Course');
    
    // Build query based on filter
    let query = {};
    if (filter && filter !== 'all') {
      query.status = filter;
    }
    
    // Add search functionality
    if (search) {
      // We'll need to populate and search by user name or course title
      const searchQuery = { $or: [] };
      // This will be handled after population
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch enrollments with population
    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title description category image points duration')
      .sort({ enrollmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalEnrollments = await Enrollment.countDocuments(query);
    
    // Apply search filter if provided
    let filteredEnrollments = enrollments;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEnrollments = enrollments.filter(enrollment => 
        enrollment.student?.name?.toLowerCase().includes(searchLower) ||
        enrollment.student?.email?.toLowerCase().includes(searchLower) ||
        enrollment.course?.title?.toLowerCase().includes(searchLower)
      );
    }
    
    // Format the response
    const formattedEnrollments = filteredEnrollments.map(enrollment => ({
      _id: enrollment._id,
      student: {
        _id: enrollment.student?._id,
        name: enrollment.student?.name || 'Unknown User',
        email: enrollment.student?.email || 'No email'
      },
      course: {
        _id: enrollment.course?._id,
        title: enrollment.course?.title || 'Unknown Course',
        description: enrollment.course?.description,
        category: enrollment.course?.category,
        image: enrollment.course?.image,
        points: enrollment.course?.points,
        duration: enrollment.course?.duration
      },
      status: enrollment.status,
      progress: enrollment.progress || 0,
      enrollmentDate: enrollment.enrollmentDate || enrollment.createdAt,
      lastAccessed: enrollment.lastAccessed,
      createdAt: enrollment.createdAt
    }));
    
    console.log('📊 Admin: Found enrollments:', formattedEnrollments.length);
    
    res.json({
      success: true,
      data: formattedEnrollments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEnrollments / parseInt(limit)),
        totalItems: totalEnrollments,
        itemsPerPage: parseInt(limit)
      },
      filter: filter || 'all'
    });
    
  } catch (error) {
    console.error('Enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollments',
      message: error.message
    });
  }
});

router.get('/enrollments/analytics', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching enrollment analytics');
    
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');
    const User = require('../models/user');
    
    // Get enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const cancelledEnrollments = await Enrollment.countDocuments({ status: 'cancelled' });
    
    // Get enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEnrollments = await Enrollment.countDocuments({
      enrollmentDate: { $gte: thirtyDaysAgo }
    });
    
    // Get top courses by enrollment
    const topCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: '$course',
          enrollmentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$courseData.title',
          enrollmentCount: 1
        }
      },
      {
        $sort: { enrollmentCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get enrollment completion rates
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;
    
    const analytics = {
      overview: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        cancelledEnrollments,
        recentEnrollments,
        completionRate
      },
      topCourses,
      trends: {
        last30Days: recentEnrollments,
        completionRate
      }
    };
    
    console.log('📊 Admin: Enrollment analytics calculated');
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Enrollment analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollment analytics',
      message: error.message
    });
  }
});

/**
 * SETTINGS MANAGEMENT ROUTES
 */
router.get('/settings', async (req, res) => {
  try {
    // This would typically fetch settings from your database
    // For now, return default settings
    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: {
        general: {
          platformName: 'JHub Learning Platform',
          platformDescription: 'Advanced learning management system',
          contactEmail: 'admin@jhub.com',
          supportPhone: '+1-555-0123',
          timezone: 'UTC',
          language: 'en',
          maintenanceMode: false,
          maintenanceMessage: 'Platform is under maintenance. Please check back later.'
        },
        security: {
          passwordMinLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          lockoutDuration: 900,
          twoFactorRequired: false
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: 'noreply@jhub.com',
          fromName: 'JHub Platform',
          emailVerificationRequired: true,
          notificationEmails: true
        },
        integrations: {
          googleAnalytics: '',
          facebookPixel: '',
          stripeEnabled: false,
          paypalEnabled: false,
          zoomEnabled: false
        },
        system: {
          maxFileSize: 10,
          allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
          backupFrequency: 'daily',
          backupRetention: 30,
          logLevel: 'info',
          autoUpdate: true,
          performanceMode: 'balanced',
          cacheEnabled: true,
          cdnEnabled: false
        }
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Here you would typically save settings to your database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

router.post('/settings/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    // Here you would typically send a test email
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: { to, subject, message },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});

/**
 * SYSTEM MANAGEMENT ROUTES
 */
router.get('/system/status', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
    
    // Check API status (if we're here, API is online)
    const apiStatus = 'online';
    
    // Check if maintenance mode is active (you can implement this based on your needs)
    const maintenanceMode = false; // This could come from environment variables or database
    
    res.json({
      success: true,
      database: dbStatus,
      api: apiStatus,
      maintenance: maintenanceMode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System status check error:', error);
    res.status(500).json({
      success: false,
      database: 'offline',
      api: 'offline',
      maintenance: false,
      error: error.message
    });
  }
});

router.post('/system/maintenance', async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    // Here you would typically update a database setting or environment variable
    // For now, we'll just return success
    res.json({
      success: true,
      maintenance: enabled,
      message: message || 'Maintenance mode updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Maintenance mode toggle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle maintenance mode'
    });
  }
});

router.get('/system/logs', async (req, res) => {
  try {
    // This would typically fetch logs from your logging system
    // For now, return a placeholder
    res.json({
      success: true,
      logs: [],
      message: 'Log system not implemented yet'
    });
  } catch (error) {
    console.error('System logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system logs'
    });
  }
});

router.get('/system/backup', async (req, res) => {
  try {
    // This would typically trigger a backup process
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Backup system not implemented yet'
    });
  } catch (error) {
    console.error('System backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger backup'
    });
  }
});

/**
 * TESTING ROUTES (for debugging)
 */
router.post('/test-user-creation', (req, res, next) => adminController.testUserCreation(req, res, next));

/**
 * ERROR HANDLING
 */
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: err.details || err.message
    });
  }

  if (err.name === 'MongoError') {
    return res.status(400).json({
      success: false,
      error: 'Database error',
      details: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;
