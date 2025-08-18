const { logSecurityEvent } = require('../utils/securityLogger');

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logSecurityEvent('ADMIN_UNAUTHORIZED_ACCESS', {
      userId: req.user._id,
      attemptedPath: req.path,
      method: req.method
    });
    return res.status(403).json({
      success: false,
      error: 'Administrator privileges required'
    });
  }
  next();
};

const adminActionLogger = (req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    if (req.user && req.user.role === 'admin') {
      logSecurityEvent('ADMIN_ACTION', {
        adminId: req.user._id,
        action: `${req.method} ${req.path}`,
        statusCode: res.statusCode,
        body: req.body,
        params: req.params,
        query: req.query,
        response: data.success ? 'success' : 'failed'
      });
    }
    oldJson.call(res, data);
  };
  next();
};

module.exports = {
  authorizeAdmin,
  adminActionLogger
};