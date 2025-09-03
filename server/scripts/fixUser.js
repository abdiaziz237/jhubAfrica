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

const fixUser = async () => {
  try {
    // Update the existing user
    const hashedPassword = await bcrypt.hash('74986642Aa;', 12);
    
    const user = await User.findOneAndUpdate(
      { email: 'zizoumoha004@gmail.com' },
      { 
        password: hashedPassword,
        emailVerified: true,
        isActive: true,
        $unset: { 
          lockUntil: 1,
          loginAttempts: 1
        }
      },
      { new: true }
    );
    
    if (user) {
      console.log('✅ User updated successfully:', user.email);
      console.log('🔑 Password: 74986642Aa;');
      console.log('🔑 Email verified:', user.emailVerified);
      console.log('🔑 Is active:', user.isActive);
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  fixUser();
});
