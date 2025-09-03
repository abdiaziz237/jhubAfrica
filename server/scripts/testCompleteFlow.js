require('dotenv').config();
const axios = require('axios');

const testCompleteFlow = async () => {
  try {
    console.log('🧪 Testing complete flow...');
    
    // Step 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'abdiazizmohamed520@gmail.com',
      password: '74986642Aa;'
    });
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    
    // Step 2: Test enrolled courses API
    console.log('2️⃣ Testing enrolled courses API...');
    const enrolledResponse = await axios.get('http://localhost:5001/api/v1/courses/enrolled', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Enrolled courses API call successful!');
    console.log('📊 Response status:', enrolledResponse.status);
    console.log('📊 Response data:', JSON.stringify(enrolledResponse.data, null, 2));
    
    if (enrolledResponse.data.success && enrolledResponse.data.data.length > 0) {
      console.log(`🎉 SUCCESS: Found ${enrolledResponse.data.data.length} courses!`);
      enrolledResponse.data.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course.approvedOnly ? 'Approved Interest' : 'Enrolled'})`);
      });
    } else {
      console.log('❌ No courses found in response');
    }
    
    // Step 3: Test user info API
    console.log('3️⃣ Testing user info API...');
    const userResponse = await axios.get('http://localhost:5001/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User info API call successful!');
    console.log('👤 User:', userResponse.data.user?.name, userResponse.data.user?.email);
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
};

testCompleteFlow();
