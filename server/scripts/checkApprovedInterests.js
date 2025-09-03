// Load environment variables first
require('dotenv').config();

const mongoose = require('mongoose');
const CourseInterest = require('../models/CourseInterest');
const User = require('../models/user');

class CheckApprovedInterests {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
      console.log(`📊 Database: ${this.connection.connection.name}`);
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async checkApprovedInterests() {
    try {
      console.log('🧪 Checking approved course interests...\n');

      // Check all course interests
      const allInterests = await CourseInterest.find({}).populate('courseId', 'title category');
      console.log(`📊 Total course interests: ${allInterests.length}`);
      
      allInterests.forEach(interest => {
        console.log(`   - ${interest._id}: ${interest.courseTitle} (${interest.email}) - Status: ${interest.status}`);
      });

      // Check approved interests specifically
      const approvedInterests = await CourseInterest.find({ status: 'approved' }).populate('courseId', 'title category');
      console.log(`\n✅ Approved course interests: ${approvedInterests.length}`);
      
      approvedInterests.forEach(interest => {
        console.log(`   - ${interest._id}: ${interest.courseTitle} (${interest.email}) - Course: ${interest.courseId?.title || 'N/A'}`);
      });

      // Check users
      const users = await User.find({}).select('email name role');
      console.log(`\n👥 Total users: ${users.length}`);
      
      users.forEach(user => {
        console.log(`   - ${user._id}: ${user.email} (${user.name}) - Role: ${user.role}`);
      });

      return true;

    } catch (error) {
      console.error('❌ Check failed:', error.message);
      throw error;
    }
  }

  async runCheck() {
    try {
      await this.checkApprovedInterests();
      console.log('\n🎉 Check completed successfully!');
    } catch (error) {
      console.error('❌ Check failed:', error.message);
      process.exit(1);
    }
  }
}

// Run check if called directly
if (require.main === module) {
  const check = new CheckApprovedInterests();
  
  check.connect()
    .then(() => check.runCheck())
    .then(() => check.disconnect())
    .catch(error => {
      console.error('❌ Check failed:', error.message);
      process.exit(1);
    });
}

module.exports = CheckApprovedInterests;
