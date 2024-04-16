const AppointmentService = require("../services/appointment-service");

exports.fetchAndSaveAppointments = async (req, res) => {
  try {
    await AppointmentService.fetchAndSaveData();
    res
      .status(200)
      .json({ message: "Appointments fetched and saved succesfully" });
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};
