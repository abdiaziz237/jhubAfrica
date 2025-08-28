const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { logSecurityEvent } = require('../utils/securityLogger');

const protect = async (req, res, next) => {
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
    const user = await User.findById(decoded._id);

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
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      logSecurityEvent('AUTH_PASSWORD_CHANGED', {
        userId: user._id
      });
      return res.status(401).json({
        success: false,
        error: 'Password was changed. Please log in again.'
      });
    }

    // 5. Check if user is active
    if (!user.isActive) {
      logSecurityEvent('AUTH_INACTIVE_USER', {
        userId: user._id
      });
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // 6. Attach user info to request
    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;

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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      logSecurityEvent('AUTH_UNAUTHORIZED_ROLE', {
        userId: req.userId,
        attemptedRole: req.userRole,
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

// Legacy function names for backward compatibility
const authenticate = protect;
const authorizeRoles = authorize;

module.exports = {
  protect,
  authorize,
  authenticate,
  authorizeRoles
};