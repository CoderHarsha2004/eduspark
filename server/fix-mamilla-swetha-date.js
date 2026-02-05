const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixMamillaSwethaDate() {
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

    // Update createdAt to a past date (e.g., 2024-01-15)
    const pastDate = new Date('2024-01-15T10:00:00.000Z');
    await User.updateOne({ _id: user._id }, { $set: { createdAt: pastDate } });

    console.log('Updated createdAt to:', pastDate);

    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('Updated user createdAt:', updatedUser.createdAt);

  } catch (error) {
    console.error('Error fixing Mamilla Swetha date:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixMamillaSwethaDate();
