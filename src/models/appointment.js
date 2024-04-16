const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientID: {
    type: String,
    ref: "Patient",
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientDOB: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  primaryMemberID: {
    type: String,
    required: false,
  },
  medicaidID: {
    type: String,
    required: false,
  },
  carrierID: {
    type: String,
    required: false,
  },
  appointmentType: {
    type: String,
    required: false,
  },
  confirmationStatus: {
    type: String,
    required: false,
  },
  endTime: {
    type: Date,
    required: false,
  },
  confirmationDate: {
    type: Date,
    required: false,
  },
  cellPhone: {
    type: String,
    required: false,
  },
  homePhone: {
    type: String,
    required: false,
  },
  workPhone: {
    type: String,
    required: false,
  },
});

// Create a compound index on startTime and patientID
appointmentSchema.index({ startTime: 1, patientID: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
