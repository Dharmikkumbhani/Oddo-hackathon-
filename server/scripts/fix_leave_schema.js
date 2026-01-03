const { sequelize } = require('../config/db');

const fixSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Add daysCount column if it doesn't exist
        try {
            await sequelize.query(`ALTER TABLE "LeaveRequests" ADD COLUMN IF NOT EXISTS "daysCount" FLOAT DEFAULT 0;`);
            console.log('Added daysCount column');
        } catch (e) {
            console.log('Error adding daysCount (might exist):', e.message);
        }

        // Add adminComment column if it doesn't exist (just in case)
        try {
            await sequelize.query(`ALTER TABLE "LeaveRequests" ADD COLUMN IF NOT EXISTS "adminComment" TEXT;`);
            console.log('Exsured adminComment column');
        } catch (e) {
            console.log('Error adding adminComment:', e.message);
        }

        // Remove attachment column if it exists
        try {
            await sequelize.query(`ALTER TABLE "LeaveRequests" DROP COLUMN IF EXISTS "attachment";`);
            console.log('Dropped attachment column');
        } catch (e) {
            console.log('Error dropping attachment:', e.message);
        }

        console.log('Schema fix complete');
        process.exit(0);
    } catch (error) {
        console.error('Schema fix failed:', error);
        process.exit(1);
    }
};

fixSchema();
