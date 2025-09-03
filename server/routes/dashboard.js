const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');

// User dashboard routes (authenticated users)
router.get('/user/courses', authenticate, dashboardController.getUserCourses);
router.get('/user/activity', authenticate, dashboardController.getUserActivity);

module.exports = router;