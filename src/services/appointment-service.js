// appointment-service.js
const mongoose = require("mongoose");
const AppointmentRepository = require("../repository/appointment-repository");
const Appointment = require("../models/appointment");


async function fetchDataAndStoreAppointments() {
  try {
 

    const officeNames = [
       
      "Aransas", "Azle", "Beaumont", "Benbrook", "Calallen", "Crosby",
      "Devine", "Elgin", "Grangerland", "Huffman", "Jasper", "Lavaca",
      "Liberty", "Lytle", "Mathis", "Potranco", "Rio Bravo", "Riverwalk",
      "Rockdale", "Sinton", "Splendora", "Springtown", "Tidwell", "Victoria",
      "Westgreen", "Winnie",
    ];

    for (const officeName of officeNames) {
      const response = await AppointmentRepository.fetchDataByOffice(officeName);
      // console.log(response);
      const appointmentsData = response.data;

      const newAppointments = appointmentsData
        .map((appointmentData) => {
          const dateTimeString = appointmentData.c5.split(" ");
          const [datePart, timePart] = dateTimeString;
          const appointmentDate = datePart
     
 
 
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
          };
        })
      
      let officeDoc = await Appointment.findOne({ officeName: officeName });

      if (!officeDoc) {
        // If office does not exist, create a new document
        officeDoc = new Appointment({
          officeName: officeName,
          appointments: newAppointments,
        });
        await officeDoc.save();
        console.log("New office document created:", officeName);
      }  
       else {
        const existingAppointments = officeDoc.appointments;
        let appointmentsToAdd = [];

        newAppointments.forEach(newAppointment => {
          const isDuplicate = existingAppointments.some(existingAppointment =>{
     // Convert both dates to Date objects
     const existingDate = new Date(existingAppointment.appointmentDate);
     const newDate = new Date(newAppointment.appointmentDate);

     // Compare dates, patient ID, and insurance name
     return (
       existingAppointment.patientId == newAppointment.patientId &&
       existingDate.getDate() == newDate.getDate() &&
       existingAppointment.insuranceName == newAppointment.insuranceName
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
            { $push: { appointments: { $each: appointmentsToAdd } }}
          );
          console.log(`Added ${appointmentsToAdd.length} new appointment(s) for office: ${officeName}`);
        } else {
          console.log("No new appointments to add for office:", officeName);
        }
       }
    }
  } catch (error) {
    console.log("Error at Service Layer fetchDataAndStoreAppointments");
    console.error("Error fetching and storing data:", error);
    throw error;
  }
}



async function fetchDataForSpecificOffice(officeName) {
  try {
    const response = await AppointmentRepository.getDataForOffice(officeName);
    // console.log("response  a", response);
    // const officeData = response[0].appointments;

    const result = [];

    response.forEach((doc) => {
      const officeName = doc.officeName;
      const officeData = doc.appointments;
      officeData.forEach((appointmentData) => {
        // Extract relevant information
        const appointmentDate = appointmentData.appointmentDate;
        const appointmentDateString = appointmentDate
          .toISOString()
          .split("T")[0]; // Splits the ISO string and takes the date part
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
        // const office = appointmentData.office;
        const _id = appointmentData._id;
        const planType = appointmentData.planType;
        const ivRemarks = appointmentData.ivRemarks;
        const source = appointmentData.source;
        const MIDSSN = appointmentData.MIDSSN;
        const ivAssignedDate =appointmentData.ivAssignedDate ;
        
       // const formattedivAssignedDate = `${ivAssignedDate.getFullYear()}-${(ivAssignedDate.getMonth() + 1).toString().padStart(2, '0')}-${ivAssignedDate.getDate().toString().padStart(2, '0')}`;
     
       

        // const timeZoneOffset = 5.5; // Example timezone offset for IST (Indian Standard Time)
        // let localAppointmentDate = new Date(
        //   appointmentDate.getTime() + timeZoneOffset * 60 * 60 * 1000
        // ); // Convert to local time by adding the offset

        // Extract hours, minutes, and seconds from the adjusted local appointment date
        // const hours = localAppointmentDate
        //   .getUTCHours()
        //   .toString()
        //   .padStart(2, "0");
        // const minutes = "30"; // Fixed minutes as per your requirement
        // const seconds = "00"; // Assuming seconds are not significant for this conversion
        // const appointmentTime = `${hours}:${minutes}:${seconds}`;

        const appointmentTime = appointmentData.appointmentTime;

        // Push the appointment object into the result array
        result.push({
          _id: _id,
          office: officeName,
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
          ivAssignedDate:ivAssignedDate ,
          MIDSSN:MIDSSN
        });
      });
    });

    return result;
  } catch (error) {
    console.log(
      "Error at Service Layer in function fetchDataForSpecificOffice"
    );
    console.error("Error fetching and storing data:", error);
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
  try {
    const result = await AppointmentRepository.updateAppointmentInArray(
      officeName,
      appointmentId,
      userId,
      status,
      completionStatus,
      ivAssignedDate,
      ivAssignedByUserName
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
    console.log("Error at Service Layer in function updateAppointmentInArray");

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
      imageUrl: data.imageUrl
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

async function fetchUserAppointments(userId) {
  try {
    const appointments = await Appointment.aggregate([
      { $match: { "appointments.assignedUser": userId } }, // Filter documents where assignedUser matches userId
      { $unwind: "$appointments" }, // Deconstruct the appointments array
      { $match: { "appointments.assignedUser": userId } }, // Re-filter to ensure only matching appointments are included
      // { $match: { "appointments.completionStatus": { $ne: "Completed" } } }, // Exclude appointments with completionStatus equal to 'Completed'
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
          source: 1,
          planType: 1,
          ivRemarks: 1,
          provider: 1,
          noteRemarks: 1,
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
  endDate
) {
  try {
    // Convert startDate and endDate to Date objects for comparison
    const startDateISO = new Date(startDate).toISOString();
    let endDateDate = new Date(endDate); // Use let instead of const for reassignment
    endDateDate.setDate(endDateDate.getDate() + 1); // Move to the start of the next day
    endDateDate.setHours(0, 0, 0, 0); // Reset time to 00:00:00.000, which is the start of the next day
    const endDateISO = endDateDate.toISOString(); // Now assign the ISO string to a new constant variable

    const appointments = await Appointment.aggregate([
      { $match: { officeName: officeName } }, // Filter by officeName to reduce the dataset
      { $unwind: "$appointments" }, // Flatten the appointments array
      {
        $match: {
          "appointments.completionStatus": "Completed",
          "appointments.appointmentDate": {
            $gte: new Date(startDateISO),
            $lt: new Date(endDateISO), // Use $lt to exclude the start of the next day, effectively including the end date up to 23:59:59.999
          },
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
};
