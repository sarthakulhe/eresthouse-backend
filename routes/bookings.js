const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
} = require("../controllers/bookingController.js");
const { authenticateJWT } = require('../middleware/auth.js');

const router = express.Router();
// Update multer storage to preserve original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", authenticateJWT, getAllBookings);
router.post("/", authenticateJWT, upload.array('files'), createBooking);
router.get("/:id", authenticateJWT, getBookingById);
router.put("/:id", authenticateJWT, updateBooking);
router.delete("/:id", authenticateJWT, deleteBooking);

module.exports = router;
