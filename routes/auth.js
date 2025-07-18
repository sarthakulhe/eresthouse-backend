const express = require('express');
const { login } = require('../controllers/authController.js');
const userController = require('../controllers/userController.js');
const { authenticateJWT, isAdmin } = require('../middleware/auth.js');

const router = express.Router();

router.post('/login', login);

// User management (admin only)
router.get('/users', authenticateJWT, isAdmin, userController.listUsers);
router.post('/users', authenticateJWT, isAdmin, userController.addUser);
router.patch('/users/:id/status', authenticateJWT, isAdmin, userController.setUserStatus);
router.delete('/users/:id', authenticateJWT, isAdmin, userController.deleteUser);

module.exports = router; 