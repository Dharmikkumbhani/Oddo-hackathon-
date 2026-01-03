const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Debugging Database Connection...');

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

const debug = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected via Sequelize!');

    // 1. Get Current Context
    const [context] = await sequelize.query("SELECT current_database(), current_schema(), current_user;");
    console.log('\n📍 Connection Context:', context[0]);

    // 2. List All Tables in 'public' schema
    const [tables] = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    console.log('\n📊 Tables in public schema:', tables.map(t => t.table_name));

    // 3. Count Users
    try {
        const [users] = await sequelize.query('SELECT count(*) FROM "Users";');
        console.log(`\n👥 User Count in "Users" table: ${users[0].count}`);
        
        if (users[0].count > 0) {
            const [userData] = await sequelize.query('SELECT id, email, "companyName" FROM "Users" LIMIT 5;');
            console.log('   Latest 5 Users:', userData);
        }
    } catch (e) {
        console.log('   ❌ Could not query "Users" table (it might not exist yet).');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
};

debug();
