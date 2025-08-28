module.exports = {
  // Production environment settings
  NODE_ENV: 'production',
  
  // Admin access control
  ADMIN_ACCESS: {
    // Enable strict admin access control
    ENABLED: true,
    
    // IP whitelist (optional - add your admin IPs here)
    ALLOWED_IPS: [
      // Add your admin IP addresses here
      // '192.168.1.100',
      // '10.0.0.50'
    ],
    
    // Time-based access (optional - restrict admin access to specific hours)
    ACCESS_HOURS: {
      START: 8,  // 8 AM
      END: 18    // 6 PM
    },
    
    // Require additional authentication factor
    REQUIRE_2FA: false,
    
    // Session timeout for admin users (in minutes)
    SESSION_TIMEOUT: 30
  },
  
  // Security headers
  SECURITY: {
    // Enable rate limiting for admin routes
    RATE_LIMIT_ADMIN: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // CORS settings for production
    CORS: {
      origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
      credentials: true
    }
  },
  
  // Logging
  LOGGING: {
    // Log all admin access attempts
    LOG_ADMIN_ACCESS: true,
    
    // Log failed authentication attempts
    LOG_FAILED_AUTH: true
  }
};
