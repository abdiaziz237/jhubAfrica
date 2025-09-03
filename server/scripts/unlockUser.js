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

const unlockUser = async () => {
  try {
    const user = await User.findOneAndUpdate(
      { email: 'zizoumoha004@gmail.com' },
      { 
        $unset: { 
          lockUntil: 1,
          loginAttempts: 1
        }
      },
      { new: true }
    );
    
    if (user) {
      console.log('✅ User unlocked successfully:', user.email);
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking user:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  unlockUser();
});
