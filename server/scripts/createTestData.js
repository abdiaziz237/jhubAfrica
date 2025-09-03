require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/user');
const Course = require('../models/Course');
const CourseInterest = require('../models/CourseInterest');
const Enrollment = require('../models/Enrollment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for test data creation');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestData = async () => {
  try {
    console.log('🧹 Cleaning existing data...');
    
    // Clean existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await CourseInterest.deleteMany({});
    await Enrollment.deleteMany({});
    
    console.log('👤 Creating test user...');
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = await User.create({
      name: 'abdiaziz mohamed',
      email: 'zizoumoha004@gmail.com',
      password: hashedPassword,
      role: 'student',
      isVerified: true,
      verificationToken: 'test-token'
    });
    
    console.log('📚 Creating test courses...');
    
    // Create test courses
    const course1 = await Course.create({
      title: 'Cisco Certified Support Technician (CCST) - Networking Fundamentals Course',
      description: 'Learn networking fundamentals with Cisco CCST certification',
      category: 'Networking',
      image: 'cisco.jpg',
      points: 100,
      duration: '8 weeks',
      status: 'active',
      createdBy: testUser._id
    });
    
    const course2 = await Course.create({
      title: 'Swift 1 - Apple Swift Certification Exam + Practice Test',
      description: 'Master Swift programming with Apple certification',
      category: 'Programming',
      image: 'swift.jpg',
      points: 150,
      duration: '12 weeks',
      status: 'active',
      createdBy: testUser._id
    });
    
    const course3 = await Course.create({
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from basics to advanced concepts',
      category: 'Programming',
      image: 'app.jpg',
      points: 80,
      duration: '6 weeks',
      status: 'active',
      createdBy: testUser._id
    });
    
    console.log('🎯 Creating approved course interests...');
    
    // Create approved course interests
    await CourseInterest.create({
      email: testUser.email,
      fullName: testUser.name,
      courseId: course1._id,
      courseTitle: course1.title,
      motivation: 'I want to learn networking fundamentals',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date()
    });
    
    await CourseInterest.create({
      email: testUser.email,
      fullName: testUser.name,
      courseId: course2._id,
      courseTitle: course2.title,
      motivation: 'I want to master Swift programming',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date()
    });
    
    await CourseInterest.create({
      email: testUser.email,
      fullName: testUser.name,
      courseId: course3._id,
      courseTitle: course3.title,
      motivation: 'I want to learn JavaScript from basics',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date()
    });
    
    console.log('✅ Test data created successfully!');
    console.log(`👤 User: ${testUser.email}`);
    console.log(`📚 Courses: 3 created`);
    console.log(`🎯 Approved interests: 3 created`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createTestData();
});