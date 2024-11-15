const express = require("express");
const authroutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const indexRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const rateLimit = require("express-rate-limit");

const dotenv = require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors({ origin: true, credentials: true }));
app.use("/api/v1/auth", authRateLimiter, authroutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1", indexRoutes);
app.use("/api/v1/admin", adminRoutes);

module.exports = app;
