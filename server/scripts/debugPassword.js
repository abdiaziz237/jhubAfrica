const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

class PasswordDebugger {
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

  async debugPassword() {
    try {
      console.log('🔍 Debugging Password Issue...\n');

      // Find the admin user
      const admin = await User.findOne({ email: 'admin@admin.com' });
      if (!admin) {
        console.log('❌ Admin not found!');
        return false;
      }

      console.log('📊 Admin Found:');
      console.log('================');
      console.log(`👤 Name: ${admin.name}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👑 Role: ${admin.role}`);
      console.log(`✅ Status: ${admin.status}`);
      console.log(`✅ Active: ${admin.isActive}`);

      // Check if password field exists
      console.log('\n🔐 Password Field Check:');
      console.log('========================');
      console.log(`Password field exists: ${admin.password ? 'YES' : 'NO'}`);
      console.log(`Password length: ${admin.password ? admin.password.length : 'N/A'}`);
      console.log(`Password starts with $2b$: ${admin.password ? admin.password.startsWith('$2b$') : 'N/A'}`);

      // Try to find user with password explicitly selected
      console.log('\n🔍 Testing findByCredentials manually...');
      const userWithPassword = await User.findOne({ email: 'admin@admin.com' })
        .select('+password +loginAttempts +lockUntil +twoFactorSecret');
      
      if (userWithPassword) {
        console.log('✅ User found with password selected');
        console.log(`Password exists: ${userWithPassword.password ? 'YES' : 'NO'}`);
        console.log(`Password length: ${userWithPassword.password ? userWithPassword.password.length : 'N/A'}`);
        
        // Test password comparison
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, userWithPassword.password);
        console.log(`Password match test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        
        if (isMatch) {
          console.log('✅ Password comparison works!');
        } else {
          console.log('❌ Password comparison failed!');
          
          // Let's see what the actual stored password looks like
          console.log('\n🔍 Stored Password Analysis:');
          console.log(`Raw password: ${userWithPassword.password}`);
          console.log(`Password type: ${typeof userWithPassword.password}`);
          
          // Try to hash the test password and compare
          const testHash = await bcrypt.hash(testPassword, 12);
          console.log(`Test password hash: ${testHash}`);
          console.log(`Test hash starts with $2b$: ${testHash.startsWith('$2b$')}`);
        }
      } else {
        console.log('❌ User not found with password selected');
      }

      return true;
    } catch (error) {
      console.error('❌ Password debugging failed:', error.message);
      return false;
    }
  }

  async runDebug() {
    try {
      await this.debugPassword();
      console.log('\n🔍 Password debugging completed!');
      
    } catch (error) {
      console.error('❌ Debug failed:', error.message);
      process.exit(1);
    }
  }
}

// Run debug if called directly
if (require.main === module) {
  const passwordDebugger = new PasswordDebugger();
  
  passwordDebugger.connect()
    .then(() => passwordDebugger.runDebug())
    .then(() => passwordDebugger.disconnect())
    .catch(error => {
      console.error('❌ Debug failed:', error.message);
      process.exit(1);
    });
}

module.exports = PasswordDebugger;
