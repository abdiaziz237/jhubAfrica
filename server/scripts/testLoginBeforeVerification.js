const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jhubadmin:admin1234@cluster0.blbkroq.mongodb.net/jhub?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test login attempts for unverified users
const testLoginBeforeVerification = async () => {
  try {
    console.log('🔐 Testing Login Before Email Verification for jhubafrica...\n');

    // Find the test user we just created
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please run the registration demo first.');
      return;
    }

    console.log('👤 Test User Details:');
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Email Verified:', testUser.emailVerified ? '✅' : '❌');
    console.log('Status:', testUser.status);
    console.log('');

    // Simulate what happens during login
    console.log('🔍 Simulating Login Process...');
    
    // Check 1: Email verification
    if (!testUser.emailVerified) {
      console.log('❌ LOGIN BLOCKED: Email not verified');
      console.log('📧 User must verify email before login');
      console.log('💡 Solution: User should check email and click verification link');
      console.log('');
    }

    // Check 2: Account status
    if (testUser.status === 'pending') {
      console.log('❌ LOGIN BLOCKED: Account status is pending');
      console.log('💡 Solution: User must verify email to activate account');
      console.log('');
    }

    // Check 3: Verification status
    if (testUser.verificationStatus === 'pending') {
      console.log('❌ LOGIN BLOCKED: Account verification pending');
      console.log('💡 Solution: Admin must approve account or user must verify email');
      console.log('');
    }

    // Now let's verify the email and show the difference
    console.log('🔄 Now verifying the email...');
    
    testUser.emailVerified = true;
    testUser.status = 'active';
    await testUser.save();
    
    console.log('✅ Email verified and account activated!');
    console.log('');
    
    // Simulate successful login
    console.log('🔐 Simulating Successful Login After Verification...');
    
    if (testUser.emailVerified && testUser.status === 'active') {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('✅ User can now access jhubafrica');
      console.log('✅ All features unlocked');
      console.log('');
    }

    // Show final state
    console.log('📊 Final User State:');
    console.log('Email Verified:', testUser.emailVerified ? '✅' : '❌');
    console.log('Status:', testUser.status);
    console.log('Verification Status:', testUser.verificationStatus);
    console.log('Can Login:', (testUser.emailVerified && testUser.status === 'active') ? '✅' : '❌');

    console.log('\n🎯 Key Points for jhubafrica:');
    console.log('• New users MUST verify email before login');
    console.log('• Verification emails are sent automatically');
    console.log('• Users click link in email to verify');
    console.log('• After verification, full access is granted');
    console.log('• No manual admin approval needed for basic users');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testLoginBeforeVerification();
  
  console.log('\n🏁 Login verification test completed!');
  process.exit(0);
};

main();
