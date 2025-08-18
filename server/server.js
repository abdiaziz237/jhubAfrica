require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Security middleware
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Utility middleware
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Custom modules
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
const loadRoutes = require('./utils/routeLoader');

// Validate environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize Express app
const app = express();

// 1. Database connection
connectDB();

// 2. Security Middleware
app.use(helmet());

// Enable CORS for specified origins
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// 3. Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// 4. Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. Compression middleware
app.use(compression());

// 6. Static files
app.use(express.static(path.join(__dirname, 'public')));

// 7. Route loading
loadRoutes(app);

// 8. Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 9. Handle 404
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 10. Error handling middleware
app.use(errorHandler);

// 11. Server initialization
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// 12. Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
  });
});

module.exports = app;