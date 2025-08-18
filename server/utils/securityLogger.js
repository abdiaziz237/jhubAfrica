// utils/securityLogger.js
const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, json, errors, metadata } = winston.format;

class SecurityLogger {
  constructor() {
    this.logtail = process.env.LOGTAIL_SOURCE_TOKEN
      ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
      : null;

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(
        errors({ stack: true }),
        metadata(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
      transports: this._getTransports(),
      exitOnError: false
    });

    this.alertThresholds = {
      failedLogins: 5,
      passwordResets: 3,
      accountLockouts: 2
    };

    this.counters = new Map();
  }

  _getTransports() {
    const transports = [
      // Console transport for development
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(info => {
            return `[SECURITY] ${info.timestamp} ${info.level}: ${info.message} ${JSON.stringify(info.metadata)}`;
          })
        ),
        silent: process.env.NODE_ENV === 'production'
      }),

      // Daily rotated file transport
      new DailyRotateFile({
        filename: path.join(__dirname, '../logs/security-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        auditFile: path.join(__dirname, '../logs/security-audit.json')
      })
    ];

    // Add Logtail transport if token exists (for cloud logging)
    if (this.logtail) {
      transports.push(new LogtailTransport(this.logtail));
    }

    return transports;
  }

  _incrementCounter(eventType) {
    const count = this.counters.get(eventType) || 0;
    this.counters.set(eventType, count + 1);
    return count + 1;
  }

  _checkAlertThreshold(eventType, count) {
    const threshold = this.alertThresholds[eventType];
    return threshold && count >= threshold;
  }

  async logEvent(eventType, metadata = {}) {
    const count = this._incrementCounter(eventType);
    const shouldAlert = this._checkAlertThreshold(eventType, count);

    const logData = {
      eventType,
      severity: this._getSeverityLevel(eventType),
      message: this._getEventMessage(eventType),
      ...metadata,
      count,
      shouldAlert
    };

    if (shouldAlert) {
      logData.alert = true;
      await this._triggerAlert(eventType, count, metadata);
    }

    this.logger.log({
      level: logData.severity,
      ...logData
    });

    return logData;
  }

  _getSeverityLevel(eventType) {
    const levels = {
      'LOGIN_SUCCESS': 'info',
      'LOGIN_FAILED': 'warn',
      'ACCOUNT_LOCKED': 'error',
      'PASSWORD_CHANGE': 'info',
      'PASSWORD_RESET_REQUEST': 'warn',
      'PASSWORD_RESET_SUCCESS': 'info',
      'PASSWORD_RESET_FAILED': 'error',
      'TOKEN_GENERATED': 'debug',
      'TOKEN_REVOKED': 'info',
      'UNAUTHORIZED_ACCESS': 'error',
      'ADMIN_ACTION': 'info'
    };
    return levels[eventType] || 'info';
  }

  _getEventMessage(eventType) {
    const messages = {
      'LOGIN_SUCCESS': 'User logged in successfully',
      'LOGIN_FAILED': 'Failed login attempt',
      'ACCOUNT_LOCKED': 'Account locked due to multiple failed attempts',
      'PASSWORD_CHANGE': 'Password changed',
      'PASSWORD_RESET_REQUEST': 'Password reset requested',
      'PASSWORD_RESET_SUCCESS': 'Password reset successful',
      'PASSWORD_RESET_FAILED': 'Password reset failed',
      'TOKEN_GENERATED': 'New auth token generated',
      'TOKEN_REVOKED': 'Auth token revoked',
      'UNAUTHORIZED_ACCESS': 'Unauthorized access attempt',
      'ADMIN_ACTION': 'Admin action performed'
    };
    return messages[eventType] || 'Security event occurred';
  }

  async _triggerAlert(eventType, count, metadata) {
    // Implement your alerting mechanism (Email, Slack, SMS, etc.)
    console.warn(`[SECURITY ALERT] ${eventType} occurred ${count} times`, metadata);
    
    // Example: Send email alert (implement your email service)
    if (process.env.SEND_SECURITY_ALERTS === 'true') {
      try {
        // await sendSecurityAlertEmail(eventType, count, metadata);
      } catch (error) {
        this.logger.error('Failed to send security alert', { error });
      }
    }
  }

  // Convenience methods for common events
  async logLoginSuccess(userId, metadata = {}) {
    return this.logEvent('LOGIN_SUCCESS', { userId, ...metadata });
  }

  async logLoginFailed(email, metadata = {}) {
    return this.logEvent('LOGIN_FAILED', { email, ...metadata });
  }

  async logAccountLocked(userId, metadata = {}) {
    return this.logEvent('ACCOUNT_LOCKED', { userId, ...metadata });
  }

  async logPasswordResetRequest(userId, metadata = {}) {
    return this.logEvent('PASSWORD_RESET_REQUEST', { userId, ...metadata });
  }

  async logUnauthorizedAccessAttempt(req, metadata = {}) {
    return this.logEvent('UNAUTHORIZED_ACCESS', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      ...metadata
    });
  }
}

// Singleton instance
const securityLogger = new SecurityLogger();

module.exports = {
  logSecurityEvent: securityLogger.logEvent.bind(securityLogger),
  logLoginSuccess: securityLogger.logLoginSuccess.bind(securityLogger),
  logLoginFailed: securityLogger.logLoginFailed.bind(securityLogger),
  logAccountLocked: securityLogger.logAccountLocked.bind(securityLogger),
  logPasswordResetRequest: securityLogger.logPasswordResetRequest.bind(securityLogger),
  logUnauthorizedAccessAttempt: securityLogger.logUnauthorizedAccessAttempt.bind(securityLogger)
};