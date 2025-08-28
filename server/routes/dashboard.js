const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// User dashboard activity (authenticated users)
router.get('/user/activity', authenticate, dashboardController.getUserActivity);

// Dashboard stats (admin only)
router.get('/stats', authenticate, authorizeAdmin, dashboardController.getStats);

// Recent system activity (admin only)
router.get('/activity', authenticate, authorizeAdmin, dashboardController.getActivity);

module.exports = router;