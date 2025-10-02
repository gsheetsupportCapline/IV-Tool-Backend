// appointment-repository.js

const axios = require('axios');
const { ES_URL } = require('../config/server.config');
const Appointment = require('../models/appointment');

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

    endDate = `${endMonth < 10 ? '0' + endMonth : endMonth}/${
      endDay < 10 ? '0' + endDay : endDay
    }/${endYear}`;

    console.log('Start Date ', startDate);
    console.log('End Date ', endDate);

    const response = await axios.get(ES_URL, {
      params: {
        office: officeName,
        password: '134568',
        // query: `from patient,appointment,chairs,patient_letter,employer,insurance_company Where  patient.patient_id=appointment.patient_id AND appointment.location_id=chairs.chair_num AND patient_letter.patient_id=appointment.patient_id AND employer.employer_id=patient.prim_employer_id AND employer.insurance_company_id=insurance_company.insurance_company_id AND appointment.start_time BETWEEN '${startDate}' AND '${endDate}' `,
        query: `FROM appointment INNER JOIN patient ON patient.patient_id = appointment.patient_id INNER JOIN chairs ON appointment.location_id = chairs.chair_num LEFT JOIN patient_letter ON patient_letter.patient_id = appointment.patient_id LEFT JOIN employer ON employer.employer_id = patient.prim_employer_id LEFT JOIN insurance_company ON employer.insurance_company_id = insurance_company.insurance_company_id WHERE appointment.start_time BETWEEN '${startDate}' AND '${endDate}' AND patient_letter.prim_policy_holder is not null`,
        selectcolumns:
          'patient.patient_id,patient_letter.prim_policy_holder,patient_letter.relation_to_prim_policy_holder,patient_letter.birth_date,appointment.start_time,chairs.chair_name,insurance_company.name,insurance_company.phone1,patient.prim_member_id,employer.name,employer.group_number,patient.first_name,patient.last_name,patient.medicaid_id,patient.carrier_id,appointment.confirmation_status,patient.cell_phone,patient.home_phone,patient.work_phone,patient.birth_date',
        columnCount: '20',
      },
    });

    // console.log("Full query:", response.config.url);
    // console.log("Query parameters:", response.config.params);

    console.log('fetching response');
    console.log(
      `Number of objects returned for office "${officeName}": ${response.data.data.length}`
    );
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
    if (officeName === 'AllOffices') {
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
    console.log('repository');
    const doc = await Appointment.findOne({ officeName: officeName });
    if (!doc) {
      throw new Error('Office not found');
    }
    const appointmentIndex = doc.appointments.findIndex(
      (appointment) => appointment._id.toString() === appointmentId
    );
    console.log('appointmentIndex', appointmentIndex);
    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }
    console.log('doc _id', doc._id);
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
    console.log('result in repository', result);
    return result;
  } catch (error) {
    console.error(
      `Error updating appointmentfor office: ${office} , appointmentId :${appointmentId} `
    );
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName, startDate, endDate) {
  try {
    // Convert dates to UTC Date objects to avoid timezone issues
    const startDateObj = new Date(startDate + 'T00:00:00.000Z'); // Force UTC start of day
    const endDateObj = new Date(endDate + 'T23:59:59.999Z'); // Force UTC end of day

    console.log('Date range for assigned counts:', {
      officeName,
      startDate,
      endDate,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    // First, get the complete appointment data
    const completeDataPipeline = [
      { $match: { officeName: officeName } },
      { $unwind: '$appointments' }, // Flatten the appointments array
      {
        $match: {
          'appointments.assignedUser': { $exists: true, $ne: null },
          'appointments.ivAssignedDate': {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      }, // Filter by assignedUser exists and ivAssignedDate range
      {
        $project: {
          _id: '$appointments._id',
          appointmentType: '$appointments.appointmentType',
          appointmentDate: '$appointments.appointmentDate',
          appointmentTime: '$appointments.appointmentTime',
          patientId: '$appointments.patientId',
          patientName: '$appointments.patientName',
          patientDOB: '$appointments.patientDOB',
          insuranceName: '$appointments.insuranceName',
          insurancePhone: '$appointments.insurancePhone',
          policyHolderName: '$appointments.policyHolderName',
          policyHolderDOB: '$appointments.policyHolderDOB',
          memberId: '$appointments.memberId',
          employerName: '$appointments.employerName',
          groupNumber: '$appointments.groupNumber',
          relationWithPatient: '$appointments.relationWithPatient',
          medicaidId: '$appointments.medicaidId',
          carrierId: '$appointments.carrierId',
          confirmationStatus: '$appointments.confirmationStatus',
          cellPhone: '$appointments.cellPhone',
          homePhone: '$appointments.homePhone',
          workPhone: '$appointments.workPhone',
          ivType: '$appointments.ivType',
          completionStatus: '$appointments.completionStatus',
          status: '$appointments.status',
          assignedUser: '$appointments.assignedUser',
          source: '$appointments.source',
          planType: '$appointments.planType',
          ivRemarks: '$appointments.ivRemarks',
          provider: '$appointments.provider',
          noteRemarks: '$appointments.noteRemarks',
          ivCompletedDate: '$appointments.ivCompletedDate',
          ivAssignedDate: '$appointments.ivAssignedDate',
          ivRequestedDate: '$appointments.ivRequestedDate',
          ivAssignedByUserName: '$appointments.ivAssignedByUserName',
          completedBy: '$appointments.completedBy',
          office: '$officeName',
        },
      },
      { $sort: { ivAssignedDate: -1 } },
    ];

    // Get the complete data
    const completeData = await Appointment.aggregate(completeDataPipeline);

    // Calculate counts from the complete data
    const countsPipeline = [
      { $match: { officeName: officeName } },
      { $unwind: '$appointments' }, // Flatten the appointments array
      {
        $match: {
          'appointments.assignedUser': { $exists: true, $ne: null },
          'appointments.ivAssignedDate': {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      }, // Filter by assignedUser exists and ivAssignedDate range
      {
        $group: {
          _id: '$appointments.assignedUser', // Group by assignedUser within appointments
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    console.log(
      'Assigned counts pipeline:',
      JSON.stringify(countsPipeline, null, 2)
    );
    const counts = await Appointment.aggregate(countsPipeline);
    console.log('Assigned counts result:', counts);
    console.log('Complete data count:', completeData.length);

    const countsObject = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      counts: countsObject,
      completeData: completeData,
    };
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
    console.log('remarks', remarks);
    const appointments = await Appointment.aggregate([
      { $match: { officeName: officeName } },
      { $unwind: '$appointments' },
      {
        $match: {
          $and: [
            {
              'appointments.appointmentDate': {
                $gte: new Date(startDateISO),
                $lt: new Date(endDateISO),
              },
            },
            {
              $or: [
                { 'appointments.ivRemarks': { $in: remarks } },
                { 'appointments.ivRemarks': { $exists: false } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: '$appointments._id',
          appointment: { $first: '$appointments' },
          officeName: { $first: '$officeName' },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', '$appointment'] },
        },
      },
      {
        $project: {
          _id: 0,
          appointmentType: 1,
          appointmentDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' },
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
          office: '$officeName',
          ivRemarks: 1,
          planType: 1,
          _id: '$appointment._id',
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
// Debug function to understand data structure
async function debugAppointmentData(officeName = 'Tidwell') {
  try {
    const sample = await Appointment.aggregate([
      { $match: { officeName: officeName } },
      { $unwind: '$appointments' },
      {
        $match: {
          'appointments.ivCompletedDate': { $exists: true, $ne: null, $ne: '' },
        },
      },
      {
        $project: {
          appointmentType: '$appointments.appointmentType',
          appointmentDate: '$appointments.appointmentDate',
          appointmentTime: '$appointments.appointmentTime',
          ivType: '$appointments.ivType',
          ivCompletedDate: '$appointments.ivCompletedDate',
          ivCompletedDateType: { $type: '$appointments.ivCompletedDate' },
        },
      },
      { $limit: 5 },
    ]);

    console.log('Sample appointment data:', JSON.stringify(sample, null, 2));
    return sample;
  } catch (error) {
    console.error('Error in debug function:', error);
    throw error;
  }
}

async function getAppointmentCompletionAnalysis(
  startDate,
  endDate,
  dateType,
  ivType
) {
  try {
    // Convert dates to UTC Date objects to avoid timezone issues
    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
    const endDateObj = new Date(endDate + 'T23:59:59.999Z');

    console.log('Appointment completion analysis parameters:', {
      startDate,
      endDate,
      dateType,
      ivType,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    // Determine the field name based on dateType
    const dateFieldName =
      dateType === 'ivCompletedDate'
        ? 'appointments.ivCompletedDate'
        : 'appointments.appointmentDate';

    // Define office names
    const officeNames = [
      'Aransas',
      'Azle',
      'Beaumont',
      'Benbrook',
      'Calallen',
      'Crosby',
      'Devine',
      'Elgin',
      'Grangerland',
      'Huffman',
      'Jasper',
      'Lavaca',
      'Liberty',
      'Lytle',
      'Mathis',
      'Potranco',
      'Rio Bravo',
      'Riverwalk',
      'Rockdale',
      'Sinton',
      'Splendora',
      'Springtown',
      'Tidwell',
      'Victoria',
      'Westgreen',
      'Winnie',
      'OS',
    ];

    const results = [];

    for (const officeName of officeNames) {
      // First get total completed IVs for this office (same for both categories)
      const totalCompletedPipeline = [
        { $match: { officeName: officeName } },
        { $unwind: '$appointments' },
        {
          $match: {
            'appointments.ivCompletedDate': {
              $exists: true,
              $ne: null,
              $ne: '',
            },
            'appointments.ivType': ivType,
            [dateFieldName]: {
              $gte: startDateObj,
              $lte: endDateObj,
            },
          },
        },
        {
          $count: 'totalCount',
        },
      ];

      const totalResult = await Appointment.aggregate(totalCompletedPipeline);
      const totalCompletedIVs =
        totalResult.length > 0 ? totalResult[0].totalCount : 0;

      console.log(
        `Office: ${officeName}, Total completed IVs: ${totalCompletedIVs}`
      );

      // Main analysis pipeline
      const pipeline = [
        { $match: { officeName: officeName } },
        { $unwind: '$appointments' },
        {
          $match: {
            'appointments.ivCompletedDate': {
              $exists: true,
              $ne: null,
              $ne: '',
            },
            'appointments.ivType': ivType,
            [dateFieldName]: {
              $gte: startDateObj,
              $lte: endDateObj,
            },
          },
        },
        {
          $addFields: {
            // Create appointment datetime by combining date and time - handle null/undefined appointmentTime
            appointmentDateTime: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$appointments.appointmentTime', null] },
                    { $ne: ['$appointments.appointmentTime', ''] },
                  ],
                },
                {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        {
                          $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$appointments.appointmentDate',
                          },
                        },
                        'T',
                        {
                          $cond: [
                            {
                              $gte: [
                                { $strLenCP: '$appointments.appointmentTime' },
                                8,
                              ],
                            },
                            {
                              $substr: ['$appointments.appointmentTime', 0, 8],
                            },
                            '$appointments.appointmentTime',
                          ],
                        },
                        ':00.000Z',
                      ],
                    },
                    onError: '$appointments.appointmentDate',
                  },
                },
                '$appointments.appointmentDate',
              ],
            },
            // Parse ivCompletedDate - handle both Date and String types
            completedDateTime: {
              $cond: [
                { $eq: [{ $type: '$appointments.ivCompletedDate' }, 'date'] },
                '$appointments.ivCompletedDate',
                {
                  $dateFromString: {
                    dateString: '$appointments.ivCompletedDate',
                    onError: null,
                  },
                },
              ],
            },
            // Check if appointment type is new patient related - improved regex and null handling
            isNewPatient: {
              $cond: [
                { $ne: ['$appointments.appointmentType', null] },
                {
                  $regexMatch: {
                    input: { $toLower: '$appointments.appointmentType' },
                    regex: /^(np|np\/srp|new patient|np \/ srp|np\/ srp|new)$/i,
                  },
                },
                false,
              ],
            },
          },
        },
        {
          $match: {
            completedDateTime: { $ne: null },
          },
        },
        {
          $addFields: {
            // Check if completed after appointment time
            completedAfterAppointment: {
              $gt: ['$completedDateTime', '$appointmentDateTime'],
            },
            // Check if completed within 1 hour
            completedWithinOneHour: {
              $and: [
                { $gt: ['$completedDateTime', '$appointmentDateTime'] },
                {
                  $lte: [
                    {
                      $subtract: ['$completedDateTime', '$appointmentDateTime'],
                    },
                    3600000, // 1 hour in milliseconds
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              officeName: '$officeName',
              isNewPatient: '$isNewPatient',
            },
            appointmentCount: { $sum: 1 },
            completedAfterAppointmentCount: {
              $sum: { $cond: ['$completedAfterAppointment', 1, 0] },
            },
            completedWithinOneHourCount: {
              $sum: { $cond: ['$completedWithinOneHour', 1, 0] },
            },
            // Debug data
            sampleData: {
              $push: {
                appointmentType: '$appointments.appointmentType',
                appointmentTime: '$appointments.appointmentTime',
                ivCompletedDate: '$appointments.ivCompletedDate',
                isNewPatient: '$isNewPatient',
              },
            },
          },
        },
        {
          $addFields: {
            afterAppointmentCompletionPercentage: {
              $cond: [
                { $gt: ['$appointmentCount', 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        '$completedAfterAppointmentCount',
                        '$appointmentCount',
                      ],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      ];

      const officeResults = await Appointment.aggregate(pipeline);

      console.log(
        `Office: ${officeName}, Pipeline results:`,
        JSON.stringify(officeResults, null, 2)
      );

      // Initialize office data structure with total count
      const officeData = {
        officeName: officeName,
        totalCompletedIVs: totalCompletedIVs, // Same for both categories
        newPatient: {
          completedAfterAppointmentCount: 0,
          completedWithinOneHourCount: 0,
          afterAppointmentCompletionPercentage: 0,
        },
        others: {
          completedAfterAppointmentCount: 0,
          completedWithinOneHourCount: 0,
          afterAppointmentCompletionPercentage: 0,
        },
      };

      // Process results
      officeResults.forEach((result) => {
        if (result._id.isNewPatient) {
          officeData.newPatient = {
            completedAfterAppointmentCount:
              result.completedAfterAppointmentCount,
            completedWithinOneHourCount: result.completedWithinOneHourCount,
            afterAppointmentCompletionPercentage:
              Math.round(result.afterAppointmentCompletionPercentage * 100) /
              100,
          };
        } else {
          officeData.others = {
            completedAfterAppointmentCount:
              result.completedAfterAppointmentCount,
            completedWithinOneHourCount: result.completedWithinOneHourCount,
            afterAppointmentCompletionPercentage:
              Math.round(result.afterAppointmentCompletionPercentage * 100) /
              100,
          };
        }
      });

      results.push(officeData);
    }

    console.log(
      `Appointment completion analysis completed for ${results.length} offices`
    );
    return results;
  } catch (error) {
    console.error('Error in appointment completion analysis:', error);
    throw error;
  }
}

// Get dynamic unassigned appointments with calculated date range
async function getDynamicUnassignedAppointments() {
  try {
    // Calculate dynamic date range
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 9 = Oct)

    // Calculate start date: previous month's 1st date, but not earlier than 2025-10-01
    let startDate;
    const minStartDate = new Date('2025-10-01T00:00:00.000Z');

    if (currentMonth === 0) {
      // If current month is January, previous month is December of previous year
      startDate = new Date(currentYear - 1, 11, 1); // December 1st of previous year
    } else {
      // Previous month's 1st date
      startDate = new Date(currentYear, currentMonth - 1, 1);
    }

    // Ensure start date is not earlier than 2025-10-01
    if (startDate < minStartDate) {
      startDate = minStartDate;
    }

    // Calculate end date: current date + 15 days
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 15);

    console.log('Dynamic date range calculated:', {
      today: today.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Query for unassigned appointments in all offices
    const unassignedAppointments = await Appointment.aggregate([
      {
        $unwind: '$appointments',
      },
      {
        $match: {
          'appointments.appointmentDate': {
            $gte: startDate,
            $lte: endDate,
          },
          'appointments.status': 'Unassigned',
        },
      },
      {
        $project: {
          _id: 0,
          appointmentId: '$appointments._id',
          appointmentDate: '$appointments.appointmentDate',
          appointmentTime: '$appointments.appointmentTime',
          appointmentType: '$appointments.appointmentType',
          patientId: '$appointments.patientId',
          patientName: '$appointments.patientName',
          ivType: '$appointments.ivType',
          status: '$appointments.status',
          office: '$officeName',
        },
      },
      {
        $sort: {
          appointmentDate: 1,
          office: 1,
        },
      },
    ]);

    console.log(
      `Found ${unassignedAppointments.length} dynamic unassigned appointments`
    );
    return {
      appointments: unassignedAppointments,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
      },
    };
  } catch (error) {
    console.error('Error fetching dynamic unassigned appointments:', error);
    throw error;
  }
}

// Check completion status of appointments by their MongoDB IDs
async function checkAppointmentCompletionStatus(appointmentIds) {
  try {
    const mongoose = require('mongoose');

    // Convert string IDs to ObjectIds
    const objectIds = appointmentIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    console.log(
      'Repository: Checking completion status for appointment IDs:',
      appointmentIds
    );

    const appointments = await Appointment.aggregate([
      {
        $unwind: '$appointments',
      },
      {
        $match: {
          'appointments._id': { $in: objectIds },
        },
      },
      {
        $project: {
          appointmentId: '$appointments._id',
          patientName: '$appointments.patientName',
          patientId: '$appointments.patientId',
          appointmentDate: '$appointments.appointmentDate',
          appointmentTime: '$appointments.appointmentTime',
          appointmentType: '$appointments.appointmentType',
          completionStatus: '$appointments.completionStatus',
          status: '$appointments.status',
          ivType: '$appointments.ivType',
          ivCompletedDate: '$appointments.ivCompletedDate',
          completedBy: '$appointments.completedBy',
          ivRemarks: '$appointments.ivRemarks',
          office: '$officeName',
        },
      },
      {
        $sort: {
          appointmentDate: 1,
        },
      },
    ]);

    console.log(
      `Repository: Found ${appointments.length} appointments out of ${appointmentIds.length} requested`
    );
    return appointments;
  } catch (error) {
    console.error('Error checking appointment completion status:', error);
    throw error;
  }
}

module.exports = {
  fetchDataByOffice,
  getDataForOffice,
  updateAppointmentInArray,
  getAssignedCountsByOffice,
  fetchAppointmentsByOfficeAndRemarks,
  getAppointmentCompletionAnalysis,
  debugAppointmentData,
  getDynamicUnassignedAppointments,
  checkAppointmentCompletionStatus,
};
