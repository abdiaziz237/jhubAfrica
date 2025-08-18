const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { logSecurityEvent } = require('../utils/securityLogger');

const generateSecret = () => {
  return speakeasy.generateSecret({
    length: 20,
    name: process.env.APP_NAME,
    issuer: process.env.APP_NAME
  });
};

const generateQRCode = async (secret) => {
  try {
    return await QRCode.toDataURL(secret.otpauth_url);
  } catch (err) {
    logSecurityEvent('2FA_QRCODE_FAILED', {
      error: err.message
    });
    throw err;
  }
};

const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token,
    window: 1
  });
};

const sendBackupCodes = async (user, codes) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Your Two-Factor Backup Codes',
      template: '2fa-backup-codes',
      context: {
        name: user.name,
        codes: codes.join('\n')
      }
    });

    logSecurityEvent('2FA_BACKUP_CODES_SENT', {
      userId: user._id
    });
  } catch (err) {
    logSecurityEvent('2FA_BACKUP_CODES_FAILED', {
      userId: user._id,
      error: err.message
    });
  }
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  sendBackupCodes
};