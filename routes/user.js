const express = require("express");
const router = express.Router();
const controller = require("../controller/usercontroller");
const { auth } = require("../middleware/auth");
router.route("/shipment").post([auth], controller.createshipment);
router.route("/parcel").get([auth], controller.GetUserParcel);
router.route("/userdata").get([auth], controller.getUserDetails);
router.route("/updateme").patch([auth], controller.updateUsersDetails);

module.exports = router;
