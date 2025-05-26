const express = require("express");
const authroutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const indexRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const newsletterRoutes = require("./routes/newsletter");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const {
  getBookedShipmentCount,
  updateBookedShipmentCount,
  updateUserCount,
  getUserCount,
} = require("./cache");
const Parcels = require("./models/parcels");
const Users = require("./models/users");

const dotenv = require("dotenv").config();
const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
(async () => {
  try {
    const count = await Parcels.count({
      where: { payment_status: "Paid" },
    });
    const userCount = await Users.count({
      where: { role: "user", is_verified: true },
    });

    updateBookedShipmentCount(count);
    updateUserCount(userCount);

    console.log(`Initial booked shipment count: ${count}`);
    console.log(`Initial user count: ${userCount}`);
  } catch (error) {
    console.error("Failed to fetch initial counts:", error);
  }
})();
cron.schedule("*/5 * * * *", async () => {
  try {
    const count = await Parcels.count({
      where: {
        payment_status: "Paid",
      },
    });
    const userCount = await Users.count({
      where: { role: "user", is_verified: true },
    });
    console.log(`Current booked shipment count: ${count}`);
    console.log(`Current user count: ${userCount}`);
    updateUserCount(userCount);
    updateBookedShipmentCount(count);
    console.log(`Updated booked shipment count: ${count}`);
  } catch (error) {
    console.error("Failed to update shipment count:", error);
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use("/api/v1/auth", authRateLimiter, authroutes);
app.use("/api/v1/counters", (req, res) => {
  const userCount = getUserCount();
  const currentCount = getBookedShipmentCount();
  console.log(`📤 [API] Returning cached count: ${currentCount}`);
  res.json({ bookingCount: currentCount, userCount: userCount });
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1", indexRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);

app.use("/api/v1/admin", adminRoutes);

module.exports = app;
