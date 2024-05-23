const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointment-controller");
const {
  updateAppointmentsStatus,
} = require("../controllers/appointment-controller");

router.post(
  "/fetch-and-save-appointments",
  AppointmentController.fetchAndSaveAppointments
);
router.get(
  "/fetch-appointments/:officeName",
  AppointmentController.fetchDataForSpecificOffice
);

router.put(
  "/update-appointments/:officeName/:appointmentId",
  AppointmentController.updateAppointmentInArray
);

router.post(
  "/create-new-appointment/:officeName",
  AppointmentController.createNewRushAppointment
);

module.exports = router;
