const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

console.log('Checking database connection...');
console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]); // Log only host part for security

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
    logging: false,
});

const checkTables = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection Successful!');

    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );

    console.log('\n📊 Tables found in database:');
    if (results.length === 0) {
        console.log('❌ No tables found. (This explains why you see 0 tables)');
    } else {
        results.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
        console.log('\n✅ use the "neondb" database in your Neon dashboard to see these tables.');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
};

checkTables();
