require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const resetAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user if any
    const deleted = await User.deleteOne({ email: 'admin@aharada.edu' });
    if (deleted.deletedCount > 0) {
      console.log('🗑️  Removed existing admin user');
    }

    // Create fresh admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@aharada.edu',
      password: 'admin123',
      role: 'superadmin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email   : admin@aharada.edu');
    console.log('   Password: admin123');
    console.log('   Role    : superadmin');
    console.log('   ID      :', admin._id.toString());

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
