const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  employerName: {
    type: String,
    required: false,
  },
  groupNumber: {
    type: String,
    required: false,
  },
  insuranceName: {
    type: String,
    required: false,
  },
  patientDOB: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: false,
  },
});

const Employer = mongoose.model("Employer", employerSchema);

module.exports = Employer;
