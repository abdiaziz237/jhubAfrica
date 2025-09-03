const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');

// @route   GET /api/v1/users
// @desc    List all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorizeRole('admin'), userController.listUsers);

// @route   POST /api/v1/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorizeRole('admin'), userController.createUser);

// @route   GET /api/v1/users/:userId
// @desc    Get user details
// @access  Private/Admin
router.get('/:userId', authenticate, authorizeRole('admin'), userController.getUser);

// @route   PUT /api/v1/users/:userId
// @desc    Update user
// @access  Private/Admin
router.put('/:userId', authenticate, authorizeRole('admin'), userController.updateUser);

// @route   DELETE /api/v1/users/:userId
// @desc    Delete user
// @access  Private/Admin
router.delete('/:userId', authenticate, authorizeRole('admin'), userController.deleteUser);

// @route   POST /api/v1/users/:userId/reset-password
// @desc    Reset user password (admin initiated)
// @access  Private/Admin
router.post('/:userId/reset-password', authenticate, authorizeRole('admin'), userController.resetUserPassword);

module.exports = router;
