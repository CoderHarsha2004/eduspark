const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@eduspark.com' });
    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Found admin:', { email: admin.email, role: admin.role, status: admin.status });

    // Set new password - this will trigger the pre-save hook to hash it
    admin.password = 'admin123';
    await admin.save();

    console.log('Admin password reset successfully');

    // Verify the password works
    const isValid = await admin.comparePassword('admin123');
    console.log('Password verification:', isValid);

  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await mongoose.connection.close();
  }
}

resetAdminPassword();
