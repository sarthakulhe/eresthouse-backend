// db.js  (CommonJS version)
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;

// simple test when Node starts
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌  MySQL connection failed:', err);
  } else {
    console.log('✅  MySQL connected.');
    conn.release();
  }
});
