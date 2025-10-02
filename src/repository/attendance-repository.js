const Attendance = require('../models/attendance');
const mongoose = require('mongoose');

// Get attendance records for a specific date with user details
async function getAttendanceByDate(date) {
  try {
    // Convert date to start and end of day to handle timezone issues
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    console.log('Fetching attendance for date range:', {
      date,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('userId', 'name email role assignedOffice isActive shiftTime')
      .sort({ 'userId.name': 1 });

    console.log(
      `Found ${attendanceRecords.length} attendance records for date: ${date}`
    );
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    throw error;
  }
}

// Save or update attendance record
async function saveOrUpdateAttendance(
  userId,
  date,
  attendance,
  assigned = null
) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(
        'Invalid userId format. Must be a valid MongoDB ObjectId'
      );
    }

    // Convert date to ensure consistent format
    const attendanceDate = new Date(date + 'T00:00:00.000Z');

    console.log('Saving/updating attendance:', {
      userId,
      date,
      attendance,
      assigned,
      attendanceDate: attendanceDate.toISOString(),
    });

    // Prepare update object
    const updateData = {
      userId: new mongoose.Types.ObjectId(userId),
      date: attendanceDate,
      attendance: attendance,
    };

    // Handle assigned field updates intelligently
    if (assigned) {
      // First, get existing record to preserve existing assigned data
      const existingRecord = await Attendance.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z'),
        },
      });

      // Start with existing assigned data or defaults
      updateData.assigned = {
        count: existingRecord?.assigned?.count || 0,
        appointmentIds: existingRecord?.assigned?.appointmentIds || [],
      };

      // Update only the fields that are provided
      if (typeof assigned.count !== 'undefined') {
        updateData.assigned.count = assigned.count;
      }

      if (assigned.appointmentIds) {
        updateData.assigned.appointmentIds = assigned.appointmentIds.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      }
    }

    // Use upsert to either create new record or update existing one
    const result = await Attendance.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z'),
        },
      },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('userId', 'name email role assignedOffice isActive shiftTime');

    console.log('Attendance record saved/updated:', result);
    return result;
  } catch (error) {
    console.error('Error saving/updating attendance:', error);
    throw error;
  }
}

// Save multiple attendance records in bulk
async function saveBulkAttendance(attendanceData) {
  try {
    console.log(
      `Processing bulk attendance for ${attendanceData.length} records`
    );

    // Validate all ObjectIds first
    for (const record of attendanceData) {
      if (!mongoose.Types.ObjectId.isValid(record.userId)) {
        throw new Error(
          `Invalid userId format for record: ${record.userId}. Must be a valid MongoDB ObjectId`
        );
      }
    }

    const bulkOps = attendanceData.map((record) => ({
      updateOne: {
        filter: {
          userId: new mongoose.Types.ObjectId(record.userId),
          date: {
            $gte: new Date(record.date + 'T00:00:00.000Z'),
            $lt: new Date(record.date + 'T23:59:59.999Z'),
          },
        },
        update: {
          userId: new mongoose.Types.ObjectId(record.userId),
          date: new Date(record.date + 'T00:00:00.000Z'),
          attendance: record.attendance,
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);
    console.log('Bulk attendance operation result:', result);
    return result;
  } catch (error) {
    console.error('Error in bulk attendance save:', error);
    throw error;
  }
}

// Get attendance records for a specific user within date range
async function getUserAttendanceInRange(userId, startDate, endDate) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(
        'Invalid userId format. Must be a valid MongoDB ObjectId'
      );
    }

    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
    const endDateObj = new Date(endDate + 'T23:59:59.999Z');

    console.log('Fetching user attendance in range:', {
      userId,
      startDate,
      endDate,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    const attendanceRecords = await Attendance.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
    })
      .populate('userId', 'name email role assignedOffice isActive shiftTime')
      .sort({ date: 1 });

    console.log(
      `Found ${attendanceRecords.length} attendance records for user: ${userId}`
    );
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching user attendance in range:', error);
    throw error;
  }
}

// Get attendance summary for all users in a date range with user details
async function getAttendanceSummary(startDate, endDate) {
  try {
    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
    const endDateObj = new Date(endDate + 'T23:59:59.999Z');

    console.log('Fetching attendance summary:', {
      startDate,
      endDate,
      startDateObj: startDateObj.toISOString(),
      endDateObj: endDateObj.toISOString(),
    });

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            attendance: '$attendance',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.userId',
          attendanceBreakdown: {
            $push: {
              status: '$_id.attendance',
              count: '$count',
            },
          },
          totalDays: { $sum: '$count' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          userId: '$_id',
          userName: '$userDetails.name',
          userEmail: '$userDetails.email',
          userRole: '$userDetails.role',
          assignedOffice: '$userDetails.assignedOffice',
          isActive: '$userDetails.isActive',
          shiftTime: '$userDetails.shiftTime',
          attendanceBreakdown: 1,
          totalDays: 1,
        },
      },
      {
        $sort: { userName: 1 },
      },
    ]);

    console.log(`Generated attendance summary for ${summary.length} users`);
    return summary;
  } catch (error) {
    console.error('Error generating attendance summary:', error);
    throw error;
  }
}

// Get all active users for attendance marking
async function getAllActiveUsers() {
  try {
    const { User } = require('../models/user');

    const activeUsers = await User.find(
      { isActive: true },
      'name email role assignedOffice shiftTime'
    ).sort({ name: 1 });

    console.log(`Found ${activeUsers.length} active users`);
    return activeUsers;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw error;
  }
}

// Update only assigned field of existing attendance record
async function updateAttendanceAssigned(userId, date, assigned) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(
        'Invalid userId format. Must be a valid MongoDB ObjectId'
      );
    }

    console.log('Updating attendance assigned data:', {
      userId,
      date,
      assigned,
    });

    // First, find the existing record
    const existingRecord = await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z'),
      },
    });

    if (!existingRecord) {
      throw new Error(
        'Attendance record not found for the specified user and date'
      );
    }

    // Prepare update object for assigned field only
    const updateData = {};

    // Preserve existing assigned data and update only provided fields
    const currentAssigned = {
      count: existingRecord.assigned?.count || 0,
      appointmentIds: existingRecord.assigned?.appointmentIds || [],
    };

    // Update only the fields that are provided
    if (typeof assigned.count !== 'undefined') {
      currentAssigned.count = assigned.count;
    }

    if (assigned.appointmentIds) {
      currentAssigned.appointmentIds = assigned.appointmentIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    updateData.assigned = currentAssigned;

    // Update the record
    const result = await Attendance.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z'),
        },
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('userId', 'name email role assignedOffice isActive shiftTime');

    console.log('Attendance assigned data updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating attendance assigned data:', error);
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
  updateAttendanceAssigned,
};
