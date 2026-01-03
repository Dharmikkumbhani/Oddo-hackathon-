const axios = require('axios');

const testLogin = async () => {
  const url = 'http://localhost:5001/api/auth/login';
  
  // Test Admin
  try {
    console.log('Testing Admin Login...');
    const adminRes = await axios.post(url, {
      role: 'Admin',
      identifier: 'Admin',
      password: '123456'
    });
    console.log('✅ Admin Login Success:', adminRes.data.user);
  } catch (error) {
    console.log('❌ Admin Login Failed:', error.response?.data || error.message);
  }

  // Test HR
  try {
    console.log('\nTesting HR Login...');
    const hrRes = await axios.post(url, {
      role: 'HR',
      identifier: 'HR',
      password: '123456'
    });
    console.log('✅ HR Login Success:', hrRes.data.user);
  } catch (error) {
    console.log('❌ HR Login Failed:', error.response?.data || error.message);
  }
};

testLogin();
