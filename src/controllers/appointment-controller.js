const AppointmentService = require("../services/appointment-service");
const DropdownValuesRepository = require("../repository/dropdownValues-repository");

const fetchAndSaveAppointments = async (req, res) => {
  try {
    const result = await AppointmentService.fetchDataAndStoreAppointments();
    res.status(200).json(result);
  } catch (error) {
    console.log("Error at fetchAndSaveAppointments - Controller layer");
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date(),
    });
  }
};

const fetchDataForSpecificOffice = async (req, res) => {
  try {
    const officeName = req.params.officeName;
    const { startDate, endDate } = req.query;
    const appointments = await AppointmentService.fetchDataForSpecificOffice(
      officeName,
      startDate,
      endDate,
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
        ivAssignedByUserName,
      );
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.log(
      "Error at updateAppointmentInArray- fetchDataForSpecificOffice- Controller layer",
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
      newData,
    );
    res
      .status(201)
      .json({ message: "Appointment created successfully", result });
  } catch (error) {
    console.error(
      "Error  createNewRushAppointment creating new appointment at Controller layer",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const fetchUserAppointments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { startDate, endDate } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required query parameters",
      });
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate",
      });
    }

    const appointments = await AppointmentService.fetchUserAppointments(
      userId,
      startDate,
      endDate,
    );
    console.log("Appointment response", appointments);
    res.status(200).json({
      success: true,
      data: appointments,
      filters: {
        userId,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.log("Error at fetchUserAppointments -Controller layer");
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
        ivCompletedDate,
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

const bulkUpdateAppointmentDetails = async (req, res) => {
  try {
    const { appointments } = req.body;

    // Validate required fields
    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).json({
        success: false,
        message: "appointments array is required",
      });
    }

    if (appointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "appointments array cannot be empty",
      });
    }

    // Validate each appointment has required fields
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      if (!appointment.appointmentId) {
        return res.status(400).json({
          success: false,
          message: `appointments[${i}].appointmentId is required`,
        });
      }
    }

    const results =
      await AppointmentService.bulkUpdateAppointmentDetails(appointments);

    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk update appointment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update appointment details at Controller layer",
      error: error.message,
    });
  }
};

const getAssignedCounts = async (req, res) => {
  const { officeName } = req.params;
  const { startDate, endDate } = req.query;

  // Validate required fields
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate are required query parameters",
    });
  }

  // Validate date format
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Please use YYYY-MM-DD format",
    });
  }

  if (startDateObj > endDateObj) {
    return res.status(400).json({
      success: false,
      message: "startDate cannot be later than endDate",
    });
  }

  try {
    const result = await AppointmentService.getAssignedCountsByOffice(
      officeName,
      startDate,
      endDate,
    );
    res.json({
      success: true,
      data: result,
      filters: {
        officeName,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned counts.",
    });
  }
};

