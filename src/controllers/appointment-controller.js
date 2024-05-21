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

const updateAppointmentInArray = async (req, res) => {
  try {
    console.log("controller");
    const { officeName, appointmentId } = req.params;
    const { userId, status } = req.body;
    console.log("officeName:", officeName, "appointmentId:", appointmentId);
    const updatedAppointment =
      await AppointmentService.updateAppointmentInArray(
        officeName,
        appointmentId,
        userId,
        status
      );
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchAndSaveAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
};
