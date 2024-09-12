const fileUploadService = require('../services/fileUpload-service');

const uploadImage = async (req, res) => {
  console.log("request in file upload in Controller", req.file);
  try {
      const result = await fileUploadService.uploadImage(req.file);
      const fileInfo = {
        filename: result.Key.split('/').pop(), // Extract the filename from the S3 key
        originalName: req.file.originalname,
        
        url: result.Location,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };
      res.status(200).json({ success: true, message: 'Image uploaded successfully', fileInfo: fileInfo });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

module.exports = { uploadImage };