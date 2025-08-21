const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/securityLogger');

// Constants
const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET_EXPIRES: 10 * 60 * 1000 // 10 minutes
};

// Prevent model overwrite in case of hot-reloading
if (mongoose.models.user) {
  delete mongoose.models.user;
  // delete mongoose.modelSchemas.user;
}

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z ]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
  },

  // Authentication Credentials
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase, one lowercase, one number and one special character'
    }
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },

  // Referral System
  referralCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: function() {
      const namePart = this.name.split(' ')[0].toUpperCase().substring(0, 4);
      const uuidPart = uuidv4().replace(/-/g, '').substring(0, 6);
      return `${namePart}-${uuidPart}`;
    }
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },

  // User Status and Roles
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  role: {
    type: String,
    enum: {
      values: Object.values(ROLES),
      message: `Role must be either ${Object.values(ROLES).join(', ')}`
    },
    default: ROLES.STUDENT
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Timestamps and Security
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },

  // Authentication Tokens
  tokens: [{
    token: {
      type: String,
      required: true
    },
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    os: String,
    browser: String,
    location: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: process.env.JWT_EXPIRES_IN || '7d'
    }
  }],

  // Account Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastPasswordChange: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  securityQuestions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      select: false,
      required: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive information from JSON output
      delete ret.password;
      delete ret.passwordConfirm;
      delete ret.tokens;
      delete ret.securityQuestions;
      delete ret.twoFactorSecret;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordConfirm;
      delete ret.tokens;
      delete ret.securityQuestions;
      delete ret.twoFactorSecret;
      delete ret.__v;
      return ret;
    }
  }
});

/* ======================
   MIDDLEWARE
   ====================== */

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.lastPasswordChange = Date.now();
    next();
  } catch (err) {
    logSecurityEvent('PASSWORD_HASH_FAILED', {
      userId: this._id,
      error: err.message
    });
    next(new Error('Failed to secure password'));
  }
});

// Update password changed timestamp
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token created after
  next();
});

/* ======================
   INSTANCE METHODS
   ====================== */

// Password verification
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate JWT token
userSchema.methods.generateAuthToken = async function(deviceInfo = {}) {
  const payload = {
    _id: this._id.toString(),
    role: this.role,
    email: this.email,
    twoFactorVerified: deviceInfo.twoFactorVerified || false
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  // Store token with device info
  this.tokens = this.tokens.concat({ 
    token,
    ...deviceInfo
  });
  
  this.lastLogin = Date.now();
  await this.save();
  
  logSecurityEvent('TOKEN_GENERATED', {
    userId: this._id,
    deviceInfo
  });
  
  return token;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + SECURITY.PASSWORD_RESET_EXPIRES;
  
  logSecurityEvent('PASSWORD_RESET_REQUESTED', {
    userId: this._id
  });
  
  return resetToken;
};

// Account lockout functionality
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    throw new Error(`Account locked. Try again after ${new Date(this.lockUntil).toLocaleTimeString()}`);
  }
  
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = Date.now() + SECURITY.LOCK_TIME;
    this.loginAttempts = 0;
    
    logSecurityEvent('ACCOUNT_LOCKED', {
      userId: this._id,
      lockUntil: this.lockUntil
    });
  }
  
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Remove old tokens
userSchema.methods.cleanOldTokens = async function(maxTokens = 5) {
  if (this.tokens.length > maxTokens) {
    this.tokens = this.tokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, maxTokens);
    await this.save();
  }
};

// Two-factor authentication setup
userSchema.methods.setupTwoFactor = function(secret) {
  this.twoFactorSecret = secret;
  this.twoFactorEnabled = true;
};

userSchema.methods.disableTwoFactor = function() {
  this.twoFactorSecret = undefined;
  this.twoFactorEnabled = false;
};

/* ======================
   STATIC METHODS
   ====================== */

// Find by credentials for login
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email })
    .select('+password +tokens +loginAttempts +lockUntil +twoFactorSecret');
  
  if (!user) {
    logSecurityEvent('LOGIN_FAILED_EMAIL', { email });
    throw new Error('Invalid email or password');
  }
  
  if (user.lockUntil && user.lockUntil > Date.now()) {
    logSecurityEvent('LOGIN_ATTEMPT_LOCKED', {
      userId: user._id,
      lockUntil: user.lockUntil
    });
    throw new Error(`Account locked. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}`);
  }
  
  if (!user.isActive) {
    logSecurityEvent('LOGIN_ATTEMPT_INACTIVE', { userId: user._id });
    throw new Error('Account is deactivated');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    logSecurityEvent('LOGIN_FAILED_PASSWORD', { userId: user._id });
    throw new Error('Invalid email or password');
  }
  
  await user.resetLoginAttempts();
  return user;
};

// Password strength checker
userSchema.statics.checkPasswordStrength = function(password) {
  const strength = {
    score: 0,
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password)
  };

  strength.score = Object.values(strength).filter(Boolean).length - 1;
  return strength;
};

/* ======================
   VIRTUALS
   ====================== */

userSchema.virtual('referralUrl').get(function() {
  return `${process.env.BASE_URL}/register?ref=${this.referralCode}`;
});

userSchema.virtual('isLocked').get(function() {
  return this.lockUntil && this.lockUntil > Date.now();
});

userSchema.virtual('activeSessions').get(function() {
  return this.tokens.length;
});

/* ======================
   INDEXES
   ====================== */

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true });
userSchema.index({ points: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'tokens.token': 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ lastLogin: -1 });

const User = mongoose.model('user', userSchema);

module.exports = User;
