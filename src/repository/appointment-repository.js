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
    
    let endDate;
    const daysToAdd = 15;

    
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    const endMonth = currentDate.getMonth() + 1; // Months are zero-based in JavaScript
    const endDay = currentDate.getDate();
    const endYear = currentDate.getFullYear();

  
    endDate = `${endMonth < 10 ? "0" + endMonth : endMonth}/${
      endDay < 10 ? "0" + endDay : endDay
    }/${endYear}`;

      console.log("Start Date ", startDate);
      console.log("End Date ",endDate);
   

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

     
    // console.log("Full query:", response.config.url);
    // console.log("Query parameters:", response.config.params);

console.log("fetching response");
console.log(`Number of objects returned for office "${officeName}": ${response.data.data.length}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetchDataByOffice - fetching data for ${officeName} at Repository Layer`
    );
    throw error;
  }
}

async function getDataForOffice(officeName) {
  try {
    let query = {};
    if (officeName === "AllOffices") {
      // Special case: Fetch all appointments if officeName is "AllOffice"
      const appointmentData = await Appointment.find({});
      // console.log("appointments All offices", appointmentData);
      return appointmentData;
    } else if (officeName) {
      // Regular case: Filter by officeName
      query.officeName = officeName;
    }
  
    const appointmentData = await Appointment.find(query);
    // console.log("appointments", appointmentData);
    return appointmentData;
  } catch (error) {
    console.error(
      `Error getDataForOffice -fetching for ${officeName} at Repository layer`
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
          [`appointments.${appointmentIndex}.ivAssignedDate`]: ivAssignedDate,
          [`appointments.${appointmentIndex}.ivAssignedByUserName`]:
            ivAssignedByUserName,
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

async function getAssignedCountsByOffice(officeName) {
  try {
    const pipeline = [
      { $match: { officeName: officeName } },
      { $unwind: "$appointments" }, // Flatten the appointments array
      { $match: { "appointments.status": "Assigned" } }, // Now filter based on the unwound appointments
      { $match: { "appointments.completionStatus": { $ne: "Completed" } } }, // Exclude appointments with completionStatus equal to 'Completed'
      {
        $group: {
          _id: "$appointments.assignedUser", // Group by assignedUser within appointments
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];
    console.log(pipeline);
    const counts = await Appointment.aggregate(pipeline);
    console.log(counts);
    return counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  } catch (error) {
    console.error(
      `Error fetching assigned counts for office: ${officeName}`,
      error
    );
    throw error;
  }
}

async function fetchAppointmentsByOfficeAndRemarks(
  officeName,
  startDate,
  endDate,
  remarks
) {
  try {
    const startDateISO = new Date(startDate).toISOString();
    let endDateDate = new Date(endDate);
    endDateDate.setDate(endDateDate.getDate() + 1); // Include the end date in the range
    endDateDate.setHours(0, 0, 0, 0); // Reset time to start of the next day
    const endDateISO = endDateDate.toISOString();
    console.log("remarks", remarks);
    const appointments = await Appointment.aggregate([
      { $match: { officeName: officeName } },
      { $unwind: "$appointments" },
      {
        $match: {
          $and: [
            {
              "appointments.appointmentDate": {
                $gte: new Date(startDateISO),
                $lt: new Date(endDateISO),
              },
            },
            {
              $or: [
                { "appointments.ivRemarks": { $in: remarks } },
                { "appointments.ivRemarks": { $exists: false } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: "$appointments._id",
          appointment: { $first: "$appointments" },
          officeName: { $first: "$officeName" },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ["$$ROOT", "$appointment"] },
        },
      },
      {
        $project: {
          _id: 0,
          appointmentType: 1,
          appointmentDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
          },
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
          office: "$officeName",
          ivRemarks: 1,
          planType: 1,
          _id: "$appointment._id",
        },
      },
    ]);

    return appointments;
  } catch (error) {
    console.error(
      `Error fetching appointments by office and remarks: ${error}`
    );
    throw error;
  }
}
module.exports = {
  fetchDataByOffice,
  getDataForOffice,
  updateAppointmentInArray,
  getAssignedCountsByOffice,
  fetchAppointmentsByOfficeAndRemarks,
};
