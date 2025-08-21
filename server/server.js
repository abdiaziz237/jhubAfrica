require('dotenv').config();

// =======================
// Core dependencies
// =======================
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// =======================
// Security middleware
// =======================
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// =======================
// Utility middleware
// =======================
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// =======================
// Custom modules
// =======================
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');
const loadRoutes = require('./utils/routeLoader');

// =======================
// Validate environment variables
// =======================
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// =======================
// Initialize Express app
// =======================
const app = express();

// =======================
// 1. Database connection
// =======================
connectDB();

mongoose.connection.on('connecting', () => console.log('⏳ Connecting to MongoDB...'));
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err.message));
mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));

// =======================
// 2. Security Middleware
// =======================
app.use(helmet());

// Enable CORS for frontend (React on port 3000)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (API only)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: '⚠️ Too many requests, please try again later'
});
app.use('/api', limiter);

// =======================
// 3. Body parsing + sanitization
// =======================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// =======================
// 4. Development logging
// =======================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =======================
// 5. Compression middleware
// =======================
app.use(compression());

// =======================
// 6. Static files (React build/public)
// =======================
const clientBuildPath = path.join(__dirname, '../client/build');
const clientPublicPath = path.join(__dirname, '../client/public');

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log('📦 Serving static files from:', clientBuildPath);
} else if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
  console.log('📦 Serving static files from:', clientPublicPath);
} else {
  console.log('⚠️ No frontend build/public found. API only.');
}

// =======================
// 7. Load API routes
// =======================
loadRoutes(app);

// =======================
// 8. Health check
// =======================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// =======================
// 9. DB test
// =======================
app.get('/api/test-db', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ status: 'success', message: 'MongoDB connected' });
  } else {
    res.status(503).json({ status: 'error', message: 'MongoDB not connected' });
  }
});

// =======================
// 10. API 404 handler
// =======================
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// =======================
// 11. React Router Fallback
// =======================
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ status: 'fail', message: `API endpoint ${req.originalUrl} not found` });
  }

  const indexPath = path.join(clientBuildPath, 'index.html');
  const publicIndexPath = path.join(clientPublicPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).json({ status: 'error', message: 'Frontend not found. Run npm run build.' });
  }
});

// =======================
// 12. Error handling middleware
// =======================
app.use(errorHandler);

// =======================
// 13. Server initialization
// =======================
const PORT = 5001; // fixed port
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ DB test: http://localhost:${PORT}/api/test-db`);
});

// =======================
// 14. Graceful shutdown
// =======================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM RECEIVED. Shutting down...');
  server.close(() => {
    mongoose.connection.close();
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT RECEIVED. Shutting down...');
  server.close(() => {
    mongoose.connection.close();
    console.log('✅ Process terminated');
  });
});

module.exports = app;
