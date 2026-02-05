const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkMamillaSwetha() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduspark');
    console.log('Connected to MongoDB');

    // Find the user by name
    const user = await User.findOne({ name: 'Mamilla Swetha' });

    if (!user) {
      console.log('User "Mamilla Swetha" not found in database');
      return;
    }

    console.log('User details for "Mamilla Swetha":');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Status:', user.status);
    console.log('- Created At:', user.createdAt);

    // Check if role is faculty and status is approved
    if (user.role === 'faculty' && user.status === 'approved') {
      console.log('✅ User has correct role (faculty) and status (approved)');
      console.log('The user should now appear in the faculty column in admin user management.');
    } else {
      console.log('❌ User does not have correct role or status:');
      if (user.role !== 'faculty') {
        console.log('  - Role should be "faculty" but is:', user.role);
      }
      if (user.status !== 'approved') {
        console.log('  - Status should be "approved" but is:', user.status);
      }
    }

  } catch (error) {
    console.error('Error checking Mamilla Swetha:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkMamillaSwetha();
