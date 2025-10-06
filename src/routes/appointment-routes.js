const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment-controller');
const {
  updateAppointmentsStatus,
} = require('../controllers/appointment-controller');

router.post('/aggregate', AppointmentController.aggregateAppointments);

router.post(
  '/fetch-and-save-appointments',
  AppointmentController.fetchAndSaveAppointments
);
router.get(
  '/fetch-appointments/:officeName',
  AppointmentController.fetchDataForSpecificOffice
);

router.put(
  '/update-appointments/:officeName/:appointmentId',
  AppointmentController.updateAppointmentInArray
);

router.post(
  '/create-new-appointment/:officeName',
  AppointmentController.createNewRushAppointment
);

router.get(
  '/user-appointments/:userId',
  AppointmentController.fetchUserAppointments
);

router.post(
  '/update-individual-appointment-details',
  AppointmentController.updateIndividualAppointmentDetails
);

router.get(
  '/assigned-counts/:officeName',
  AppointmentController.getAssignedCounts
);

router.get(
  '/fetch-unassigned-appointments',
  AppointmentController.fetchUnassignedAppointmentsInRange
);

router.get(
  '/completed-appointments',
  AppointmentController.fetchCompletedAppointmentsByOffice
);

router.get(
  '/appointments-by-office-and-remarks',
  AppointmentController.getAppointmentsByOfficeAndRemarks
);

router.get(
  '/completion-analysis',
  AppointmentController.getAppointmentCompletionAnalysis
);

router.get('/debug-data', AppointmentController.debugAppointmentData);

// Check completion status of appointments by their MongoDB IDs
router.post(
  '/check-completion-status',
  AppointmentController.checkAppointmentCompletionStatus
);

// Get dynamic unassigned appointments (no params needed - auto calculates date range)
router.get(
  '/dynamic-unassigned-appointments',
  AppointmentController.getDynamicUnassignedAppointments
);

module.exports = router;
