require('dotenv').config();
const { query } = require('./config/db');

(async () => {
  try {
    await query('SELECT 1');
    console.log('✅ DB OK');
  } catch (err) {
    console.error('❌ DB FAIL', err);
  } finally {
    process.exit();
  }
})();
