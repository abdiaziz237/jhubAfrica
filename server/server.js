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

// Trust proxy for rate limiting (fixes X-Forwarded-For header issue)
app.set('trust proxy', 1);

// =======================
// 1. Database connection
// =======================
connectDB();

mongoose.connection.on('connecting', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏳ Connecting to MongoDB...');
  }
});
mongoose.connection.on('connected', async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ MongoDB connected successfully');
  }
  
  // Auto-correct system data on startup
  try {
    const DataConsistencyService = require('./services/dataConsistencyService');
    console.log('🔄 Running automatic system data correction on startup...');
    await DataConsistencyService.autoCorrectSystem();
    console.log('✅ System data correction completed on startup');
  } catch (error) {
    console.error('❌ Startup data correction failed:', error.message);
  }
});
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err.message));
mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ MongoDB disconnected');
  }
});

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
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 Serving static files from:', clientBuildPath);
  }
} else if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 Serving static files from:', clientPublicPath);
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ No frontend build/public found. API only.');
  }
}

// =======================
// 7. Load API routes
// =======================
loadRoutes(app);

// Manually mount auth routes to ensure they work
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Auth routes manually mounted at /api/v1/auth');
}

// Clear enrollments route (no auth required for testing)
app.delete('/api/v1/clear-enrollments', async (req, res) => {
  try {
    console.log('🗑️ Clearing all enrollments for testing');
    
    const Enrollment = require('./models/Enrollment');
    
    // Count existing enrollments
    const existingCount = await Enrollment.countDocuments();
    console.log(`📊 Found ${existingCount} existing enrollments`);
    
    if (existingCount === 0) {
      return res.json({
        success: true,
        message: 'No enrollments to delete',
        deletedCount: 0
      });
    }
    
    // Delete all enrollments
    const result = await Enrollment.deleteMany({});
    
    console.log(`🗑️ Deleted ${result.deletedCount} enrollments`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} enrollments`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error clearing enrollments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear enrollments',
      message: error.message
    });
  }
});

// Manually mount admin routes to fix routing conflicts
const adminRoutes = require('./routes/admin');
app.use('/api/v1/admin', adminRoutes);
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Admin routes manually mounted at /api/v1/admin');
}

// Mount additional routes
app.use('/api/v1/courses', require('./routes/course'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/points', require('./routes/points'));
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/referrals', require('./routes/referralRoutes'));
app.use('/api/v1/system', require('./routes/dataConsistencyRoutes'));
console.log('✅ Points routes mounted at /api/v1/points');
console.log('✅ Data consistency routes mounted at /api/v1/system');


if (process.env.NODE_ENV !== 'production') {
  console.log('✅ All API routes mounted successfully');
}

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
const PORT = process.env.PORT || 5001; // use environment variable or default to 5001
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`✅ Health: http://localhost:${PORT}/api/health`);
    console.log(`✅ DB test: http://localhost:${PORT}/api/test-db`);
  }
});

// =======================
// 14. Graceful shutdown
// =======================
process.on('SIGTERM', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛑 SIGTERM RECEIVED. Shutting down...');
  }
  server.close(() => {
    mongoose.connection.close();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Process terminated');
    }
  });
});

process.on('SIGINT', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛑 SIGINT RECEIVED. Shutting down...');
  }
  server.close(() => {
    mongoose.connection.close();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Process terminated');
    }
  });
});

// Admin access control middleware
const adminAccessControl = (req, res, next) => {
  // In production, restrict admin access to specific conditions
  if (process.env.NODE_ENV === 'production') {
    // Check if user is authenticated as admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access restricted in production'
      });
    }
    
    // Additional security checks can be added here
    // For example: IP whitelisting, time-based access, etc.
  }
  
  next();
};

// Apply admin access control to admin routes
app.use('/api/v1/admin', adminAccessControl);

module.exports = app;
