// appointment-service.js - RESTRUCTURED VERSION
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
    const appointmentsData = response.data;

    const newAppointments = appointmentsData.map((appointmentData) => {
      const dateTimeString = appointmentData.c5.split(" ");
      const [datePart, timePart] = dateTimeString;
      const appointmentDate = datePart;

      // Get current date/time in America/Chicago timezone (Texas)
      const texasTime = moment.tz("America/Chicago").toDate();

      return {
        officeName: officeName, // Now at top level
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
      };
    });

    // Check for duplicates and insert new appointments
    let appointmentsToAdd = [];

    for (const newAppointment of newAppointments) {
      const existingAppointment = await Appointment.findOne({
        officeName: newAppointment.officeName,
        patientId: newAppointment.patientId,
        insuranceName: newAppointment.insuranceName,
        appointmentDate: {
          $gte: new Date(
            new Date(newAppointment.appointmentDate).setHours(0, 0, 0, 0),
          ),
          $lt: new Date(
            new Date(newAppointment.appointmentDate).setHours(23, 59, 59, 999),
          ),
        },
      });

      if (!existingAppointment) {
        appointmentsToAdd.push(newAppointment);
      }
    }

    if (appointmentsToAdd.length > 0) {
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
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.aggregate([
      {
        $match: {
          officeName: { $in: [officeName] },
          appointmentDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $addFields: {
          appointmentMonth: { $month: "$appointmentDate" },
          appointmentYear: { $year: "$appointmentDate" },
          office: "$officeName",
        },
      },
      // Check for previous completions
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
                    { $eq: ["$officeName", "$$currentOfficeName"] },
                    { $eq: ["$patientId", "$$patientId"] },
                    { $eq: ["$insuranceName", "$$insuranceName"] },
                    {
                      $eq: [
                        { $month: "$appointmentDate" },
                        "$$appointmentMonth",
                      ],
                    },
                    {
                      $eq: [{ $year: "$appointmentDate" }, "$$appointmentYear"],
                    },
                    { $eq: ["$completionStatus", "Completed"] },
                    { $ne: ["$_id", "$$currentAppointmentId"] },
                    { $lte: ["$appointmentDate", "$$currentAppointmentDate"] },
                  ],
                },
              },
            },
            { $limit: 1 },
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
        $project: {
          previousCompletions: 0,
        },
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
      throw new Error("Appointment not found");
    }

    // Get the updated appointment
    const updatedAppointment = await Appointment.findById(appointmentId);

    if (!updatedAppointment) {
      throw new Error("Appointment not found after update");
    }

    return updatedAppointment;
  } catch (error) {
    console.error("Error in updateAppointmentInArray service:", error);
    throw error;
  }
}

async function createNewRushAppointment(officeName, data) {
  try {
    const texasTime = moment.tz("America/Chicago").toDate();

    const newAppointment = new Appointment({
      officeName: officeName,
      appointmentType: "Rush",
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      patientId: data.patientId,
      patientName: data.patientName,
      patientDOB: data.patientDOB,
      insuranceName: data.insuranceName,
      insurancePhone: data.insurancePhone,
      policyHolderName: data.policyHolderName,
      policyHolderDOB: data.policyHolderDOB,
      memberId: data.memberId,
      employerName: data.employerName,
      groupNumber: data.groupNumber,
      relationWithPatient: data.relationWithPatient,
      medicaidId: data.medicaidId,
      carrierId: data.carrierId,
      cellPhone: data.cellPhone,
      homePhone: data.homePhone,
      workPhone: data.workPhone,
      ivType: "Rush",
      completionStatus: "IV Not Done",
      status: "Unassigned",
      ivRequestedDate: texasTime,
    });

    await newAppointment.save();
    console.log(`Rush appointment created for office: ${officeName}`);

    return newAppointment;
  } catch (error) {
    console.error("Error creating rush appointment:", error);
    throw error;
  }
}

async function fetchUserAppointments(userId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.aggregate([
      {
        $match: {
          assignedUser: userId,
          appointmentDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $addFields: {
          appointmentMonth: { $month: "$appointmentDate" },
          appointmentYear: { $year: "$appointmentDate" },
          office: "$officeName",
        },
      },
      // Check for previous completions
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
                    { $eq: ["$officeName", "$$currentOfficeName"] },
                    { $eq: ["$patientId", "$$patientId"] },
                    { $eq: ["$insuranceName", "$$insuranceName"] },
                    {
                      $eq: [
                        { $month: "$appointmentDate" },
                        "$$appointmentMonth",
                      ],
                    },
                    {
                      $eq: [{ $year: "$appointmentDate" }, "$$appointmentYear"],
                    },
                    { $eq: ["$completionStatus", "Completed"] },
                    { $ne: ["$_id", "$$currentAppointmentId"] },
                    { $lte: ["$appointmentDate", "$$currentAppointmentDate"] },
                  ],
                },
              },
            },
            { $limit: 1 },
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
        $project: {
          previousCompletions: 0,
        },
      },
      {
        $sort: { appointmentDate: 1, appointmentTime: 1 },
      },
    ]);

    return results;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}

