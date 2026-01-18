// appointment-service.js
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const AppointmentRepository = require("../repository/appointment-repository");
const Appointment = require("../models/appointment");
const DropdownValuesRepository = require("../repository/dropdownValues-repository");

async function fetchDataAndStoreAppointments() {
  try {
    // Fetch office names dynamically from dropdownValues collection
    const officeDropdown =
      await DropdownValuesRepository.findByCategory("Office");

    console.log("Office Dropdown Result:", officeDropdown);
    console.log("Options:", officeDropdown?.options);

    if (
      !officeDropdown ||
      !officeDropdown.options ||
      officeDropdown.options.length === 0
    ) {
      throw new Error(
        'No office names found in dropdownValues collection with category "Office"',
      );
    }

    // Extract office names from the options array
    const officeNames = officeDropdown.options.map((option) => option.name);
    console.log("Fetched office names from database:", officeNames);

    for (const officeName of officeNames) {
      await processOfficeAppointments(officeName);
    }
  } catch (error) {
    console.log("Error at Service Layer fetchDataAndStoreAppointments");
    console.error("Error fetching and storing data:", error);
    throw error;
  }
}

async function processOfficeAppointments(officeName) {
  try {
    const response = await AppointmentRepository.fetchDataByOffice(officeName);
    // console.log(response);
    const appointmentsData = response.data;

    // Get current date/time in America/Chicago timezone (Texas)
    // This automatically handles CST (UTC-6) and CDT (UTC-5) with Daylight Saving Time
    const texasTime = moment.tz("America/Chicago").toDate();

    const newAppointments = appointmentsData.map((appointmentData) => {
      const dateTimeString = appointmentData.c5.split(" ");
      const [datePart, timePart] = dateTimeString;
      const appointmentDate = datePart;

      return {
        officeName: officeName, // Add officeName at root level
        appointmentDate: appointmentDate,
        appointmentTime: timePart.substring(0, 8),
        patientId: appointmentData.c1,
        patientName: `${appointmentData.c12} ${appointmentData.c13}`,
        insuranceName: appointmentData.c7,
        insurancePhone: appointmentData.c8,
        policyHolderName: appointmentData.c2,
        policyHolderDOB: appointmentData.c4,
        appointmentType: appointmentData.c6,
        memberId: appointmentData.c9,
        employerName: appointmentData.c10,
        groupNumber: appointmentData.c11,
        relationWithPatient: appointmentData.c3,
        medicaidId: appointmentData.c14,
        carrierId: appointmentData.c15,
        confirmationStatus: appointmentData.c16,
        cellPhone: appointmentData.c17,
        homePhone: appointmentData.c18,
        workPhone: appointmentData.c19,
        patientDOB: appointmentData.c20,
        ivRequestedDate: texasTime,
        source: "GoogleSheets", // Mark source
        status: "Unassigned", // Default status
      };
    });

    // Find existing appointments for this office to check for duplicates
    const existingAppointments = await Appointment.find({
      officeName: officeName,
    })
      .select("patientId appointmentDate insuranceName")
      .lean();

    let appointmentsToAdd = [];

    newAppointments.forEach((newAppointment) => {
      const isDuplicate = existingAppointments.some((existingAppointment) => {
        // Convert both dates to Date objects
        const existingDate = new Date(existingAppointment.appointmentDate);
        const newDate = new Date(newAppointment.appointmentDate);

        // Compare patientId, appointmentDate (date only), and insuranceName
        return (
          existingAppointment.patientId == newAppointment.patientId &&
          existingDate.getDate() == newDate.getDate() &&
          existingDate.getMonth() == newDate.getMonth() &&
          existingDate.getFullYear() == newDate.getFullYear() &&
          existingAppointment.insuranceName == newAppointment.insuranceName
        );
      });
      if (!isDuplicate) {
        appointmentsToAdd.push(newAppointment);
      }
    });

    if (appointmentsToAdd.length > 0) {
      // Insert new appointments as flat documents
      await Appointment.insertMany(appointmentsToAdd);
      console.log(
        `Added ${appointmentsToAdd.length} new appointment(s) for office: ${officeName}`,
      );
    } else {
      console.log("No new appointments to add for office:", officeName);
    }
  } catch (error) {
    console.log("Error processing office appointments for:", officeName);
    console.error("Error:", error);
    throw error;
  }
}

