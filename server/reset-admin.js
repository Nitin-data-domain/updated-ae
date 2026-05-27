require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const resetAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin users
    const deleted = await User.deleteMany({ email: { $in: ['admin@aharada.edu', 'md@aharadaedu.in'] } });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} existing admin user(s)`);
    }

    // Create fresh admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'md@aharadaedu.in',
      password: 'Aharada@Prabhu',
      role: 'superadmin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email   : md@aharadaedu.in');
    console.log('   Password: Aharada@Prabhu');
    console.log('   Role    : superadmin');
    console.log('   ID      :', admin._id.toString());

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
