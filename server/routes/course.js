const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/category/:category', courseController.getCoursesByCategory);
router.get('/:id', courseController.getCourse);
router.post('/interest', courseController.submitCourseInterest);

// Protected routes
router.use(protect); // All routes below this require authentication

router.get('/enrolled', courseController.getEnrolledCourses);
router.get('/waitlisted', courseController.getWaitlistedCourses);
router.get('/interest/approved', courseController.getApprovedCourseInterests);
router.post('/:id/enroll', courseController.enrollInCourse);
router.delete('/:id/enroll', courseController.unenrollFromCourse);

// Waitlist routes
router.get('/:id/waitlist', courseController.getWaitlistStatus);
router.post('/:id/waitlist', courseController.joinWaitlist);
router.delete('/:id/waitlist', courseController.leaveWaitlist);

// Admin/Instructor only routes
router.post('/', authorize('admin', 'instructor'), courseController.createCourse);
router.put('/:id', authorize('admin', 'instructor'), courseController.updateCourse);
router.delete('/:id', authorize('admin', 'instructor'), courseController.deleteCourse);

module.exports = router;
