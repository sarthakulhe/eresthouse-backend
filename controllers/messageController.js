const pool = require('../config/db');

// Get all messages (latest first)
exports.getMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a new message (admin only)
exports.sendMessage = async (req, res) => {
  const { message, created_by } = req.body;
  if (!message || !created_by) {
    return res.status(400).json({ error: 'Message and created_by are required' });
  }
  try {
    await pool.query('INSERT INTO messages (message, created_by) VALUES (?, ?)', [message, created_by]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}; 