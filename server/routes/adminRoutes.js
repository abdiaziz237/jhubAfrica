const express = require('express');
const router = express.Router();

// Import controllers - SINGLE IMPORT to avoid duplication
const {
  userController,
  courseController,
  dashboardController,
  adminController
} = require('../controllers');

// Debug: Verify controller methods are available
console.log('Admin Controller Methods:', adminController ? Object.keys(adminController) : 'Controller not found');
console.log('Course Controller Methods:', courseController ? Object.keys(courseController) : 'Controller not found');

// Import middlewares
const { authenticate, authorizeAdmin, validate } = require('../middlewares');

// Import validation schemas
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

// Global middleware for all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * USER MANAGEMENT ROUTES
 */
router.route('/users')
  .get(
    validate(listUsersSchema),
    (req, res, next) => {
      if (!adminController || !adminController.listUsers) {
        console.error('adminController.listUsers is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return adminController.listUsers(req, res, next);
    }
  )
  .post(
    validate(registerUser),
    (req, res, next) => {
      if (!adminController || !adminController.createUser) {
        console.error('adminController.createUser is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return adminController.createUser(req, res, next);
    }
  );

router.route('/users/:userId')
  .get(
    validate(getUserSchema),
    (req, res, next) => {
      if (!adminController || !adminController.getUser) {
        console.error('adminController.getUser is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return adminController.getUser(req, res, next);
    }
  )
  .put(
    validate(updateUser),
    (req, res, next) => {
      if (!adminController || !adminController.updateUser) {
        console.error('adminController.updateUser is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return adminController.updateUser(req, res, next);
    }
  )
  .delete(
    validate(deleteUserSchema),
    (req, res, next) => {
      if (!adminController || !adminController.deleteUser) {
        console.error('adminController.deleteUser is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return adminController.deleteUser(req, res, next);
    }
  );

/**
 * COURSE MANAGEMENT ROUTES
 */
router.route('/courses')
  .get(
    validate(listCoursesSchema),
    (req, res, next) => {
      if (!courseController || !courseController.listCourses) {
        console.error('courseController.listCourses is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return courseController.listCourses(req, res, next);
    }
  )
  .post(
    validate(createCourse),
    (req, res, next) => {
      if (!courseController || !courseController.createCourse) {
        console.error('courseController.createCourse is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return courseController.createCourse(req, res, next);
    }
  );

router.route('/courses/:courseId')
  .get(
    validate(getCourseSchema),
    (req, res, next) => {
      if (!courseController || !courseController.getCourse) {
        console.error('courseController.getCourse is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return courseController.getCourse(req, res, next);
    }
  )
  .put(
    validate(updateCourse),
    (req, res, next) => {
      if (!courseController || !courseController.updateCourse) {
        console.error('courseController.updateCourse is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return courseController.updateCourse(req, res, next);
    }
  )
  .delete(
    validate(deleteCourseSchema),
    (req, res, next) => {
      if (!courseController || !courseController.deleteCourse) {
        console.error('courseController.deleteCourse is undefined');
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error - controller method missing' 
        });
      }
      return courseController.deleteCourse(req, res, next);
    }
  );

/**
 * DASHBOARD ROUTES
 */
router.get('/dashboard/stats', 
  (req, res, next) => {
    if (!dashboardController || !dashboardController.getStats) {
      console.error('dashboardController.getStats is undefined');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error - controller method missing' 
      });
    }
    return dashboardController.getStats(req, res, next);
  }
);

router.get('/dashboard/activity',
  validate(activityQuerySchema),
  (req, res, next) => {
    if (!dashboardController || !dashboardController.getActivity) {
      console.error('dashboardController.getActivity is undefined');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error - controller method missing' 
      });
    }
    return dashboardController.getActivity(req, res, next);
  }
);

/**
 * SYSTEM MANAGEMENT ROUTES
 */
router.get('/system/status',
  (req, res, next) => {
    if (!adminController || !adminController.getStatus) {
      console.error('adminController.getStatus is undefined');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error - controller method missing' 
      });
    }
    return adminController.getStatus(req, res, next);
  }
);

router.post('/system/maintenance',
  validate(maintenanceSchema),
  (req, res, next) => {
    if (!adminController || !adminController.toggleMaintenance) {
      console.error('adminController.toggleMaintenance is undefined');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error - controller method missing' 
      });
    }
    return adminController.toggleMaintenance(req, res, next);
  }
);

// Error handling middleware
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