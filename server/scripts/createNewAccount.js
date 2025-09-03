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

const createNewAccount = async () => {
  try {
    // Create a completely new user account
    const hashedPassword = await bcrypt.hash('74986642Aa;', 12);
    const user = await User.create({
      name: 'Abdiaziz Mohamed',
      email: 'abdiaziz.test@gmail.com',
      password: hashedPassword,
      role: 'student',
      emailVerified: true,
      isActive: true
    });
    
    console.log('✅ New account created successfully!');
    console.log('📧 Email: abdiaziz.test@gmail.com');
    console.log('🔑 Password: 74986642Aa;');
    console.log('👤 Name: Abdiaziz Mohamed');
    console.log('✅ Email verified: true');
    console.log('✅ Account active: true');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating account:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  createNewAccount();
});
