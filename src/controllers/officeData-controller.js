const OfficeDataService = require('../services/officeData-service');

const getOfficeDataByDateRange = async (req, res) => {
  try {
    const { fromDate, toDate, dateType } = req.body;

    // Validate required fields
    if (!fromDate || !toDate || !dateType) {
      return res.status(400).json({
        success: false,
        message: 'fromDate, toDate, and dateType are required fields',
      });
    }

    // Validate dateType
    const validDateTypes = [
      'appointmentDate',
      'completedDate',
      'ivRequestedDate',
      'ivAssignedDate',
    ];
    if (!validDateTypes.includes(dateType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid dateType. Must be one of: ${validDateTypes.join(
          ', '
        )}`,
      });
    }

    // Validate date range (31 days maximum)
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format',
      });
    }

    if (fromDateObj > toDateObj) {
      return res.status(400).json({
        success: false,
        message: 'fromDate cannot be later than toDate',
      });
    }

    // Check if date range exceeds 31 days
    const daysDifference = Math.ceil(
      (toDateObj - fromDateObj) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 31) {
      return res.status(400).json({
        success: false,
        message:
          'Date range exceeds 31 days. Please select a date range less than or equal to 31 days.',
      });
    }

    const officeData = await OfficeDataService.getOfficeDataByDateRange(
      fromDate,
      toDate,
      dateType
    );

    res.status(200).json({
      success: true,
      message: 'Office data fetched successfully',
      data: officeData,
      dateRange: {
        from: fromDate,
        to: toDate,
        dateType: dateType,
        totalDays: daysDifference,
      },
    });
  } catch (error) {
    console.error(
      'Error at getOfficeDataByDateRange - Controller layer:',
      error
    );
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching office data',
      error: error.message,
    });
  }
};

module.exports = {
  getOfficeDataByDateRange,
};
