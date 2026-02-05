const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function unblockUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all blocked users
    const blockedUsers = await User.find({ status: 'blocked' });

    if (blockedUsers.length === 0) {
      console.log('No blocked users found');
      return;
    }

    console.log(`Found ${blockedUsers.length} blocked user(s):`);
    blockedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Unblock all blocked users
    const result = await User.updateMany(
      { status: 'blocked' },
      { status: 'approved' }
    );

    console.log(`Unblocked ${result.modifiedCount} user(s)`);

    // Show updated users
    const updatedUsers = await User.find({ _id: { $in: blockedUsers.map(u => u._id) } });
    console.log('\nUpdated users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Status: ${user.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

unblockUsers();
