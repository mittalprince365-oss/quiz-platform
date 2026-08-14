const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL se connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected at', res.rows[0].now);
  }
});

module.exports = pool;