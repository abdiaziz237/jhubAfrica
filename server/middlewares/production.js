// middlewares/production.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const productionMiddleware = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // Enhanced security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", process.env.API_BASE_URL]
        }
      },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // Rate limiting
    app.use('/api/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later'
    }));

    // Compression
    app.use(compression({
      level: 6,
      threshold: '10kb'
    }));
  }
};

module.exports = productionMiddleware;