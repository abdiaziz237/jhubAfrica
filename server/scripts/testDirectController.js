require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testDirectController = async () => {
  try {
    // Get user
    const user = await User.findOne({ email: 'abdiazizmohamed520@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Test the getEnrolledCourses function directly
    const courseController = require('../controllers/courseController');
    
    // Mock request object
    const mockReq = {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    };
    
    // Mock response object
    const mockRes = {
      json: (data) => {
        console.log('✅ API Response:', JSON.stringify(data, null, 2));
        if (data.success && data.data.length > 0) {
          console.log(`🎉 SUCCESS: Found ${data.data.length} courses!`);
          data.data.forEach((course, index) => {
            console.log(`${index + 1}. ${course.title} (${course.approvedOnly ? 'Approved Interest' : 'Enrolled'})`);
          });
        } else {
          console.log('❌ No courses found in response');
        }
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, JSON.stringify(data, null, 2));
        }
      })
    };
    
    // Call the function directly
    await courseController.getEnrolledCourses(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    process.exit(0);
  }
};

connectDB().then(() => {
  testDirectController();
});
