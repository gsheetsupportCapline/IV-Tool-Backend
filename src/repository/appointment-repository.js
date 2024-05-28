// appointment-repository.js

const axios = require("axios");
const { ES_URL } = require("../config/server.config");
const Appointment = require("../models/appointment");

async function fetchDataByOffice(officeName) {
  try {
    const currentDate = new Date();
    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    const startDate = `${
      twoMonthsAgo.getMonth() + 1
    }/${twoMonthsAgo.getDate()}/${twoMonthsAgo.getFullYear()}`;
    const endDate = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

    const response = await axios.get(ES_URL, {
      params: {
        office: officeName,
        password: "134568",
        query: `from patient,appointment,chairs,patient_letter,employer,insurance_company Where  patient.patient_id=appointment.patient_id AND appointment.location_id=chairs.chair_num AND patient_letter.patient_id=appointment.patient_id AND employer.employer_id=patient.prim_employer_id AND employer.insurance_company_id=insurance_company.insurance_company_id AND appointment.start_time BETWEEN '${startDate}' AND '${endDate}' `,
        selectcolumns:
          "patient.patient_id,patient_letter.prim_policy_holder,patient_letter.relation_to_prim_policy_holder,patient_letter.birth_date,appointment.start_time,chairs.chair_name,insurance_company.name,insurance_company.phone1,patient.prim_member_id,employer.name,employer.group_number,patient.first_name,patient.last_name,patient.medicaid_id,patient.carrier_id,appointment.confirmation_status,patient.cell_phone,patient.home_phone,patient.work_phone,patient.birth_date",
        columnCount: "20",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${officeName} at Repository Layer`);
    throw error;
  }
}

async function getDataForOffice(officeName) {
  try {
    const appointmentData = await Appointment.find({ officeName: officeName });
    console.log("appointments", appointmentData);
    return appointmentData;
  } catch (error) {
    console.error(`Error fetching for ${officeName} at Repository layer`);
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
    console.log("repository");
    const doc = await Appointment.findOne({ officeName: officeName });
    if (!doc) {
      throw new Error("Office not found");
    }
    const appointmentIndex = doc.appointments.findIndex(
      (appointment) => appointment._id.toString() === appointmentId
    );
    console.log("appointmentIndex", appointmentIndex);
    if (appointmentIndex === -1) {
      throw new Error("Appointment not found");
    }
    console.log("doc _id", doc._id);
    const result = await Appointment.updateOne(
      { _id: doc._id },
      {
        $set: {
          [`appointments.${appointmentIndex}.assignedUser`]: userId,
          [`appointments.${appointmentIndex}.status`]: status,
          [`appointments.${appointmentIndex}.completionStatus`]:
            completionStatus,
        },
      }
    );
    console.log("result in repository", result);
    return result;
  } catch (error) {
    console.error(
      `Error updating appointmentfor office: ${office} , appointmentId :${appointmentId} `
    );
    throw error;
  }
}
module.exports = {
  fetchDataByOffice,
  getDataForOffice,
  updateAppointmentInArray,
};
