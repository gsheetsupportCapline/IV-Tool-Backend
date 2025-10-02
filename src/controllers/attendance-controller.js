const AttendanceService = require('../services/attendance-service');

// Get attendance records for a specific date
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date is a required query parameter (format: YYYY-MM-DD)',
      });
    }

    const result = await AttendanceService.getAttendanceByDate(date);

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      filters: { date },
    });
  } catch (error) {
    console.error('Error at controller layer in getAttendanceByDate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance records',
    });
  }
};

// Save or update single attendance record
const saveOrUpdateAttendance = async (req, res) => {
  try {
    const { userId, date, attendance, assigned } = req.body;

    // Validate required fields
    if (!userId || !date || !attendance) {
      return res.status(400).json({
        success: false,
        message: 'userId, date, and attendance are required fields',
      });
    }

    // Validate assigned field if provided
    if (assigned) {
      if (
        typeof assigned.count !== 'undefined' &&
        (typeof assigned.count !== 'number' || assigned.count < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: 'assigned.count must be a non-negative number',
        });
      }

      if (assigned.appointmentIds && !Array.isArray(assigned.appointmentIds)) {
        return res.status(400).json({
          success: false,
          message: 'assigned.appointmentIds must be an array',
        });
      }
    }

    const result = await AttendanceService.saveOrUpdateAttendance(
      userId,
      date,
      attendance,
      assigned
    );

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(
      'Error at controller layer in saveOrUpdateAttendance:',
      error
    );
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save attendance record',
    });
  }
};

// Save multiple attendance records in bulk
const saveBulkAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body;

    // Validate required fields
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'attendanceData is required and must be an array',
      });
    }

    if (attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'attendanceData array cannot be empty',
      });
    }

    const result = await AttendanceService.saveBulkAttendance(attendanceData);

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error at controller layer in saveBulkAttendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save bulk attendance records',
    });
  }
};

// Get user attendance within date range
const getUserAttendanceInRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required query parameters',
      });
    }

    const result = await AttendanceService.getUserAttendanceInRange(
      userId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      filters: result.filters,
    });
  } catch (error) {
    console.error(
      'Error at controller layer in getUserAttendanceInRange:',
      error
    );
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user attendance records',
    });
  }
};

// Get attendance summary for all users
const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required query parameters',
      });
    }

    const result = await AttendanceService.getAttendanceSummary(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      filters: result.filters,
    });
  } catch (error) {
    console.error('Error at controller layer in getAttendanceSummary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate attendance summary',
    });
  }
};

// Get all active users for attendance marking
const getAllActiveUsers = async (req, res) => {
  try {
    const result = await AttendanceService.getAllActiveUsers();

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
      message: 'Active users fetched successfully',
    });
  } catch (error) {
    console.error('Error at controller layer in getAllActiveUsers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active users',
    });
  }
};

// Update only assigned field of attendance record
const updateAttendanceAssigned = async (req, res) => {
  try {
    const { userId, date, assigned } = req.body;

    // Validate required fields
    if (!userId || !date || !assigned) {
      return res.status(400).json({
        success: false,
        message: 'userId, date, and assigned are required fields',
      });
    }

    // Validate assigned field structure
    if (
      typeof assigned.count !== 'undefined' &&
      (typeof assigned.count !== 'number' || assigned.count < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'assigned.count must be a non-negative number',
      });
    }

    if (assigned.appointmentIds && !Array.isArray(assigned.appointmentIds)) {
      return res.status(400).json({
        success: false,
        message: 'assigned.appointmentIds must be an array',
      });
    }

    // At least one field should be provided for update
    if (typeof assigned.count === 'undefined' && !assigned.appointmentIds) {
      return res.status(400).json({
        success: false,
        message:
          'At least one field (count or appointmentIds) must be provided in assigned object',
      });
    }

    const result = await AttendanceService.updateAttendanceAssigned(
      userId,
      date,
      assigned
    );

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error(
      'Error at controller layer in updateAttendanceAssigned:',
      error
    );
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update attendance assigned data',
    });
  }
};

module.exports = {
  getAttendanceByDate,
  saveOrUpdateAttendance,
  saveBulkAttendance,
  getUserAttendanceInRange,
  getAttendanceSummary,
  getAllActiveUsers,
  updateAttendanceAssigned,
};
