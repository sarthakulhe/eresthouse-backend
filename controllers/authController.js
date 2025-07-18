const pool = require('../config/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res) => {
    // Accept either username or email as 'useridOrEmail'
    const { useridOrEmail, password } = req.body;
    if (!useridOrEmail || !password) {
      return res.status(400).json({ error: 'User ID/Email and password are required' });
    }
    try {
      // Check both username and email
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', [useridOrEmail, useridOrEmail]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid user ID/email or password' });
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid user ID/email or password' });
      }
      // Issue JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'changeme',
        { expiresIn: '1d' }
      );
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role }, token });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  }
}; 