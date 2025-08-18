// config/env.js
require('dotenv').config();

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'NODE_ENV'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI.includes('ssl=true')) {
    console.warn('Warning: Production database connection should use SSL');
  }
};

module.exports = validateEnv;