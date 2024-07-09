// appointment-service.js
const mongoose = require("mongoose");
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

        const appointmentDate = new Date(appointmentData.c5);
        const hours = appointmentDate.getHours().toString().padStart(2, "0"); // Ensure two digits for hours
        const minutes = appointmentDate
          .getMinutes()
          .toString()
          .padStart(2, "0"); // Ensure two digits for minutes
        const seconds = appointmentDate
          .getSeconds()
          .toString()
          .padStart(2, "0"); // Ensure two digits for seconds
        const appointmentTime = `${hours}:${minutes}:${seconds}`;

        const patientId = appointmentData.c1;
        const patientName = `${appointmentData.c12} ${appointmentData.c13}`;
        const insuranceName = appointmentData.c7;
        const insurancePhone = appointmentData.c8;
        const policyHolderName = appointmentData.c2;
        const policyHolderDOB = appointmentData.c4;
        const appointmentType = appointmentData.c6; // chair name
        const memberId = appointmentData.c9;
        const employerName = appointmentData.c10;
        const groupNumber = appointmentData.c11;
        const relationWithPatient = appointmentData.c3;
        const medicaidId = appointmentData.c14;
        const carrierId = appointmentData.c15;
        const confirmationStatus = appointmentData.c16;
        const cellPhone = appointmentData.c17;
        const homePhone = appointmentData.c18;
        const workPhone = appointmentData.c19;
        const patientDOB = appointmentData.c20;

        // Push the appointment object into the result array
        result.push({
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          patientId: patientId,
          patientName: patientName,
          insuranceName: insuranceName,
          insurancePhone: insurancePhone,
          policyHolderName: policyHolderName,
          policyHolderDOB: policyHolderDOB,
          appointmentType: appointmentType,
          memberId: memberId,
          employerName: employerName,
          groupNumber: groupNumber,
          relationWithPatient: relationWithPatient,
          medicaidId: medicaidId,
          carrierId: carrierId,
          confirmationStatus: confirmationStatus,
          cellPhone: cellPhone,
          homePhone: homePhone,
          workPhone: workPhone,
          patientDOB: patientDOB,
        });
      });
      // console.log(result);
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

async function fetchDataForSpecificOffice(officeName) {
  try {
    const response = await AppointmentRepository.getDataForOffice(officeName);
    // console.log("response  a", response);
    const officeData = response[0].appointments;
    const result = [];
    // console.log("office data", officeData);
    officeData.forEach((appointmentData) => {
      // Extract relevant information
      const appointmentDate = appointmentData.appointmentDate;
      const appointmentDateString = appointmentDate.toISOString().split("T")[0]; // Splits the ISO string and takes the date part
      const patientId = appointmentData.patientId;
      const patientName = appointmentData.patientName;
      const insuranceName = appointmentData.insuranceName;
      const insurancePhone = appointmentData.insurancePhone;
      const policyHolderName = appointmentData.policyHolderName;
      const policyHolderDOB = appointmentData.policyHolderDOB;
      const appointmentType = appointmentData.appointmentType; // chair name
      const memberId = appointmentData.memberId;
      const employerName = appointmentData.employerName;
      const groupNumber = appointmentData.groupNumber;
      const relationWithPatient = appointmentData.relationWithPatient;
      const medicaidId = appointmentData.medicaidId;
      const carrierId = appointmentData.carrierId;
      const confirmationStatus = appointmentData.confirmationStatus;
      const cellPhone = appointmentData.cellPhone;
      const homePhone = appointmentData.homePhone;
      const workPhone = appointmentData.workPhone;
      const ivType = appointmentData.ivType;
      const status = appointmentData.status;
      const assignedUser = appointmentData.assignedUser;
      const completionStatus = appointmentData.completionStatus;
      const office = officeName;
      const _id = appointmentData._id;
      const planType = appointmentData.planType;
      const ivRemarks = appointmentData.ivRemarks;
      const source = appointmentData.source;

      const timeZoneOffset = 5.5; // Example timezone offset for IST (Indian Standard Time)
      let localAppointmentDate = new Date(
        appointmentDate.getTime() + timeZoneOffset * 60 * 60 * 1000
      ); // Convert to local time by adding the offset

      // Extract hours, minutes, and seconds from the adjusted local appointment date
      const hours = localAppointmentDate
        .getUTCHours()
        .toString()
        .padStart(2, "0");
      const minutes = "30"; // Fixed minutes as per your requirement
      const seconds = "00"; // Assuming seconds are not significant for this conversion
      const appointmentTime = `${hours}:${minutes}:${seconds}`;

      // Push the appointment object into the result array
      result.push({
        _id: _id,
        office: office,
        appointmentDate: appointmentDateString,
        patientId: patientId,
        patientName: patientName,
        insuranceName: insuranceName,
        insurancePhone: insurancePhone,
        policyHolderName: policyHolderName,
        policyHolderDOB: policyHolderDOB,
        appointmentType: appointmentType,
        memberId: memberId,
        employerName: employerName,
        groupNumber: groupNumber,
        relationWithPatient: relationWithPatient,
        medicaidId: medicaidId,
        carrierId: carrierId,
        confirmationStatus: confirmationStatus,
        cellPhone: cellPhone,
        homePhone: homePhone,
        workPhone: workPhone,
        ivType: ivType,
        status: status,
        assignedUser: assignedUser,
        completionStatus: completionStatus,
        appointmentTime: appointmentTime,
        ivRemarks: ivRemarks,
        planType: planType,
        source: source,
      });
    });

    return result;
  } catch (error) {
    console.log("Error at Service Layer in function ");
    console.error("Error fetching and storing data:", error);
    throw error;
  }
}

