const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  
  // App Configuration
  APP_NAME: 'JHUB Africa',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    WAITLIST: true,
    COHORT_MANAGEMENT: true,
    ANALYTICS: true,
    USER_DASHBOARD: true,
    ADMIN_PANEL: true
  },
  
  // External Services
  EXTERNAL_SERVICES: {
    GOOGLE_ANALYTICS: process.env.REACT_APP_GA_ID || '',
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || ''
  },
  
  // App Settings
  SETTINGS: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    AUTO_SAVE_INTERVAL: 30000 // 30 seconds
  },
  
  // Timeouts
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 seconds
    AUTH_TOKEN_REFRESH: 5000, // 5 seconds
    USER_INACTIVITY: 15 * 60 * 1000 // 15 minutes
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // File Upload
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    MAX_FILES: 5
  },
  
  // Security
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    SESSION_SECURE: process.env.NODE_ENV === 'production',
    CSRF_PROTECTION: true
  },
  
  // Performance
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 1000,
    CACHE_TTL: 5 * 60 * 1000 // 5 minutes
  }
};

export default config;
