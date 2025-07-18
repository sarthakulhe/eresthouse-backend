const pool = require('../config/db.js');
const jwt = require('jsonwebtoken');

// Helper: Validate required fields for booking
function validateBooking(data) {
  const required = [
    'booking_id', 'booking_type', 'guest_name', 'phone', 'guest_type',
    'resthouse_id', 'room_id', 'checkin_datetime', 'checkout_datetime',
    'total_days', 'total_guests', 'amount', 'payment_mode', 'operator_name'
  ];
  for (const field of required) {
    if (!data[field]) return `Missing required field: ${field}`;
  }
  // Defensive: check for empty/invalid dates
  const zeroDates = ['0000-00-00', '0000-00-00 00:00:00', '', null, undefined];
  if (zeroDates.includes(data.checkin_date) || zeroDates.includes(data.checkout_date) || zeroDates.includes(data.checkin_datetime) || zeroDates.includes(data.checkout_datetime)) {
    return 'Invalid or missing check-in/check-out date.';
  }
  // Check valid date order
  const checkin = new Date(data.checkin_datetime);
  const checkout = new Date(data.checkout_datetime);
  if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
    return 'Invalid date format for check-in or check-out.';
  }
  if (checkout <= checkin) {
    return 'Check-out must be after check-in.';
  }
  return null;
}

// Helper: Parse MySQL UTC timestamp as UTC and convert to IST, then format as 'DD-MM-YYYY, HH:mm:ss'
function toIST(mysqlTimestamp) {
  if (!mysqlTimestamp) return mysqlTimestamp;
  let ts = mysqlTimestamp;
  // If it's a Date object, convert to UTC 'YYYY-MM-DD HH:mm:ss'
  if (ts instanceof Date) {
    const pad = n => n.toString().padStart(2, '0');
    ts = `${ts.getUTCFullYear()}-${pad(ts.getUTCMonth() + 1)}-${pad(ts.getUTCDate())} ${pad(ts.getUTCHours())}:${pad(ts.getUTCMinutes())}:${pad(ts.getUTCSeconds())}`;
  }
  if (typeof ts !== 'string') ts = String(ts);
  const [datePart, timePart] = ts.split(' ');
  if (!datePart || !timePart) return ts;
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffset);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(istDate.getDate())}-${pad(istDate.getMonth() + 1)}-${istDate.getFullYear()}, ${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}`;
}

// JWT auth middleware
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
  getAllBookings: async (req, res) => {
    try {
      const { from, to, resthouse_id } = req.query;
      let sql = 'SELECT b.*, r.name AS room_name FROM bookings b JOIN rooms r ON b.room_id = r.id';
      const params = [];
      const where = [];
      if (from) {
        if (from.length > 10) {
          where.push('b.checkin_datetime >= ?');
        } else {
          where.push('b.checkin_date >= ?');
        }
        params.push(from);
      }
      if (to) {
        if (to.length > 10) {
          where.push('b.checkout_datetime <= ?');
        } else {
          where.push('b.checkout_date <= ?');
        }
        params.push(to);
      }
      if (resthouse_id) {
        where.push('b.resthouse_id = ?');
        params.push(resthouse_id);
      }
      if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
      }
      sql += ' ORDER BY b.created_at DESC';
      console.log('[GET] /api/bookings query:', { from, to, resthouse_id, sql, params });
      const [rows] = await pool.query(sql, params);
      // Convert created_at to IST for all rows
      const rowsIST = rows.map(row => ({ ...row, created_at: toIST(row.created_at) }));
      res.json(rowsIST);
    } catch (err) {
      console.error('[GET] /api/bookings DB error:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  getBookingById: async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT b.*, r.name AS room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?',
        [req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      // Convert created_at to IST for single row
      const row = rows[0];
      row.created_at = toIST(row.created_at);
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  createBooking: async (req, res) => {
    console.log("[CREATE] incoming payload:", req.body);
    console.log("[CREATE] uploaded files:", req.files);
    const error = validateBooking(req.body);
    if (error) return res.status(400).json({ error });
    try {
      const [roomRows] = await pool.query(
        'SELECT * FROM rooms WHERE id = ? AND resthouse_id = ?',
        [req.body.room_id, req.body.resthouse_id]
      );
      if (roomRows.length === 0) {
        return res.status(400).json({ error: 'Selected room does not belong to the selected rest house.' });
      }
      const filePath = req.files && req.files.length > 0 ? req.files[0].path : null;
      const documents = filePath ? filePath : null;

      const fields = [
        'booking_id', 'booking_type', 'guest_name', 'phone', 'designation', 'guest_type',
        'resthouse_id', 'room_id', 'checkin_date', 'checkout_date', 'checkin_datetime', 'checkout_datetime',
        'total_days', 'total_guests', 'amount', 'payment_mode', 'operator_name', 'documents'
      ];
      const values = [
        req.body.booking_id, req.body.booking_type, req.body.guest_name, req.body.phone, req.body.designation, req.body.guest_type,
        req.body.resthouse_id, req.body.room_id, req.body.checkin_date, req.body.checkout_date, req.body.checkin_datetime, req.body.checkout_datetime,
        req.body.total_days, req.body.total_guests, req.body.amount, req.body.payment_mode, req.body.operator_name, documents
      ];
      const sql = `INSERT INTO bookings (${fields.join(',')}) VALUES (${fields.map(_ => '?').join(',')})`;
      const [result] = await pool.query(sql, values);
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error("[CREATE] DB error:", err);
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  updateBooking: async (req, res) => {
    const error = validateBooking(req.body);
    if (error) return res.status(400).json({ error });
    try {
      const [roomRows] = await pool.query(
        'SELECT * FROM rooms WHERE id = ? AND resthouse_id = ?',
        [req.body.room_id, req.body.resthouse_id]
      );
      if (roomRows.length === 0) {
        return res.status(400).json({ error: 'Selected room does not belong to the selected rest house.' });
      }
      const fields = [
        'booking_id', 'booking_type', 'guest_name', 'phone', 'designation', 'guest_type',
        'resthouse_id', 'room_id', 'checkin_date', 'checkout_date', 'checkin_datetime', 'checkout_datetime',
        'total_days', 'total_guests', 'amount', 'payment_mode', 'operator_name'
      ];
      const values = fields.map(f => req.body[f] ?? null);
      const sql = `UPDATE bookings SET ${fields.map(f => `${f}=?`).join(', ')} WHERE id = ?`;
      values.push(req.params.id);
      const [result] = await pool.query(sql, values);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  deleteBooking: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  }
};
