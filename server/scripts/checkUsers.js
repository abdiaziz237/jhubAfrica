require('dotenv').config();
const mongoose = require('mongoose');
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

const checkUsers = async () => {
  try {
    const users = await User.find({});
    console.log('👥 Users in database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, Role: ${user.role}, Verified: ${user.isVerified}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  checkUsers();
});
