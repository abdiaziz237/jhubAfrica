const mongoose = require('mongoose');

const courseInterestSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    required: false
  },
  education: {
    type: String,
    enum: ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'],
    default: 'Other',
    required: false
  },
  experience: {
    type: String,
    enum: ['No Experience', '1-2 years', '3-5 years', '5+ years'],
    default: 'No Experience',
    required: false
  },
  motivation: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Motivation must be at least 10 characters']
  },
  preferredStartDate: {
    type: String,
    trim: true,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected', 'contacted', 'enrolled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  adminResponse: {
    type: String,
    trim: true
  },
  responseDate: {
    type: Date
  },
  isContacted: {
    type: Boolean,
    default: false
  },
  contactDate: {
    type: Date
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

// Update timestamp on save
courseInterestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
courseInterestSchema.index({ courseId: 1, email: 1 });
courseInterestSchema.index({ status: 1, createdAt: -1 });
courseInterestSchema.index({ email: 1 });

const CourseInterest = mongoose.model('CourseInterest', courseInterestSchema);

module.exports = CourseInterest;
