const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function testAnnouncementCreation() {
  try {
    console.log('Testing Announcement Creation...');

    // First, register a test admin user
    console.log('\n1. Registering test admin user...');
    const timestamp = Date.now();
    const adminEmail = `testadmin${timestamp}@example.com`;
    const adminReg = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Faculty',
      email: adminEmail,
      password: 'faculty123',
      role: 'faculty'
    });
    console.log('Test admin registered with status:', adminReg.data.user.status);

    // Login as the test admin
    console.log('\n2. Logging in as test admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: adminEmail,
      password: 'faculty123'
    });
    const adminToken = adminLogin.data.token;
    const headers = { Authorization: `Bearer ${adminToken}` };
    console.log('Test admin login successful');

    // Test creating announcement with faculty target role
    console.log('\n2. Testing announcement creation with faculty target role...');
    const announcementData = {
      title: 'Test Announcement with Faculty',
      content: 'This is a test announcement targeting faculty members.',
      targetRoles: ['faculty']
    };

    const response = await axios.post(`${API_BASE}/announcements`, announcementData, { headers });
    console.log('Announcement created successfully:', response.data.message);

    // Test creating announcement with multiple roles including faculty
    console.log('\n3. Testing announcement creation with multiple roles...');
    const multiRoleData = {
      title: 'Test Announcement Multi-Role',
      content: 'This announcement targets admin, faculty, and students.',
      targetRoles: ['admin', 'faculty', 'student']
    };

    const multiResponse = await axios.post(`${API_BASE}/announcements`, multiRoleData, { headers });
    console.log('Multi-role announcement created successfully:', multiResponse.data.message);

    // Test getting announcements
    console.log('\n4. Testing announcement retrieval...');
    const getResponse = await axios.get(`${API_BASE}/announcements`, { headers });
    console.log(`Retrieved ${getResponse.data.announcements.length} announcements`);

    console.log('\n✅ All announcement tests PASSED!');
    console.log('- Announcement creation with faculty role works');
    console.log('- Multi-role announcements work');
    console.log('- Announcement retrieval works');

  } catch (error) {
    console.error('❌ Test FAILED:', error.response?.data || error.message);
    console.error('Full error:', error);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    if (error.response?.status === 400) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testAnnouncementCreation();
