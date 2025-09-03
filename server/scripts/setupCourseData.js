require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Course = require('../models/Course');
const CourseInterest = require('../models/CourseInterest');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const setupCourseData = async () => {
  try {
    const userEmail = 'abdiazizmohamed520@gmail.com';
    
    console.log('🔧 Setting up course data...');
    
    // Get user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email);
    
    // Create test courses
    console.log('📚 Creating test courses...');
    
    const course1 = await Course.create({
      title: 'Cisco Certified Support Technician (CCST) - Networking Fundamentals Course',
      description: 'Learn networking fundamentals with Cisco CCST certification',
      category: 'Networking',
      image: 'cisco.jpg',
      points: 100,
      duration: '8 weeks',
      status: 'active',
      createdBy: user._id
    });
    
    const course2 = await Course.create({
      title: 'Swift 1 - Apple Swift Certification Exam + Practice Test',
      description: 'Master Swift programming with Apple certification',
      category: 'Programming',
      image: 'swift.jpg',
      points: 150,
      duration: '12 weeks',
      status: 'active',
      createdBy: user._id
    });
    
    const course3 = await Course.create({
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from basics to advanced concepts',
      category: 'Programming',
      image: 'app.jpg',
      points: 80,
      duration: '6 weeks',
      status: 'active',
      createdBy: user._id
    });
    
    console.log('✅ Created 3 courses');
    
    // Create approved course interests
    console.log('🎯 Creating approved course interests...');
    
    await CourseInterest.create({
      email: userEmail,
      fullName: user.name,
      courseId: course1._id,
      courseTitle: course1.title,
      motivation: 'I want to learn networking fundamentals',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date(),
      responseDate: new Date(),
      adminResponse: 'Great choice! This course will help you build strong networking skills.'
    });
    
    await CourseInterest.create({
      email: userEmail,
      fullName: user.name,
      courseId: course2._id,
      courseTitle: course2.title,
      motivation: 'I want to master Swift programming',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date(),
      responseDate: new Date(),
      adminResponse: 'Excellent! Swift is a powerful language for iOS development.'
    });
    
    await CourseInterest.create({
      email: userEmail,
      fullName: user.name,
      courseId: course3._id,
      courseTitle: course3.title,
      motivation: 'I want to learn JavaScript fundamentals',
      status: 'approved',
      submittedAt: new Date(),
      approvedAt: new Date(),
      responseDate: new Date(),
      adminResponse: 'Perfect! JavaScript is essential for web development.'
    });
    
    console.log('✅ Created 3 approved course interests');
    
    // Verify the data
    const approvedInterests = await CourseInterest.find({
      email: userEmail,
      status: 'approved'
    }).populate('courseId');
    
    console.log('🔍 Verification: Found', approvedInterests.length, 'approved course interests');
    approvedInterests.forEach((interest, index) => {
      console.log(`${index + 1}. ${interest.courseTitle} - ${interest.status}`);
    });
    
    console.log('🎉 Course data setup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up course data:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  setupCourseData();
});
