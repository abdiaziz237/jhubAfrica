const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  to: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  subject: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  text: {
    type: String,
    required: function() {
      return !this.html; // Require text if no html
    }
  },
  html: {
    type: String,
    required: function() {
      return !this.text; // Require html if no text
    }
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'failed'],
    default: 'queued'
  },
  service: {
    type: String,
    enum: ['gmail', 'sendgrid', 'mailgun', 'ses', 'smtp'],
    required: true
  },
  error: {
    type: String,
    required: false
  },
  sentAt: { 
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  openedAt: {
    type: Date,
    default: null
  },
  clicks: [{
    url: String,
    clickedAt: Date
  }],
  referenceId: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      userId: null,
      purpose: null, // 'verification', 'password-reset', etc.
      relatedId: null // verification token, reset token, etc.
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for optimized queries
EmailSchema.index({ to: 1 });
EmailSchema.index({ status: 1 });
EmailSchema.index({ createdAt: -1 });
EmailSchema.index({ 'metadata.purpose': 1 });
EmailSchema.index({ 'metadata.relatedId': 1 });

// Virtual for email delivery status
EmailSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

// Static method to find emails by purpose
EmailSchema.statics.findByPurpose = function(purpose) {
  return this.find({ 'metadata.purpose': purpose });
};

// Instance method to mark as delivered
EmailSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Email', EmailSchema);