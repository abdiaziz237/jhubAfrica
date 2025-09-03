// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication token required'
      });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    const token = tokenParts[1];
    // console.log('🔍 Token received:', token.substring(0, 20) + '...');

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('🔍 JWT decoded:', { userId: decoded._id, email: decoded.email });

    // Find user by ID (handle both _id and userId fields)
    const userId = decoded._id || decoded.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      // console.log('🔍 User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if password was changed after token issued
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      // console.log('🔍 Password changed after token issued');
      return res.status(401).json({ error: 'Session expired. Please login again' });
    }

    // console.log('🔍 User authenticated:', { id: user._id, email: user.email, role: user.role });

    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('🔍 Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Administrator privileges required'
    });
  }
  next();
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Insufficient privileges. Required roles: ${roles.join(', ')}`
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