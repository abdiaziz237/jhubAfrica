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

// Protect all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * USER MANAGEMENT ROUTES
 */
router.route('/users')
  .get((req, res, next) => adminController.listUsers(req, res, next))
  .post((req, res, next) => adminController.createUser(req, res, next));

router.route('/users/:userId')
  .get((req, res, next) => adminController.getUser(req, res, next))
  .put((req, res, next) => adminController.updateUser(req, res, next))
  .delete((req, res, next) => adminController.deleteUser(req, res, next));

// User status and role management
router.patch('/users/:userId/status', (req, res, next) => adminController.updateUserStatus(req, res, next));
router.patch('/users/:userId/role', (req, res, next) => adminController.updateUserRole(req, res, next));

// User verification routes
router.get('/users/pending-verification', (req, res, next) => adminController.getPendingVerifications(req, res, next));
router.patch('/users/:userId/verify', (req, res, next) => adminController.verifyUser(req, res, next));
router.get('/users/:userId/verification', (req, res, next) => adminController.getUserVerificationDetails(req, res, next));

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
router.get('/system/status', (req, res, next) => adminController.getStatus(req, res, next));

router.post('/system/maintenance',
  (req, res, next) => adminController.toggleMaintenance(req, res, next)
);

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
