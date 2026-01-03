const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Employee = require('../models/Employee');
const { sequelize } = require('../config/db');

dotenv.config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Syncing tables...');
    
    // Force sync will drop tables and recreate them (Erasing User table effectively)
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt); // Default password

    // Seed Admin
    await Admin.create({
      username: 'Admin',
      password: passwordHash
    });
    console.log('✅ Admin created: username="Admin", password="123456"');

    // Seed HR
    await HR.create({
      username: 'HR',
      password: passwordHash
    });
    console.log('✅ HR created: username="HR", password="123456"');

    console.log('🚀 Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
