// This file configures the database connection for Knex.js
require('dotenv').config(); // Load environment variables

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './db/migrations' // We'll store our migration files here
    }
  }
};
