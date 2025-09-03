const User = require('../models/user');
const Enrollment = require('../models/Enrollment');
const CourseInterest = require('../models/CourseInterest');
const PointsService = require('./pointsService');

class DataConsistencyService {
  /**
   * Automatically correct all data inconsistencies for a specific user
   * @param {string} userId - User ID
   * @returns {Object} Correction results
   */
  static async correctUserData(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const corrections = {
        pointsCorrected: false,
        courseCountsCorrected: false,
        referralDataCorrected: false,
        profileDataCorrected: false
      };

      // 1. Correct points calculation
      const calculatedData = await PointsService.calculateUserPoints(userId);
      if (user.points !== calculatedData.totalPoints) {
        user.points = calculatedData.totalPoints;
        corrections.pointsCorrected = true;
      }

      // 2. Correct course counts
      const enrollments = await Enrollment.find({ 
        student: userId, 
        status: { $in: ['active', 'completed'] } 
      });
      const completedEnrollments = await Enrollment.find({ 
        student: userId, 
        status: 'completed' 
      });

      if (user.enrolledCourses !== enrollments.length) {
        user.enrolledCourses = enrollments.length;
        corrections.courseCountsCorrected = true;
      }

      if (user.completedCourses !== completedEnrollments.length) {
        user.completedCourses = completedEnrollments.length;
        corrections.courseCountsCorrected = true;
      }

      // 3. Correct referral data consistency
      const referrals = await User.find({ referredBy: userId });
      const expectedReferralPoints = referrals.length * 50;
      const actualReferralPoints = calculatedData.pointsBreakdown.referrals;

      if (expectedReferralPoints !== actualReferralPoints) {
        // Recalculate points to fix referral inconsistency
        await PointsService.calculateUserPoints(userId);
        corrections.referralDataCorrected = true;
      }

      // 4. Correct profile data consistency
      const expectedEmailPoints = user.emailVerified ? 25 : 0;
      const expectedProfilePoints = user.profileComplete ? 25 : 0;
      const actualEmailPoints = calculatedData.pointsBreakdown.emailVerification;
      const actualProfilePoints = calculatedData.pointsBreakdown.profileCompletion;

      if (expectedEmailPoints !== actualEmailPoints || expectedProfilePoints !== actualProfilePoints) {
        // Recalculate points to fix profile inconsistency
        await PointsService.calculateUserPoints(userId);
        corrections.profileDataCorrected = true;
      }

      // Save all corrections
      await user.save();

      return {
        success: true,
        userId: userId,
        corrections: corrections,
        finalPoints: user.points,
        finalEnrolledCourses: user.enrolledCourses,
        finalCompletedCourses: user.completedCourses
      };

    } catch (error) {
      console.error('Error correcting user data:', error);
      throw error;
    }
  }

  /**
   * Automatically correct all data inconsistencies for all users
   * @returns {Object} System-wide correction results
   */
  static async correctAllUsersData() {
    try {
      // Only process verified users to avoid issues with unverified accounts
      const users = await User.find({ emailVerified: true, status: 'active' });
      const results = {
        totalUsers: users.length,
        correctedUsers: 0,
        totalCorrections: 0,
        userResults: [],
        skippedUnverified: 0
      };

      // Count unverified users
      const unverifiedUsers = await User.find({ 
        $or: [
          { emailVerified: false }, 
          { status: { $ne: 'active' } }
        ]
      });
      results.skippedUnverified = unverifiedUsers.length;

      console.log(`📊 Processing ${users.length} verified users, skipping ${results.skippedUnverified} unverified users`);

      for (const user of users) {
        try {
          const correctionResult = await this.correctUserData(user._id);
          results.userResults.push(correctionResult);
          
          if (correctionResult.corrections.pointsCorrected || 
              correctionResult.corrections.courseCountsCorrected ||
              correctionResult.corrections.referralDataCorrected ||
              correctionResult.corrections.profileDataCorrected) {
            results.correctedUsers++;
            results.totalCorrections += Object.values(correctionResult.corrections).filter(Boolean).length;
          }
        } catch (error) {
          console.error(`Error correcting user ${user.email}:`, error);
          results.userResults.push({
            success: false,
            userId: user._id,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Error correcting all users data:', error);
      throw error;
    }
  }

  /**
   * Validate and ensure system-wide data consistency
   * @returns {Object} Validation results
   */
  static async validateSystemConsistency() {
    try {
      // Only validate verified, active users
      const users = await User.find({ emailVerified: true, status: 'active' });
      const allEnrollments = await Enrollment.find({});
      const allReferrals = await User.find({ referredBy: { $exists: true, $ne: null } });

      const validation = {
        totalUsers: users.length,
        totalEnrollments: allEnrollments.length,
        totalReferrals: allReferrals.length,
        inconsistencies: [],
        isConsistent: true
      };

      // Check for orphaned enrollments (enrollments with invalid student references)
      const orphanedEnrollments = [];
      for (const enrollment of allEnrollments) {
        const user = await User.findById(enrollment.student);
        if (!user) {
          orphanedEnrollments.push(enrollment);
        }
      }

      if (orphanedEnrollments.length > 0) {
        validation.inconsistencies.push({
          type: 'orphaned_enrollments',
          count: orphanedEnrollments.length,
          description: `Found ${orphanedEnrollments.length} enrollments with invalid student references`
        });
        validation.isConsistent = false;
      }

      // Check enrollment consistency (only count valid enrollments)
      const validEnrollments = allEnrollments.filter(enrollment => {
        return users.some(user => user._id.toString() === enrollment.student.toString());
      });
      
      const totalEnrollmentsFromUsers = users.reduce((sum, user) => sum + user.enrolledCourses, 0);
      if (totalEnrollmentsFromUsers !== validEnrollments.length) {
        validation.inconsistencies.push({
          type: 'enrollment_count',
          expected: validEnrollments.length,
          actual: totalEnrollmentsFromUsers,
          description: 'Total enrollments from user counts does not match valid enrollments in database'
        });
        validation.isConsistent = false;
      }

      // Check referral consistency
      const totalReferralPoints = users.reduce((sum, user) => {
        const userReferrals = allReferrals.filter(r => r.referredBy.toString() === user._id.toString());
        return sum + (userReferrals.length * 50);
      }, 0);

      // Check points consistency for each user
      for (const user of users) {
        const calculatedData = await PointsService.calculateUserPoints(user._id);
        if (user.points !== calculatedData.totalPoints) {
          validation.inconsistencies.push({
            type: 'points_mismatch',
            userId: user._id,
            userEmail: user.email,
            expected: calculatedData.totalPoints,
            actual: user.points,
            description: `User ${user.email} has incorrect points calculation`
          });
          validation.isConsistent = false;
        }
      }

      return validation;

    } catch (error) {
      console.error('Error validating system consistency:', error);
      throw error;
    }
  }

  /**
   * Clean up orphaned enrollments (enrollments with invalid student references)
   * @returns {Object} Cleanup results
   */
  static async cleanupOrphanedEnrollments() {
    try {
      const allEnrollments = await Enrollment.find({});
      const users = await User.find({});
      const userIds = users.map(user => user._id.toString());
      
      const orphanedEnrollments = allEnrollments.filter(enrollment => {
        return !userIds.includes(enrollment.student.toString());
      });

      if (orphanedEnrollments.length > 0) {
        console.log(`🧹 Cleaning up ${orphanedEnrollments.length} orphaned enrollments...`);
        
        const orphanedIds = orphanedEnrollments.map(enrollment => enrollment._id);
        await Enrollment.deleteMany({ _id: { $in: orphanedIds } });
        
        console.log(`✅ Cleaned up ${orphanedEnrollments.length} orphaned enrollments`);
        
        return {
          success: true,
          cleanedCount: orphanedEnrollments.length,
          orphanedIds: orphanedIds
        };
      } else {
        console.log('✅ No orphaned enrollments found');
        return {
          success: true,
          cleanedCount: 0,
          message: 'No orphaned enrollments found'
        };
      }

    } catch (error) {
      console.error('❌ Orphaned enrollment cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Auto-correct system on startup or when called
   * @returns {Object} Auto-correction results
   */
  static async autoCorrectSystem() {
    try {
      console.log('🔄 Starting automatic system data correction...');
      
      // First, clean up orphaned enrollments
      const cleanupResults = await this.cleanupOrphanedEnrollments();
      
      // Then, validate current state
      const validation = await this.validateSystemConsistency();
      console.log(`📊 System validation: ${validation.isConsistent ? 'Consistent' : 'Inconsistent'}`);
      
      if (!validation.isConsistent) {
        console.log(`⚠️  Found ${validation.inconsistencies.length} inconsistencies, correcting...`);
        
        // Correct all user data
        const correctionResults = await this.correctAllUsersData();
        
        console.log(`✅ Auto-correction complete:`);
        console.log(`   Orphaned enrollments cleaned: ${cleanupResults.cleanedCount}`);
        console.log(`   Users processed: ${correctionResults.totalUsers}`);
        console.log(`   Users corrected: ${correctionResults.correctedUsers}`);
        console.log(`   Total corrections: ${correctionResults.totalCorrections}`);
        
        // Validate again after correction
        const postValidation = await this.validateSystemConsistency();
        console.log(`📊 Post-correction validation: ${postValidation.isConsistent ? 'Consistent' : 'Still Inconsistent'}`);
        
        return {
          success: true,
          cleanupResults: cleanupResults,
          preValidation: validation,
          correctionResults: correctionResults,
          postValidation: postValidation
        };
      } else {
        console.log('✅ System is already consistent, no corrections needed');
        return {
          success: true,
          message: 'System is already consistent',
          cleanupResults: cleanupResults,
          validation: validation
        };
      }

    } catch (error) {
      console.error('❌ Auto-correction failed:', error);
      throw error;
    }
  }
}

module.exports = DataConsistencyService;
