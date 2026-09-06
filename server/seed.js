require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const { syncModels, seedInitialData, User, Program, Faculty, Event, Placement } = require('./models');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing data...');
    await User.destroy({ where: {} });
    await Program.destroy({ where: {} });
    await Faculty.destroy({ where: {} });
    await Event.destroy({ where: {} });
    await Placement.destroy({ where: {} });

    console.log('Re-seeding database...');
    await seedInitialData();

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
