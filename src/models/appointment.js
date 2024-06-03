const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    officeName: {
      type: String,
      required: false,
    },

    appointments: [
      {
        appointmentType: {
          type: String,
          required: false,
        },
        appointmentDate: {
          type: Date,
          required: false,
        },
        appointmentTime: {
          type: String,
          required: false,
        },

        patientId: {
          type: Number,
          required: false,
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
        },

        source: {
          type: String,
          required: false,
        },
        planType: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create a compound index on startTime and patientID
// appointmentSchema.index(
//   { appointmentDate: 1, patientID: 1, insuranceName: 1 },
//   { unique: true }
// );

appointmentSchema.index({ assignedUser: 1 });
const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
