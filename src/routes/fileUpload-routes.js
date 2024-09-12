const express = require('express');
const router = express.Router();
const {upload} = require('../services/fileUpload-service');
const fileUploadController = require('../controllers/fileUpload-controller');

router.post('/upload', upload.single('image'),fileUploadController.uploadImage);

module.exports = router;     