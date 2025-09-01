const express = require("express");
const router = express.Router();
const controller = require("../controller/admincontroller");
const { super_admin, processing_user } = require("../middleware/role");
const { auth } = require("../middleware/auth");
const checkRoles = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

router.route("/team").get([auth, super_admin], controller.getAllTeamMembers);
router.route("/customers").get([auth, super_admin], controller.getAllCustomers);

router
  .route("/update-role")
  .put([auth, super_admin], controller.changeStaffRole);

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
        "sub_admin",
        "logistics_user",
        "customers_rep",
        "sub_logistics_admin",
        "dispatch_rider",
      ]),
    ],
    controller.updateParcel
  );
router
  .route("/bulk-update-parcels")
  .patch(
    [
      auth,
      checkRoles([
        "super_admin",
        "processing_user",
        "logistics_user",
        "customers_rep",
        "sub_admin",
        "sub_logistics_admin",
        "dispatch_rider",
      ]),
    ],
    controller.bulkUpdateParcelStatus
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
        "sub_admin",
        "sub_logistics_admin",
        "dispatch_rider",
      ]),
    ],
    controller.getParcelByTrackingNumber
  );

router
  .route("/registeredUsers")
  .get([auth, super_admin], controller.getAllRegisteredUsers);

router
  .route("/activity-logs")
  .get([auth, super_admin], controller.getAllActivityLogs);
router
  .route("/sendmail")
  .post(
    [auth, super_admin],
    controller.uploadAttachment,
    controller.sendEmailsToUsers
  );
module.exports = router;
