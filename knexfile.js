// This file configures the database connection for Knex.js
const fs = require('fs');
require('dotenv').config(); // Load environment variables

const sharedConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: true,
          ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined
        }
      : undefined
  },
  migrations: {
    directory: './db/migrations' // We'll store our migration files here
  }
};

// Same connection settings regardless of NODE_ENV (development/production both
// point at the same Aiven database via env vars), so `knex migrate:latest`
// works no matter what NODE_ENV is set to.
module.exports = {
  development: sharedConfig,
  production: sharedConfig
};