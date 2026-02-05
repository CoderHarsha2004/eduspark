const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function testStudentLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const studentEmail = 'student@eduspark.com';
    const studentPassword = 'student123';

    // Find student user
    const user = await User.findOne({ email: studentEmail });
    console.log('Student user found:', user ? { email: user.email, role: user.role, status: user.status } : 'No user found');

    if (!user) {
      console.log('Student user does not exist');
      return;
    }

    // Test password
    const isValidPassword = await user.comparePassword(studentPassword);
    console.log('Password valid:', isValidPassword);

    // Check status
    if (user.status !== 'approved') {
      console.log('User status is not approved:', user.status);
    } else {
      console.log('Student is approved and ready for login');
    }

  } catch (error) {
    console.error('Error testing student login:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testStudentLogin();
