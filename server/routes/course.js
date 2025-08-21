const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate } = require('../middlewares/auth');

// @route   GET /api/v1/courses
// @desc    Get all courses (listing only)
// @access  Public
router.get('/', courseController.listCourses);

// @route   GET /api/v1/courses/:id/content
// @desc    Get full course content
// @access  Public (can restrict later)
router.get('/:id/content', courseController.getCourseContent);

// @route   POST /api/v1/courses
// @desc    Create a new course
// @access  Private (Instructor/Admin)
router.post('/', authenticate, courseController.createCourse);

// @route   PUT /api/v1/courses/:id
// @desc    Update course
// @access  Private (Instructor/Admin)
router.put('/:id', authenticate, courseController.updateCourse);

// @route   DELETE /api/v1/courses/:id
// @desc    Delete course
// @access  Private (Instructor/Admin)
router.delete('/:id', authenticate, courseController.deleteCourse);

// @route   POST /api/v1/courses/:id/enroll
// @desc    Enroll in course
// @access  Private (Student)
router.post('/:id/enroll', authenticate, courseController.enrollCourse);

// @route   POST /api/v1/courses/:id/reviews
// @desc    Add review
// @access  Private (Student)
router.post('/:id/reviews', authenticate, courseController.addReview);

module.exports = router;
