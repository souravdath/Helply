// This file manages the connection to your MariaDB/MySQL database.
const mysql = require('mysql2');
require('dotenv').config(); // Loads the database credentials from your .env file

// Create a promise-based connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Export the promise-enabled pool
module.exports = pool.promise();
