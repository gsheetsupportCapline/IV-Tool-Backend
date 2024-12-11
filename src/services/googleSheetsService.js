const { google } = require("googleapis");
const keys = require("../keys.json");

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

module.exports = {
  readData: async (sheetId, range) => {
    const gsapi = google.sheets({ version: "v4", auth: client });
    const options = {
      spreadsheetId: sheetId,
      range: range,
    };

    const data = await gsapi.spreadsheets.values.get(options);
    console.log("data.data.values ", data.data.values);
    return data.data.values;
  },

  updateGsheet: async (sheetId, range, updateValues) => {
    const updateOptions = {
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: "USER_ENTERED", 
      resource: { values: updateValues },  
    };
    const gsapi = google.sheets({ version: "v4", auth: client });
    
    try {
      const result = await gsapi.spreadsheets.values.update(updateOptions);
      console.log("Update successful:", result.data);
      return result;
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      throw error;
    }
  },

  batchUpdatesheet: async (sheetId, updates) => {
    const updateOptions = {
      spreadsheetId: sheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    };

    const gsapi = google.sheets({ version: "v4", auth: client });
    return await gsapi.spreadsheets.values.batchUpdate(updateOptions);
  },

  updateAndReadGsheet: async (sheetId, range, updateValues) => {
    try {
      const updateResponse = await module.exports.updateGsheet(sheetId, range, updateValues);
      
      // Read the updated sheet
      const readResponse = await module.exports.readData(sheetId, range);

      return { updateResponse, readResponse };
    } catch (error) {
      console.error("Error updating and reading the sheet:", error);
      throw error;
    }
  },
};
  