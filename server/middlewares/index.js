const { authenticate } = require('./auth');
const { authorizeAdmin } = require('./admin');
const { validate, validateJoi } = require('./validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

module.exports = {
  authenticate,
  authorizeAdmin,
  validate,
  validateJoi,
  adminLimiter
};