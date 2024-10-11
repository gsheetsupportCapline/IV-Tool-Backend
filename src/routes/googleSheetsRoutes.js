const express = require("express");
const router = express.Router();
const googleSheetsController = require('../controllers/googleSheetsController');
router.post('/gsheet/updategsheet', googleSheetsController.updateGSheet);
router.post('/gsheet/readgsheet/:sheetId/:range', googleSheetsController.readGSheet);

module.exports = router;