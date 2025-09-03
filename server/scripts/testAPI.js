require('dotenv').config();
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🧪 Testing API endpoint...');
    
    // First, let's login to get a valid token
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'zizoumoha004@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // Now test the enrolled courses endpoint
    const enrolledResponse = await axios.get('http://localhost:5001/api/v1/courses/enrolled', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:');
    console.log('Status:', enrolledResponse.status);
    console.log('Data:', JSON.stringify(enrolledResponse.data, null, 2));
    
    if (enrolledResponse.data.success && enrolledResponse.data.data.length > 0) {
      console.log(`🎉 SUCCESS: Found ${enrolledResponse.data.data.length} courses!`);
      enrolledResponse.data.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course.approvedOnly ? 'Approved Interest' : 'Enrolled'})`);
      });
    } else {
      console.log('❌ No courses found in response');
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
};

testAPI();
