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
const { authenticate, authorizeAdmin, validate } = require('../middlewares');

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
  .get(validate(listUsersSchema), (req, res, next) => adminController.listUsers(req, res, next))
  .post(validate(registerUser), (req, res, next) => adminController.createUser(req, res, next));

router.route('/users/:userId')
  .get(validate(getUserSchema), (req, res, next) => adminController.getUser(req, res, next))
  .put(validate(updateUser), (req, res, next) => adminController.updateUser(req, res, next))
  .delete(validate(deleteUserSchema), (req, res, next) => adminController.deleteUser(req, res, next));

/**
 * COURSE MANAGEMENT ROUTES
 */
router.route('/courses')
  .get(validate(listCoursesSchema), (req, res, next) => courseController.listCourses(req, res, next))
  .post(validate(createCourse), (req, res, next) => courseController.createCourse(req, res, next));

router.route('/courses/:courseId')
  .get(validate(getCourseSchema), (req, res, next) => courseController.getCourse(req, res, next))
  .put(validate(updateCourse), (req, res, next) => courseController.updateCourse(req, res, next))
  .delete(validate(deleteCourseSchema), (req, res, next) => courseController.deleteCourse(req, res, next));

/**
 * DASHBOARD ROUTES
 */
router.get('/dashboard/stats', (req, res, next) => dashboardController.getDashboardStats(req, res, next));

router.get('/dashboard/activity',
  validate(activityQuerySchema),
  (req, res, next) => dashboardController.getUserActivity(req, res, next)
);

/**
 * SYSTEM MANAGEMENT ROUTES
 */
router.get('/system/status', (req, res, next) => adminController.getStatus(req, res, next));

router.post('/system/maintenance',
  validate(maintenanceSchema),
  (req, res, next) => adminController.toggleMaintenance(req, res, next)
);

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
