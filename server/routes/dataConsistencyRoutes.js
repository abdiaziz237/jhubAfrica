const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { ensureDataConsistency, ensureSystemConsistency } = require('../middleware/dataConsistencyMiddleware');
const {
  correctAllUserData,
  validateSystemConsistency,
  autoCorrectSystem,
  correctUserData
} = require('../controllers/dataConsistencyController');

// Apply data consistency middleware to all routes
router.use(ensureDataConsistency);

// System-wide data correction routes (Admin only)
router.post('/correct-data', authenticate, authorizeRoles(['admin']), correctAllUserData);
router.get('/validate-consistency', authenticate, authorizeRoles(['admin']), validateSystemConsistency);
router.post('/auto-correct', authenticate, authorizeRoles(['admin']), autoCorrectSystem);
router.post('/correct-user/:userId', authenticate, authorizeRoles(['admin']), correctUserData);

// Apply system consistency middleware for admin routes
router.use('/admin', ensureSystemConsistency);

module.exports = router;
