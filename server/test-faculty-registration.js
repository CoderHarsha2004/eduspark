const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testFacultyRegistration() {
  try {
    console.log('Testing Faculty Registration...');

    // Register faculty
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Faculty',
      email: 'testfaculty@example.com',
      password: 'password123',
      role: 'faculty'
    });

    console.log('Registration Response:', registerResponse.data);

    // Login faculty
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testfaculty@example.com',
      password: 'password123'
    });

    console.log('Login Response:', loginResponse.data);

    console.log('Faculty registration and login test PASSED');

  } catch (error) {
    console.error('Faculty test FAILED:', error.response?.data || error.message);
  }
}

testFacultyRegistration();
