const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const dbName     = process.env.DB_NAME     || 'aharada_education';
const dbUser     = process.env.DB_USER     || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost     = process.env.DB_HOST     || 'localhost';
const dbPort     = process.env.DB_PORT     || 3306;

const isProduction = process.env.NODE_ENV === 'production';
// In production (GoDaddy), or when DB_PASSWORD is provided, or when explicitly forced: use MySQL
const useMySQL = isProduction || Boolean(process.env.DB_PASSWORD) || process.env.FORCE_MYSQL === 'true';

let sequelize;

if (useMySQL) {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: Number(dbPort),
    dialect: 'mysql',
    logging: isProduction ? false : console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      decimalNumbers: true,
    },
  });
} else {
  // Local development SQLite fallback (when local MySQL credentials are not yet configured)
  const storagePath = path.join(__dirname, '..', 'aharada_dev.sqlite');
  console.log(`ℹ️  Using SQLite for local development: ${storagePath}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

// Function to ensure MySQL database exists before Sequelize connects (if MySQL)
async function ensureMySQLDatabase() {
  if (!useMySQL) return;
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: Number(dbPort),
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
  } catch (err) {
    console.warn(`Notice: Database check (${err.message}). Connecting directly to ${dbName}...`);
  }
}

const connectDB = async () => {
  try {
    if (useMySQL) {
      await ensureMySQLDatabase();
    }
    await sequelize.authenticate();
    console.log(`✅ Database Connected successfully via Sequelize (${sequelize.getDialect().toUpperCase()})`);

    // Import models and associations
    const { syncModels, seedInitialData } = require('../models');

    // Sync tables automatically (creates tables if they don't exist)
    await syncModels();
    console.log('✅ Database tables synchronized successfully');

    // Seed initial admin and demo data if empty
    await seedInitialData();

  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.sequelize = sequelize;
