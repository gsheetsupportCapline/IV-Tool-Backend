const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance-controller');

// Get all active users for attendance marking
// GET /api/attendance/active-users
router.get('/active-users', AttendanceController.getAllActiveUsers);

// Get attendance records for a specific date
// GET /api/attendance/by-date?date=2025-10-01
router.get('/by-date', AttendanceController.getAttendanceByDate);

// Save or update single attendance record
// POST /api/attendance/save
// Body: { "userId": "670123456789abcdef123456", "date": "2025-10-01", "attendance": "Present" }
router.post('/save', AttendanceController.saveOrUpdateAttendance);

// Save multiple attendance records in bulk
// POST /api/attendance/bulk-save
// Body: { "attendanceData": [{ "userId": "670123456789abcdef123456", "date": "2025-10-01", "attendance": "Present" }, ...] }
router.post('/bulk-save', AttendanceController.saveBulkAttendance);

// Get user attendance within date range
// GET /api/attendance/user/670123456789abcdef123456?startDate=2025-10-01&endDate=2025-10-31
router.get('/user/:userId', AttendanceController.getUserAttendanceInRange);

// Get attendance summary for all users
// GET /api/attendance/summary?startDate=2025-10-01&endDate=2025-10-31
router.get('/summary', AttendanceController.getAttendanceSummary);

module.exports = router;
