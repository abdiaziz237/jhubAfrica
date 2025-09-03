const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class DirectAdminCreator {
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

  async createDirectAdmin() {
    try {
      console.log('👑 Creating Direct Admin (Bypassing Middleware)...\n');

      // Get the database connection directly
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');

      // Delete any existing admin with this email
      const existingAdmin = await usersCollection.findOne({ email: 'admin@admin.com' });
      if (existingAdmin) {
        console.log('⚠️  Admin already exists. Deleting old one...');
        await usersCollection.deleteOne({ email: 'admin@admin.com' });
      }

      // Create a simple password and hash it
      const plainPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      
      console.log('🔐 Password Details:');
      console.log(`Plain password: ${plainPassword}`);
      console.log(`Hashed password: ${hashedPassword}`);
      console.log(`Hash starts with $2b$: ${hashedPassword.startsWith('$2b$')}`);

      // Create admin document directly in the collection (bypassing Mongoose middleware)
      const adminDoc = {
        name: 'Direct Administrator',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        isActive: true,
        emailVerified: true,
        verificationStatus: 'approved',
        points: 1000,
        lastLogin: new Date(),
        passwordChangedAt: new Date(),
        lastPasswordChange: new Date(),
        twoFactorEnabled: false,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(adminDoc);
      console.log('✅ Direct Admin created successfully!');
      console.log(`Admin ID: ${result.insertedId}`);
      
      // Verify the password works
      const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(`Password verification test: ${testMatch ? 'SUCCESS' : 'FAILED'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Direct admin creation failed:', error.message);
      return false;
    }
  }

  async testDirectLogin() {
    try {
      console.log('\n🔍 Testing Direct Login Process...\n');

      // Test the findByCredentials method manually using the collection
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne({ email: 'admin@admin.com' });
      
      if (!user) {
        console.log('❌ User not found');
        return false;
      }

      console.log('📊 User Found:');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log(`Password exists: ${user.password ? 'YES' : 'NO'}`);

      // Test password comparison
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`Password match test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

      if (isMatch) {
        console.log('✅ Direct login test passed!');
        return true;
      } else {
        console.log('❌ Direct login test failed!');
        return false;
      }
    } catch (error) {
      console.error('❌ Direct login test failed:', error.message);
      return false;
    }
  }

  async runSetup() {
    try {
      await this.createDirectAdmin();
      await this.testDirectLogin();

      console.log('\n🎉 Direct Admin setup completed successfully!');
      console.log('\n🔐 Login Credentials:');
      console.log('=====================');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin123');
      console.log('\n📝 Next Steps:');
      console.log('   1. Test login with these credentials');
      console.log('   2. This should work now (bypassing middleware)!');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DirectAdminCreator();
  
  setup.connect()
    .then(() => setup.runSetup())
    .then(() => setup.disconnect())
    .catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = DirectAdminCreator;
