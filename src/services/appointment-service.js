// appointment-service.js
const mongoose = require("mongoose");
const AppointmentRepository = require("../repository/appointment-repository");
const Appointment = require("../models/appointment");
const DropdownValuesRepository = require("../repository/dropdownValues-repository");

async function fetchDataAndStoreAppointments() {
  try {
    // Fetch office names dynamically from dropdownValues collection
    const officeDropdown = await DropdownValuesRepository.findByCategory(
      "Office"
    );

    console.log("Office Dropdown Result:", officeDropdown);
    console.log("Options:", officeDropdown?.options);

    if (
      !officeDropdown ||
      !officeDropdown.options ||
      officeDropdown.options.length === 0
    ) {
      throw new Error(
        'No office names found in dropdownValues collection with category "Office"'
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

    const newAppointments = appointmentsData.map((appointmentData) => {
      const dateTimeString = appointmentData.c5.split(" ");
      const [datePart, timePart] = dateTimeString;
      const appointmentDate = datePart;
      return {
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
        ivRequestedDate: new Date(),
      };
    });

    let officeDoc = await Appointment.findOne({ officeName: officeName });

    if (!officeDoc) {
      // If office does not exist, create a new document
      officeDoc = new Appointment({
        officeName: officeName,
        appointments: newAppointments,
      });
      await officeDoc.save();
      console.log("New office document created:", officeName);
    } else {
      const existingAppointments = officeDoc.appointments;
      let appointmentsToAdd = [];

      newAppointments.forEach((newAppointment) => {
        const isDuplicate = existingAppointments.some((existingAppointment) => {
          // Convert both dates to Date objects
          const existingDate = new Date(existingAppointment.appointmentDate);
          const newDate = new Date(newAppointment.appointmentDate);

          // Compare dates, patient ID
          return (
            existingAppointment.patientId == newAppointment.patientId &&
            existingDate.getDate() == newDate.getDate()
            // && existingAppointment.insuranceName == newAppointment.insuranceName
          );
        });
        if (!isDuplicate) {
          appointmentsToAdd.push(newAppointment);
        }
      });
      if (appointmentsToAdd.length > 0) {
        // Update the office document with truly new appointments
        await Appointment.updateOne(
          { officeName: officeName },
          { $push: { appointments: { $each: appointmentsToAdd } } }
        );
        console.log(
          `Added ${appointmentsToAdd.length} new appointment(s) for office: ${officeName}`
        );
      } else {
        console.log("No new appointments to add for office:", officeName);
      }
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
        },
      },
      {
        $unwind: { path: "$appointments" },
      },
      {
        $match: {
          "appointments.appointmentDate": {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      },
      {
        $set: {
          "appointments.officeId": "$_id",
          "appointments.office": "$officeName",
        },
      },
      {
        $replaceRoot: { newRoot: "$appointments" },
      },
      {
        $sort: { appointmentDate: 1, appointmentTime: 1 },
      },
    ]);

    return results;
  } catch (error) {
    console.error(
      "Error at Service Layer in fetchDataForSpecificOffice:",
      error
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
  ivAssignedByUserName
) {
  const startTime = Date.now();
  try {
    console.log("=== SERVICE LAYER - updateAppointmentInArray ===");
    console.log("Parameters received:", {
      officeName,
      appointmentId,
      userId,
      status,
      completionStatus,
      ivAssignedDate,
      ivAssignedByUserName,
    });

    console.log("Calling repository layer...");
    const result = await AppointmentRepository.updateAppointmentInArray(
      officeName,
      appointmentId,
      userId,
      status,
      completionStatus,
      ivAssignedDate,
      ivAssignedByUserName
    );

    console.log("Repository update result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    if (!result.matchedCount) {
      throw new Error("Appointment not found or no matching office");
    }

    // Retrieve the updated document efficiently using aggregation
    console.log("Retrieving updated appointment...");
    const retrievalStartTime = Date.now();
    const updatedAppointments = await Appointment.aggregate([
      { $match: { officeName: officeName } },
      { $unwind: "$appointments" },
      { $match: { "appointments._id": appointmentId } },
      { $replaceRoot: { newRoot: "$appointments" } },
      { $limit: 1 },
    ]);

    const retrievalDuration = Date.now() - retrievalStartTime;
    console.log("Appointment retrieved:", {
      found: updatedAppointments.length > 0,
      duration: `${retrievalDuration}ms`,
    });

    if (updatedAppointments.length === 0) {
      throw new Error("Updated appointment not found after update");
    }

    const updatedAppointment = updatedAppointments[0];
    const totalDuration = Date.now() - startTime;
    console.log("=== SERVICE LAYER COMPLETE ===");
    console.log("Updated Appointment:", {
      _id: updatedAppointment._id,
      patientName: updatedAppointment.patientName,
      status: updatedAppointment.status,
      completionStatus: updatedAppointment.completionStatus,
      totalDuration: `${totalDuration}ms`,
    });

    return updatedAppointment;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error("=== SERVICE LAYER ERROR ===");
    console.error("Error in updateAppointmentInArray:", {
      error: error.message,
      duration: `${totalDuration}ms`,
    });
    throw error;
  }
}

async function createNewRushAppointment(officeName, data) {
  try {
    const newAppointment = {
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
    };

    const result = await Appointment.updateOne(
      { officeName: officeName },
      { $push: { appointments: newAppointment } }
    );
    console.log("hhhhh");
    if (!result.matchedCount) {
      throw new Error("Office not found");
    }
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

    // Default to ivAssignedDate filtering
    const dateFieldName = "appointments.ivAssignedDate";

    const appointments = await Appointment.aggregate([
      { $match: { "appointments.assignedUser": userId } }, // Filter documents where assignedUser matches userId
      { $unwind: "$appointments" }, // Deconstruct the appointments array
      {
        $match: {
          "appointments.assignedUser": userId,
          [dateFieldName]: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      }, // Re-filter to ensure only matching appointments are included with full date range
      { $sort: { [dateFieldName]: -1 } }, // Sort appointments by ivAssignedDate in descending order

      {
        $group: {
          _id: "$appointments._id", //Group by appointment id
          appointment: { $first: "$appointments" }, // Keep the first occurrence of each appointment
          officeName: { $first: "$officeName" }, // Keep the officeName for reference
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ["$$ROOT", "$appointment"] },
        }, // Merge the root document with the appointment document
      },
      {
        $project: {
          _id: 0, // Exclude the original _id field
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
          office: "$officeName", // Add officeName as a field named office
          _id: "$appointment._id", // Use the appointment's _id as the document's _id
        },
      },
    ]);

    console.log(
      `Found ${appointments.length} appointments for userId: ${userId} with date filters`
    );

    // Debug: Log some appointment dates if found
    if (appointments.length > 0) {
      console.log(
        "Sample appointment ivAssignedDates:",
        appointments.slice(0, 3).map((apt) => ({
          id: apt._id,
          ivAssignedDate: apt.ivAssignedDate,
        }))
      );
    }

    return appointments;
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
  ivCompletedDate
) {
  try {
    const filter = {
      "appointments._id": appointmentId,
    };

    // Define the update operation to modify the specified fields of the targeted appointment
    const updateOperation = {
      $set: {
        "appointments.$[elem].ivRemarks": ivRemarks,
        "appointments.$[elem].source": source,
        "appointments.$[elem].planType": planType,
        "appointments.$[elem].completionStatus": "Completed",
        "appointments.$[elem].completedBy": completedBy,
        "appointments.$[elem].noteRemarks": noteRemarks,
        "appointments.$[elem].ivCompletedDate": ivCompletedDate,
      },
    };

    // Specify the arrayFilters option to target the correct appointment within the array
    const arrayFilters = [
      {
        "elem._id": appointmentId,
      },
    ];

    // Execute the update operation
    const updateResult = await Appointment.updateOne(filter, updateOperation, {
      arrayFilters: arrayFilters,
    });

    if (!updateResult.matchedCount) {
      throw new Error(
        `No matching appointment found for appointment ID ${appointmentId}`
      );
    }

    // Optionally, return the updated document or a success message
    return updateResult;
  } catch (error) {
    console.error(
      "Error at service layer updating individual appointment details:",
      error
    );
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName, startDate, endDate) {
  const result = await AppointmentRepository.getAssignedCountsByOffice(
    officeName,
    startDate,
    endDate
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
  dateType = "appointmentDate"
) {
  try {
    // Convert startDate and endDate to Date objects
    const startDateISO = new Date(startDate).toISOString();
    // Adjust endDate to the start of the next day to include appointments on the end date up to 23:59:59.999
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    // Determine the field name based on dateType
    const dateFieldName =
      dateType === "ivAssignedDate"
        ? "appointments.ivAssignedDate"
        : "appointments.appointmentDate";

    const appointments = await Appointment.aggregate([
      { $unwind: "$appointments" },
      {
        $match: {
          $or: [
            { "appointments.completionStatus": { $ne: "Completed" } },
            { "appointments.status": "Unassigned" },
          ],
          [dateFieldName]: {
            $gte: new Date(startDateISO),
            $lt: new Date(endDateISO), // Use $lt to exclude the start of the next day, effectively including the end date up to 23:59:59.999
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
      error
    );
    throw error;
  }
}
async function fetchCompletedAppointmentsCountByUser(
  officeName,
  startDate,
  endDate,
  dateType = "appointmentDate"
) {
  try {
    // Convert startDate and endDate to Date objects for comparison
    const startDateISO = new Date(startDate).toISOString();
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    // Determine the field name based on dateType
    const dateFieldName =
      dateType === "ivCompletedDate"
        ? "appointments.ivCompletedDate"
        : "appointments.appointmentDate";

    console.log("Master data analysis parameters:", {
      officeName,
      startDate,
      endDate,
      dateType,
      conversionNote:
        dateType === "ivCompletedDate"
          ? "Will convert IST to CST in pipeline"
          : "No conversion needed",
    });

    const appointments = await Appointment.aggregate([
      { $match: { officeName: officeName } }, // Filter by officeName to reduce the dataset
      { $unwind: "$appointments" }, // Flatten the appointments array
      // Add CST conversion stage if dateType is ivCompletedDate
      ...(dateType === "ivCompletedDate"
        ? [
            {
              $addFields: {
                // Convert IST to CST if dateType is ivCompletedDate
                convertedDate: {
                  $cond: [
                    { $ne: ["$appointments.ivCompletedDate", null] },
                    {
                      $dateAdd: {
                        startDate: "$appointments.ivCompletedDate",
                        unit: "minute",
                        amount: -690, // IST to CST: subtract 11.5 hours = 690 minutes
                      },
                    },
                    null,
                  ],
                },
              },
            },
          ]
        : []),
      {
        $match: {
          "appointments.completionStatus": "Completed",
          ...(dateType === "ivCompletedDate"
            ? {
                convertedDate: {
                  $gte: new Date(startDateISO),
                  $lt: new Date(endDateISO),
                },
              }
            : {
                [dateFieldName]: {
                  $gte: new Date(startDateISO),
                  $lt: new Date(endDateISO), // Use $lt to exclude the start of the next day, effectively including the end date up to 23:59:59.999
                },
              }),
        },
      }, // Filter for completed appointments
      { $group: { _id: "$appointments.assignedUser", count: { $sum: 1 } } }, // Group by assignedUser and count
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
      error
    );
    throw error;
  }
}

async function getAppointmentsByOfficeAndRemarks(
  officeName,
  startDate,
  endDate,
  remarks
) {
  try {
    const appointments =
      await AppointmentRepository.fetchAppointmentsByOfficeAndRemarks(
        officeName,
        startDate,
        endDate,
        remarks
      );
    return appointments;
  } catch (error) {
    console.error(
      "Error at service layer in getAppointmentsByOfficeAndRemarks:",
      error
    );
    throw error;
  }
}

async function getAppointmentCompletionAnalysis(
  startDate,
  endDate,
  dateType = "appointmentDate",
  ivType = "Normal"
) {
  try {
    // Validate dateType
    if (!["appointmentDate", "ivCompletedDate"].includes(dateType)) {
      throw new Error(
        "Invalid dateType. Must be 'appointmentDate' or 'ivCompletedDate'"
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
        ivType
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
      error
    );
    throw error;
  }
}

async function debugAppointmentData(officeName) {
  try {
    const debugData = await AppointmentRepository.debugAppointmentData(
      officeName
    );
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
      error
    );
    throw error;
  }
}

// Check completion status of appointments by their MongoDB IDs
async function checkAppointmentCompletionStatus(appointmentIds) {
  try {
    console.log(
      "Service: Checking completion status for appointments:",
      appointmentIds
    );

    const result = await AppointmentRepository.checkAppointmentCompletionStatus(
      appointmentIds
    );

    // Separate completed and not completed appointments
    const completedAppointments = result.filter(
      (appointment) => appointment.completionStatus === "Completed"
    );
    const notCompletedAppointments = result.filter(
      (appointment) => appointment.completionStatus !== "Completed"
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
      error
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
