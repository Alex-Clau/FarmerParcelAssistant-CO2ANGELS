const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});
// design pattern to efficiently manage connection to the db
// client -> static connection
// pool -> dynamic and allows multiple connections

module.exports = pool;
