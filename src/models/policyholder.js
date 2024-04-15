const mongoose = require("mongoose");

const policyHolderSchema = new mongoose.Schema({
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  policyHolder: {
    type: String,
    required: false,
  },
  relation: {
    type: String,
    required: false,
  },
  policyHolderDOB: {
    type: Date,
    required: false,
  },
  appointmentStartTime: {
    type: Date,
    required: false,
  },
});

const PolicyHolder = mongoose.model("PolicyHolder", policyHolderSchema);

module.exports = PolicyHolder;
