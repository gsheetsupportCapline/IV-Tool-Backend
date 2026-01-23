// fetchLog-routes.js
const express = require("express");
const router = express.Router();
const FetchLogController = require("../controllers/fetchLog-controller");

// Get latest fetch log
// GET /api/fetch-logs/latest
router.get("/latest", FetchLogController.getLatestFetchLog);

// Get fetch logs by date range
// GET /api/fetch-logs/range?startDate=2026-01-01&endDate=2026-01-31
router.get("/range", FetchLogController.getFetchLogsByDateRange);

// Get fetch logs by specific date
// GET /api/fetch-logs/2026-01-24
router.get("/:date", FetchLogController.getFetchLogsByDate);

module.exports = router;
