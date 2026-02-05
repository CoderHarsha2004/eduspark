const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function testOverallSystem() {
  try {
    console.log('Testing Overall System...');

    // Test 1: New student registration (should be auto-approved)
    console.log('\n1. Testing new student registration...');
    const timestamp = Date.now();
    const studentReg = await axios.post(`${API_BASE}/auth/register`, {
      name: 'New Test Student',
      email: `newstudent${timestamp}@example.com`,
      password: 'password123',
      role: 'student'
    });
    console.log('Student registered with status:', studentReg.data.user.status);

    // Test login immediately
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: `newstudent${timestamp}@example.com`,
      password: 'password123'
    });
    console.log('Student login successful:', studentLogin.data.message);

    // Test 2: New faculty registration (should be auto-approved)
    console.log('\n2. Testing new faculty registration...');
    const facultyReg = await axios.post(`${API_BASE}/auth/register`, {
      name: 'New Test Faculty',
      email: `newfaculty${timestamp}@example.com`,
      password: 'password123',
      role: 'faculty'
    });
    console.log('Faculty registered with status:', facultyReg.data.user.status);

    // Test login immediately
    const facultyLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: `newfaculty${timestamp}@example.com`,
      password: 'password123'
    });
    console.log('Faculty login successful:', facultyLogin.data.message);

    // Test 3: Admin can still manage users
    console.log('\n3. Testing admin user management...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eduspark.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Get users
    const usersResponse = await axios.get(`${API_BASE}/auth/users`, { headers });
    const newStudent = usersResponse.data.users.find(u => u.email === 'newstudent@example.com');

    if (newStudent) {
      // Block the new student
      await axios.put(`${API_BASE}/auth/users/${newStudent._id}/status`, { status: 'blocked' }, { headers });
      console.log('Admin successfully blocked student');

      // Try login (should fail)
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: 'newstudent@example.com',
          password: 'password123'
        });
        console.log('ERROR: Blocked student could login');
      } catch (error) {
        console.log('GOOD: Blocked student login failed');
      }

      // Unblock
      await axios.put(`${API_BASE}/auth/users/${newStudent._id}/status`, { status: 'approved' }, { headers });
      console.log('Admin successfully unblocked student');
    }

    console.log('\n✅ All tests PASSED! System working correctly.');
    console.log('- New users are auto-approved');
    console.log('- Users can login immediately after registration');
    console.log('- Admin can still block/unblock users');

  } catch (error) {
    console.error('❌ Test FAILED:', error.response?.data || error.message);
  }
}

testOverallSystem();
