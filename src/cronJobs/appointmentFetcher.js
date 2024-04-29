const cron = require("node-cron");
const appointmentService = require("../services/appointment-service");

// Schedule the cron job to run every day at 12:00 AM

const setupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running fetchAndSaveData daily at 12:00 AM");
      const response = await appointmentService.fetchDataAndStoreAppointments();
      if (!response) {
        console.error(
          "No response received from fetchDataAndStoreAppointments"
        );
      } else {
        //
      }
    } catch (error) {
      console.error(
        "Error occured while running fetchDataAndStoreAppointments:",
        error
      );
    }
  });
};

module.exports = setupJob;
