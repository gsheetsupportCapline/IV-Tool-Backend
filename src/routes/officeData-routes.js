const express = require('express');
const router = express.Router();
const OfficeDataController = require('../controllers/officeData-controller');

// POST route for fetching office data by date range
router.post(
  '/office-data-by-date-range',
  OfficeDataController.getOfficeDataByDateRange
);

module.exports = router;
