const axios = require("axios");
const { ES_URL } = require("../config/server.config");
async function fetchData() {
  try {
    const currentDate = new Date();

    // Calculate the start date two months ago
    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    // Format the start date as 'MM/DD/YYYY'
    const startDate = `${
      twoMonthsAgo.getMonth() + 1
    }/${twoMonthsAgo.getDate()}/${twoMonthsAgo.getFullYear()}`;

    // Format the end date as 'MM/DD/YYYY'
    const endDate = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

    const response = await axios.get(ES_URL, {
      params: {
        office: "Aransas",
        password: "134568",
        query: `from appointment,patient,chairs Where patient.patient_id=appointment.patient_id AND appointment.location_id=chairs.chair_num AND appointment.start_time BETWEEN '${startDate}' AND '${endDate}' `,
        selectcolumns:
          "appointment.patient_id,appointment.description,patient.birth_date,appointment.start_time,patient.prim_member_id,patient.medicaid_id,patient.carrier_id,chairs.chair_name,appointment.confirmation_status, appointment.end_time,appointment.date_confirmed,patient.cell_phone,patient.home_phone,patient.work_phone",
        columnCount: "14",
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error at Repository Layer");
    console.error("Error fetching data:", error);
    throw error;
  }
}

module.exports = {
  fetchData,
};
