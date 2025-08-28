// routes/adminSettings.js
// Admin settings routes

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getPlatformSettings,
  updatePlatformSettings,
  getTimezoneInfoHandler,
  getCurrentNairobiTime
} = require('../controllers/settingsController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/v1/admin/settings
// @desc    Get platform settings
// @access  Admin only
router.get('/', getPlatformSettings);

// @route   PUT /api/v1/admin/settings
// @desc    Update platform settings
// @access  Admin only
router.put('/', updatePlatformSettings);

// @route   GET /api/v1/admin/settings/timezone
// @desc    Get timezone information
// @access  Admin only
router.get('/timezone', getTimezoneInfoHandler);

// @route   GET /api/v1/admin/settings/timezone/current
// @desc    Get current time in Nairobi timezone
// @access  Admin only
router.get('/timezone/current', getCurrentNairobiTime);

module.exports = router;
