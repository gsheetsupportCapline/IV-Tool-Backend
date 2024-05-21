// appointment-service.js

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

        // Push the appointment object into the result array
        result.push({
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
        });
      });
      console.log(result);
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
  status
) {
  try {
    const result = await AppointmentRepository.updateAppointmentInArray(
      officeName,
      appointmentId,
      userId,
      status
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

module.exports = {
  fetchDataAndStoreAppointments,
  fetchDataForSpecificOffice,
  updateAppointmentInArray,
};
