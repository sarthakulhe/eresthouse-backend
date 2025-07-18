const express = require('express');
const {
  getAllCharges,
  createCharge,
  updateCharge,
  deleteCharge
} = require('../controllers/chargeController.js');

const router = express.Router();

router.get('/', getAllCharges);
router.post('/', createCharge);
router.put('/:resthouse_id/:guest_type/:with_bed', updateCharge);
router.delete('/:resthouse_id/:guest_type/:with_bed', deleteCharge);

module.exports = router; 