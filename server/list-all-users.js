const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const users = await User.find({})
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });

    console.log(`Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.role} - ${user.status} - ${user.createdAt}`);
    });

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

listAllUsers();
