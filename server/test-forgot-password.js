const axios = require('axios');
const API_BASE = 'http://localhost:5004/api';

async function testForgotPassword() {
  try {
    console.log('Testing forgot-password endpoint...');

    // Test with non-existent email
    const response1 = await axios.post(`${API_BASE}/auth/forgot-password`, { email: 'nonexistent@example.com' });
    console.log('Non-existent email response:', response1.data);

    // Test with 'cmg' email
    const response2 = await axios.post(`${API_BASE}/auth/forgot-password`, { email: 'cmg' });
    console.log('cmg email response:', response2.data);

    // Test with valid email (assuming test user exists)
    const response3 = await axios.post(`${API_BASE}/auth/forgot-password`, { email: 'admin@eduspark.com' });
    console.log('Valid email response:', response3.data);

  } catch (error) {
    console.error('Test error:', error.response ? error.response.data : error.message);
  }
}

testForgotPassword();
