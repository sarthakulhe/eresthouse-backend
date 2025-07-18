const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get maintenance mode
router.get('/maintenance-mode', settingController.getMaintenanceMode);
// Set maintenance mode (admin only)
router.post('/maintenance-mode', authenticateJWT, isAdmin, settingController.setMaintenanceMode);
// Show/hide document column
router.get('/show-document-column', settingController.getShowDocumentColumn);
router.post('/show-document-column', authenticateJWT, isAdmin, settingController.setShowDocumentColumn);
// Subscription end date
router.get('/subscription-end-date', settingController.getSubscriptionEndDate);
router.post('/subscription-end-date', authenticateJWT, isAdmin, settingController.setSubscriptionEndDate);
// Subscription blocked
router.get('/subscription-blocked', settingController.getSubscriptionBlocked);
router.post('/subscription-blocked', authenticateJWT, isAdmin, settingController.setSubscriptionBlocked);

module.exports = router; 