async function updateIndividualAppointmentDetails(appointmentId, updateData) {
  try {
    const texasTime = moment.tz("America/Chicago").toDate();

    const updateFields = {
      ...updateData,
      lastUpdatedAt: texasTime,
    };

    if (updateData.completionStatus === "Completed") {
      updateFields.ivCompletedDate = texasTime;
    }

    const result = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new Error("Appointment not found");
    }

    return result;
  } catch (error) {
    console.error("Error updating appointment details:", error);
    throw error;
  }
}

async function bulkUpdateAppointmentDetails(appointmentsData) {
  try {
    const texasTime = moment.tz("America/Chicago").toDate();
    const bulkOps = [];

    for (const appointmentUpdate of appointmentsData) {
      const updateFields = {
        ...appointmentUpdate.updateData,
        lastUpdatedAt: texasTime,
      };

      if (appointmentUpdate.updateData.completionStatus === "Completed") {
        updateFields.ivCompletedDate = texasTime;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: appointmentUpdate.appointmentId },
          update: { $set: updateFields },
        },
      });
    }

    if (bulkOps.length > 0) {
      const result = await Appointment.bulkWrite(bulkOps);
      return result;
    }

    return { modifiedCount: 0 };
  } catch (error) {
    console.error("Error in bulk update:", error);
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.aggregate([
      {
        $match: {
          officeName: officeName,
          appointmentDate: {
            $gte: start,
            $lte: end,
          },
          status: "Assigned",
        },
      },
      {
        $group: {
          _id: "$assignedUser",
          count: { $sum: 1 },
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error("Error getting assigned counts:", error);
    throw error;
  }
}

async function fetchUnassignedAppointmentsInRange(
  officeName,
  startDate,
  endDate,
) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.find({
      officeName: officeName,
      appointmentDate: {
        $gte: start,
        $lte: end,
      },
      status: "Unassigned",
    }).sort({ appointmentDate: 1, appointmentTime: 1 });

    return results;
  } catch (error) {
    console.error("Error fetching unassigned appointments:", error);
    throw error;
  }
}

async function fetchCompletedAppointmentsCountByUser(
  userId,
  startDate,
  endDate,
) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const count = await Appointment.countDocuments({
      assignedUser: userId,
      appointmentDate: {
        $gte: start,
        $lte: end,
      },
      completionStatus: "Completed",
    });

    return count;
  } catch (error) {
    console.error("Error fetching completed appointments count:", error);
    throw error;
  }
}

async function getAppointmentsByOfficeAndRemarks(
  officeName,
  startDate,
  endDate,
) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.find({
      officeName: officeName,
      appointmentDate: {
        $gte: start,
        $lte: end,
      },
      ivRemarks: { $exists: true, $ne: null, $ne: "" },
    }).sort({ appointmentDate: 1 });

    return results;
  } catch (error) {
    console.error("Error fetching appointments with remarks:", error);
    throw error;
  }
}

async function getAppointmentCompletionAnalysis(
  officeName,
  startDate,
  endDate,
) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await Appointment.aggregate([
      {
        $match: {
          officeName: officeName,
          appointmentDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$completionStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error("Error in completion analysis:", error);
    throw error;
  }
}

async function debugAppointmentData(officeName) {
  try {
    const count = await Appointment.countDocuments({ officeName: officeName });
    console.log(`Total appointments for ${officeName}: ${count}`);
    return count;
  } catch (error) {
    console.error("Error in debug:", error);
    throw error;
  }
}

async function getDynamicUnassignedAppointments() {
  try {
    const currentDate = new Date();
    const fifteenDaysLater = new Date();
    fifteenDaysLater.setDate(currentDate.getDate() + 15);

    const results = await Appointment.find({
      appointmentDate: {
        $gte: currentDate,
        $lte: fifteenDaysLater,
      },
      status: "Unassigned",
    }).sort({ appointmentDate: 1 });

    return results;
  } catch (error) {
    console.error("Error fetching dynamic unassigned appointments:", error);
    throw error;
  }
}

async function checkAppointmentCompletionStatus(appointmentIds) {
  try {
    const results = await Appointment.find({
      _id: { $in: appointmentIds },
    }).select("_id completionStatus");

    return results;
  } catch (error) {
    console.error("Error checking completion status:", error);
    throw error;
  }
}

async function aggregate(pipeline) {
  try {
    return await Appointment.aggregate(pipeline);
  } catch (error) {
    console.error("Error in aggregate:", error);
    throw error;
  }
}

module.exports = {
  fetchDataAndStoreAppointments,
  processOfficeAppointments,
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
