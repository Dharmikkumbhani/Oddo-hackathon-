const axios = require('axios');

const testLogin = async () => {
  const url = 'http://localhost:5001/api/auth/login';
  
  console.log(`\n🔵 Testing Login against: ${url}`);

  // Test Admin
  try {
    console.log('Testing Admin Login...');
    const adminRes = await axios.post(url, {
      role: 'Admin',
      identifier: 'Admin',
      password: '123456'
    });
    console.log('✅ Admin Login Success:', adminRes.data.user.role);
  } catch (error) {
    console.log('❌ Admin Login Failed:', JSON.stringify(error.response?.data) || error.message);
  }

  // Test HR
  try {
    console.log('\nTesting HR Login...');
    const hrRes = await axios.post(url, {
      role: 'HR',
      identifier: 'HR',
      password: '123456'
    });
    console.log('✅ HR Login Success:', hrRes.data.user.role);
  } catch (error) {
    console.log('❌ HR Login Failed:', error.response?.data || error.message);
  }

  // Test Employee SignUp & Login
  try {
      console.log('\nTesting Employee Signup...');
      const uniqueEmail = `testemp${Date.now()}@test.com`;
      const signupRes = await axios.post('http://localhost:5001/api/auth/register', {
          name: 'Test Employee',
          email: uniqueEmail,
          phone: '1234567890',
          password: 'password123',
          confirmPassword: 'password123', // Frontend usually sends this, backend ignores or checks? Backend controller doesn't seem to check confirmPassword, but frontend does.
          companyName: 'Test Corp'
      });
      console.log('✅ Employee Signup Success. Token received.');

      console.log('Testing Employee Login...');
      const loginRes = await axios.post(url, {
          role: 'Employee', // Frontend sends this
          identifier: uniqueEmail,
          password: 'password123'
      });
      console.log('✅ Employee Login Success:', loginRes.data.user.role);

  } catch (error) {
      console.log('❌ Employee Test Failed:', error.response?.data || error.message);
  }
};

testLogin();
