// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { logSecurityEvent } = require('../utils/securityLogger');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // 1. Check for presence of Authorization header
  if (!authHeader) {
    logSecurityEvent('MISSING_AUTH_HEADER', { ip: req.ip });
    return res.status(401).json({ 
      error: 'Authentication token required',
      code: 'UNAUTHENTICATED'
    });
  }

  // 2. Extract and verify token format
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    logSecurityEvent('INVALID_TOKEN_FORMAT', { ip: req.ip });
    return res.status(401).json({
      error: 'Invalid authorization format. Use: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT'
    });
  }

  const token = tokenParts[1];

  try {
    // 3. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Find active user with token
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
      isActive: true
    }).select('-password -tokens');

    if (!user) {
      logSecurityEvent('INVALID_TOKEN', { userId: decoded._id, ip: req.ip });
      throw new Error('Invalid or expired session');
    }

    // 5. Check if password was changed after token issued
    if (user.passwordChangedAfter(decoded.iat)) {
      logSecurityEvent('PASSWORD_CHANGED', { userId: user._id });
      throw new Error('Session expired. Please login again');
    }

    // 6. Attach user to request
    req.user = user;
    req.token = token;
    
    logSecurityEvent('AUTH_SUCCESS', { userId: user._id, role: user.role });
    next();
  } catch (error) {
    logSecurityEvent('AUTH_FAILED', { 
      error: error.message,
      token: token ? 'present' : 'missing',
      ip: req.ip
    });

    const statusCode = error.name === 'JsonWebTokenError' ? 401 : 403;
    res.status(statusCode).json({
      error: error.message,
      code: 'AUTHENTICATION_FAILED',
      action: statusCode === 401 ? 'reauthenticate' : 'forbidden'
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      userId: req.user._id,
      attemptedRoute: req.path,
      requiredRole: 'admin'
    });

    return res.status(403).json({
      error: 'Administrator privileges required',
      code: 'FORBIDDEN',
      requiredRole: 'admin'
    });
  }
  next();
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logSecurityEvent('ROLE_VIOLATION', {
        userId: req.user._id,
        attemptedRoute: req.path,
        userRole: req.user.role,
        requiredRoles: roles
      });

      return res.status(403).json({
        error: `Insufficient privileges. Required roles: ${roles.join(', ')}`,
        code: 'FORBIDDEN',
        requiredRoles: roles
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeRole
};