const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const db = require('./config/db.js');

// Test connection once at startup
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL connection successful");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
})();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// DO NOT use express.json() before multer routes!
// app.use(express.json()); // <-- Remove or move this

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const bookingRoutes = require("./routes/bookings.js");
app.use("/api/bookings", bookingRoutes); // multer route, no express.json()

// Now apply express.json() for all other routes
app.use(express.json());

const authRoutes = require("./routes/auth.js");
app.use("/api/auth", authRoutes);

const roomsRouter = require("./routes/rooms.js");
app.use("/api/rooms", roomsRouter);

const chargesRouter = require("./routes/charges.js");
app.use("/api/charges", chargesRouter);

const pdfRoutes = require("./routes/pdf.js");
app.use('/api/pdf', pdfRoutes);

const messagesRoutes = require("./routes/messages.js");
app.use("/api/messages", messagesRoutes);

const settingsRoutes = require("./routes/settings.js");
app.use("/api/settings", settingsRoutes);

// Routes (to be added)
app.get("/", (req, res) => {
  res.send("eRestHouse API is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
