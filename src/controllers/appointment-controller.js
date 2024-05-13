const AppointmentService = require("../services/appointment-service");

const fetchAndSaveAppointments = async (req, res) => {
  try {
    await AppointmentService.fetchDataAndStoreAppointments();
    res
      .status(200)
      .json({ message: "Appointments fetched and saved succesfully" });
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};

const fetchDataForSpecificOffice = async (req, res) => {
  try {
    const officeName = req.params.officeName;
    const appointments = await AppointmentService.fetchDataForSpecificOffice(
      officeName
    );
    res.status(200).json({ appointments });
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchAndSaveAppointments,
  fetchDataForSpecificOffice,
};
