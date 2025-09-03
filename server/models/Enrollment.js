const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'suspended'],
    default: 'active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedModules: [{
    moduleId: String,
    completedAt: Date,
    score: Number
  }],
  certificates: [{
    name: String,
    issuedAt: Date,
    certificateId: String
  }],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to ensure unique student-course combinations
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for performance
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollmentDate: 1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('duration').get(function() {
  return Date.now() - this.enrollmentDate;
});

// Method to update progress
enrollmentSchema.methods.updateProgress = function(moduleId, score) {
  const existingModule = this.completedModules.find(m => m.moduleId === moduleId);
  
  if (existingModule) {
    existingModule.score = Math.max(existingModule.score, score);
    existingModule.completedAt = new Date();
  } else {
    this.completedModules.push({
      moduleId,
      completedAt: new Date(),
      score
    });
  }
  
  // Calculate overall progress
  this.progress = Math.round((this.completedModules.length / 3) * 100); // Assuming 3 modules per course
  this.lastAccessed = new Date();
  
  return this.save();
};

// Method to complete enrollment
enrollmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.progress = 100;
  this.lastAccessed = new Date();
  return this.save();
};

// Static method to get enrollment statistics
enrollmentSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completedEnrollments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageProgress: { $avg: '$progress' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0
  };
};

// Pre-save middleware to update lastAccessed
enrollmentSchema.pre('save', function(next) {
  this.lastAccessed = new Date();
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
