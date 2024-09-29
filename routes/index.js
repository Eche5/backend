const express = require("express");
const controller = require("../controller/indexController");
const { user } = require("../middleware/validation");
const { auth } = require("../middleware/auth");
const router = express.Router();

router.route("/parcels").get(controller.GetAllParcels);
router.route("/parcel").get([auth], controller.GetUserParcel);
router
  .route("/payment")
  .get(controller.createPayment)
  .post([auth], controller.startPayment);

router
  .route("/wallet")
  .post([auth], controller.startWalletFunding)
  .get(controller.startWalletPayment);

router.route("/getrate").post(controller.shippingRate);
router.route("/getLocalrate").post(controller.localshippingrate);
router.route("/paywithwallet").post([auth], controller.payThroughWallet);

module.exports = router;
