require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');

const resetAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    // Remove existing admin accounts
    await User.destroy({
      where: {
        email: ['admin@aharada.edu', 'md@aharadaedu.in'],
      },
    });

    // Create fresh superadmin
    const admin = await User.create({
      name: 'Admin',
      email: 'md@aharadaedu.in',
      password: 'Aharada@Prabhu',
      role: 'superadmin',
    });

    const admin2 = await User.create({
      name: 'Admin',
      email: 'admin@aharada.edu',
      password: 'admin123',
      role: 'superadmin',
    });

    console.log('✅ Admin users reset successfully!');
    console.log('   1. Email: md@aharadaedu.in  / Password: Aharada@Prabhu');
    console.log('   2. Email: admin@aharada.edu / Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
