const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createStudentUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const studentData = {
      name: 'Test Student',
      email: 'student@eduspark.com',
      password: 'student123',
      role: 'student',
      status: 'approved'
    };

    const existingUser = await User.findOne({ email: studentData.email });
    if (!existingUser) {
      // Hash password manually
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(studentData.password, salt);

      const user = new User({
        ...studentData,
        password: hashedPassword
      });

      await user.save();
      console.log(`Created student user: ${studentData.email}`);
    } else {
      // Update existing user to approved status
      await User.findByIdAndUpdate(existingUser._id, { status: 'approved' });
      console.log(`Updated existing student user: ${studentData.email} to approved status`);
    }

    console.log('Student user creation completed');

  } catch (error) {
    console.error('Error creating student user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createStudentUser();