async function updateAppointmentInArray(
  officeName,
  appointmentId,
  userId,
  status,
  completionStatus
) {
  try {
    const result = await AppointmentRepository.updateAppointmentInArray(
      officeName,
      appointmentId,
      userId,
      status,
      completionStatus
    );
    if (!result.matchedCount) {
      throw new Error("Appointment not found or no matching office");
    }

    // Retrieve the updated document
    const updatedDocument = await Appointment.findOne({
      officeName: officeName,
      "appointments._id": appointmentId,
    });

    // Find the updated appointment in the appointments array
    const updatedAppointment = updatedDocument.appointments.find(
      (appointment) => appointment._id.toString() === appointmentId
    );

    console.log("Updated Appointment", updatedAppointment);
    return updatedAppointment;
  } catch (error) {
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
      ivType: "Rush",
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
    console.error("Error creating new appointment :", error);
    throw error;
  }
}

async function fetchUserAppointments(userId) {
  try {
    const appointments = await Appointment.aggregate([
      { $match: { "appointments.assignedUser": userId } }, // Filter documents where assignedUser matches userId
      { $unwind: "$appointments" }, // Deconstruct the appointments array
      { $match: { "appointments.assignedUser": userId } }, // Re-filter to ensure only matching appointments are included
      { $sort: { "appointments.appointmentDate": -1 } }, // Sort appointments by date in descending order

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
          provider: 1,
          office: "$officeName", // Add officeName as a field named office
          _id: "$appointment._id", // Use the appointment's _id as the document's _id
        },
      },
    ]);
    // Check if appointments array is empty
    if (appointments.length === 0) {
      console.log("No appointments found for userId:", userId);
      return [];
    }

    return appointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}

async function updateIndividualAppointmentDetails(
  appointmentId,
  ivRemarks,
  source,
  planType,
  completedBy
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
    console.error("Error updating individual appointment details:", error);
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName) {
  const counts = await AppointmentRepository.getAssignedCountsByOffice(
    officeName
  );
  return {
    officeName,
    assignedCounts: counts,
  };
}
async function fetchUnassignedAppointmentsInRange(startDate, endDate) {
  try {
    // Convert startDate and endDate to Date objects
    const startDateISO = new Date(startDate).toISOString();
    // Adjust endDate to the start of the next day to include appointments on the end date up to 23:59:59.999
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    const appointments = await Appointment.aggregate([
      { $match: { "appointments.status": "Unassigned" } },
      { $unwind: "$appointments" },
      {
        $match: {
          "appointments.status": "Unassigned",
          "appointments.appointmentDate": {
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
                date: "$appointments.appointmentDate",
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
    console.error("Error fetching unassigned appointments:", error);
    throw error;
  }
}
async function fetchCompletedAppointmentsCountByUser(officeName) {
  try {
    const appointments = await Appointment.aggregate([
      { $match: { officeName: officeName } }, // Filter by officeName to reduce the dataset
      { $unwind: "$appointments" }, // Flatten the appointments array
      { $match: { "appointments.completionStatus": "Completed" } }, // Filter for completed appointments
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
    console.error("Error fetching completed appointments:", error);
    throw error;
  }
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
};
