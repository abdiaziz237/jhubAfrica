const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../utils/securityLogger');

const createLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    },
    ...options
  });
};

// Specific limiters
const authLimiter = createLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login attempts, please try again later'
});

const passwordResetLimiter = createLimiter({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many password reset requests'
});

const apiLimiter = createLimiter({
  max: 200,
  windowMs: 15 * 60 * 1000
});

module.exports = {
  createLimiter,
  authLimiter,
  passwordResetLimiter,
  apiLimiter
};