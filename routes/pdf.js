const express = require('express');
const router = express.Router();
const { generateChallanPDF } = require('../controllers/pdfController');

router.post('/challan', generateChallanPDF);

module.exports = router;