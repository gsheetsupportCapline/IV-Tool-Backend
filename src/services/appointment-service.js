const AppointmentRepository = require("../repository/appointment-repository");

const Appointment = require("../models/appointment");

const fetchAndSaveData = async (officeName) => {
  try {
    const response = await AppointmentRepository.fetchData(officeName);
    console.log(response);

    // Check if the response contains data and that data is an array
    if (response && Array.isArray(response.data)) {
      const currentDate = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

      for (const item of response.data) {
        const startTime = new Date(item.c4);
        const endTime = new Date(item.c10);
        const confirmationDate = new Date(item.c11);

        // Check if the appointment is from the last two months, from the current month, or scheduled for a future date
        if (
          (startTime >= twoMonthsAgo && startTime < currentDate) ||
          startTime.getMonth() === currentDate.getMonth() ||
          startTime > currentDate
        ) {
          try {
            const appointment = new Appointment({
              patientID: item.c1,
              patientName: item.c2,
              patientDOB: new Date(item.c3),
              startTime: startTime, // new Date(item.c4),
              primaryMemberID: item.c5,
              medicaidID: item.c6,
              carrierID: item.c7,
              appointmentType: item.c8,
              confirmationStatus: item.c9,
              endTime: endTime, //new Date(item.c10),

              confirmationDate: confirmationDate, //new Date(item.c11)
              cellPhone: item.c12,
              homePhone: item.c13,
              workPhone: item.c14,
            });

            await appointment.save();
            console.log("Appointment saved successfully:", appointment);
          } catch (error) {
            console.error("Error saving appointment:", error);
          }
        }
      }
    } else {
      console.error("No data to process or data is not an array");
    }
  } catch (error) {
    console.error("Error in fetchAndSaveData:", error);
    throw error;
  }
};

module.exports = {
  fetchAndSaveData,
};
