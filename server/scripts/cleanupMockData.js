const mongoose = require('mongoose');
const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Waitlist = require('../models/Waitlist');
const CourseInterest = require('../models/CourseInterest');

class MockDataCleanup {
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

  async clearAllMockData() {
    try {
      console.log('🧹 Starting cleanup of all mock data...\n');

      // Clear all collections
      const collections = [
        { name: 'Users', model: User, description: '👥 Users' },
        { name: 'Courses', model: Course, description: '📚 Courses' },
        { name: 'Enrollments', model: Enrollment, description: '📝 Enrollments' },
        { name: 'Waitlists', model: Waitlist, description: '📋 Waitlists' },
        { name: 'Course Interests', model: CourseInterest, description: '💼 Course Interests' }
      ];

      for (const collection of collections) {
        const count = await collection.model.countDocuments();
        if (count > 0) {
          await collection.model.deleteMany({});
          console.log(`🗑️  Cleared ${count} ${collection.description}`);
        } else {
          console.log(`✅ ${collection.description} already empty`);
        }
      }

      console.log('\n🎉 All mock data cleared successfully!');
      console.log('📊 Database is now clean and ready for real data.');
      
      return true;
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      return false;
    }
  }

  async verifyCleanDatabase() {
    try {
      console.log('\n🔍 Verifying clean database...\n');

      const userCount = await User.countDocuments();
      const courseCount = await Course.countDocuments();
      const enrollmentCount = await Enrollment.countDocuments();
      const waitlistCount = await Waitlist.countDocuments();
      const interestCount = await CourseInterest.countDocuments();

      console.log('📊 Database Status:');
      console.log('==================');
      console.log(`👥 Users: ${userCount}`);
      console.log(`📚 Courses: ${courseCount}`);
      console.log(`📝 Enrollments: ${enrollmentCount}`);
      console.log(`📋 Waitlists: ${waitlistCount}`);
      console.log(`💼 Course Interests: ${interestCount}`);

      if (userCount === 0 && courseCount === 0 && enrollmentCount === 0 && waitlistCount === 0 && interestCount === 0) {
        console.log('\n✅ Database is completely clean!');
        console.log('🚀 Ready for real data creation.');
        return true;
      } else {
        console.log('\n⚠️  Some data still exists. Cleanup may be incomplete.');
        return false;
      }
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
  }

  async resetDatabaseIndexes() {
    try {
      console.log('\n🔧 Resetting database indexes...');

      // Drop all indexes and recreate them
      await User.collection.dropIndexes();
      await Course.collection.dropIndexes();
      await Enrollment.collection.dropIndexes();
      await Waitlist.collection.dropIndexes();
      await CourseInterest.collection.dropIndexes();

      console.log('✅ Database indexes reset successfully');
      return true;
    } catch (error) {
      console.error('❌ Index reset failed:', error.message);
      return false;
    }
  }

  async runFullCleanup() {
    try {
      await this.clearAllMockData();
      await this.resetDatabaseIndexes();
      await this.verifyCleanDatabase();
      
      console.log('\n🎯 Database cleanup completed successfully!');
      console.log('📝 Next steps:');
      console.log('   1. Create real admin users');
      console.log('   2. Add real courses with proper content');
      console.log('   3. Set up real user registrations');
      console.log('   4. Configure waitlist thresholds');
      
      return true;
    } catch (error) {
      console.error('❌ Full cleanup failed:', error.message);
      return false;
    }
  }
}

// Run cleanup if called directly
if (require.main === module) {
  const cleanup = new MockDataCleanup();
  
  cleanup.connect()
    .then(() => cleanup.runFullCleanup())
    .then(() => cleanup.disconnect())
    .catch(error => {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    });
}

module.exports = MockDataCleanup;
