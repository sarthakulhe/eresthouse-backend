const express = require('express');
const { getAvailableRooms, getRooms } = require('../controllers/roomController.js');
const { authenticateJWT } = require('../middleware/auth.js');

const router = express.Router();

router.get('/available', authenticateJWT, getAvailableRooms);
router.get('/', authenticateJWT, getRooms);

module.exports = router; 