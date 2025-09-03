const PointsService = require('../services/pointsService');

/**
 * @desc    Get user points summary
 * @route   GET /api/v1/points/summary
 * @access  Private
 */
const getPointsSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const pointsSummary = await PointsService.getUserPointsSummary(userId);
    
    res.json({
      success: true,
      data: pointsSummary
    });

  } catch (error) {
    console.error('Get Points Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points summary',
      error: error.message
    });
  }
};

/**
 * @desc    Calculate and update user points
 * @route   POST /api/v1/points/calculate
 * @access  Private
 */
const calculatePoints = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const pointsData = await PointsService.calculateUserPoints(userId);
    
    res.json({
      success: true,
      data: pointsData
    });

  } catch (error) {
    console.error('Calculate Points Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate points',
      error: error.message
    });
  }
};

/**
 * @desc    Award points to user
 * @route   POST /api/v1/points/award
 * @access  Private
 */
const awardPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { action, points, description } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!action || !points) {
      return res.status(400).json({
        success: false,
        message: 'Action and points are required'
      });
    }

    const result = await PointsService.awardPoints(userId, action, points, description);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Award Points Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
};

/**
 * @desc    Update learning streak
 * @route   POST /api/v1/points/streak
 * @access  Private
 */
const updateStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const streak = await PointsService.updateLearningStreak(userId);
    
    res.json({
      success: true,
      data: { learningStreak: streak }
    });

  } catch (error) {
    console.error('Update Streak Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning streak',
      error: error.message
    });
  }
};

module.exports = {
  getPointsSummary,
  calculatePoints,
  awardPoints,
  updateStreak
};
