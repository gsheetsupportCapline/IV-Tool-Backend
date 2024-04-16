const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointment-controller");

router.post(
  "/fetch-and-save-appointments",
  AppointmentController.fetchAndSaveAppointments
);

module.exports = router;
