const pool = require('../config/db.js');

function validateCharge(data) {
  const required = ['resthouse_id', 'guest_type', 'with_bed', 'charge'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) return `Missing required field: ${field}`;
  }
  return null;
}

module.exports = {
  getAllCharges: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM charges');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  createCharge: async (req, res) => {
    const error = validateCharge(req.body);
    if (error) return res.status(400).json({ error });
    try {
      const { resthouse_id, guest_type, with_bed, charge } = req.body;
      const sql = 'INSERT INTO charges (resthouse_id, guest_type, with_bed, charge) VALUES (?, ?, ?, ?)';
      await pool.query(sql, [resthouse_id, guest_type, with_bed, charge]);
      res.status(201).json({ success: true });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Charge already exists for this combination' });
      } else {
        res.status(500).json({ error: 'Database error', details: err.message });
      }
    }
  },

  updateCharge: async (req, res) => {
    const error = validateCharge(req.body);
    if (error) return res.status(400).json({ error });
    try {
      const { resthouse_id, guest_type, with_bed } = req.params;
      const { charge } = req.body;
      const sql = 'UPDATE charges SET charge = ? WHERE resthouse_id = ? AND guest_type = ? AND with_bed = ?';
      const [result] = await pool.query(sql, [charge, resthouse_id, guest_type, with_bed]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Charge not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },

  deleteCharge: async (req, res) => {
    try {
      const { resthouse_id, guest_type, with_bed } = req.params;
      const sql = 'DELETE FROM charges WHERE resthouse_id = ? AND guest_type = ? AND with_bed = ?';
      const [result] = await pool.query(sql, [resthouse_id, guest_type, with_bed]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Charge not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  },
}; 