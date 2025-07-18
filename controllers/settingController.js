const pool = require('../config/db');

// Get maintenance mode status
exports.getMaintenanceMode = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'maintenance_mode'");
    if (rows.length > 0) {
      res.json({ maintenance_mode: rows[0].value });
    } else {
      res.json({ maintenance_mode: 'off' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance mode' });
  }
};

// Set maintenance mode status
exports.setMaintenanceMode = async (req, res) => {
  const { maintenance_mode } = req.body;
  if (!['on', 'off'].includes(maintenance_mode)) {
    return res.status(400).json({ error: 'Invalid value for maintenance_mode' });
  }
  try {
    await pool.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('maintenance_mode', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [maintenance_mode, maintenance_mode]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set maintenance mode' });
  }
};

// Get show_document_column status
exports.getShowDocumentColumn = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'show_document_column'");
    if (rows.length > 0) {
      res.json({ show_document_column: rows[0].value });
    } else {
      res.json({ show_document_column: 'on' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch show_document_column' });
  }
};

// Set show_document_column status (admin only)
exports.setShowDocumentColumn = async (req, res) => {
  const { show_document_column } = req.body;
  if (!['on', 'off'].includes(show_document_column)) {
    return res.status(400).json({ error: 'Invalid value for show_document_column' });
  }
  try {
    await pool.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('show_document_column', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [show_document_column, show_document_column]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set show_document_column' });
  }
};

// Get subscription end date
exports.getSubscriptionEndDate = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'subscription_end_date'");
    res.json({ subscription_end_date: rows[0]?.value || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription end date' });
  }
};

// Set subscription end date (admin only)
exports.setSubscriptionEndDate = async (req, res) => {
  const { subscription_end_date } = req.body;
  if (typeof subscription_end_date !== 'string') {
    return res.status(400).json({ error: 'Invalid value for subscription_end_date' });
  }
  try {
    await pool.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('subscription_end_date', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [subscription_end_date, subscription_end_date]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set subscription end date' });
  }
};

// Get subscription blocked
exports.getSubscriptionBlocked = async (req, res) => {
  try {
    // Get both subscription_end_date and subscription_blocked
    const [[dateRow], [blockRow]] = await Promise.all([
      pool.query("SELECT `value` FROM settings WHERE `key` = 'subscription_end_date'"),
      pool.query("SELECT `value` FROM settings WHERE `key` = 'subscription_blocked'")
    ]);
    const endDate = dateRow[0]?.value;
    const dbBlocked = blockRow[0]?.value || 'off';
    let autoBlocked = dbBlocked;
    let today = new Date();
    let end = endDate ? new Date(endDate + 'T23:59:59') : null; // Treat end date as end of day
    if (endDate && endDate.trim() !== '') {
      if (today > end) {
        autoBlocked = 'on';
      }
    }
    // Debug log
    console.log('DEBUG subscription block:', { today: today.toISOString(), end: end?.toISOString(), endDate, autoBlocked });
    res.json({ subscription_blocked: autoBlocked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription blocked' });
  }
};

// Set subscription blocked (admin only)
exports.setSubscriptionBlocked = async (req, res) => {
  const { subscription_blocked } = req.body;
  if (!['on', 'off'].includes(subscription_blocked)) {
    return res.status(400).json({ error: 'Invalid value for subscription_blocked' });
  }
  try {
    await pool.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('subscription_blocked', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [subscription_blocked, subscription_blocked]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set subscription blocked' });
  }
}; 