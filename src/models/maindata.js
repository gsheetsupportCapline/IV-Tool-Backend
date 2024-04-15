const mongoose = require("mongoose");

const mainDataSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  policyHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PolicyHolder",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  // Additional fields from the Main Data collection
  appointmentType: {
    type: String,
    required: false,
  },
  cellPhone: {
    type: String,
    required: false,
  },
  appointmentDate: {
    type: Date,
    required: false,
  },
  appointmentTime: {
    type: Date,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  patientName: {
    type: String,
    required: false,
  },
  patientDOB: {
    type: Date,
    required: false,
  },
  insuranceName: {
    type: String,
    required: false,
  },
  insurancePhone: {
    type: String,
    required: false,
  },
  policyHolderName: {
    type: String,
    required: false,
  },
  policyHolderDOB: {
    type: Date,
    required: false,
  },
  relationWithPatient: {
    type: String,
    required: false,
  },
  memberID: {
    type: String,
    required: false,
  },
  employerName: {
    type: String,
    required: false,
  },
  groupNumber: {
    type: String,
    required: false,
  },
  confirmationStatus: {
    type: String,
    required: false,
  },
  endDate: {
    type: Date,
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
  homePhone: {
    type: String,
    required: false,
  },
  workPhone: {
    type: String,
    required: false,
  },
});

const MainData = mongoose.model("MainData", mainDataSchema);

module.exports = MainData;
