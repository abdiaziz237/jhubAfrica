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

const createNewUser = async () => {
  try {
    // Create new user with different email
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      role: 'student',
      emailVerified: true
    });
    
    console.log('✅ New user created successfully:', user.email);
    console.log('🔑 Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  createNewUser();
});
