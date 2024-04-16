const axios = require("axios");

async function fetchData() {
  try {
    const response = await axios.get(
      "https://www.caplineruleengine.com/googleESReport",
      {
        params: {
          office: "Aransas",
          password: "134568",
          query: `from appointment,patient,chairs Where patient.patient_id=appointment.patient_id AND appointment.location_id=chairs.chair_num AND appointment.start_time BETWEEN '4/9/2024' AND '4/10/2024'`,
          selectcolumns:
            "appointment.patient_id,appointment.description,patient.birth_date,appointment.start_time,patient.prim_member_id,patient.medicaid_id,patient.carrier_id,chairs.chair_name,appointment.confirmation_status, appointment.end_time,appointment.date_confirmed,patient.cell_phone,patient.home_phone,patient.work_phone",
          columnCount: "14",
        },
      }
    );
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
