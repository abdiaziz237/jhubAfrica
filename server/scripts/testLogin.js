require('dotenv').config();
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login...');
    
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'abdiazizmohamed520@gmail.com',
      password: '74986642Aa;' 
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ Login successful!');
      console.log('🔑 Token:', loginResponse.data.token.substring(0, 50) + '...');
      
      // Now test the enrolled courses endpoint with the valid token
      const enrolledResponse = await axios.get('http://localhost:5001/api/v1/courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Enrolled courses API call successful!');
      console.log('📊 Response:', JSON.stringify(enrolledResponse.data, null, 2));
      
      if (enrolledResponse.data.success && enrolledResponse.data.data.length > 0) {
        console.log(`🎉 SUCCESS: Found ${enrolledResponse.data.data.length} courses!`);
        enrolledResponse.data.data.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title} (${course.approvedOnly ? 'Approved Interest' : 'Enrolled'})`);
        });
      } else {
        console.log('❌ No courses found in response');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
};

testLogin();
