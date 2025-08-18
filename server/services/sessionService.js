const { logSecurityEvent } = require('../utils/securityLogger');

const getActiveSessions = async (user) => {
  try {
    return user.tokens.map(token => ({
      createdAt: token.createdAt,
      deviceInfo: {
        ip: token.ipAddress,
        browser: token.browser,
        os: token.os,
        location: token.location
      },
      current: token.token === req.token
    }));
  } catch (err) {
    logSecurityEvent('SESSION_FETCH_FAILED', {
      userId: user._id,
      error: err.message
    });
    throw err;
  }
};

const revokeSession = async (user, tokenId) => {
  try {
    user.tokens = user.tokens.filter(t => t._id.toString() !== tokenId);
    await user.save();
    
    logSecurityEvent('SESSION_REVOKED', {
      userId: user._id,
      tokenId
    });
  } catch (err) {
    logSecurityEvent('SESSION_REVOKE_FAILED', {
      userId: user._id,
      error: err.message
    });
    throw err;
  }
};

const revokeAllSessions = async (user) => {
  try {
    user.tokens = [];
    await user.save();
    
    logSecurityEvent('ALL_SESSIONS_REVOKED', {
      userId: user._id
    });
  } catch (err) {
    logSecurityEvent('SESSION_REVOKE_ALL_FAILED', {
      userId: user._id,
      error: err.message
    });
    throw err;
  }
};

module.exports = {
  getActiveSessions,
  revokeSession,
  revokeAllSessions
};