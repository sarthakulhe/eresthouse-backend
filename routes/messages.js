const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all messages
router.get('/', messageController.getMessages);

// Send a new message (admin only)
router.post('/', messageController.sendMessage);

module.exports = router; 