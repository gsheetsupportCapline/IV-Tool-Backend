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
          type: Date,
          required: false,
        },

        patientID: {
          type: String,
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
        insurance_name: {
          type: String,
          required: false,
        },

        policy_holder_name: {
          type: String,
          required: false,
        },
        policy_holder_dob: {
          type: Date,
          required: false,
        },

        primaryMemberID: {
          type: String,
          required: false,
        },

        employer_name: {
          type: String,
          required: false,
        },
        group: {
          type: String,
          required: false,
        },
        relation_with_patient: {
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
      },
    ],
  },
  { timestamps: true }
);

// Create a compound index on startTime and patientID
// appointmentSchema.index({ appointmentDate: 1, patientID: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
