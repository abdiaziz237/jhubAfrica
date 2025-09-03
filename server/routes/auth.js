const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// ✅ Forgot/Reset Password routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.get('/referral-count', authenticate, authController.getReferralCount);
router.put('/update-profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/courses', authenticate, authController.getUserCourses);

module.exports = router;
