const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// @route   GET /api/v1/users
// @desc    List all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorizeRoles, userController.listUsers);

// @route   POST /api/v1/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/', authenticate, authorizeRoles, userController.createUser);

// @route   GET /api/v1/users/:userId
// @desc    Get user details
// @access  Private/Admin
router.get('/:userId', authenticate, authorizeRoles, userController.getUser);

// @route   PUT /api/v1/users/:userId
// @desc    Update user
// @access  Private/Admin
router.put('/:userId', authenticate, authorizeRoles, userController.updateUser);

// @route   DELETE /api/v1/users/:userId
// @desc    Delete user
// @access  Private/Admin
router.delete('/:userId', authenticate, authorizeRoles, userController.deleteUser);

// @route   POST /api/v1/users/:userId/reset-password
// @desc    Reset user password (admin initiated)
// @access  Private/Admin
router.post('/:userId/reset-password', authenticate, authorizeRoles, userController.resetUserPassword);

module.exports = router;
