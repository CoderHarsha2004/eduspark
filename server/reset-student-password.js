const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetStudentPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const studentEmail = 'student@eduspark.com';
    const newPassword = 'student123';

    // Find student user
    const user = await User.findOne({ email: studentEmail });
    if (!user) {
      console.log('Student user not found');
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    console.log(`Password reset for user: ${studentEmail}`);
    console.log(`New password: ${newPassword}`);
    console.log(`Hashed password: ${hashedPassword}`);

  } catch (error) {
    console.error('Error resetting student password:', error);
  } finally {
    await mongoose.connection.close();
  }
}

resetStudentPassword();
