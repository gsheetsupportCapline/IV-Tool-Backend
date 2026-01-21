// appointment-repository.js

const axios = require("axios");
const { ES_URL } = require("../config/server.config");
const Appointment = require("../models/appointment");
const DropdownValuesRepository = require("./dropdownValues-repository");

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
    console.log("End Date ", endDate);

    const response = await axios.get(ES_URL, {
      params: {
        office: officeName,
        password: "134568",
        // query: `from patient,appointment,chairs,patient_letter,employer,insurance_company Where  patient.patient_id=appointment.patient_id AND appointment.location_id=chairs.chair_num AND patient_letter.patient_id=appointment.patient_id AND employer.employer_id=patient.prim_employer_id AND employer.insurance_company_id=insurance_company.insurance_company_id AND appointment.start_time BETWEEN '${startDate}' AND '${endDate}' `,
        // query: `FROM appointment INNER JOIN patient ON patient.patient_id = appointment.patient_id INNER JOIN chairs ON appointment.location_id = chairs.chair_num LEFT JOIN patient_letter ON patient_letter.patient_id = appointment.patient_id LEFT JOIN employer ON employer.employer_id = patient.prim_employer_id LEFT JOIN insurance_company ON employer.insurance_company_id = insurance_company.insurance_company_id WHERE appointment.start_time BETWEEN '${startDate}' AND '${endDate}' AND patient_letter.prim_policy_holder is not null AND appointment.confirmation_status <> '0'`,
        query: `FROM appointment INNER JOIN patient ON patient.patient_id = appointment.patient_id INNER JOIN chairs ON appointment.location_id = chairs.chair_num LEFT JOIN patient_letter ON patient_letter.patient_id = appointment.patient_id JOIN employer ON employer.employer_id = patient.prim_employer_id JOIN insurance_company ON employer.insurance_company_id = insurance_company.insurance_company_id WHERE appointment.start_time BETWEEN '${startDate}' AND '${endDate}' AND patient_letter.prim_policy_holder is not null AND appointment.confirmation_status = 1 AND LOWER(chairs.chair_name) not Like '%25ortho%25'`,
        selectcolumns:
          "patient.patient_id,patient_letter.prim_policy_holder,patient_letter.relation_to_prim_policy_holder,patient_letter.birth_date,appointment.start_time,chairs.chair_name,insurance_company.name,insurance_company.phone1,patient.prim_member_id,employer.name,employer.group_number,patient.first_name,patient.last_name,patient.medicaid_id,patient.carrier_id,appointment.confirmation_status,patient.cell_phone,patient.home_phone,patient.work_phone,patient.birth_date",
        columnCount: "20",
      },
    });

    // console.log("Full query:", response.config.url);
    // console.log("Query parameters:", response.config.params);

    console.log("fetching response");
    console.log(
      `Number of objects returned for office "${officeName}": ${response.data.data.length}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetchDataByOffice - fetching data for ${officeName} at Repository Layer`,
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
      `Error getDataForOffice -fetching for ${officeName} at Repository layer`,
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
    console.log("repository - updating appointment");

    // UPDATED: Direct update on individual appointment document
    const result = await Appointment.updateOne(
      {
        _id: appointmentId,
        officeName: officeName,
      },
      {
        $set: {
          assignedUser: userId,
          status: status,
          completionStatus: completionStatus,
          ivAssignedDate: ivAssignedDate,
          ivAssignedByUserName: ivAssignedByUserName,
          lastUpdatedAt: new Date(),
        },
      },
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      throw new Error("Appointment not found");
    }

    return result;
  } catch (error) {
    console.error(`Error updating appointment: ${appointmentId}`, error);
    throw error;
  }
}

