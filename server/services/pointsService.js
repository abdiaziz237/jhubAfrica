const User = require('../models/user');
const Enrollment = require('../models/Enrollment');
const CourseInterest = require('../models/CourseInterest');

class PointsService {
  /**
   * Calculate and update user points based on their activities
   * @param {string} userId - User ID
   * @returns {Object} Updated points summary
   */
  static async calculateUserPoints(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let totalPoints = 0;
      const pointsBreakdown = {
        enrollment: 0,
        completion: 0,
        activity: 0,
        streak: 0,
        achievements: 0
      };

      // Points for course enrollments (100 points per enrollment)
      const enrollments = await Enrollment.find({ 
        student: userId, 
        status: { $in: ['active', 'completed'] } 
      });
      pointsBreakdown.enrollment = enrollments.length * 100;

      // Points for course completions (500 points per completion)
      const completedEnrollments = await Enrollment.find({ 
        student: userId, 
        status: 'completed' 
      });
      pointsBreakdown.completion = completedEnrollments.length * 500;

      // Points for approved course interests (50 points per approval)
      const approvedInterests = await CourseInterest.find({ 
        email: user.email, 
        status: 'approved' 
      });
      pointsBreakdown.activity = approvedInterests.length * 50;

      // Points for learning streak (10 points per day of streak)
      const streakPoints = Math.min((user.learningStreak || 0) * 10, 1000); // Cap at 1000 points
      pointsBreakdown.streak = streakPoints;

      // Points for achievements (varies by achievement type)
      if (user.achievements && user.achievements.length > 0) {
        pointsBreakdown.achievements = user.achievements.length * 200;
      }

      // Points for referrals (50 points per successful referral)
      const referrals = await User.find({ referredBy: user._id });
      pointsBreakdown.referrals = referrals.length * 50;

      // Points for email verification (25 points)
      const emailVerificationPoints = user.emailVerified ? 25 : 0;
      pointsBreakdown.emailVerification = emailVerificationPoints;

      // Points for profile completion (25 points)
      const profileCompletionPoints = user.profileComplete ? 25 : 0;
      pointsBreakdown.profileCompletion = profileCompletionPoints;

      // Calculate total points
      totalPoints = Object.values(pointsBreakdown).reduce((sum, points) => sum + points, 0);

      // Update user points
      user.points = totalPoints;
      user.completedCourses = completedEnrollments.length;
      user.enrolledCourses = enrollments.length;
      
      await user.save();

      return {
        totalPoints,
        pointsBreakdown,
        enrolledCourses: enrollments.length,
        completedCourses: completedEnrollments.length,
        learningStreak: user.learningStreak,
        achievements: user.achievements?.length || 0
      };

    } catch (error) {
      console.error('Error calculating user points:', error);
      throw error;
    }
  }

  /**
   * Award points to user for specific actions
   * @param {string} userId - User ID
   * @param {string} action - Action type (enrollment, completion, etc.)
   * @param {number} points - Points to award
   * @param {string} description - Description of the action
   */
  static async awardPoints(userId, action, points, description = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add points to user
      user.points = (user.points || 0) + points;
      
      // Add to points history if it exists
      if (!user.pointsHistory) {
        user.pointsHistory = [];
      }
      
      user.pointsHistory.push({
        action,
        points,
        description,
        date: new Date()
      });

      // Keep only last 50 points history entries
      if (user.pointsHistory.length > 50) {
        user.pointsHistory = user.pointsHistory.slice(-50);
      }

      await user.save();

      // Trigger data consistency check in background
      setImmediate(async () => {
        try {
          const DataConsistencyService = require('./dataConsistencyService');
          await DataConsistencyService.correctUserData(userId);
        } catch (error) {
          console.error(`Background data consistency check failed for user ${userId}:`, error);
        }
      });

      return {
        newTotal: user.points,
        pointsAwarded: points,
        action,
        description
      };

    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Award referral points when someone uses a referral code
   * @param {string} referrerId - ID of the user who made the referral
   * @param {string} newUserId - ID of the new user who used the referral
   * @returns {Object} Points result
   */
  static async awardReferralPoints(referrerId, newUserId) {
    try {
      // Award 50 points to the referrer
      const referrerResult = await this.awardPoints(
        referrerId, 
        'referral', 
        50, 
        'Successfully referred a new user'
      );

      // Award 25 points to the new user for using a referral code
      const newUserResult = await this.awardPoints(
        newUserId, 
        'referral_signup', 
        25, 
        'Signed up using referral code'
      );

      return {
        referrerPoints: referrerResult,
        newUserPoints: newUserResult
      };

    } catch (error) {
      console.error('Error awarding referral points:', error);
      throw error;
    }
  }

  /**
   * Get user points summary
   * @param {string} userId - User ID
   * @returns {Object} Points summary
   */
  static async getUserPointsSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get current stats
      const enrollments = await Enrollment.find({ 
        student: userId, 
        status: { $in: ['active', 'completed'] } 
      });
      
      const completedEnrollments = await Enrollment.find({ 
        student: userId, 
        status: 'completed' 
      });

      const approvedInterests = await CourseInterest.find({ 
        user: userId, 
        status: 'approved' 
      });

      return {
        totalPoints: user.points || 0,
        enrolledCourses: enrollments.length,
        completedCourses: completedEnrollments.length,
        approvedInterests: approvedInterests.length,
        learningStreak: user.learningStreak || 0,
        achievements: user.achievements?.length || 0,
        pointsHistory: user.pointsHistory || []
      };

    } catch (error) {
      console.error('Error getting user points summary:', error);
      throw error;
    }
  }

  /**
   * Update learning streak for user
   * @param {string} userId - User ID
   */
  static async updateLearningStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      const lastActivity = user.lastActivityDate || user.createdAt;
      const daysSinceLastActivity = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysSinceLastActivity === 1) {
        // Consecutive day - increment streak
        user.learningStreak = (user.learningStreak || 0) + 1;
      } else if (daysSinceLastActivity > 1) {
        // Streak broken - reset to 1
        user.learningStreak = 1;
      }
      // If daysSinceLastActivity === 0, it's the same day, keep current streak

      user.lastActivityDate = today;
      await user.save();

      return user.learningStreak;

    } catch (error) {
      console.error('Error updating learning streak:', error);
      throw error;
    }
  }
}

module.exports = PointsService;
