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

const resetUserPassword = async () => {
  try {
    // Delete existing user
    await User.deleteOne({ email: 'zizoumoha004@gmail.com' });
    console.log('🗑️ Deleted existing user');
    
    // Create new user with known password
    const hashedPassword = await bcrypt.hash('74986642Aa;', 12);
    const user = await User.create({
      name: 'abdiaziz mohamed',
      email: 'zizoumoha004@gmail.com',
      password: hashedPassword,
      role: 'student',
      emailVerified: true
    });
    
    console.log('✅ User created successfully:', user.email);
    console.log('🔑 Password: 74986642Aa;');
    console.log('🔑 Hashed password:', hashedPassword);
    
    // Test password verification
    const isValid = await bcrypt.compare('74986642Aa;', hashedPassword);
    console.log('🔍 Password verification test:', isValid ? '✅ Valid' : '❌ Invalid');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  resetUserPassword();
});
