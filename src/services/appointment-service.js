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
    console.log("response  a", response);
    const officeData = response[0].appointments;
    const result = [];
    console.log("office data", officeData);
    officeData.forEach((appointmentData) => {
      // Extract relevant information
      const appointmentDate = new Date(appointmentData.appointmentDate);
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

      const appointmentTime = `${appointmentData.appointmentDate
        .getUTCHours()
        .toString()
        .padStart(2, "0")}:${appointmentData.appointmentDate
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}:${appointmentData.appointmentDate
        .getUTCSeconds()
        .toString()
        .padStart(2, "0")}`;
      // Push the appointment object into the result array
      result.push({
        _id: _id,
        office: office,
        appointmentDate: appointmentDate,
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
      // appointmentTime: data.appointmentTime,
      provider: data.provider,
      patientId: data.patientId,
      patientDOB: new Date(data.patientDOB),
      patientName: data.patientName,
      policyHolderName: data.policyHolderName,
      policyHolderDOB: new Date(data.policyHolderDOB),
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
          _id: "$_id",
          appointments: { $push: "$appointments" },
          officeName: { $first: "$officeName" }, // Keep the officeName for reference
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
  planType
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
async function getPendingIVCountsByOffice() {
  const results = await AppointmentRepository.getPendingIVCountsByOffice();

  // Assuming results are grouped by officeName and date, transform them into the desired structure
  const officeCounts = results.reduce(
    (acc, { _id: { officeName, date } }, count) => {
      if (!acc[officeName]) {
        acc[officeName] = { OfficeName: officeName, PendingCount: {} };
      }
      acc[officeName].PendingCount[date] = count;
      return acc;
    },
    {}
  );

  // Convert the object to an array of objects for easier handling
  const formattedResults = Object.keys(officeCounts).map((officeName) => ({
    OfficeName: officeName,
    PendingCount: officeCounts[officeName].PendingCount,
  }));

  return formattedResults;
}

module.exports = {
  fetchDataAndStoreAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
  createNewRushAppointment,
  fetchUserAppointments,
  updateIndividualAppointmentDetails,
  getAssignedCountsByOffice,
  getPendingIVCountsByOffice,
};
