const AuditLog = require('../models/auditLog');
const { logSecurityEvent } = require('../utils/securityLogger');

const requestLogger = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      // Skip logging for these paths
      if (['/health', '/metrics'].includes(req.path)) return;
      
      const duration = Date.now() - start;
      
      await AuditLog.create({
        action: req.method,
        entity: req.path.split('/')[2] || 'system',
        entityId: req.params.id,
        performedBy: req.user?._id,
        metadata: {
          params: req.params,
          query: req.query,
          body: req.method === 'GET' ? undefined : req.body
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
        responseTime: duration
      });
      
      logSecurityEvent('REQUEST_COMPLETED', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration
      });
    } catch (err) {
      logSecurityEvent('AUDIT_LOG_FAILED', {
        error: err.message
      });
    }
  });
  
  next();
};

module.exports = requestLogger;