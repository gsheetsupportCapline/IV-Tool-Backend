const cron = require('node-cron');
const appointmentService = require('../services/appointment-service');

// Schedule the cron job to run every 3 hours

const setupJob = () => {
  cron.schedule('0 */3 * * *', async () => {
    try {
      console.log('Running fetchAndSaveData every 3 hours');
      const response = await appointmentService.fetchDataAndStoreAppointments();
      console.log('result', response);
      if (!response) {
        console.error(
          'No response received from fetchDataAndStoreAppointments'
        );
      } else {
        //
      }
    } catch (error) {
      console.error(
        'Error occured while running fetchDataAndStoreAppointments:',
        error
      );
    }
  });
};

module.exports = setupJob;
