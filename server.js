const app = require("./app");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const sequelize = require("./utils/database");
const User = require("./models/users");
const Parcels = require("./models/parcels");
const Zoning = require("./models/zoning");
const ParcelTracking = require("./models/parcelTracking");
const RatePricing = require("./models/ratePricingLocal");
const RatePricingTest = require("./models/ratePricingTest");
const Payments = require("./models/payments");
dotenv.config({ path: ".env" });

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Database sync failed:", error.message);
  });

const PORT = process.env.PORT;

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
  });
}

startServer();
