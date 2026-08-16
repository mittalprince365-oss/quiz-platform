const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT current_database(), current_user, (SELECT count(*) FROM public.users) AS user_count', (err, res) => {
  if (err) {
    console.log('❌ DB error:', err.message);
  } else {
    console.log('✅ Connected to DB:', res.rows[0].current_database);
    console.log('👤 As user:', res.rows[0].current_user);
    console.log('📊 Users in public.users:', res.rows[0].user_count);
  }
});

module.exports = pool;