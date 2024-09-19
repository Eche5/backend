const express = require("express");
const router = express.Router();
const controller = require("../controller/usercontroller");
const { auth } = require("../middleware/auth");
router.route("/shipment").post([auth], controller.createshipment);
router.route("/parcel").get([auth], controller.GetUserParcel);
module.exports = router;
