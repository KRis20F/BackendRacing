const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'racingdb',
  password: process.env.PGPASSWORD || 'tu_password',
  port: process.env.PGPORT || 5432,
});

module.exports = pool;