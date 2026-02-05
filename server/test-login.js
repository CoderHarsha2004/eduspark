const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    // Test admin login
    const admin = await User.findOne({ email: 'admin@eduspark.com' });
    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', {
      email: admin.email,
      role: admin.role,
      status: admin.status
    });

    // Test password comparison
    const isValidPassword = await admin.comparePassword('admin123');
    console.log('Password valid:', isValidPassword);

    if (admin.status !== 'approved') {
      console.log('Admin status is not approved:', admin.status);
    } else {
      console.log('Admin is approved and ready for login');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testLogin();
