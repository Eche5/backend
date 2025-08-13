const express = require("express");
const router = express.Router();
const controller = require("../controller/careercontroller");
const { auth } = require("../middleware/auth");
const { super_admin } = require("../middleware/role");

router
  .route("/create-job-opening")
  .post([auth, super_admin], controller.createJob);
router.route("/get-all-job-openings").get(controller.getAllJobs);
router
  .route("/get-user-all-job-openings/:department?")
  .get(controller.getUserJobsOpenings);

router.route("/update-job-opening/:id").patch(controller.updateJob);
router.route("/delete-job-opening/:id").delete(controller.deleteJob);
router
  .route("/apply-job")
  .post(controller.uploadResume, controller.applyForJob);

module.exports = router;
