const fileUploadService = require('../services/fileUpload-service');
const uploadImage = async (req, res) => {
  try {
    const result = await fileUploadService.uploadImage(req.files.image);
    res.status(200).json({ success: true, message: 'Image uploaded successfully', url: result.Location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

module.exports = { uploadImage };