async function getAssignedCountsByOffice(officeName, startDate, endDate) {
  try {
    // Convert dates to UTC Date objects to avoid timezone issues
    const startDateObj = new Date(startDate + "T00:00:00.000Z"); // Force UTC start of day
    const endDateObj = new Date(endDate + "T23:59:59.999Z"); // Force UTC end of day

    console.log("Date range for assigned counts:", {
      officeName,
      startDate,
      endDate,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    // UPDATED: Direct query on flat appointment documents
    const completeData = await Appointment.find({
      officeName: officeName,
      assignedUser: { $exists: true, $ne: null },
      ivAssignedDate: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
    }).sort({ ivAssignedDate: -1 });

    // Calculate counts by aggregation
    const counts = await Appointment.aggregate([
      {
        $match: {
          officeName: officeName,
          assignedUser: { $exists: true, $ne: null },
          ivAssignedDate: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      },
      {
        $group: {
          _id: "$assignedUser",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Assigned counts result:", counts);
    console.log("Complete data count:", completeData.length);

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
      error,
    );
    throw error;
  }
}

async function fetchAppointmentsByOfficeAndRemarks(
  officeName,
  startDate,
  endDate,
  remarks,
) {
  try {
    const startDateISO = new Date(startDate).toISOString();
    let endDateDate = new Date(endDate);
    endDateDate.setDate(endDateDate.getDate() + 1);
    endDateDate.setHours(0, 0, 0, 0);
    const endDateISO = endDateDate.toISOString();

    console.log("remarks", remarks);

    // UPDATED: Direct query on flat appointment documents
    const appointments = await Appointment.find({
      officeName: officeName,
      appointmentDate: {
        $gte: new Date(startDateISO),
        $lt: new Date(endDateISO),
      },
      $or: [{ ivRemarks: { $in: remarks } }, { ivRemarks: { $exists: false } }],
    }).select({
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
      ivRemarks: 1,
      planType: 1,
      officeName: 1,
    });

    return appointments;
  } catch (error) {
    console.error(
      `Error fetching appointments by office and remarks: ${error}`,
    );
    throw error;
  }
}
// Debug function to understand data structure
async function debugAppointmentData(officeName = "Tidwell") {
  try {
    // UPDATED: Direct query on flat documents
    const sample = await Appointment.find({
      officeName: officeName,
      ivCompletedDate: { $exists: true, $ne: null, $ne: "" },
    })
      .select({
        appointmentType: 1,
        appointmentDate: 1,
        appointmentTime: 1,
        ivType: 1,
        ivCompletedDate: 1,
      })
      .limit(5);

    console.log("Sample appointment data:", JSON.stringify(sample, null, 2));
    return sample;
  } catch (error) {
    console.error("Error in debug function:", error);
    throw error;
  }
}

async function getAppointmentCompletionAnalysis(
  startDate,
  endDate,
  dateType,
  ivType,
) {
  try {
    // Convert dates to UTC Date objects to avoid timezone issues
    const startDateObj = new Date(startDate + "T00:00:00.000Z");
    const endDateObj = new Date(endDate + "T23:59:59.999Z");

    console.log("Appointment completion analysis parameters:", {
      startDate,
      endDate,
      dateType,
      ivType,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
      note: "All dates are already stored in CST, no conversion needed",
    });

    // Determine the field name based on dateType
    const dateFieldName =
      dateType === "ivCompletedDate" ? "ivCompletedDate" : "appointmentDate";

    // Create match condition - if ivCompletedDate, we'll convert IST to CST in pipeline
    const getMatchCondition = () => {
      if (dateType === "ivCompletedDate") {
        // For ivCompletedDate, we'll do date filtering after conversion in pipeline
        return {};
      } else {
        // For appointmentDate, use direct date filtering
        return {
          [dateFieldName]: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        };
      }
    };

    // Fetch office names dynamically from dropdownValues collection
    const officeDropdown =
      await DropdownValuesRepository.findByCategory("Office");

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

    const results = [];

    for (const officeName of officeNames) {
      // First get total completed IVs for this office with raw data
      const totalCompletedPipeline = [
        {
          $match: {
            officeName: officeName,
            ivCompletedDate: {
              $exists: true,
              $ne: null,
              $ne: "",
            },
            ivType: ivType,
            source: { $ne: "Temp" },
          },
        },
        {
          $addFields: {
            // Parse date for filtering - data is already in CST
            convertedDate:
              dateType === "ivCompletedDate"
                ? {
                    $cond: [
                      { $ne: ["$ivCompletedDate", null] },
                      {
                        $cond: [
                          {
                            $eq: [{ $type: "$ivCompletedDate" }, "date"],
                          },
                          "$ivCompletedDate",
                          {
                            $dateFromString: {
                              dateString: "$ivCompletedDate",
                              onError: null,
                            },
                          },
                        ],
                      },
                      null,
                    ],
                  }
                : "$appointmentDate",
          },
        },
        {
          $match: {
            ...(dateType === "ivCompletedDate"
              ? {
                  convertedDate: {
                    $gte: startDateObj,
                    $lte: endDateObj,
                  },
                }
              : {
                  [dateFieldName]: {
                    $gte: startDateObj,
                    $lte: endDateObj,
                  },
                }),
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalCompletedData: {
              $push: {
                patientId: "$patientId",
                patientName: "$patientName",
                insuranceName: "$insuranceName",
                appointmentDate: "$appointmentDate",
                appointmentTime: "$appointmentTime",
                ivRequestedDate: "$ivRequestedDate",
                ivAssignedDate: "$ivAssignedDate",
                ivCompletedDate: "$ivCompletedDate",
              },
            },
          },
        },
      ];

      const totalResult = await Appointment.aggregate(totalCompletedPipeline);
      const totalCompletedIVs =
        totalResult.length > 0 ? totalResult[0].totalCount : 0;
      const totalCompletedData =
        totalResult.length > 0 ? totalResult[0].totalCompletedData : [];

      console.log(
        `Office: ${officeName}, Total completed IVs: ${totalCompletedIVs}`,
      );

      // Main analysis pipeline
      const pipeline = [
        {
          $match: {
            officeName: officeName,
            ivCompletedDate: {
              $exists: true,
              $ne: null,
              $ne: "",
            },
            ivType: ivType,
            source: { $ne: "Temp" },
          },
        },
        {
          $addFields: {
            // Parse date for filtering - data is already in CST
            convertedDate:
              dateType === "ivCompletedDate"
                ? {
                    $cond: [
                      { $ne: ["$ivCompletedDate", null] },
                      {
                        $cond: [
                          {
                            $eq: [{ $type: "$ivCompletedDate" }, "date"],
                          },
                          "$ivCompletedDate",
                          {
                            $dateFromString: {
                              dateString: "$ivCompletedDate",
                              onError: null,
                            },
                          },
                        ],
                      },
                      null,
                    ],
                  }
                : "$appointmentDate",
          },
        },
        {
          $match: {
            ...(dateType === "ivCompletedDate"
              ? {
                  convertedDate: {
                    $gte: startDateObj,
                    $lte: endDateObj,
                  },
                }
              : {
                  [dateFieldName]: {
                    $gte: startDateObj,
                    $lte: endDateObj,
                  },
                }),
          },
        },
        {
          $addFields: {
            // Convert 12-hour time format (e.g., "10:00 AM") to 24-hour format
            appointmentTime24Hour: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$appointmentTime", null] },
                    { $ne: ["$appointmentTime", ""] },
                  ],
                },
                {
                  $let: {
                    vars: {
                      timeParts: {
                        $split: ["$appointmentTime", " "],
                      },
                    },
                    in: {
                      $let: {
                        vars: {
                          time: { $arrayElemAt: ["$$timeParts", 0] },
                          period: { $arrayElemAt: ["$$timeParts", 1] },
                          hourMin: {
                            $split: [{ $arrayElemAt: ["$$timeParts", 0] }, ":"],
                          },
                        },
                        in: {
                          $let: {
                            vars: {
                              hour: {
                                $convert: {
                                  input: { $arrayElemAt: ["$$hourMin", 0] },
                                  to: "int",
                                  onError: null,
                                  onNull: null,
                                },
                              },
                              minute: { $arrayElemAt: ["$$hourMin", 1] },
                            },
                            in: {
                              $cond: [
                                // If hour conversion failed (null), return null
                                { $eq: ["$$hour", null] },
                                null,
                                // If period is null/empty, it's 24-hour format - use hour as-is
                                {
                                  $cond: [
                                    {
                                      $or: [
                                        { $eq: ["$$period", null] },
                                        { $eq: ["$$period", ""] },
                                      ],
                                    },
                                    // 24-hour format: use hour directly
                                    {
                                      $concat: [
                                        {
                                          $cond: [
                                            { $lt: ["$$hour", 10] },
                                            {
                                              $concat: [
                                                "0",
                                                { $toString: "$$hour" },
                                              ],
                                            },
                                            { $toString: "$$hour" },
                                          ],
                                        },
                                        ":",
                                        "$$minute",
                                        ":00",
                                      ],
                                    },
                                    // 12-hour format with AM/PM
                                    {
                                      $concat: [
                                        {
                                          $cond: [
                                            { $eq: ["$$period", "PM"] },
                                            {
                                              $cond: [
                                                { $eq: ["$$hour", 12] },
                                                "12",
                                                {
                                                  $toString: {
                                                    $add: ["$$hour", 12],
                                                  },
                                                },
                                              ],
                                            },
                                            {
                                              $cond: [
                                                { $eq: ["$$hour", 12] },
                                                "00",
                                                {
                                                  $cond: [
                                                    { $lt: ["$$hour", 10] },
                                                    {
                                                      $concat: [
                                                        "0",
                                                        { $toString: "$$hour" },
                                                      ],
                                                    },
                                                    { $toString: "$$hour" },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        ":",
                                        "$$minute",
                                        ":00",
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                null,
              ],
            },
            // Create appointment datetime by combining date and time (Already in CST)
            appointmentDateTime: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$appointmentTime", null] },
                    { $ne: ["$appointmentTime", ""] },
                  ],
                },
                {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$appointmentDate",
                          },
                        },
                        "T",
                        {
                          $let: {
                            vars: {
                              timeParts: {
                                $split: ["$appointmentTime", " "],
                              },
                              hasColon: {
                                $gt: [
                                  {
                                    $indexOfBytes: ["$appointmentTime", ":"],
                                  },
                                  -1,
                                ],
                              },
                            },
                            in: {
                              $cond: [
                                // Check if already in 24-hour format (HH:MM:SS or HH:MM)
                                {
                                  $and: [
                                    { $eq: [{ $size: "$$timeParts" }, 1] },
                                    "$$hasColon",
                                  ],
                                },
                                // Already 24-hour format, use as-is (add :00 if needed)
                                {
                                  $let: {
                                    vars: {
                                      timeLength: {
                                        $strLenCP: "$appointmentTime",
                                      },
                                    },
                                    in: {
                                      $cond: [
                                        { $eq: ["$$timeLength", 5] },
                                        {
                                          $concat: ["$appointmentTime", ":00"],
                                        },
                                        {
                                          $cond: [
                                            { $eq: ["$$timeLength", 8] },
                                            "$appointmentTime",
                                            {
                                              $concat: [
                                                "$appointmentTime",
                                                ":00",
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  },
                                },
                                // Parse 12-hour format with AM/PM
                                {
                                  $let: {
                                    vars: {
                                      time: {
                                        $arrayElemAt: ["$$timeParts", 0],
                                      },
                                      period: {
                                        $arrayElemAt: ["$$timeParts", 1],
                                      },
                                      hourMin: {
                                        $split: [
                                          { $arrayElemAt: ["$$timeParts", 0] },
                                          ":",
                                        ],
                                      },
                                    },
                                    in: {
                                      $let: {
                                        vars: {
                                          hour: {
                                            $convert: {
                                              input: {
                                                $arrayElemAt: ["$$hourMin", 0],
                                              },
                                              to: "int",
                                              onError: null,
                                              onNull: null,
                                            },
                                          },
                                          minute: {
                                            $ifNull: [
                                              {
                                                $arrayElemAt: ["$$hourMin", 1],
                                              },
                                              "00",
                                            ],
                                          },
                                        },
                                        in: {
                                          $cond: [
                                            // If hour conversion failed (null), return null
                                            { $eq: ["$$hour", null] },
                                            null,
                                            // If period is null/empty, it's 24-hour format - use hour as-is
                                            {
                                              $cond: [
                                                {
                                                  $or: [
                                                    { $eq: ["$$period", null] },
                                                    { $eq: ["$$period", ""] },
                                                  ],
                                                },
                                                // 24-hour format: use hour directly
                                                {
                                                  $concat: [
                                                    {
                                                      $cond: [
                                                        { $lt: ["$$hour", 10] },
                                                        {
                                                          $concat: [
                                                            "0",
                                                            {
                                                              $toString:
                                                                "$$hour",
                                                            },
                                                          ],
                                                        },
                                                        { $toString: "$$hour" },
                                                      ],
                                                    },
                                                    ":",
                                                    "$$minute",
                                                    ":00",
                                                  ],
                                                },
                                                // 12-hour format with AM/PM
                                                {
                                                  $concat: [
                                                    {
                                                      $cond: [
                                                        {
                                                          $eq: [
                                                            "$$period",
                                                            "PM",
                                                          ],
                                                        },
                                                        {
                                                          $cond: [
                                                            {
                                                              $eq: [
                                                                "$$hour",
                                                                12,
                                                              ],
                                                            },
                                                            "12",
                                                            {
                                                              $toString: {
                                                                $add: [
                                                                  "$$hour",
                                                                  12,
                                                                ],
                                                              },
                                                            },
                                                          ],
                                                        },
                                                        {
                                                          $cond: [
                                                            {
                                                              $eq: [
                                                                "$$period",
                                                                "AM",
                                                              ],
                                                            },
                                                            {
                                                              $cond: [
                                                                {
                                                                  $eq: [
                                                                    "$$hour",
                                                                    12,
                                                                  ],
                                                                },
                                                                "00",
                                                                {
                                                                  $cond: [
                                                                    {
                                                                      $lt: [
                                                                        "$$hour",
                                                                        10,
                                                                      ],
                                                                    },
                                                                    {
                                                                      $concat: [
                                                                        "0",
                                                                        {
                                                                          $toString:
                                                                            "$$hour",
                                                                        },
                                                                      ],
                                                                    },
                                                                    {
                                                                      $toString:
                                                                        "$$hour",
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                            {
                                                              $cond: [
                                                                {
                                                                  $lt: [
                                                                    "$$hour",
                                                                    10,
                                                                  ],
                                                                },
                                                                {
                                                                  $concat: [
                                                                    "0",
                                                                    {
                                                                      $toString:
                                                                        "$$hour",
                                                                    },
                                                                  ],
                                                                },
                                                                {
                                                                  $toString:
                                                                    "$$hour",
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                    ":",
                                                    "$$minute",
                                                    ":00",
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                        ".000Z",
                      ],
                    },
                    onError: null,
                  },
                },
                "$appointmentDate",
              ],
            },
            // Parse ivCompletedDate if it's a string
            completedDateTime: {
              $cond: [
                { $ne: ["$ivCompletedDate", null] },
                {
                  $cond: [
                    {
                      $eq: [{ $type: "$ivCompletedDate" }, "date"],
                    },
                    "$ivCompletedDate",
                    {
                      $dateFromString: {
                        dateString: "$ivCompletedDate",
                        onError: null,
                      },
                    },
                  ],
                },
                null,
              ],
            },
            // Parse ivRequestedDate if it's a string
            requestedDateTime: {
              $cond: [
                { $ne: ["$ivRequestedDate", null] },
                {
                  $cond: [
                    {
                      $eq: [{ $type: "$ivRequestedDate" }, "date"],
                    },
                    "$ivRequestedDate",
                    {
                      $dateFromString: {
                        dateString: "$ivRequestedDate",
                        onError: null,
                      },
                    },
                  ],
                },
                null,
              ],
            },
            // Check if appointment type is new patient related
            isNewPatient: {
              $cond: [
                { $ne: ["$appointmentType", null] },
                {
                  $regexMatch: {
                    input: { $toLower: "$appointmentType" },
                    regex: /^(np|np\/srp|new patient|np \/ srp|np\/ srp|new)$/i,
                  },
                },
                false,
              ],
            },
          },
        },
        {
          $addFields: {
            // For Rush IV: If requested within 1 hour before appointment, add 1 hour buffer to requested time
            // Otherwise, use appointment time as the threshold
            // Data is already in CST, no conversion needed
            effectiveThresholdTime: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$ivType", "Rush"] },
                    { $ne: ["$requestedDateTime", null] },
                    { $ne: ["$appointmentDateTime", null] },
                    { $lt: ["$requestedDateTime", "$appointmentDateTime"] }, // Requested before appointment (CST to CST)
                    {
                      $lte: [
                        {
                          $subtract: [
                            "$appointmentDateTime",
                            "$requestedDateTime",
                          ],
                        },
                        3600000, // Within 1 hour (in milliseconds)
                      ],
                    },
                  ],
                },
                // Rush IV requested within 1 hour before appointment: add 1 hour buffer to requested time
                {
                  $dateAdd: {
                    startDate: "$requestedDateTime",
                    unit: "millisecond",
                    amount: 3600000, // Add 1 hour
                  },
                },
                // Normal IV or Rush IV requested >1 hour before: use appointment time
                "$appointmentDateTime",
              ],
            },
          },
        },
        {
          $match: {
            completedDateTime: { $ne: null },
            requestedDateTime: { $ne: null },
            appointmentDateTime: { $ne: null },
            // Filter: Only include IVs requested BEFORE appointment time
            // All dates are already in CST, direct comparison
            // requestedDateTime < appointmentDateTime
            // Means: IV was requested BEFORE the appointment time
            $expr: {
              $lt: ["$requestedDateTime", "$appointmentDateTime"],
            },
          },
        },
        {
          $addFields: {
            // Check if completed after appointment time (or after buffer time for Rush IV)
            completedAfterAppointment: {
              $gt: ["$completedDateTime", "$effectiveThresholdTime"],
            },
            // Check if completed within 1 hour (using effectiveThresholdTime as base)
            completedWithinOneHour: {
              $and: [
                { $gt: ["$completedDateTime", "$effectiveThresholdTime"] },
                {
                  $lte: [
                    {
                      $subtract: [
                        "$completedDateTime",
                        "$effectiveThresholdTime",
                      ],
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
              officeName: "$officeName",
              isNewPatient: "$isNewPatient",
            },
            appointmentCount: { $sum: 1 },
            completedAfterAppointmentCount: {
              $sum: { $cond: ["$completedAfterAppointment", 1, 0] },
            },
            completedWithinOneHourCount: {
              $sum: { $cond: ["$completedWithinOneHour", 1, 0] },
            },
            // All completed IVs data
            allCompletedAppointments: {
              $push: {
                patientId: "$patientId",
                patientName: "$patientName",
                insuranceName: "$insuranceName",
                appointmentDate: "$appointmentDate",
                appointmentTime: "$appointmentTime",
                ivRequestedDate: "$ivRequestedDate",
                ivAssignedDate: "$ivAssignedDate",
                ivCompletedDate: "$ivCompletedDate",
              },
            },
            // Completed AFTER appointment time data
            completedAfterAppointmentData: {
              $push: {
                $cond: [
                  "$completedAfterAppointment",
                  {
                    patientId: "$patientId",
                    patientName: "$patientName",
                    insuranceName: "$insuranceName",
                    appointmentDate: "$appointmentDate",
                    appointmentTime: "$appointmentTime",
                    ivRequestedDate: "$ivRequestedDate",
                    ivAssignedDate: "$ivAssignedDate",
                    ivCompletedDate: "$ivCompletedDate",
                  },
                  "$$REMOVE",
                ],
              },
            },
            // Completed WITHIN one hour data
            completedWithinOneHourData: {
              $push: {
                $cond: [
                  "$completedWithinOneHour",
                  {
                    patientId: "$patientId",
                    patientName: "$patientName",
                    insuranceName: "$insuranceName",
                    appointmentDate: "$appointmentDate",
                    appointmentTime: "$appointmentTime",
                    ivRequestedDate: "$ivRequestedDate",
                    ivAssignedDate: "$ivAssignedDate",
                    ivCompletedDate: "$ivCompletedDate",
                  },
                  "$$REMOVE",
                ],
              },
            },
          },
        },
        {
          $addFields: {
            afterAppointmentCompletionPercentage: {
              $cond: [
                { $gt: ["$appointmentCount", 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        "$completedAfterAppointmentCount",
                        "$appointmentCount",
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
        JSON.stringify(officeResults, null, 2),
      );

      // Initialize office data structure with total count
      const officeData = {
        officeName: officeName,
        totalCompletedIVs: totalCompletedIVs, // Same for both categories
        totalCompletedData: totalCompletedData, // Raw data for all completed IVs
        newPatient: {
          completedAfterAppointmentCount: 0,
          completedWithinOneHourCount: 0,
          afterAppointmentCompletionPercentage: 0,
          allCompletedAppointments: [],
          completedAfterAppointmentData: [],
          completedWithinOneHourData: [],
        },
        others: {
          completedAfterAppointmentCount: 0,
          completedWithinOneHourCount: 0,
          afterAppointmentCompletionPercentage: 0,
          allCompletedAppointments: [],
          completedAfterAppointmentData: [],
          completedWithinOneHourData: [],
        },
      };

      // Process results
      officeResults.forEach((result) => {
        const afterAppointmentData = result.completedAfterAppointmentData || [];
        const withinOneHourData = result.completedWithinOneHourData || [];

        if (result._id.isNewPatient) {
          officeData.newPatient = {
            completedAfterAppointmentCount: afterAppointmentData.length,
            completedWithinOneHourCount: withinOneHourData.length,
            afterAppointmentCompletionPercentage:
              Math.round(result.afterAppointmentCompletionPercentage * 100) /
                100 || 0,
            allCompletedAppointments: result.allCompletedAppointments || [],
            completedAfterAppointmentData: afterAppointmentData,
            completedWithinOneHourData: withinOneHourData,
          };
        } else {
          officeData.others = {
            completedAfterAppointmentCount: afterAppointmentData.length,
            completedWithinOneHourCount: withinOneHourData.length,
            afterAppointmentCompletionPercentage:
              Math.round(result.afterAppointmentCompletionPercentage * 100) /
                100 || 0,
            allCompletedAppointments: result.allCompletedAppointments || [],
            completedAfterAppointmentData: afterAppointmentData,
            completedWithinOneHourData: withinOneHourData,
          };
        }
      });

      results.push(officeData);
    }

    console.log(
      `Appointment completion analysis completed for ${results.length} offices`,
    );
    return results;
  } catch (error) {
    console.error("Error in appointment completion analysis:", error);
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
    const minStartDate = new Date("2025-10-13T00:00:00.000Z");

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

    console.log("Dynamic date range calculated:", {
      today: today.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // UPDATED: Query flat documents directly
    const unassignedAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "Unassigned",
    })
      .select({
        _id: 1,
        appointmentDate: 1,
        appointmentTime: 1,
        appointmentType: 1,
        patientId: 1,
        patientName: 1,
        ivType: 1,
        status: 1,
        officeName: 1,
      })
      .sort({ appointmentDate: 1, officeName: 1 })
      .lean();

    // Map to match expected response format
    const formattedAppointments = unassignedAppointments.map((apt) => ({
      appointmentId: apt._id,
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      appointmentType: apt.appointmentType,
      patientId: apt.patientId,
      patientName: apt.patientName,
      ivType: apt.ivType,
      status: apt.status,
      office: apt.officeName,
    }));

    console.log(
      `Found ${formattedAppointments.length} dynamic unassigned appointments`,
    );
    return {
      appointments: formattedAppointments,
      dateRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        today: today.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error("Error fetching dynamic unassigned appointments:", error);
    throw error;
  }
}

// Check completion status of appointments by their MongoDB IDs
async function checkAppointmentCompletionStatus(appointmentIds) {
  try {
    const mongoose = require("mongoose");

    // Convert string IDs to ObjectIds
    const objectIds = appointmentIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    console.log(
      "Repository: Checking completion status for appointment IDs:",
      appointmentIds,
    );

    // UPDATED: Direct query on flat documents
    const appointments = await Appointment.find({
      _id: { $in: objectIds },
    })
      .select({
        _id: 1,
        patientName: 1,
        patientId: 1,
        appointmentDate: 1,
        appointmentTime: 1,
        appointmentType: 1,
        completionStatus: 1,
        status: 1,
        ivType: 1,
        ivCompletedDate: 1,
        completedBy: 1,
        ivRemarks: 1,
        officeName: 1,
      })
      .sort({ appointmentDate: 1 })
      .lean();

    // Map to match expected response format
    const formattedAppointments = appointments.map((apt) => ({
      appointmentId: apt._id,
      patientName: apt.patientName,
      patientId: apt.patientId,
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      appointmentType: apt.appointmentType,
      completionStatus: apt.completionStatus,
      status: apt.status,
      ivType: apt.ivType,
      ivCompletedDate: apt.ivCompletedDate,
      completedBy: apt.completedBy,
      ivRemarks: apt.ivRemarks,
      office: apt.officeName,
    }));

    console.log(
      `Repository: Found ${formattedAppointments.length} appointments out of ${appointmentIds.length} requested`,
    );
    return formattedAppointments;
  } catch (error) {
    console.error("Error checking appointment completion status:", error);
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
