const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const { initDB, checkDatabaseConnection } = require('./db');
const routes = require('./routes');

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from Vite dev server
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

const startServer = async () => {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to the database. Exiting...');
      process.exit(1);
    }

    // Initialize database
    await initDB();
    console.log('Database initialized successfully');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;