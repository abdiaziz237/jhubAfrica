const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/securityLogger');
const { sendEmail } = require('./emailService');

const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}&id=${user._id}`;
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl,
        expiresIn: '10 minutes'
      }
    });

    logSecurityEvent('PASSWORD_RESET_EMAIL_SENT', {
      userId: user._id,
      email: user.email
    });
  } catch (err) {
    logSecurityEvent('PASSWORD_RESET_EMAIL_FAILED', {
      userId: user._id,
      error: err.message
    });
    throw err;
  }
};

const sendPasswordChangedEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      template: 'password-changed',
      context: {
        name: user.name,
        timestamp: new Date().toLocaleString()
      }
    });
  } catch (err) {
    logSecurityEvent('PASSWORD_CHANGE_EMAIL_FAILED', {
      userId: user._id,
      error: err.message
    });
  }
};

module.exports = {
  generatePasswordResetToken,
  hashToken,
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};