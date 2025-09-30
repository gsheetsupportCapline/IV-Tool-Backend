const Appointment = require('../models/appointment');

const OfficeDataRepository = {
  getOfficeDataByDateRange: async (fromDate, toDate, dateFieldName) => {
    try {
      // Convert dates to Date objects
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      // Adjust end date to include the entire day
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      // Build the aggregation pipeline
      const pipeline = [
        // Unwind appointments array to work with individual appointments
        { $unwind: '$appointments' },

        // Match appointments within date range
        {
          $match: {
            [dateFieldName]: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        // Add office name to each appointment
        {
          $addFields: {
            'appointments.officeName': '$officeName',
          },
        },

        // Replace root with appointment data
        {
          $replaceRoot: { newRoot: '$appointments' },
        },

        // Lookup user details from users collection
        {
          $lookup: {
            from: 'users', // Name of the users collection
            let: { assignedUserId: { $toObjectId: '$assignedUser' } }, // Convert string ID to ObjectId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$assignedUserId'] }
                }
              },
              {
                $project: {
                  name: 1,
                  _id: 0
                }
              }
            ],
            as: 'userDetails'
          }
        },

        // Add computed field for assignedUserName
        {
          $addFields: {
            assignedUserName: {
              $cond: {
                if: { $gt: [{ $size: '$userDetails' }, 0] },
                then: { $arrayElemAt: ['$userDetails.name', 0] },
                else: 'Unknown User'
              }
            }
          }
        },

        // Remove the temporary userDetails field
        {
          $unset: 'userDetails'
        },

        // Sort by date and time
        {
          $sort: {
            [dateFieldName.replace('appointments.', '')]: 1,
            appointmentTime: 1,
          },
        },
      ];

      // Execute aggregation
      const appointments = await Appointment.aggregate(pipeline);

      console.log(
        `Found ${appointments.length} appointments for date range ${fromDate} to ${toDate}`
      );

      return appointments;
    } catch (error) {
      console.error(
        'Error at OfficeDataRepository.getOfficeDataByDateRange:',
        error
      );
      throw error;
    }
  },
};

module.exports = OfficeDataRepository;
