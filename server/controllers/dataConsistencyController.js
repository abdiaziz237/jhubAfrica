const DataConsistencyService = require('../services/dataConsistencyService');

/**
 * Auto-correct all user data inconsistencies
 * @route POST /api/v1/system/correct-data
 * @access Private (Admin only)
 */
const correctAllUserData = async (req, res) => {
  try {
    console.log('🔧 Admin triggered system-wide data correction...');
    
    const results = await DataConsistencyService.correctAllUsersData();
    
    res.json({
      success: true,
      message: 'System-wide data correction completed',
      results: {
        totalUsers: results.totalUsers,
        correctedUsers: results.correctedUsers,
        totalCorrections: results.totalCorrections,
        correctionRate: `${((results.correctedUsers / results.totalUsers) * 100).toFixed(1)}%`
      }
    });
    
  } catch (error) {
    console.error('System-wide data correction failed:', error);
    res.status(500).json({
      success: false,
      message: 'System-wide data correction failed',
      error: error.message
    });
  }
};

/**
 * Validate system-wide data consistency
 * @route GET /api/v1/system/validate-consistency
 * @access Private (Admin only)
 */
const validateSystemConsistency = async (req, res) => {
  try {
    const validation = await DataConsistencyService.validateSystemConsistency();
    
    res.json({
      success: true,
      message: 'System consistency validation completed',
      validation: {
        isConsistent: validation.isConsistent,
        totalUsers: validation.totalUsers,
        totalEnrollments: validation.totalEnrollments,
        totalReferrals: validation.totalReferrals,
        inconsistencies: validation.inconsistencies,
        inconsistencyCount: validation.inconsistencies.length
      }
    });
    
  } catch (error) {
    console.error('System consistency validation failed:', error);
    res.status(500).json({
      success: false,
      message: 'System consistency validation failed',
      error: error.message
    });
  }
};

/**
 * Auto-correct system (validate and fix if needed)
 * @route POST /api/v1/system/auto-correct
 * @access Private (Admin only)
 */
const autoCorrectSystem = async (req, res) => {
  try {
    console.log('🚀 Admin triggered automatic system correction...');
    
    const results = await DataConsistencyService.autoCorrectSystem();
    
    res.json({
      success: true,
      message: 'Automatic system correction completed',
      results: results
    });
    
  } catch (error) {
    console.error('Automatic system correction failed:', error);
    res.status(500).json({
      success: false,
      message: 'Automatic system correction failed',
      error: error.message
    });
  }
};

/**
 * Correct data for a specific user
 * @route POST /api/v1/system/correct-user/:userId
 * @access Private (Admin only)
 */
const correctUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const results = await DataConsistencyService.correctUserData(userId);
    
    res.json({
      success: true,
      message: 'User data correction completed',
      results: results
    });
    
  } catch (error) {
    console.error('User data correction failed:', error);
    res.status(500).json({
      success: false,
      message: 'User data correction failed',
      error: error.message
    });
  }
};

module.exports = {
  correctAllUserData,
  validateSystemConsistency,
  autoCorrectSystem,
  correctUserData
};
