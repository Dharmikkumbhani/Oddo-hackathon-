const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use connection string (Neon / Production)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
} else {
  // Use local config
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully...');
    return true;
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    return false;
  }
};

module.exports = { sequelize, connectDB };
