// This file manages the connection to your MariaDB/MySQL database.
const mysql = require('mysql2');
require('dotenv').config(); // Loads the database credentials from your .env file

const fs = require('fs');

// Create a promise-based connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Aiven requires SSL. Set DB_SSL=true and DB_SSL_CA to the path of ca.pem
  // (downloaded from the Aiven console) to verify the connection properly.
  ssl: process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined
      }
    : undefined
});

// Export the promise-enabled pool
module.exports = pool.promise();