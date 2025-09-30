const AttendanceRepository = require('../repository/attendance-repository');
const mongoose = require('mongoose');

// Get attendance for a specific date with user details
async function getAttendanceByDate(date) {
  try {
    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    console.log('Service: Fetching attendance for date:', date);
    const attendanceRecords = await AttendanceRepository.getAttendanceByDate(
      date
    );

    // Format the response to make it easier to use
    const formattedRecords = attendanceRecords.map((record) => ({
      userId: record.userId._id,
      userName: record.userId.name,
      userEmail: record.userId.email,
      userRole: record.userId.role,
      assignedOffice: record.userId.assignedOffice,
      isActive: record.userId.isActive,
      shiftTime: record.userId.shiftTime,
      date: record.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      attendance: record.attendance,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

    return {
      success: true,
      data: formattedRecords,
      count: formattedRecords.length,
      date: date,
    };
  } catch (error) {
    console.error('Error at service layer in getAttendanceByDate:', error);
    throw error;
  }
}

// Save or update single attendance record
async function saveOrUpdateAttendance(userId, date, attendance) {
  try {
    // Validate inputs
    if (!userId || !date || !attendance) {
      throw new Error('userId, date, and attendance are required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(
        'Invalid userId format. Must be a valid MongoDB ObjectId'
      );
    }

    if (!['Present', 'Absent', 'Half'].includes(attendance)) {
      throw new Error(
        'Invalid attendance value. Must be Present, Absent, or Half'
      );
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    console.log('Service: Saving/updating attendance:', {
      userId,
      date,
      attendance,
    });
    const result = await AttendanceRepository.saveOrUpdateAttendance(
      userId,
      date,
      attendance
    );

    return {
      success: true,
      data: {
        userId: result.userId._id,
        userName: result.userId.name,
        userEmail: result.userId.email,
        userRole: result.userId.role,
        assignedOffice: result.userId.assignedOffice,
        isActive: result.userId.isActive,
        shiftTime: result.userId.shiftTime,
        date: result.date.toISOString().split('T')[0],
        attendance: result.attendance,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
      message: 'Attendance record saved successfully',
    };
  } catch (error) {
    console.error('Error at service layer in saveOrUpdateAttendance:', error);
    throw error;
  }
}

// Save multiple attendance records
async function saveBulkAttendance(attendanceData) {
  try {
    // Validate input
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      throw new Error('attendanceData must be a non-empty array');
    }

    // Validate each record
    for (const record of attendanceData) {
      if (!record.userId || !record.date || !record.attendance) {
        throw new Error('Each record must have userId, date, and attendance');
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(record.userId)) {
        throw new Error(
          `Invalid userId format for user ${record.userId}. Must be a valid MongoDB ObjectId`
        );
      }

      if (!['Present', 'Absent', 'Half'].includes(record.attendance)) {
        throw new Error(
          `Invalid attendance value for user ${record.userId}. Must be Present, Absent, or Half`
        );
      }

      const dateObj = new Date(record.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(
          `Invalid date format for user ${record.userId}. Please use YYYY-MM-DD format`
        );
      }
    }

    console.log(
      `Service: Processing bulk attendance for ${attendanceData.length} records`
    );
    const result = await AttendanceRepository.saveBulkAttendance(
      attendanceData
    );

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        insertedCount: result.insertedCount,
      },
      message: `Bulk attendance operation completed. ${
        result.upsertedCount + result.modifiedCount
      } records processed.`,
    };
  } catch (error) {
    console.error('Error at service layer in saveBulkAttendance:', error);
    throw error;
  }
}

// Get user attendance within date range
async function getUserAttendanceInRange(userId, startDate, endDate) {
  try {
    // Validate inputs
    if (!userId || !startDate || !endDate) {
      throw new Error('userId, startDate, and endDate are required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(
        'Invalid userId format. Must be a valid MongoDB ObjectId'
      );
    }

    // Validate date formats
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    if (startDateObj > endDateObj) {
      throw new Error('startDate cannot be later than endDate');
    }

    console.log('Service: Fetching user attendance in range:', {
      userId,
      startDate,
      endDate,
    });
    const attendanceRecords =
      await AttendanceRepository.getUserAttendanceInRange(
        userId,
        startDate,
        endDate
      );

    // Format the response
    const formattedRecords = attendanceRecords.map((record) => ({
      userId: record.userId._id,
      userName: record.userId.name,
      userEmail: record.userId.email,
      userRole: record.userId.role,
      assignedOffice: record.userId.assignedOffice,
      isActive: record.userId.isActive,
      shiftTime: record.userId.shiftTime,
      date: record.date.toISOString().split('T')[0],
      attendance: record.attendance,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

    return {
      success: true,
      data: formattedRecords,
      count: formattedRecords.length,
      filters: { userId, startDate, endDate },
    };
  } catch (error) {
    console.error('Error at service layer in getUserAttendanceInRange:', error);
    throw error;
  }
}

// Get attendance summary for all users
async function getAttendanceSummary(startDate, endDate) {
  try {
    // Validate inputs
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    // Validate date formats
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    if (startDateObj > endDateObj) {
      throw new Error('startDate cannot be later than endDate');
    }

    console.log('Service: Generating attendance summary:', {
      startDate,
      endDate,
    });
    const summary = await AttendanceRepository.getAttendanceSummary(
      startDate,
      endDate
    );

    // Format the summary for better readability
    const formattedSummary = summary.map((userSummary) => {
      const breakdown = {};
      userSummary.attendanceBreakdown.forEach((item) => {
        breakdown[item.status] = item.count;
      });

      return {
        userId: userSummary.userId,
        userName: userSummary.userName,
        userEmail: userSummary.userEmail,
        userRole: userSummary.userRole,
        assignedOffice: userSummary.assignedOffice,
        isActive: userSummary.isActive,
        shiftTime: userSummary.shiftTime,
        totalDays: userSummary.totalDays,
        present: breakdown.Present || 0,
        absent: breakdown.Absent || 0,
        half: breakdown.Half || 0,
      };
    });

    return {
      success: true,
      data: formattedSummary,
      count: formattedSummary.length,
      filters: { startDate, endDate },
    };
  } catch (error) {
    console.error('Error at service layer in getAttendanceSummary:', error);
    throw error;
  }
}

// Get all active users for attendance marking
async function getAllActiveUsers() {
  try {
    console.log('Service: Fetching all active users');
    const activeUsers = await AttendanceRepository.getAllActiveUsers();

    const formattedUsers = activeUsers.map((user) => ({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      assignedOffice: user.assignedOffice,
      shiftTime: user.shiftTime,
    }));

    return {
      success: true,
      data: formattedUsers,
      count: formattedUsers.length,
    };
  } catch (error) {
    console.error('Error at service layer in getAllActiveUsers:', error);
    throw error;
  }
}

module.exports = {
  getAttendanceByDate,
  saveOrUpdateAttendance,
  saveBulkAttendance,
  getUserAttendanceInRange,
  getAttendanceSummary,
  getAllActiveUsers,
};
