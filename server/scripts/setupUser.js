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

const setupUser = async () => {
  try {
    const email = 'abdiazizmohamed520@gmail.com';
    const password = '74986642Aa;';
    
    console.log('🔧 Setting up user account...');
    console.log('📧 Email:', email);
    
    // Delete existing user if any
    await User.deleteOne({ email });
    console.log('🗑️ Cleared any existing user');
    
    // Create new user with correct credentials
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: 'Abdiaziz Mohamed',
      email: email,
      password: hashedPassword,
      role: 'student',
      emailVerified: true,
      isActive: true
    });
    
    console.log('✅ User account created successfully!');
    console.log('👤 Name:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: 74986642Aa;');
    console.log('✅ Email verified:', user.emailVerified);
    console.log('✅ Account active:', user.isActive);
    
    // Test password verification
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('🔍 Password verification test:', isValid ? '✅ Valid' : '❌ Invalid');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up user:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  setupUser();
});
