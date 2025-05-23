const express = require("express");
const router = express.Router();
const controller = require("../controller/newsletterController");

router.route("/subscribe").post(controller.subscribeUser);
router.route("/contact-us").post(controller.contactusform);

router.route("/unsubscribe").delete(controller.unsubscribeUser);

module.exports = router;
