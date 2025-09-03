const DataConsistencyService = require('../services/dataConsistencyService');

/**
 * Middleware to ensure data consistency for authenticated users
 * This runs on every request to automatically correct any data inconsistencies
 */
const ensureDataConsistency = async (req, res, next) => {
  try {
    // Only run for authenticated users
    if (req.user && req.user._id) {
      // Check if user data needs correction (non-blocking)
      const user = req.user;
      
      // Quick consistency check - if points seem off, trigger correction
      if (user.points !== undefined) {
        // Run correction in background without blocking the request
        setImmediate(async () => {
          try {
            await DataConsistencyService.correctUserData(user._id);
          } catch (error) {
            console.error(`Background data correction failed for user ${user.email}:`, error);
          }
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Data consistency middleware error:', error);
    // Don't block the request if consistency check fails
    next();
  }
};

/**
 * Middleware to ensure system-wide data consistency (admin only)
 */
const ensureSystemConsistency = async (req, res, next) => {
  try {
    // Only run for admin users
    if (req.user && req.user.role === 'admin') {
      // Run system-wide consistency check in background
      setImmediate(async () => {
        try {
          const validation = await DataConsistencyService.validateSystemConsistency();
          if (!validation.isConsistent) {
            console.log('🔧 Admin request detected system inconsistency, auto-correcting...');
            await DataConsistencyService.autoCorrectSystem();
          }
        } catch (error) {
          console.error('System consistency check failed:', error);
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('System consistency middleware error:', error);
    next();
  }
};

module.exports = {
  ensureDataConsistency,
  ensureSystemConsistency
};
