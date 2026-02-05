const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixDateDirect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email: 'swethayadav10@gmail.com' });

    if (!user) {
      console.log('User "swethayadav10@gmail.com" not found');
      return;
    }

    console.log('Current user details:', {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    });

    // Update createdAt directly on the document
    const pastDate = new Date('2024-01-15T10:00:00.000Z');
    user.createdAt = pastDate;
    await user.save();

    console.log('Updated createdAt to:', pastDate);

    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('Updated user createdAt:', updatedUser.createdAt);

  } catch (error) {
    console.error('Error fixing date:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixDateDirect();
