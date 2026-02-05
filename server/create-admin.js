const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@eduspark.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@eduspark.com',
      password: 'admin123',
      role: 'admin',
      status: 'approved'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@eduspark.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
