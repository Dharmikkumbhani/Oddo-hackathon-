const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
});

const check = async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Employees' AND column_name IN ('skills', 'certifications', 'salaryDetails', 'jobPosition', 'loveJob');");
        console.log('Columns and Types:');
        results.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
