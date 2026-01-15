const mongoose = require("mongoose");
const moment = require("moment-timezone");
require("dotenv").config();

const MONGODB_URL = process.env.ATLAS_DB_URL;

// Connect to MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Appointment = require("./src/models/appointment");

async function checkLatestAppointment() {
  try {
    console.log("=== Checking Database Times ===\n");

    // Find latest appointment with ivRequestedDate
    const latestDoc = await Appointment.findOne({
      "appointments.ivRequestedDate": { $exists: true },
    }).sort({ "appointments.ivRequestedDate": -1 });

    if (!latestDoc) {
      console.log("No appointments found with ivRequestedDate");
      return;
    }

    // Find the latest appointment with ivRequestedDate
    const appointmentWithDate = latestDoc.appointments
      .filter((apt) => apt.ivRequestedDate)
      .sort(
        (a, b) => new Date(b.ivRequestedDate) - new Date(a.ivRequestedDate)
      )[0];

    if (appointmentWithDate) {
      console.log("Latest ivRequestedDate found:");
      console.log("Office:", latestDoc.officeName);
      console.log("Patient:", appointmentWithDate.patientName);
      console.log("\n=== Stored in Database (MongoDB) ===");
      console.log("Raw value:", appointmentWithDate.ivRequestedDate);
      console.log(
        "ISO String:",
        new Date(appointmentWithDate.ivRequestedDate).toISOString()
      );

      console.log("\n=== Interpreted in Different Timezones ===");
      const storedDate = moment(appointmentWithDate.ivRequestedDate);
      console.log("UTC:", storedDate.utc().format("YYYY-MM-DD HH:mm:ss"));
      console.log(
        "Chicago (CST/CDT):",
        storedDate.tz("America/Chicago").format("YYYY-MM-DD hh:mm:ss A z")
      );
      console.log(
        "India (IST):",
        storedDate.tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A z")
      );

      console.log("\n=== Current Time for Comparison ===");
      console.log(
        "Current Chicago time:",
        moment.tz("America/Chicago").format("YYYY-MM-DD hh:mm:ss A z")
      );
      console.log(
        "Current UTC time:",
        moment.utc().format("YYYY-MM-DD HH:mm:ss")
      );
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
}

checkLatestAppointment();
