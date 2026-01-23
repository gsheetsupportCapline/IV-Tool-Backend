// fetchLog-service.js
const FetchLogRepository = require("../repository/fetchLog-repository");

/**
 * Get fetch logs by specific date
 * @param {String} date - Date in YYYY-MM-DD format
 * @returns {Object} Response with fetch log data
 */
async function getFetchLogsByDate(date) {
  try {
    console.log(`[FETCH LOG SERVICE] Getting logs for date: ${date}`);

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(
        "Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-01-24)",
      );
    }

    const logDoc = await FetchLogRepository.getFetchLogsByDate(date);

    if (!logDoc) {
      return {
        success: true,
        message: `No fetch logs found for date: ${date}`,
        date: date,
        fetchOperations: [],
        totalOperations: 0,
      };
    }

    return {
      success: true,
      message: "Fetch logs retrieved successfully",
      date: logDoc.date,
      fetchOperations: logDoc.fetchOperations,
      totalOperations: logDoc.fetchOperations.length,
    };
  } catch (error) {
    console.error(
      `[FETCH LOG SERVICE ERROR] Error getting logs for date ${date}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Get fetch logs for a date range
 * @param {String} startDate - Start date in YYYY-MM-DD format
 * @param {String} endDate - End date in YYYY-MM-DD format
 * @returns {Object} Response with fetch log data
 */
async function getFetchLogsByDateRange(startDate, endDate) {
  try {
    console.log(
      `[FETCH LOG SERVICE] Getting logs from ${startDate} to ${endDate}`,
    );

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error(
        "Invalid date format. Please use YYYY-MM-DD format (e.g., 2026-01-24)",
      );
    }

    const logDocs = await FetchLogRepository.getFetchLogsByDateRange(
      startDate,
      endDate,
    );

    if (!logDocs || logDocs.length === 0) {
      return {
        success: true,
        message: `No fetch logs found between ${startDate} and ${endDate}`,
        startDate: startDate,
        endDate: endDate,
        logs: [],
        totalDays: 0,
        totalOperations: 0,
      };
    }

    const totalOperations = logDocs.reduce(
      (sum, doc) => sum + doc.fetchOperations.length,
      0,
    );

    return {
      success: true,
      message: "Fetch logs retrieved successfully",
      startDate: startDate,
      endDate: endDate,
      logs: logDocs,
      totalDays: logDocs.length,
      totalOperations: totalOperations,
    };
  } catch (error) {
    console.error(
      `[FETCH LOG SERVICE ERROR] Error getting logs for date range:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Get latest fetch log
 * @returns {Object} Response with latest fetch log data
 */
async function getLatestFetchLog() {
  try {
    console.log(`[FETCH LOG SERVICE] Getting latest fetch log`);

    const logDoc = await FetchLogRepository.getLatestFetchLog();

    if (!logDoc) {
      return {
        success: true,
        message: "No fetch logs found in database",
        fetchOperations: [],
        totalOperations: 0,
      };
    }

    return {
      success: true,
      message: "Latest fetch log retrieved successfully",
      date: logDoc.date,
      fetchOperations: logDoc.fetchOperations,
      totalOperations: logDoc.fetchOperations.length,
    };
  } catch (error) {
    console.error(
      `[FETCH LOG SERVICE ERROR] Error getting latest log:`,
      error.message,
    );
    throw error;
  }
}

module.exports = {
  getFetchLogsByDate,
  getFetchLogsByDateRange,
  getLatestFetchLog,
};
