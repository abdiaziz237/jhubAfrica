const mongoose = require('mongoose');
const User = require('../models/user');
const Enrollment = require('../models/Enrollment');

// Connect to MongoDB Atlas
const MONGO_URI = 'mongodb+srv://jhubadmin:admin1234@cluster0.blbkroq.mongodb.net/jhub?retryWrites=true&w=majority&appName=Cluster0';

async function syncUserPoints() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    let totalFixed = 0;
    let totalChecked = 0;
    
    for (const user of users) {
      totalChecked++;
      
      // Count enrolled courses for this user
      const enrollments = await Enrollment.find({ 
        student: user._id,
        status: { $in: ['active', 'completed'] }
      });
      
      // Calculate expected points
      let expectedPoints = 0;
      expectedPoints += enrollments.length * 100; // 100 points per enrollment
      if (user.profileComplete) expectedPoints += 25;
      if (user.emailVerified) expectedPoints += 25;
      
      if (user.points !== expectedPoints) {
        console.log(`⚠️  Fixing points for ${user.name} (${user.email}): ${user.points} → ${expectedPoints}`);
        
        // Update user points to correct value
        await User.findByIdAndUpdate(user._id, {
          points: expectedPoints
        });
        
        totalFixed++;
      }
    }
    
    console.log(`\n🎉 Points Sync Complete:`);
    console.log(`   Users checked: ${totalChecked}`);
    console.log(`   Users fixed: ${totalFixed}`);
    console.log(`   Users already correct: ${totalChecked - totalFixed}`);
    
    return { totalChecked, totalFixed };
    
  } catch (error) {
    console.error('❌ Error syncing user points:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  syncUserPoints()
    .then(() => {
      console.log('✅ Points sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Points sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncUserPoints };
