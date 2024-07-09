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
    const { userId, status, completionStatus } = req.body;
    console.log("officeName:", officeName, "appointmentId:", appointmentId);
    const updatedAppointment =
      await AppointmentService.updateAppointmentInArray(
        officeName,
        appointmentId,
        userId,
        status,
        completionStatus
      );
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createNewRushAppointment = async (req, res) => {
  try {
    const officeName = req.params.officeName;
    const newData = req.body;
    const result = await AppointmentService.createNewRushAppointment(
      officeName,
      newData
    );
    res
      .status(201)
      .json({ message: "Appointment created successfully", result });
  } catch (error) {
    console.error("Error creating new appointment", error);
    res.status(500).json({ message: error.message });
  }
};

const fetchUserAppointments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const appointments = await AppointmentService.fetchUserAppointments(userId);
    console.log("Appointment response", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};

const updateIndividualAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId, ivRemarks, source, planType, completedBy } =
      req.body;

    const updatedAppointment =
      await AppointmentService.updateIndividualAppointmentDetails(
        appointmentId,
        ivRemarks,
        source,
        planType,
        completedBy
      );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating individual appointment details:", error);
    res
      .status(500)
      .send({ error: "Failed to update individual appointment details" });
  }
};

const getAssignedCounts = async (req, res) => {
  const { officeName } = req.params;

  try {
    const result = await AppointmentService.getAssignedCountsByOffice(
      officeName
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch assigned counts." });
  }
};

const fetchUnassignedAppointmentsInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments =
      await AppointmentService.fetchUnassignedAppointmentsInRange(
        startDate,
        endDate
      );
    console.log("Appointments", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};

const fetchCompletedAppointmentsByOffice = async (req, res) => {
  try {
    const offices = [
      "Aransas",
      "Azle",
      "Beaumont" /* Add all other office names here */,
    ];
    const results = await Promise.all(
      offices.map((officeName) =>
        AppointmentService.fetchCompletedAppointmentsCountByUser(officeName)
      )
    );
    res.status(200).json(results);
  } catch (error) {
    console.log("Error at Controller layer");
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchAndSaveAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
  createNewRushAppointment,
  fetchUserAppointments,
  updateIndividualAppointmentDetails,
  getAssignedCounts,
  fetchUnassignedAppointmentsInRange,
  fetchCompletedAppointmentsByOffice,
};
