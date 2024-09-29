const express = require("express");
const router = express.Router();
const controller = require("../controller/authController");
const { user, password, email } = require("../middleware/validation");
const { auth } = require("../middleware/auth");
const { super_admin } = require("../middleware/role");

router.route("/register").post([user, password], controller.createUser);
router
  .route("/registerTeam")
  .post([auth, super_admin], controller.createTeamMembers);
router.route("/login").post([email, password], controller.login);
router.route("/refresh").get(controller.refresh);
router.route("/verify").post([user], controller.resendVerificationemail);
router.route("/verify/:id").patch([user], controller.verify);
router.route("/logout").post(controller.LogOut);

module.exports = router;
