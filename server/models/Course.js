const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Digital Literacy', 
      'Networking', 
      'Programming', 
      'Soft Skills',
      'Digital Literacy & Office Productivity',
      'Business & Entrepreneurship',
      'Networking & IT Certifications',
      'Programming & App Development',
      'Data Science & Analytics',
      'Cybersecurity'
    ]
  },
  image: {
    type: String,
    required: false,
    default: 'https://via.placeholder.com/400x300?text=Course+Image'
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    default: 0
  },
  maxStudents: {
    type: Number,
    default: 100
  },
  duration: {
    type: String,
    default: '8-12 weeks'
  },
  prerequisites: {
    type: String,
    default: 'None'
  },
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Waitlist and cohort management
  waitlistEnabled: {
    type: Boolean,
    default: true
  },
  cohortStatus: {
    type: String,
    enum: ['planning', 'recruiting', 'ready', 'in-progress', 'completed'],
    default: 'planning'
  },
  cohortReadyThreshold: {
    type: Number,
    default: 10, // Minimum students needed to start cohort
    min: 1
  },
  cohortStartDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'full', 'waitlist-only', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for current enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  // This will be calculated when needed, not stored
  return undefined;
});

// Virtual for waitlist count
courseSchema.virtual('waitlistCount').get(function() {
  // This will be calculated when needed, not stored
  return undefined;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxStudents);
});

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  return 0; // Will be calculated when needed
});

// Virtual for cohort readiness
courseSchema.virtual('isCohortReady').get(function() {
  return this.cohortStatus === 'ready';
});

// Update status based on enrollment count and cohort status
courseSchema.pre('save', async function(next) {
  try {
    // Only update if we have the necessary models
    if (mongoose.models.Enrollment && mongoose.models.Waitlist) {
      const Enrollment = mongoose.model('Enrollment');
      const Waitlist = mongoose.model('Waitlist');
      
      const enrollmentCount = await Enrollment.countDocuments({ 
        course: this._id, 
        status: { $in: ['active', 'completed'] } 
      });
      
      const waitlistCount = await Waitlist.countDocuments({ 
        course: this._id, 
        status: 'waiting' 
      });
      
      // Update status based on enrollments
      if (enrollmentCount >= this.maxStudents) {
        this.status = 'full';
      } else if (this.status === 'full' && enrollmentCount < this.maxStudents) {
        this.status = 'active';
      }
      
      // Update cohort status based on waitlist
      if (this.cohortStatus === 'recruiting' && waitlistCount >= this.cohortReadyThreshold) {
        this.cohortStatus = 'ready';
      }
    }
    
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if course is full
courseSchema.methods.isFull = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const enrollmentCount = await Enrollment.countDocuments({ 
    course: this._id, 
    status: { $in: ['active', 'completed'] } 
  });
  return enrollmentCount >= this.maxStudents;
};

// Method to check if waitlist is open
courseSchema.methods.isWaitlistOpen = function() {
  return this.waitlistEnabled && this.status !== 'inactive';
};

// Method to get enrolled students
courseSchema.methods.getEnrolledStudents = async function() {
  if (!mongoose.models.Enrollment) {
    return [];
  }
  const Enrollment = mongoose.model('Enrollment');
  return await Enrollment.find({ 
    course: this._id, 
    status: { $in: ['active', 'completed'] } 
  }).populate('student', 'name email profile');
};

// Method to get waitlist students
courseSchema.methods.getWaitlistStudents = async function() {
  if (!mongoose.models.Waitlist) {
    return [];
  }
  const Waitlist = mongoose.model('Waitlist');
  return await Waitlist.find({ 
    course: this._id, 
    status: 'waiting' 
  }).populate('user', 'name email profile');
};

// Method to get enrollment statistics
courseSchema.methods.getEnrollmentStats = async function() {
  if (!mongoose.models.Enrollment) {
    return { total: 0, active: 0, completed: 0, cancelled: 0 };
  }
  const Enrollment = mongoose.model('Enrollment');
  const stats = await Enrollment.aggregate([
    { $match: { course: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Method to get waitlist statistics
courseSchema.methods.getWaitlistStats = async function() {
  if (!mongoose.models.Waitlist) {
    return { total: 0, waiting: 0, notified: 0, enrolled: 0, cancelled: 0 };
  }
  const Waitlist = mongoose.model('Waitlist');
  return await Waitlist.getWaitlistStats(this._id);
};

// Method to start cohort
courseSchema.methods.startCohort = function() {
  this.cohortStatus = 'in-progress';
  this.cohortStartDate = new Date();
  this.status = 'active';
  return this.save();
};

// Method to complete cohort
courseSchema.methods.completeCohort = function() {
  this.cohortStatus = 'completed';
  return this.save();
};

// Method to open new cohort
courseSchema.methods.openNewCohort = function() {
  this.cohortStatus = 'recruiting';
  this.cohortStartDate = null;
  this.status = 'active';
  return this.save();
};

// Static method to get courses with enrollment counts
courseSchema.statics.getCoursesWithEnrollments = async function() {
  const courses = await this.find({});
  const coursesWithEnrollments = [];
  
  for (const course of courses) {
    try {
      const enrollmentStats = await course.getEnrollmentStats();
      const waitlistStats = await course.getWaitlistStats();
      
      coursesWithEnrollments.push({
        ...course.toObject(),
        enrollmentCount: enrollmentStats.total,
        activeEnrollments: enrollmentStats.active,
        completedEnrollments: enrollmentStats.completed,
        waitlistCount: waitlistStats.waiting,
        totalWaitlist: waitlistStats.total
      });
    } catch (error) {
      // If there's an error, add course with default values
      coursesWithEnrollments.push({
        ...course.toObject(),
        enrollmentCount: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        waitlistCount: 0,
        totalWaitlist: 0
      });
    }
  }
  
  return coursesWithEnrollments;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;