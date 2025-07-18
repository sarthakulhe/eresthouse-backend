import fetch from "node-fetch";

const payload = {
  booking_type: "offline",
  guest_name: "Debug User",
  phone: "1234567890",
  designation: "Guest",
  guest_type: "ZP Officer",
  resthouse_id: 1,
  room_id: 1,
  with_bed: true,
  total_guests: 2,
  total_days: 1,
  checkin_date: "2025-07-01",
  checkout_date: "2025-07-02",
  payment_mode: "Cash",
  operator_name: "Sudhir"
};

const res = await fetch("http://localhost:5000/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

console.log("Status:", res.status);
console.log("Response:", await res.text()); 