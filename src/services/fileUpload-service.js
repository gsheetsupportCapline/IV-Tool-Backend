 

const fileUploadRepository = require('../repository/fileUpload-repository');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const s3 = require('../utils/s3.util');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

const uploadImage = async (file) => {
  try {
    const result = await fileUploadRepository.uploadFileToS3(file);
    return result.Location;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

module.exports = { uploadImage };