// Load environment variables first
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/user');

class AdminAccessTest {
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

  async testAdminAccess() {
    try {
      console.log('🧪 Testing admin access and user management...\n');

      // Find admin user
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('❌ No admin user found');
        return false;
      }

      console.log('👤 Found admin user:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      });

      // Find all users
      const allUsers = await User.find({}).select('-password -tokens');
      console.log(`📊 Total users in database: ${allUsers.length}`);
      
      allUsers.forEach(user => {
        console.log(`   - ${user._id}: ${user.email} (${user.role})`);
      });

      // Test finding a specific user by ID
      if (allUsers.length > 0) {
        const testUser = allUsers[0];
        console.log(`\n🔍 Testing findById for user: ${testUser._id}`);
        
        const foundUser = await User.findById(testUser._id).select('-password -tokens');
        if (foundUser) {
          console.log(`✅ Successfully found user: ${foundUser.email}`);
        } else {
          console.log(`❌ Failed to find user with ID: ${testUser._id}`);
        }
      }

      // Test finding user by email
      if (allUsers.length > 0) {
        const testUser = allUsers[0];
        console.log(`\n🔍 Testing findByEmail for user: ${testUser.email}`);
        
        const foundUser = await User.findOne({ email: testUser.email }).select('-password -tokens');
        if (foundUser) {
          console.log(`✅ Successfully found user by email: ${foundUser.email}`);
        } else {
          console.log(`❌ Failed to find user by email: ${testUser.email}`);
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }

  async runTest() {
    try {
      await this.testAdminAccess();
      console.log('\n🎉 Admin access test completed successfully!');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new AdminAccessTest();
  
  test.connect()
    .then(() => test.runTest())
    .then(() => test.disconnect())
    .catch(error => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = AdminAccessTest;
