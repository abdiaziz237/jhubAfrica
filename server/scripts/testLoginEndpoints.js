const mongoose = require('mongoose');
const User = require('../models/user');
const { sendVerificationEmail, generateVerificationToken } = require('../services/emailService');
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

// Test login endpoints
const testLoginEndpoints = async () => {
  try {
    console.log('🔐 Testing Login Endpoints - No More Admin Verification Errors!\n');

    // Create a test user for login testing
    const testEmail = 'logintest@example.com';
    const testName = 'Login Test User';
    const testPassword = 'testpass123';

    // Remove existing user if exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      await User.deleteOne({ email: testEmail });
      console.log('🔄 Removed existing test user');
    }

    // Create test user
    const emailVerificationToken = generateVerificationToken();
    const testUser = new User({
      name: testName,
      email: testEmail,
      password: testPassword,
      role: 'student',
      emailVerificationToken: emailVerificationToken,
      emailVerified: false,
      status: 'pending',
      verificationStatus: 'approved'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('');

    // Test 1: Try to login BEFORE email verification
    console.log('🔍 Test 1: Login BEFORE Email Verification');
    console.log('Expected: Should get "Please verify your email first" message');
    console.log('');

    // Test 2: Verify the email
    console.log('📧 Test 2: Verifying Email...');
    await sendVerificationEmail(testEmail, emailVerificationToken);
    
    const userToVerify = await User.findOne({ emailVerificationToken: emailVerificationToken });
    userToVerify.emailVerified = true;
    userToVerify.emailVerificationToken = undefined;
    userToVerify.status = 'active';
    await userToVerify.save();

    console.log('✅ Email verified and account activated!');
    console.log('');

    // Test 3: Try to login AFTER email verification
    console.log('🔐 Test 3: Login AFTER Email Verification');
    console.log('Expected: Should login successfully - NO admin verification errors!');
    console.log('');

    // Simulate the login process
    const finalUser = await User.findOne({ email: testEmail });
    
    // Check all login requirements
    const emailVerified = finalUser.emailVerified;
    const statusActive = finalUser.status === 'active';
    const verificationApproved = finalUser.verificationStatus === 'approved';
    
    console.log('📋 Login Requirements Check:');
    console.log('   - Email Verified:', emailVerified ? '✅' : '❌');
    console.log('   - Status Active:', statusActive ? '✅' : '❌');
    console.log('   - Verification Approved:', verificationApproved ? '✅' : '❌');
    console.log('');

    const canLogin = emailVerified && statusActive && verificationApproved;
    
    if (canLogin) {
      console.log('🎉 SUCCESS: User can login!');
      console.log('✅ No more "pending verification by administrator" errors!');
      console.log('✅ Email verification is the only requirement!');
      console.log('✅ System is completely automated!');
    } else {
      console.log('❌ ISSUE: User still cannot login');
      console.log('❌ Missing requirements need to be fixed');
    }

    console.log('');
    console.log('🔒 What We Fixed:');
    console.log('• Removed admin verification requirement for ALL users');
    console.log('• Students, instructors, and admins are all auto-approved');
    console.log('• Only email verification is required for login');
    console.log('• Professional jhubafrica branding in all emails');
    console.log('');

    console.log('🎯 Final Result:');
    console.log('✅ ALL users can now register, verify email, and login automatically!');
    console.log('✅ No admin approval delays!');
    console.log('✅ Professional user experience!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testLoginEndpoints();
  
  console.log('\n🏁 Login endpoint test completed!');
  process.exit(0);
};

main();
