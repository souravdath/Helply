// This file manages the connection to your MariaDB/MySQL database.
const mysql = require('mysql');
require('dotenv').config(); // Loads the database credentials from your .env file

// Create a connection pool. This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Export the pool so that other files (like app.js) can use it to query the database.
module.exports = pool;