async function fetchDataForSpecificOffice(officeName, startDate, endDate) {
  try {
    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.aggregate([
      {
        $match: {
          officeName: { $in: [officeName] },
          appointmentDate: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      },
      {
        $addFields: {
          officeId: "$_id",
          office: "$officeName",
          // Extract month and year from appointment date
          appointmentMonth: {
            $month: "$appointmentDate",
          },
          appointmentYear: {
            $year: "$appointmentDate",
          },
        },
      },
      // Self-lookup to check if same patient + insurance was completed BEFORE current appointment
      // NOTE: This checks if there's ANY earlier completed appointment in the same month/year
      {
        $lookup: {
          from: "appointments",
          let: {
            patientId: "$patientId",
            insuranceName: "$insuranceName",
            appointmentMonth: "$appointmentMonth",
            appointmentYear: "$appointmentYear",
            currentAppointmentDate: "$appointmentDate",
            currentAppointmentId: "$_id",
            currentOfficeName: "$officeName",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    // Same office
                    { $eq: ["$officeName", "$$currentOfficeName"] },
                    // Same patient
                    { $eq: ["$patientId", "$$patientId"] },
                    // Same insurance
                    {
                      $eq: ["$insuranceName", "$$insuranceName"],
                    },
                    // Same month
                    {
                      $eq: [
                        { $month: "$appointmentDate" },
                        "$$appointmentMonth",
                      ],
                    },
                    // Same year
                    {
                      $eq: [{ $year: "$appointmentDate" }, "$$appointmentYear"],
                    },
                    // Completion status is 'Completed'
                    {
                      $eq: ["$completionStatus", "Completed"],
                    },
                    // Different appointment (not comparing with itself)
                    {
                      $ne: ["$_id", "$$currentAppointmentId"],
                    },
                    // IMPORTANT: Completed BEFORE or ON the current appointment date
                    {
                      $lte: ["$appointmentDate", "$$currentAppointmentDate"],
                    },
                  ],
                },
              },
            },
            { $limit: 1 }, // Just need to know if exists
          ],
          as: "previousCompletions",
        },
      },
      {
        $addFields: {
          isPreviouslyCompleted: {
            $cond: {
              if: { $gt: [{ $size: "$previousCompletions" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $unset: "previousCompletions",
      },
      {
        $sort: { appointmentDate: 1, appointmentTime: 1 },
      },
    ]);

    return results;
  } catch (error) {
    console.error(
      "Error at Service Layer in fetchDataForSpecificOffice:",
      error,
    );
    throw error;
  }
}

async function updateAppointmentInArray(
  officeName,
  appointmentId,
  userId,
  status,
  completionStatus,
  ivAssignedDate,
  ivAssignedByUserName,
) {
  try {
    const result = await AppointmentRepository.updateAppointmentInArray(
      officeName,
      appointmentId,
      userId,
      status,
      completionStatus,
      ivAssignedDate,
      ivAssignedByUserName,
    );

    if (!result.matchedCount) {
      throw new Error("Appointment not found or no matching office");
    }

    // UPDATED: Get the updated appointment directly (flat structure)
    const updatedAppointment = await Appointment.findById(appointmentId);

    if (!updatedAppointment) {
      throw new Error("Failed to retrieve updated appointment");
    }

    console.log("Updated Appointment:", updatedAppointment._id);

    return updatedAppointment;
  } catch (error) {
    console.log("Error at Service Layer in function updateAppointmentInArray");
    throw error;
  }
}

async function createNewRushAppointment(officeName, data) {
  try {
    const newAppointment = {
      officeName: officeName,
      appointmentDate: new Date(data.appointmentDate),
      appointmentTime: data.appointmentTime,
      provider: data.provider,
      patientId: data.patientId,
      patientDOB: data.patientDOB,
      patientName: data.patientName,
      policyHolderName: data.policyHolderName,
      policyHolderDOB: data.policyHolderDOB,
      MIDSSN: data.MIDSSN,
      insuranceName: data.insuranceName,
      insurancePhone: data.insurancePhone,
      ivRequestedDate: data.ivRequestedDate,
      ivType: "Rush",
      imageUrl: data.imageUrl,
      source: "Manual", // Mark as manually created
      status: "Unassigned", // Default status
    };

    const result = await Appointment.create(newAppointment);

    console.log("New rush appointment created:", result._id);
    return result;
  } catch (error) {
    console.error("Error at service layer creating new appointment :", error);
    throw error;
  }
}

async function fetchUserAppointments(userId, startDate, endDate) {
  try {
    // Convert dates to UTC Date objects to avoid timezone issues
    const startDateObj = new Date(startDate + "T00:00:00.000Z"); // Force UTC start of day
    const endDateObj = new Date(endDate + "T23:59:59.999Z"); // Force UTC end of day

    console.log("Date range for user appointments:", {
      userId,
      startDate,
      endDate,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    // UPDATED: Direct query on flat documents
    const appointments = await Appointment.find({
      assignedUser: userId,
      ivAssignedDate: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
    })
      .select({
        _id: 1,
        appointmentType: 1,
        appointmentDate: 1,
        appointmentTime: 1,
        patientId: 1,
        patientName: 1,
        patientDOB: 1,
        insuranceName: 1,
        insurancePhone: 1,
        policyHolderName: 1,
        policyHolderDOB: 1,
        memberId: 1,
        employerName: 1,
        groupNumber: 1,
        relationWithPatient: 1,
        medicaidId: 1,
        carrierId: 1,
        confirmationStatus: 1,
        cellPhone: 1,
        homePhone: 1,
        workPhone: 1,
        ivType: 1,
        completionStatus: 1,
        status: 1,
        assignedUser: 1,
        source: 1,
        planType: 1,
        ivRemarks: 1,
        provider: 1,
        noteRemarks: 1,
        ivCompletedDate: 1,
        ivAssignedDate: 1,
        ivRequestedDate: 1,
        ivAssignedByUserName: 1,
        completedBy: 1,
        officeName: 1,
      })
      .sort({ ivAssignedDate: -1 })
      .lean();

    // Map to match expected response format
    const formattedAppointments = appointments.map((apt) => ({
      ...apt,
      office: apt.officeName,
    }));

    console.log(
      `Found ${formattedAppointments.length} appointments for userId: ${userId} with date filters`,
    );

    // Debug: Log some appointment dates if found
    if (formattedAppointments.length > 0) {
      console.log(
        "Sample appointment ivAssignedDates:",
        formattedAppointments.slice(0, 3).map((apt) => ({
          id: apt._id,
          ivAssignedDate: apt.ivAssignedDate,
        })),
      );
    }

    return formattedAppointments;
  } catch (error) {
    console.error("Error at service layer fetching user appointments:", error);
    throw error;
  }
}

async function updateIndividualAppointmentDetails(
  appointmentId,
  ivRemarks,
  source,
  planType,
  completedBy,
  noteRemarks,
  ivCompletedDate,
) {
  try {
    // UPDATED: Direct update on flat document
    const updateOperation = {
      $set: {
        ivRemarks: ivRemarks,
        source: source,
        planType: planType,
        completionStatus: source === "Temp" ? "IV Not Done" : "Completed",
        completedBy: source === "Temp" ? "Temp" : completedBy,
        noteRemarks: noteRemarks,
        ivCompletedDate: ivCompletedDate,
        lastUpdatedAt: new Date(),
      },
    };

    // Execute the update operation
    const updateResult = await Appointment.updateOne(
      { _id: appointmentId },
      updateOperation,
    );

    if (!updateResult.matchedCount) {
      throw new Error(
        `No matching appointment found for appointment ID ${appointmentId}`,
      );
    }

    // Optionally, return the updated document or a success message
    return updateResult;
  } catch (error) {
    console.error(
      "Error at service layer updating individual appointment details:",
      error,
    );
    throw error;
  }
}

async function bulkUpdateAppointmentDetails(appointmentsData) {
  try {
    const results = {
      totalRequested: appointmentsData.length,
      successfulUpdates: 0,
      failedUpdates: 0,
      details: [],
    };

    // Validate all appointments first
    const validAppointments = [];
    for (const appointmentData of appointmentsData) {
      if (!appointmentData.appointmentId) {
        results.failedUpdates++;
        results.details.push({
          appointmentId: appointmentData.appointmentId || "unknown",
          status: "failed",
          error: "appointmentId is required",
        });
      } else {
        validAppointments.push(appointmentData);
      }
    }

    // If no valid appointments, return early
    if (validAppointments.length === 0) {
      return results;
    }

    // UPDATED: Process each appointment individually with flat structure
    // Using Promise.allSettled to handle all updates regardless of individual failures
    const updatePromises = validAppointments.map(async (appointmentData) => {
      const {
        appointmentId,
        ivRemarks,
        source,
        planType,
        completedBy,
        noteRemarks,
        ivCompletedDate,
        assignedUser,
        ivAssignedByUserName,
        ivAssignedDate,
      } = appointmentData;

      try {
        const updateResult = await Appointment.updateOne(
          { _id: appointmentId },
          {
            $set: {
              ivRemarks: ivRemarks,
              source: source,
              planType: planType,
              status: "Assigned",
              completionStatus: source === "Temp" ? "IV Not Done" : "Completed",
              completedBy: source === "Temp" ? "Temp" : completedBy,
              noteRemarks: noteRemarks,
              ivCompletedDate: ivCompletedDate,
              assignedUser: assignedUser,
              ivAssignedByUserName: ivAssignedByUserName,
              ivAssignedDate: ivAssignedDate,
              lastUpdatedAt: new Date(),
            },
          },
        );

        return {
          appointmentId,
          success:
            updateResult.matchedCount > 0 && updateResult.modifiedCount > 0,
          matched: updateResult.matchedCount,
          modified: updateResult.modifiedCount,
        };
      } catch (error) {
        return {
          appointmentId,
          success: false,
          error: error.message,
        };
      }
    });

    // Wait for all updates to complete
    const updateResults = await Promise.allSettled(updatePromises);

    // Process results
    updateResults.forEach((result) => {
      if (result.status === "fulfilled") {
        const updateInfo = result.value;
        if (updateInfo.success) {
          results.successfulUpdates++;
          results.details.push({
            appointmentId: updateInfo.appointmentId,
            status: "success",
            matched: updateInfo.matched,
            modified: updateInfo.modified,
          });
        } else {
          results.failedUpdates++;
          results.details.push({
            appointmentId: updateInfo.appointmentId,
            status: "failed",
            error:
              updateInfo.error || "Appointment not found or no changes made",
          });
        }
      } else {
        results.failedUpdates++;
        results.details.push({
          appointmentId: "unknown",
          status: "failed",
          error: result.reason?.message || "Unknown error",
        });
      }
    });

    return results;
  } catch (error) {
    console.error(
      "Error at service layer in bulk update appointment details:",
      error,
    );
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName, startDate, endDate) {
  const result = await AppointmentRepository.getAssignedCountsByOffice(
    officeName,
    startDate,
    endDate,
  );
  return {
    officeName,
    assignedCounts: result.counts,
    completeData: result.completeData,
    dateRange: {
      startDate,
      endDate,
    },
  };
}
async function fetchUnassignedAppointmentsInRange(
  startDate,
  endDate,
  dateType = "appointmentDate",
) {
  try {
    // Convert startDate and endDate to Date objects
    const startDateISO = new Date(startDate).toISOString();
    // Adjust endDate to the start of the next day to include appointments on the end date up to 23:59:59.999
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    // Determine the field name based on dateType (UPDATED for flat structure)
    const dateFieldName =
      dateType === "ivAssignedDate" ? "ivAssignedDate" : "appointmentDate";

    // UPDATED: Direct aggregation on flat documents
    const appointments = await Appointment.aggregate([
      {
        $match: {
          $or: [
            {
              status: "Unassigned",
            },
            {
              completionStatus: "In Process",
            },
          ],
          completedBy: { $ne: "Temp" },
          [dateFieldName]: {
            $gte: new Date(startDateISO),
            $lt: new Date(endDateISO),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: `$${dateFieldName}`,
              },
            },
            officeName: "$officeName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          offices: {
            $push: {
              officeName: "$_id.officeName",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return appointments;
  } catch (error) {
    console.error(
      "Error at service layer fetching unassigned appointments:",
      error,
    );
    throw error;
  }
}
async function fetchCompletedAppointmentsCountByUser(
  officeName,
  startDate,
  endDate,
  dateType = "appointmentDate",
) {
  try {
    // Convert startDate and endDate to Date objects for comparison
    const startDateISO = new Date(startDate).toISOString();
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    // UPDATED: Determine the field name based on dateType (flat structure)
    const dateFieldName =
      dateType === "ivCompletedDate" ? "ivCompletedDate" : "appointmentDate";

    console.log("Master data analysis parameters:", {
      officeName,
      startDate,
      endDate,
      dateType,
      conversionNote: "No timezone conversion - filtering as-is",
    });

    // UPDATED: Direct aggregation on flat documents
    const appointments = await Appointment.aggregate([
      {
        $match: {
          officeName: officeName,
          completionStatus: "Completed",
          source: { $ne: "Temp" },
          [dateFieldName]: {
            $gte: new Date(startDateISO),
            $lt: new Date(endDateISO),
          },
        },
      },
      { $group: { _id: "$assignedUser", count: { $sum: 1 } } },
    ]);

    console.log("Aggregation Result:", appointments);

    if (appointments.length === 0) {
      console.log(`No completed appointments found for office: ${officeName}`);
      return { office: officeName, completedCount: [] };
    }

    const completedCount = appointments.map((appointment) => ({
      userId: appointment._id,
      count: appointment.count,
    }));

    return { office: officeName, completedCount };
  } catch (error) {
    console.error(
      "Error at service layer fetching completed appointments:",
      error,
    );
    throw error;
  }
}

async function getAppointmentsByOfficeAndRemarks(
  officeName,
  startDate,
  endDate,
  remarks,
) {
  try {
    const appointments =
      await AppointmentRepository.fetchAppointmentsByOfficeAndRemarks(
        officeName,
        startDate,
        endDate,
        remarks,
      );
    return appointments;
  } catch (error) {
    console.error(
      "Error at service layer in getAppointmentsByOfficeAndRemarks:",
      error,
    );
    throw error;
  }
}

async function getAppointmentCompletionAnalysis(
  startDate,
  endDate,
  dateType = "appointmentDate",
  ivType = "Normal",
) {
  try {
    // Validate dateType
    if (!["appointmentDate", "ivCompletedDate"].includes(dateType)) {
      throw new Error(
        "Invalid dateType. Must be 'appointmentDate' or 'ivCompletedDate'",
      );
    }

    // Validate ivType
    if (!["Normal", "Rush"].includes(ivType)) {
      throw new Error("Invalid ivType. Must be 'Normal' or 'Rush'");
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format");
    }

    if (startDateObj > endDateObj) {
      throw new Error("startDate cannot be later than endDate");
    }

    console.log("Appointment completion analysis request:", {
      startDate,
      endDate,
      dateType,
      ivType,
    });

    const analysisData =
      await AppointmentRepository.getAppointmentCompletionAnalysis(
        startDate,
        endDate,
        dateType,
        ivType,
      );

    return {
      success: true,
      data: analysisData,
      summary: {
        totalOffices: analysisData.length,
        dateRange: { startDate, endDate },
        filters: { dateType, ivType },
      },
    };
  } catch (error) {
    console.error(
      "Error at service layer in appointment completion analysis:",
      error,
    );
    throw error;
  }
}

async function debugAppointmentData(officeName) {
  try {
    const debugData =
      await AppointmentRepository.debugAppointmentData(officeName);
    return debugData;
  } catch (error) {
    console.error("Error at service layer in debug appointment data:", error);
    throw error;
  }
}

// Get dynamic unassigned appointments with calculated date range
async function getDynamicUnassignedAppointments() {
  try {
    console.log("Service: Fetching dynamic unassigned appointments");
    const result =
      await AppointmentRepository.getDynamicUnassignedAppointments();

    // Format appointments for better readability
    const formattedAppointments = result.appointments.map((appointment) => ({
      appointmentId: appointment.appointmentId,
      appointmentDate: appointment.appointmentDate.toISOString().split("T")[0],
      appointmentTime: appointment.appointmentTime,
      appointmentType: appointment.appointmentType,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      ivType: appointment.ivType,
      status: appointment.status,
      office: appointment.office,
    }));

    return {
      success: true,
      data: formattedAppointments,
      count: formattedAppointments.length,
      dateRange: result.dateRange,
      message: "Dynamic unassigned appointments fetched successfully",
    };
  } catch (error) {
    console.error(
      "Error at service layer in getDynamicUnassignedAppointments:",
      error,
    );
    throw error;
  }
}

// Check completion status of appointments by their MongoDB IDs
async function checkAppointmentCompletionStatus(appointmentIds) {
  try {
    console.log(
      "Service: Checking completion status for appointments:",
      appointmentIds,
    );

    const result =
      await AppointmentRepository.checkAppointmentCompletionStatus(
        appointmentIds,
      );

    // Separate completed and not completed appointments
    const completedAppointments = result.filter(
      (appointment) => appointment.completionStatus === "Completed",
    );
    const notCompletedAppointments = result.filter(
      (appointment) => appointment.completionStatus !== "Completed",
    );

    // Create detailed response
    const detailedData = {
      completed: completedAppointments.map((appointment) => ({
        appointmentId: appointment.appointmentId,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        office: appointment.office,
        completionStatus: appointment.completionStatus,
        ivCompletedDate: appointment.ivCompletedDate,
        completedBy: appointment.completedBy,
      })),
      notCompleted: notCompletedAppointments.map((appointment) => ({
        appointmentId: appointment.appointmentId,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        office: appointment.office,
        completionStatus: appointment.completionStatus,
        status: appointment.status,
        ivType: appointment.ivType,
      })),
    };

    const summary = {
      totalAppointments: appointmentIds.length,
      foundAppointments: result.length,
      notFoundAppointments: appointmentIds.length - result.length,
      completedCount: completedAppointments.length,
      notCompletedCount: notCompletedAppointments.length,
      completionPercentage:
        result.length > 0
          ? Math.round((completedAppointments.length / result.length) * 100)
          : 0,
    };

    return {
      success: true,
      data: detailedData,
      summary: summary,
      message: `Found ${result.length} appointments. ${notCompletedAppointments.length} are not completed.`,
    };
  } catch (error) {
    console.error(
      "Error at service layer in checkAppointmentCompletionStatus:",
      error,
    );
    throw error;
  }
}

async function aggregate(pipeline) {
  if (!Array.isArray(pipeline)) {
    throw new Error("pipeline must be an array");
  }
  // run pipeline on Appointment collection
  return Appointment.aggregate(pipeline);
}

module.exports = {
  fetchDataAndStoreAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
  createNewRushAppointment,
  fetchUserAppointments,
  updateIndividualAppointmentDetails,
  bulkUpdateAppointmentDetails,
  getAssignedCountsByOffice,
  fetchUnassignedAppointmentsInRange,
  fetchCompletedAppointmentsCountByUser,
  getAppointmentsByOfficeAndRemarks,
  getAppointmentCompletionAnalysis,
  debugAppointmentData,
  getDynamicUnassignedAppointments,
  checkAppointmentCompletionStatus,
  aggregate,
};
