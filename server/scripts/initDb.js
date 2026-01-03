const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const createDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default DB first
  });

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
    
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log('Database created successfully.');
    } else {
      console.log('Database already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
};

createDatabase();
