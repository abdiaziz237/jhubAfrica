require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugLogin = async () => {
  try {
    const email = 'testuser@example.com';
    const password = 'password123';
    
    console.log('🔍 Debugging login for:', email);
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +twoFactorSecret');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('🔍 User isActive:', user.isActive);
    console.log('🔍 User emailVerified:', user.emailVerified);
    console.log('🔍 User lockUntil:', user.lockUntil);
    console.log('🔍 User loginAttempts:', user.loginAttempts);
    
    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match:', isMatch);
    
    if (isMatch) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect');
      console.log('🔍 Stored password hash:', user.password);
      
      // Test with a new hash
      const newHash = await bcrypt.hash(password, 12);
      const newMatch = await bcrypt.compare(password, newHash);
      console.log('🔍 New hash test:', newMatch);
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
  } finally {
    process.exit(0);
  }
};

connectDB().then(() => {
  debugLogin();
});
