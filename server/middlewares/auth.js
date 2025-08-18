const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { logSecurityEvent } = require('../utils/securityLogger');

const authenticate = async (req, res, next) => {
  try {
    // 1. Check for token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      logSecurityEvent('AUTH_MISSING_TOKEN', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user exists
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });

    if (!user) {
      logSecurityEvent('AUTH_INVALID_TOKEN', {
        userId: decoded._id,
        token
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // 4. Check if password changed after token issued
    if (user.changedPasswordAfter(decoded.iat)) {
      logSecurityEvent('AUTH_PASSWORD_CHANGED', {
        userId: user._id
      });
      return res.status(401).json({
        success: false,
        error: 'Password was changed. Please log in again.'
      });
    }

    // 5. Check 2FA if required
    if (user.twoFactorEnabled && !decoded.twoFactorVerified) {
      return res.status(401).json({
        success: false,
        error: 'Two-factor authentication required',
        requires2FA: true
      });
    }

    // 6. Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    logSecurityEvent('AUTH_ERROR', {
      error: err.message,
      stack: err.stack
    });
    
    let errorMessage = 'Authentication failed';
    if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    }

    res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logSecurityEvent('AUTH_UNAUTHORIZED_ROLE', {
        userId: req.user._id,
        attemptedRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({
        success: false,
        error: `Access restricted to: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles
};