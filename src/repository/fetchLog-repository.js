// fetchLog-repository.js
const FetchLog = require("../models/fetchLog");
const moment = require("moment-timezone");

/**
 * Get fetch logs by date (ignores time, matches only date part)
 * @param {String} dateString - Date in YYYY-MM-DD format
 * @returns {Object} Fetch log document for the specified date
 */
async function getFetchLogsByDate(dateString) {
  try {
    // Parse the input date in CST timezone - get start and end of day
    const startOfDay = moment
      .tz(dateString, "America/Chicago")
      .startOf("day")
      .toDate();

    const endOfDay = moment
      .tz(dateString, "America/Chicago")
      .endOf("day")
      .toDate();

    console.log(`[FETCH LOG REPO] Querying logs for date: ${dateString}`);
    console.log(
      `[FETCH LOG REPO] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`,
    );

    // Find document where date falls within the day (ignores time part)
    const logDoc = await FetchLog.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    if (!logDoc) {
      console.log(`[FETCH LOG REPO] No logs found for date: ${dateString}`);
      return null;
    }

    console.log(
      `[FETCH LOG REPO] Found ${logDoc.fetchOperations.length} fetch operations for date: ${dateString}`,
    );

    return logDoc;
  } catch (error) {
    console.error(
      `[FETCH LOG REPO ERROR] Error fetching logs for date ${dateString}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Get all fetch logs within a date range
 * @param {String} startDate - Start date in YYYY-MM-DD format
 * @param {String} endDate - End date in YYYY-MM-DD format
 * @returns {Array} Array of fetch log documents
 */
async function getFetchLogsByDateRange(startDate, endDate) {
  try {
    const start = moment
      .tz(startDate, "America/Chicago")
      .startOf("day")
      .toDate();
    const end = moment.tz(endDate, "America/Chicago").endOf("day").toDate();

    console.log(
      `[FETCH LOG REPO] Querying logs from ${startDate} to ${endDate}`,
    );

    const logDocs = await FetchLog.find({
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: -1 }) // Most recent first
      .lean();

    console.log(
      `[FETCH LOG REPO] Found ${logDocs.length} log documents in date range`,
    );

    return logDocs;
  } catch (error) {
    console.error(
      `[FETCH LOG REPO ERROR] Error fetching logs for date range:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Get latest fetch log (most recent)
 * @returns {Object} Most recent fetch log document
 */
async function getLatestFetchLog() {
  try {
    const logDoc = await FetchLog.findOne().sort({ date: -1 }).lean();

    if (!logDoc) {
      console.log(`[FETCH LOG REPO] No fetch logs found in database`);
      return null;
    }

    console.log(`[FETCH LOG REPO] Found latest log for date: ${logDoc.date}`);

    return logDoc;
  } catch (error) {
    console.error(
      `[FETCH LOG REPO ERROR] Error fetching latest log:`,
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
