const mongoose = require("mongoose");

// NEW RESTRUCTURED APPOINTMENT SCHEMA
// Each appointment is now a separate document with officeName reference
const appointmentSchema = new mongoose.Schema(
  {
    officeName: {
      type: String,
      required: true,
      index: true,
    },
    appointmentType: {
      type: String,
      required: false,
    },
    appointmentDate: {
      type: Date,
      required: false,
      index: true,
    },
    appointmentTime: {
      type: String,
      required: false,
    },
    patientId: {
      type: Number,
      required: false,
      index: true,
    },
    patientName: {
      type: String,
      required: false,
    },
    patientDOB: {
      type: String,
      required: false,
    },
    MIDSSN: {
      type: String,
      required: false,
    },
    insuranceName: {
      type: String,
      required: false,
      index: true,
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
      type: String,
      required: false,
    },
    memberId: {
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
    relationWithPatient: {
      type: String,
      required: false,
    },
    medicaidId: {
      type: String,
      required: false,
    },
    carrierId: {
      type: String,
      required: false,
    },
    confirmationStatus: {
      type: String,
      required: false,
    },
    confirmationDate: {
      type: Date,
      required: false,
    },
    endTime: {
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
    ivType: {
      type: String,
      enum: ["Normal", "Rush"],
      default: "Normal",
    },
    completionStatus: {
      type: String,
      enum: ["IV Not Done", "In Process", "Completed"],
      default: "IV Not Done",
    },
    status: {
      type: String,
      enum: ["Assigned", "Unassigned"],
      default: "Unassigned",
    },
    assignedUser: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    provider: {
      type: String,
      required: false,
      default: null,
    },
    lastUpdatedAt: {
      type: Date,
    },
    ivRemarks: {
      type: String,
      required: false,
      default: null,
    },
    source: {
      type: String,
      required: false,
      default: null,
    },
    planType: {
      type: String,
      required: false,
      default: null,
    },
    completedBy: {
      type: String,
      required: false,
      default: null,
    },
    ivRequestedDate: {
      type: Date,
    },
    ivAssignedDate: {
      type: Date,
    },
    ivCompletedDate: {
      type: Date,
    },
    ivAssignedByUserName: {
      type: String,
      default: null,
    },
    noteRemarks: {
      type: String,
      default: null,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

// Compound indexes for better query performance
appointmentSchema.index({ officeName: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1, insuranceName: 1 });
appointmentSchema.index({ status: 1, completionStatus: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
