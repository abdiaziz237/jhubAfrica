// controllers/settingsController.js
// Admin platform settings controller

const { getTimezoneInfo, getAllTimezones, isValidTimezone, getNairobiTime } = require('../config/timezone');

// @route   GET /api/v1/admin/settings
// @desc    Get platform settings
// @access  Admin only
const getPlatformSettings = async (req, res) => {
  try {
    // Get current time in Nairobi timezone
    const nairobiTime = getNairobiTime();
    
    // Get all available timezones
    const availableTimezones = getAllTimezones();
    
    // Default platform settings
    const settings = {
      platform: {
        name: process.env.PLATFORM_NAME || 'JHUB Africa',
        contactEmail: process.env.CONTACT_EMAIL || 'admin@jhub.africa',
        timezone: process.env.PLATFORM_TIMEZONE || 'Africa/Nairobi',
        currentTime: nairobiTime,
        version: process.env.PLATFORM_VERSION || '1.0.0'
      },
      security: {
        twoFactorAuth: process.env.ENABLE_2FA === 'true',
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30,
        passwordPolicy: process.env.PASSWORD_POLICY || 'strong'
      },
      email: {
        smtpServer: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.SMTP_PORT) || 587,
        emailFrom: process.env.EMAIL_USER || 'noreply@jhub.africa'
      },
      availableTimezones
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform settings'
    });
  }
};

// @route   PUT /api/v1/admin/settings
// @desc    Update platform settings
// @access  Admin only
const updatePlatformSettings = async (req, res) => {
  try {
    const { platform, security, email } = req.body;
    
    // Validate timezone if provided
    if (platform?.timezone && !isValidTimezone(platform.timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }

    // Update environment variables (in production, these would be persisted to database)
    if (platform?.name) {
      process.env.PLATFORM_NAME = platform.name;
    }
    
    if (platform?.contactEmail) {
      process.env.CONTACT_EMAIL = platform.contactEmail;
    }
    
    if (platform?.timezone) {
      process.env.PLATFORM_TIMEZONE = platform.timezone;
    }

    if (security?.sessionTimeout) {
      process.env.SESSION_TIMEOUT = security.sessionTimeout.toString();
    }

    if (email?.smtpServer) {
      process.env.SMTP_HOST = email.smtpServer;
    }

    if (email?.smtpPort) {
      process.env.SMTP_PORT = email.smtpPort.toString();
    }

    if (email?.emailFrom) {
      process.env.EMAIL_USER = email.emailFrom;
    }

    // Get updated settings
    const updatedSettings = await getPlatformSettings(req, res);
    
    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform settings'
    });
  }
};

// @route   GET /api/v1/admin/settings/timezone
// @desc    Get timezone information
// @access  Admin only
const getTimezoneInfoHandler = async (req, res) => {
  try {
    const { timezone } = req.query;
    
    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: 'Timezone parameter is required'
      });
    }

    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone provided'
      });
    }

    const timezoneInfo = getTimezoneInfo(timezone);
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    res.json({
      success: true,
      data: {
        timezone,
        info: timezoneInfo,
        currentTime
      }
    });
  } catch (error) {
    console.error('Error getting timezone info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve timezone information'
    });
  }
};

// @route   GET /api/v1/admin/settings/timezone/current
// @desc    Get current time in Nairobi timezone
// @access  Admin only
const getCurrentNairobiTime = async (req, res) => {
  try {
    const nairobiTime = getNairobiTime();
    
    res.json({
      success: true,
      data: {
        timezone: 'Africa/Nairobi',
        currentTime: nairobiTime,
        offset: '+03:00',
        country: 'Kenya'
      }
    });
  } catch (error) {
    console.error('Error getting Nairobi time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current time'
    });
  }
};

module.exports = {
  getPlatformSettings,
  updatePlatformSettings,
  getTimezoneInfoHandler,
  getCurrentNairobiTime
};
