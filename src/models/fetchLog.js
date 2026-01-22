const mongoose = require("mongoose");

// FETCH LOG SCHEMA
// Stores logs of data fetch operations - one document per date with multiple fetch entries
const fetchLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Array of fetch operations for this date
    fetchOperations: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        totalOffices: {
          type: Number,
          default: 0,
        },
        successfulOffices: {
          type: Number,
          default: 0,
        },
        failedOffices: {
          type: Number,
          default: 0,
        },
        totalFetched: {
          type: Number,
          default: 0,
        },
        totalNewAdded: {
          type: Number,
          default: 0,
        },
        totalArchived: {
          type: Number,
          default: 0,
        },
        // Details per office
        officeDetails: [
          {
            officeName: String,
            fetchedCount: Number,
            newCount: Number,
            archivedCount: Number,
            status: String,
            message: String,
            error: String,
            // Actual new appointments added
            newAppointmentsData: [
              {
                patientId: Number,
                patientName: String,
                appointmentDate: Date,
                appointmentTime: String,
                insuranceName: String,
                appointmentType: String,
              },
            ],
            // Actual archived appointments
            archivedAppointmentsData: [
              {
                patientId: Number,
                patientName: String,
                appointmentDate: Date,
                appointmentTime: String,
                insuranceName: String,
                appointmentType: String,
                archivedReason: String,
              },
            ],
          },
        ],
        executionType: {
          type: String,
          enum: ["manual", "cron"],
          default: "manual",
        },
      },
    ],
  },
  { timestamps: true },
);

// Compound index for efficient date-based queries
fetchLogSchema.index({ date: 1 });
fetchLogSchema.index({ "fetchOperations.timestamp": -1 });

const FetchLog = mongoose.model("FetchLog", fetchLogSchema);

module.exports = FetchLog;
