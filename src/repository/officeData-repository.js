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
              $lt: endDate,
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
