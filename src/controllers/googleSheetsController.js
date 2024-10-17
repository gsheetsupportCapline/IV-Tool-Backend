const googleSheetsService = require('../services/googleSheetsService');

module.exports = {
  updateGSheet: async (req, res) => {
    const { sheetId, range, values } = req.body;
    try {
      const result = await googleSheetsService.updateGsheet(sheetId, range, values);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating sheet data" });
    }
  },

  readGSheet: async (req, res) => {
    const { sheetId, range } = req.params;
    console.log("Sheet Id", sheetId);
    console.log("Range",range);
    try {
      const data = await googleSheetsService.readData(sheetId, range);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error reading sheet data" });
    }
  },
};