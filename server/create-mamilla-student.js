const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createMamillaStudent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const studentData = {
      name: 'Mamilla Abhilash',
      email: 'mamillaabhilash2005@gmail.com',
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
      console.log(`Created student user: ${studentData.name}`);
      console.log(`Email: ${studentData.email}`);
      console.log(`Password: ${studentData.password}`);
    } else {
      // Update existing user to approved status and correct name
      await User.findByIdAndUpdate(existingUser._id, {
        status: 'approved',
        name: studentData.name
      });
      console.log(`Updated existing student user: ${studentData.email} to approved status`);
    }

    console.log('Mamilla Abhilash student user creation completed');

  } catch (error) {
    console.error('Error creating Mamilla Abhilash student user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createMamillaStudent();
