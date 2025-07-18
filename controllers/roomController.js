const pool = require('../config/db.js');
const jwt = require('jsonwebtoken');

// Get available rooms for a resthouse and date range
function toMySQLDate(dateStr) {
  // Converts DD-MM-YYYY to YYYY-MM-DD
  const [dd, mm, yyyy] = dateStr.split('-');
  return `${yyyy}-${mm}-${dd}`;
}

const getAvailableRooms = async (req, res) => {
  const { resthouse_id, checkin, checkout } = req.query;
  if (!resthouse_id || !checkin || !checkout) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }
  try {
    // checkin and checkout are now full datetimes (YYYY-MM-DD HH:MM:SS)
    const checkinSQL = checkin;
    const checkoutSQL = checkout;
    console.log('Checking available rooms for:', { resthouse_id, checkin, checkout });
    // Log all bookings for this resthouse and date range
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE resthouse_id = ? AND ((checkin_datetime < ? AND checkout_datetime > ?))',
      [resthouse_id, checkoutSQL, checkinSQL]
    );
    console.log('Overlapping bookings:', bookings);

    const sql = `
      SELECT r.* FROM rooms r
      WHERE r.resthouse_id = ?
        AND r.status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.room_id = r.id
            AND b.checkin_datetime < ?
            AND b.checkout_datetime > ?
        )
      ORDER BY r.id
    `;
    const [rows] = await pool.query(sql, [resthouse_id, checkoutSQL, checkinSQL]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// Get all rooms for a resthouse
const getRooms = async (req, res) => {
  const { resthouse_id } = req.query;
  if (!resthouse_id) {
    return res.status(400).json({ error: 'resthouse_id is required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE resthouse_id = ?', [resthouse_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// JWT auth middleware (export if you need it in routes)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, process.env.JWT_SECRET || 'changeme', (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = {
  getAvailableRooms,
  getRooms,
  authenticateJWT
};

