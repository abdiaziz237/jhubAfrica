const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/category/:category', courseController.getCoursesByCategory);
router.post('/interest', courseController.submitCourseInterest);

// Specific routes that must come before /:id to avoid conflicts
router.get('/enrolled', authenticate, courseController.getEnrolledCourses);
router.get('/waitlisted', authenticate, courseController.getWaitlistedCourses);
router.get('/interest/approved', authenticate, courseController.getApprovedInterests);
router.post('/interest/:interestId/enroll', authenticate, courseController.enrollInApprovedCourse);

// Public route for getting specific course (must come after specific routes)
router.get('/:id', courseController.getCourse);

// Protected routes
router.use(authenticate); // All routes below this require authentication

// Waitlist routes
router.get('/:id/waitlist', courseController.getWaitlistStatus);
router.post('/:id/waitlist', courseController.joinWaitlist);
router.delete('/:id/waitlist', courseController.leaveWaitlist);

// Course enrollment routes
router.post('/:id/enroll', courseController.enrollInCourse);
router.delete('/:id/enroll', courseController.unenrollFromCourse);

// Admin/Instructor only routes
router.post('/', authorizeRole('admin', 'instructor'), courseController.createCourse);
router.put('/:id', authorizeRole('admin', 'instructor'), courseController.updateCourse);
router.delete('/:id', authorizeRole('admin', 'instructor'), courseController.deleteCourse);

module.exports = router;
