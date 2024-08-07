const AppointmentService = require("../services/appointment-service");

const fetchAndSaveAppointments = async (req, res) => {
  try {
    await AppointmentService.fetchDataAndStoreAppointments();
    res
      .status(200)
      .json({ message: "Appointments fetched and saved succesfully" });
  } catch (error) {
    console.log("Error at fetchAndSaveAppointments -Controller layer");
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
    console.log("Error at fetchDataForSpecificOffice- Controller layer");
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentInArray = async (req, res) => {
  try {
    console.log("controller");
    const { officeName, appointmentId } = req.params;
    const {
      userId,
      status,
      completionStatus,
      ivAssignedDate,
      ivAssignedByUserName,
    } = req.body;
    console.log("officeName:", officeName, "appointmentId:", appointmentId);
    const updatedAppointment =
      await AppointmentService.updateAppointmentInArray(
        officeName,
        appointmentId,
        userId,
        status,
        completionStatus,
        ivAssignedDate,
        ivAssignedByUserName
      );
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.log(
      "Error at updateAppointmentInArray- fetchDataForSpecificOffice- Controller layer"
    );
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
    console.error(
      "Error  createNewRushAppointment creating new appointment at Controller layer",
      error
    );
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
    console.log("Error at fetchUserAppointments -Controller layer");
    res.status(500).json({ message: error.message });
  }
};

const updateIndividualAppointmentDetails = async (req, res) => {
  try {
    const {
      appointmentId,
      ivRemarks,
      source,
      planType,
      completedBy,
      noteRemarks,
      ivCompletedDate,
    } = req.body;

    const updatedAppointment =
      await AppointmentService.updateIndividualAppointmentDetails(
        appointmentId,
        ivRemarks,
        source,
        planType,
        completedBy,
        noteRemarks,
        ivCompletedDate
      );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating individual appointment details:", error);
    res.status(500).send({
      error:
        "Failed to update individual appointment details at Controller layer",
    });
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
    console.log(
      "Error at fetchUnassignedAppointmentsInRange -Controller layer"
    );
    res.status(500).json({ message: error.message });
  }
};

const fetchCompletedAppointmentsByOffice = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const offices = [
      "Aransas",
      "Azle",
      "Beaumont",
      "Benbrook",
      "Calallen",
      "Crosby",
      "Devine",
      "Elgin",
      "Grangerland",
      "Huffman",
      "Jasper",
      "Lavaca",
      "Liberty",
      "Lytle",
      "Mathis",
      "Potranco",
      "Rio Bravo",
      "Riverwalk",
      "Rockdale",
      "Sinton",
      "Splendora",
      "Springtown",
      "Tidwell",
      "Victoria",
      "Westgreen",
      "Winnie",
      "OS",
    ];
    const results = await Promise.all(
      offices.map((officeName) =>
        AppointmentService.fetchCompletedAppointmentsCountByUser(
          officeName,
          startDate,
          endDate
        )
      )
    );
    res.status(200).json(results);
  } catch (error) {
    console.log(
      "Error at fetchCompletedAppointmentsByOffice- Controller layer"
    );
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentsByOfficeAndRemarks = async (req, res) => {
  try {
    const { officeName, startDate, endDate } = req.query;
    const remarks = [
      "Appt Cancelled",
      "Discounted Plan",
      "Benefit maxed out as per ES",
      "Dependent not enrolled",
      "Future activation date",
      "Inactive",
      "Ineligible",
      "Maxed Out",
      "Medicaid IVs (Day Team)",
      "Medicaid IVs for Future Dates (Day Team)",
      "Medical Policy",
      "Missing Insurance Details",
      "No Dental Coverage",
      "No OON Benefits",
      "No OS Benefits",
      "Not able to contact with rep",
      "Not assigned to our office",
      "Not Found over Call",
      "office Closed",
      "Only Ortho IV required as per ofc",
      "Only OS IV required as per ofc",
      "OS Patient",
      "Indemnity plan",
      "Rep denied to provide info",
      "Repeated",
      "Rush not Accepted",
      "Terminated",
      "Unable to retrive information",
      "Wrong information",
      "Provider not available on Provider Schedule",
      "Not Found over web, Night IV need to call",
      "Not found on web and call",
      "Not accepting HMO patient",
      "Missing Insurance Details, No info ES",
      "Ortho/OS Provider on Scheduler",
      "IV Return - TX on Exchange above 18 years",
      "Office Is closed for the day, Patient need to reschedule.",
      "Faxback Attached in Drive",
      "Completed, Not assigned to Facility",
      "Technical Issue - Not received OTP/Fax",
      "Unable to check Provider/Facility Status",
      "Updated ES, IV has not created",
      "IV not created, Email sent for benefits",
    ];
    const appointments =
      await AppointmentService.getAppointmentsByOfficeAndRemarks(
        officeName,
        startDate,
        endDate,
        remarks
      );
    console.log("Appointments", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Error getAppointmentsByOfficeAndRemarks at controller layer fetching appointments: ",
      error
    );
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
  getAppointmentsByOfficeAndRemarks,
};
