const express = require("express");
const authroutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const indexRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

const dotenv = require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: true, credentials: true }));
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1", indexRoutes);
app.use("/api/v1/admin", adminRoutes);

module.exports = app;
