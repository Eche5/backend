const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
module.exports = {
  port: process.env.PORT || 3000,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires: process.env.JWT_EXPIRES,
  paystack_key_api: process.env.PAYSTACK_APIKEY,
};
