const { Sequelize } = require('sequelize');
const fs = require('fs');
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
        let query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Employees';";
        let [results] = await sequelize.query(query);

        if (results.length === 0) {
            query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees';";
            [results] = await sequelize.query(query);
        }

        const output = 'Found Columns:\n' + results.map(r => `${r.column_name} (${r.data_type})`).join('\n');
        fs.writeFileSync('columns_output.txt', output);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
