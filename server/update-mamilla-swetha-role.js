const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateMamillaSwethaRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    // Find the user by name
    const user = await User.findOne({ name: 'Mamilla Swetha' });

    if (!user) {
      console.log('User "Mamilla Swetha" not found');
      return;
    }

    console.log('Current user details:', {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Update role to faculty if not already
    if (user.role !== 'faculty') {
      await User.findByIdAndUpdate(user._id, { role: 'faculty' });
      console.log('Updated user role to faculty');
    } else {
      console.log('User already has faculty role');
    }

    // Ensure status is approved
    if (user.status !== 'approved') {
      await User.findByIdAndUpdate(user._id, { status: 'approved' });
      console.log('Updated user status to approved');
    } else {
      console.log('User already has approved status');
    }

    console.log('Mamilla Swetha role update completed');

  } catch (error) {
    console.error('Error updating Mamilla Swetha role:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateMamillaSwethaRole();
