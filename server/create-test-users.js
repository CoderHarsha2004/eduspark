const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const testUsers = [
      {
        name: 'John Student',
        email: 'john@student.com',
        password: 'password123',
        role: 'student',
        status: 'approved'
      },
      {
        name: 'Jane Faculty',
        email: 'jane@faculty.com',
        password: 'password123',
        role: 'faculty',
        status: 'approved'
      },
      {
        name: 'Bob Student',
        email: 'bob@student.com',
        password: 'password123',
        role: 'student',
        status: 'approved'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created test user: ${userData.email}`);
      } else {
        // Update existing user to approved status
        await User.findByIdAndUpdate(existingUser._id, { status: 'approved' });
        console.log(`Updated existing user: ${userData.email} to approved status`);
      }
    }

    console.log('Test users creation completed');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUsers();
