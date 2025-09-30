const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    attendance: {
      type: String,
      enum: ['Present', 'Absent', 'Half'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one record per user per date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
