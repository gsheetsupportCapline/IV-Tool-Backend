// fetchLog-controller.js
const FetchLogService = require("../services/fetchLog-service");

/**
 * Get fetch logs by date
 * GET /api/fetch-logs/:date
 */
const getFetchLogsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    console.log(`[FETCH LOG CONTROLLER] Request for date: ${date}`);

    const result = await FetchLogService.getFetchLogsByDate(date);

    res.status(200).json(result);
  } catch (error) {
    console.error(
      `[FETCH LOG CONTROLLER ERROR] Error getting logs by date:`,
      error.message,
    );
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date(),
    });
  }
};

/**
 * Get fetch logs by date range
 * GET /api/fetch-logs/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getFetchLogsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate query parameters are required",
        timestamp: new Date(),
      });
    }

    console.log(
      `[FETCH LOG CONTROLLER] Request for range: ${startDate} to ${endDate}`,
    );

    const result = await FetchLogService.getFetchLogsByDateRange(
      startDate,
      endDate,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(
      `[FETCH LOG CONTROLLER ERROR] Error getting logs by date range:`,
      error.message,
    );
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date(),
    });
  }
};

/**
 * Get latest fetch log
 * GET /api/fetch-logs/latest
 */
const getLatestFetchLog = async (req, res) => {
  try {
    console.log(`[FETCH LOG CONTROLLER] Request for latest log`);

    const result = await FetchLogService.getLatestFetchLog();

    res.status(200).json(result);
  } catch (error) {
    console.error(
      `[FETCH LOG CONTROLLER ERROR] Error getting latest log:`,
      error.message,
    );
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date(),
    });
  }
};

module.exports = {
  getFetchLogsByDate,
  getFetchLogsByDateRange,
  getLatestFetchLog,
};