const fetchUnassignedAppointmentsInRange = async (req, res) => {
  try {
    const { startDate, endDate, dateType } = req.query;

    // Validate dateType parameter
    if (dateType && !["appointmentDate", "ivAssignedDate"].includes(dateType)) {
      return res.status(400).json({
        message:
          "Invalid dateType. Must be 'appointmentDate' or 'ivAssignedDate'",
      });
    }

    // Default to appointmentDate if dateType is not provided
    const selectedDateType = dateType || "appointmentDate";

    const appointments =
      await AppointmentService.fetchUnassignedAppointmentsInRange(
        startDate,
        endDate,
        selectedDateType,
      );
    console.log("Appointments", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.log(
      "Error at fetchUnassignedAppointmentsInRange -Controller layer",
    );
    res.status(500).json({ message: error.message });
  }
};

const fetchCompletedAppointmentsByOffice = async (req, res) => {
  try {
    const { startDate, endDate, dateType } = req.query;

    // Validate dateType parameter
    if (
      dateType &&
      !["appointmentDate", "ivCompletedDate"].includes(dateType)
    ) {
      return res.status(400).json({
        message:
          "Invalid dateType. Must be 'appointmentDate' or 'ivCompletedDate'",
      });
    }

    // Default to appointmentDate if dateType is not provided
    const selectedDateType = dateType || "appointmentDate";

    // Fetch office names dynamically from dropdownValues collection
    const officeDropdown =
      await DropdownValuesRepository.findByCategory("Office");

    if (
      !officeDropdown ||
      !officeDropdown.options ||
      officeDropdown.options.length === 0
    ) {
      return res.status(404).json({
        message:
          'No office names found in dropdownValues collection with category "Office"',
      });
    }

    // Extract office names from the options array
    const offices = officeDropdown.options.map((option) => option.name);

    const results = await Promise.all(
      offices.map((officeName) =>
        AppointmentService.fetchCompletedAppointmentsCountByUser(
          officeName,
          startDate,
          endDate,
          selectedDateType,
        ),
      ),
    );
    res.status(200).json(results);
  } catch (error) {
    console.log(
      "Error at fetchCompletedAppointmentsByOffice- Controller layer",
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
        remarks,
      );
    console.log("Appointments", appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Error getAppointmentsByOfficeAndRemarks at controller layer fetching appointments: ",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentCompletionAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, dateType, ivType } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required query parameters",
      });
    }

    // Validate dateType parameter
    if (
      dateType &&
      !["appointmentDate", "ivCompletedDate"].includes(dateType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid dateType. Must be 'appointmentDate' or 'ivCompletedDate'",
      });
    }

    // Validate ivType parameter
    if (ivType && !["Normal", "Rush"].includes(ivType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ivType. Must be 'Normal' or 'Rush'",
      });
    }

    // Default values
    const selectedDateType = dateType || "appointmentDate";
    const selectedIvType = ivType || "Normal";

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }

    if (startDateObj > endDateObj) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate",
      });
    }

    const result = await AppointmentService.getAppointmentCompletionAnalysis(
      startDate,
      endDate,
      selectedDateType,
      selectedIvType,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      summary: result.summary,
      filters: {
        startDate,
        endDate,
        dateType: selectedDateType,
        ivType: selectedIvType,
      },
    });
  } catch (error) {
    console.error(
      "Error at controller layer in appointment completion analysis:",
      error,
    );
    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch appointment completion analysis",
    });
  }
};

const debugAppointmentData = async (req, res) => {
  try {
    const { officeName } = req.query;
    const debugData = await AppointmentService.debugAppointmentData(
      officeName || "Tidwell",
    );

    res.status(200).json({
      success: true,
      data: debugData,
      message: "Debug data retrieved successfully",
    });
  } catch (error) {
    console.error(
      "Error at controller layer in debug appointment data:",
      error,
    );
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch debug data",
    });
  }
};

// Get dynamic unassigned appointments with calculated date range
const getDynamicUnassignedAppointments = async (req, res) => {
  try {
    const result = await AppointmentService.getDynamicUnassignedAppointments();

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      dateRange: result.dateRange,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "Error at controller layer in getDynamicUnassignedAppointments:",
      error,
    );
    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch dynamic unassigned appointments",
    });
  }
};

// Check completion status of appointments by their MongoDB IDs
const checkAppointmentCompletionStatus = async (req, res) => {
  try {
    const { appointmentIds } = req.body;

    // Validate required fields
    if (!appointmentIds || !Array.isArray(appointmentIds)) {
      return res.status(400).json({
        success: false,
        message: "appointmentIds is required and must be an array",
      });
    }

    if (appointmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "appointmentIds array cannot be empty",
      });
    }

    // Validate each appointment ID format
    const mongoose = require("mongoose");
    for (const appointmentId of appointmentIds) {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid appointmentId format: ${appointmentId}. Must be a valid MongoDB ObjectId`,
        });
      }
    }

    const result =
      await AppointmentService.checkAppointmentCompletionStatus(appointmentIds);

    res.status(200).json({
      success: true,
      data: result.data,
      summary: result.summary,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "Error at controller layer in checkAppointmentCompletionStatus:",
      error,
    );
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check appointment completion status",
    });
  }
};

const aggregateAppointments = async (req, res) => {
  try {
    const pipeline = req.body.pipeline;
    if (!Array.isArray(pipeline)) {
      return res
        .status(400)
        .json({ success: false, message: "pipeline must be an array" });
    }
    const result = await AppointmentService.aggregate(pipeline);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchAndSaveAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
  createNewRushAppointment,
  fetchUserAppointments,
  updateIndividualAppointmentDetails,
  bulkUpdateAppointmentDetails,
  getAssignedCounts,
  fetchUnassignedAppointmentsInRange,
  fetchCompletedAppointmentsByOffice,
  getAppointmentsByOfficeAndRemarks,
  getAppointmentCompletionAnalysis,
  debugAppointmentData,
  getDynamicUnassignedAppointments,
  checkAppointmentCompletionStatus,
  aggregateAppointments,
};
