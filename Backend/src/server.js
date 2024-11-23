const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const { initDB, checkDatabaseConnection } = require('./db');
const routes = require('./routes');

dotenv.config();

const app = express();

const corsOptions = {
  origin: "*", // Allow only requests from this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Enable cookies or authorization headers
};



// Middleware
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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

    // Use routes
    app.use('/api', routes);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;