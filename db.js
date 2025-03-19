const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'amicus',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'amicusdb',
  password: process.env.DB_PASSWORD || 'YOUR_PASSWORD',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
