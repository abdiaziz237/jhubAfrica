const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Dashboard stats
router.get('/stats', authenticate, authorizeAdmin, dashboardController.getStats);

// Recent system activity
router.get('/activity', authenticate, authorizeAdmin, dashboardController.getActivity);

module.exports = router;