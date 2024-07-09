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

router.get(
  "/user-appointments/:userId",
  AppointmentController.fetchUserAppointments
);

router.post(
  "/update-individual-appointment-details",
  AppointmentController.updateIndividualAppointmentDetails
);

router.get(
  "/assigned-counts/:officeName",
  AppointmentController.getAssignedCounts
);

router.get(
  "/fetch-unassigned-appointments",
  AppointmentController.fetchUnassignedAppointmentsInRange
);

router.get(
  "/completed-appointments",
  AppointmentController.fetchCompletedAppointmentsByOffice
);

module.exports = router;
