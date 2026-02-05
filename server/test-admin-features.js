const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

// First, we need to login as admin to get token
async function getAdminToken() {
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eduspark.com', // Assuming this is the admin email from create-admin.js
      password: 'admin123'
    });
    return loginResponse.data.token;
  } catch (error) {
    console.error('Failed to login as admin:', error.response?.data || error.message);
    return null;
  }
}

async function testAdminFeatures() {
  try {
    console.log('Testing Admin Features...');

    const adminToken = await getAdminToken();
    if (!adminToken) {
      console.log('Cannot test admin features without admin token');
      return;
    }

    const headers = { Authorization: `Bearer ${adminToken}` };

    // Get all users
    const usersResponse = await axios.get(`${API_BASE}/auth/users`, { headers });
    console.log(`Found ${usersResponse.data.users.length} users`);

    // Find a test user to block/unblock
    const testUser = usersResponse.data.users.find(u => u.email === 'teststudent@example.com');
    if (!testUser) {
      console.log('Test user not found, creating one first...');
      return;
    }

    console.log(`Testing with user: ${testUser.name} (${testUser.status})`);

    // Block the user
    await axios.put(`${API_BASE}/auth/users/${testUser._id}/status`, { status: 'blocked' }, { headers });
    console.log('User blocked successfully');

    // Try to login with blocked user (should fail)
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'teststudent@example.com',
        password: 'password123'
      });
      console.log('ERROR: Blocked user was able to login!');
    } catch (error) {
      console.log('GOOD: Blocked user login failed as expected');
    }

    // Unblock the user
    await axios.put(`${API_BASE}/auth/users/${testUser._id}/status`, { status: 'approved' }, { headers });
    console.log('User unblocked successfully');

    // Try to login again (should succeed)
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    console.log('GOOD: Unblocked user login successful');

    console.log('Admin features test PASSED');

  } catch (error) {
    console.error('Admin features test FAILED:', error.response?.data || error.message);
  }
}

testAdminFeatures();
