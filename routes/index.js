const express = require("express");
const controller = require("../controller/indexController");
const { user } = require("../middleware/validation");
const { auth } = require("../middleware/auth");
const router = express.Router();

router.route("/parcels").get(controller.GetAllParcels);
router.route("/standard/shipment").get(controller.GetAllStandardParcels);
router.route("/next-day-shipments").get(controller.GetAllNextDayParcels);
router.route("/economy-shipments").get(controller.GetAllEconomyParcels);
router.route("/express-shipments").get(controller.GetAllExpressParcels);
router.route("/delete-shipment").delete(controller.deletedShipment);
router.route("/savers-shipments").get(controller.GetAllSaversParcels);

router.route("/parcel/user").get([auth], controller.GetUserParcel);
router.route("/payment/debit-card").post([auth], controller.startPayment);
router.route("/shipment/webhook").post(controller.createPayment);
router.route("/wallet/funding").post([auth], controller.startWalletFunding);
router.route("/wallet/webhook").post(controller.startWalletPayment);

router.route("/rate/international").post(controller.shippingRate);
router.route("/rate/local").post(controller.localshippingrate);
router.route("/payment/wallet").post([auth], controller.payThroughWallet);

module.exports = router;
