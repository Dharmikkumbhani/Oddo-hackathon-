const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const profileRoutes = require('./routes/profileRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to DB and start server
const startServer = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log("⚠️ Database connection failed. Server will not start. Check your .env file.");
      return;
    }

    // Sync models - using alter to update schema if needed
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
