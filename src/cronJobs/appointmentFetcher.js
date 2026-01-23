const cron = require("node-cron");
const appointmentService = require("../services/appointment-service");

// Schedule the cron job to run every 1 hour

const setupJob = () => {
  cron.schedule("0 */1 * * *", async () => {
    try {
      console.log("Running fetchAndSaveData every 1 hour");
      const response =
        await appointmentService.fetchDataAndStoreAppointments("cron");
      console.log("result", response);
      if (!response) {
        console.error(
          "No response received from fetchDataAndStoreAppointments",
        );
      } else {
        //
      }
    } catch (error) {
      console.error(
        "Error occured while running fetchDataAndStoreAppointments:",
        error,
      );
    }
  });
};

module.exports = setupJob;
