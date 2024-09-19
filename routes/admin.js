const express = require("express");
const router = express.Router();
const controller = require("../controller/admincontroller");
const { super_admin } = require("../middleware/role");
const { auth } = require("../middleware/auth");

router.route("/team").get([auth, super_admin], controller.getAllTeamMembers);
router.route("/payments").get([auth, super_admin], controller.getAllPayments);
router.route("/updateparcel").patch([auth, super_admin], controller.updateParcel);
module.exports = router;
