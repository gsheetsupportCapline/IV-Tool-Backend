// appointment-service.js

const AppointmentRepository = require("../repository/appointment-repository");
const Appointment = require("../models/appointment");
async function fetchDataAndStoreAppointments() {
  try {
    // Array of office names
    const officeNames = [
      "Aransas",
      "Azle",
      "Beaumont",
      "Benbrook",
      "Brodie",
      "Calallen",
      "Crosby",
      "Devine",
      "Elgin",
      "Huffman",
      "Jasper",
      "Lavaca",
      "Liberty",
      "Lucas",
      "Lytle",
      "Mathis",
      "Potranco",
      "Rio Bravo",
      "Riverwalk",
      "Rockdale",
      "Rockwall",
      "San Mateo",
      "Sinton",
      "Splendora",
      "Springtown",
      "Tidwell",
      "Victoria",
      "Westgreen",
      "Winnie",
    ];

    // Iterate over each office
    for (const officeName of officeNames) {
      const response = await AppointmentRepository.fetchDataByOffice(
        officeName
      );
      // console.log("Response :", response);
      const appointmentsData = response.data;
      const result = [];

      // const formattedAppointments = appointmentsData.map((appointmentData) => ({
      //   officeName: officeName,
      //   appointments: [
      //     {
      //       appointmentDate: new Date(appointmentData.c5),
      //       patientID: appointmentData.c1,
      //     },
      //   ],
      // }));

      appointmentsData.forEach((appointmentData) => {
        // Extract relevant information
        const appointmentDate = appointmentData.c5;
        const patientID = appointmentData.c1;

        // Push the appointment object into the result array
        result.push({
          appointmentDate: appointmentDate,
          patientID: parseInt(patientID), // Convert patientID to integer
        });
      });
      console.log(result);
      // Bulk insert appointments for the office
      // await Appointment.insertMany(formattedAppointments);

      const appointmentDoc = await Appointment.findOneAndUpdate(
        { officeName: officeName },
        { officeName: officeName, appointments: result },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.log("Error at Service Layer");
    console.error("Error fetching and storing data:", error);
    throw error;
  }
}

module.exports = {
  fetchDataAndStoreAppointments,
};
