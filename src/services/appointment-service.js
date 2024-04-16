const AppointmentRepository = require("../repository/appointment-repository");

const Appointment = require("../models/appointment");

async function fetchAndSaveData() {
  try {
    const response = await AppointmentRepository.fetchData();
    console.log(response);

    // Check if the response contains data and that data is an array
    if (response && Array.isArray(response.data)) {
      for (const item of response.data) {
        const appointment = new Appointment({
          patientID: item.c1,
          patientName: item.c2,
          patientDOB: new Date(item.c3),
          startTime: new Date(item.c4),
          primaryMemberID: item.c5,
          medicaidID: item.c6,
          carrierID: item.c7,
          appointmentType: item.c8,
          confirmationStatus: item.c9,
          endTime: new Date(item.c10),
          confirmationDate: new Date(item.c11),
          cellPhone: item.c12,
          homePhone: item.c13,
          workPhone: item.c14,
        });

        await appointment.save();
      }
      console.log("Data saved successfully");
    } else {
      console.error("No data to process or data is not an array");
    }
  } catch (error) {
    console.error("Error in fetchAndSaveData:", error);
    throw error;
  }
}

module.exports = {
  fetchAndSaveData,
};
