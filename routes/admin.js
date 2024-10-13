const express = require("express");
const router = express.Router();
const controller = require("../controller/admincontroller");
const { super_admin, processing_user } = require("../middleware/role");
const { auth } = require("../middleware/auth");
const checkRoles = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assuming `req.user.role` contains the role of the authenticated user
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

router.route("/team").get([auth, super_admin], controller.getAllTeamMembers);
router.route("/payments").get([auth, super_admin], controller.getAllPayments);
router
  .route("/deleteuser")
  .delete([auth, super_admin], controller.deletedTeamMember);
router
  .route("/updateparcel")
  .patch(
    [
      auth,
      checkRoles([
        "super_admin",
        "processing_user",
        "logistics_user",
        "customers_rep",
      ]),
    ],
    controller.updateParcel
  );
router
  .route("/getShipment/:tracking_number")
  .get(
    [
      auth,
      checkRoles([
        "super_admin",
        "processing_user",
        "logistics_user",
        "customers_rep",
      ]),
    ],
    controller.getParcelByTrackingNumber
  );
module.exports = router;
