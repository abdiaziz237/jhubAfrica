const express = require('express');
const router = express.Router();
 const pointsController = require('../controllers/pointsController');
const { authenticate } = require('../middlewares/authMiddleware');

// All points routes require authentication
router.use(authenticate);

// Points routes
router.get('/summary', pointsController.getPointsSummary);
router.post('/calculate', pointsController.calculatePoints);
router.post('/award', pointsController.awardPoints);
router.post('/streak', pointsController.updateStreak);

module.exports = router;