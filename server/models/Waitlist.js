const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'enrolled', 'cancelled'],
    default: 'waiting'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-course combinations
waitlistSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for performance
waitlistSchema.index({ course: 1, status: 1 });
waitlistSchema.index({ joinDate: 1 });

// Virtual for waitlist position
waitlistSchema.virtual('position').get(async function() {
  const Waitlist = mongoose.model('Waitlist');
  const position = await Waitlist.countDocuments({
    course: this.course,
    joinDate: { $lt: this.joinDate },
    status: 'waiting'
  });
  return position + 1;
});

// Method to notify user
waitlistSchema.methods.notifyUser = function() {
  this.status = 'notified';
  this.notificationSent = true;
  this.notificationDate = new Date();
  return this.save();
};

// Method to enroll user
waitlistSchema.methods.enrollUser = function() {
  this.status = 'enrolled';
  return this.save();
};

// Method to cancel waitlist
waitlistSchema.methods.cancelWaitlist = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to get waitlist statistics
waitlistSchema.statics.getWaitlistStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    waiting: 0,
    notified: 0,
    enrolled: 0,
    cancelled: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get waitlist for a course
waitlistSchema.statics.getCourseWaitlist = async function(courseId, limit = 50) {
  return await this.find({ course: courseId, status: 'waiting' })
    .populate('user', 'name email profile')
    .sort({ joinDate: 1 })
    .limit(limit);
};

// Static method to check if user is on waitlist
waitlistSchema.statics.isUserOnWaitlist = async function(userId, courseId) {
  const waitlistEntry = await this.findOne({
    user: userId,
    course: courseId,
    status: { $in: ['waiting', 'notified'] }
  });
  return waitlistEntry;
};

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

module.exports = Waitlist;
